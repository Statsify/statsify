/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  type Bazaar,
  type ItemsResource,
  type MayorView,
  type PriceMap,
  type PriceView,
  type RawItemsResource,
  describeKey,
  parseBazaar,
  parseItemsResource,
  toMayorView,
  toPriceView,
} from "@statsify/skyblock";
import {
  HypixelService,
  HypixelUnavailableError,
  SKYBLOCK_TIMEOUT,
} from "#hypixel";
import { InjectRedis } from "#redis";
import { Injectable, type OnModuleDestroy } from "@nestjs/common";
import { Logger } from "@statsify/logger";
import { Redis } from "ioredis";
import {
  SkyBlockNotFoundException,
  SkyBlockUnavailableException,
} from "@statsify/api-client";
import { SkyBlockSearchService } from "./search/skyblock-search.service.js";
import { Worker } from "node:worker_threads";
import { getTerm } from "@statsify/skyblock/display";
import { gunzipJson, gzipJson } from "./zip.js";
import type {
  RebuildRequest,
  RebuildResult,
} from "./skyblock-prices.worker.js";

const PRICES_KEY = "skyblock:prices";
const LOCK_KEY = "skyblock:prices:lock";
const BAZAAR_KEY = "skyblock:bazaar";
const ITEMS_KEY = "skyblock:resource:items";
const ELECTION_KEY = "skyblock:resource:election";

const PRICES_REFRESH_MS = 15 * 60_000;
const BAZAAR_REFRESH_MS = 60_000;
const ITEMS_REFRESH_MS = 12 * 60 * 60_000;
const ELECTION_REFRESH_MS = 30 * 60_000;
export const FAILURE_BACKOFF_MS = 60_000;
// The lock spaces rebuilds out too, for when the feed's lastUpdated stops.
const LOCK_MS = 300_000;

const binCount = (map: PriceMap) =>
  Object.values(map.entries).filter(({ source }) => source === "bin").length;

interface Copy<T> {
  value: T;
  fetchedAt: number;
}

function isCurrent<T>(copy: Copy<T> | undefined, maxAge: number) {
  return copy !== undefined && Date.now() - copy.fetchedAt <= maxAge;
}

// Hypixel can still send the last mayor after a term ends, so only a copy
// fetched during its term goes out of date when it ends.
const isOutdated = ({ value, fetchedAt }: Copy<MayorView>) =>
  getTerm(value, fetchedAt) !== undefined &&
  getTerm(value, Date.now()) === undefined;

const isMayorCurrent = (copy: Copy<MayorView> | undefined) =>
  copy !== undefined &&
  isCurrent(copy, ELECTION_REFRESH_MS) &&
  !isOutdated(copy);

interface LoadedItems {
  raw: RawItemsResource;
  parsed: ItemsResource;
}

const loadItems = ({ value, fetchedAt }: Copy<RawItemsResource>) => ({
  value: { raw: value, parsed: parseItemsResource(value) },
  fetchedAt,
});

interface MarketReads {
  bazaar?: Promise<Bazaar | undefined>;
  items?: Promise<LoadedItems | undefined>;
}

@Injectable()
export class SkyBlockPricesService implements OnModuleDestroy {
  private readonly logger = new Logger("SkyBlockPricesService");
  // A process keeps what it unzipped, since unzipping per request is slow.
  private map?: PriceMap;
  private bazaar?: Copy<Bazaar>;
  private items?: Copy<LoadedItems>;
  private mayor?: Copy<MayorView>;
  private worker?: Worker;

  public constructor(
    private readonly hypixelService: HypixelService,
    private readonly searchService: SkyBlockSearchService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  public async onModuleDestroy() {
    await this.worker?.terminate();
  }

  // A rebuild reuses the bazaar and items reads a caller already started.
  public async getPriceMap(
    reads: MarketReads = {},
  ): Promise<PriceMap | undefined> {
    const asOf = Number(await this.redis.hget(PRICES_KEY, "asOf"));
    if (asOf > (this.map?.asOf ?? 0)) {
      const data = await this.redis.hgetBuffer(PRICES_KEY, "data");
      if (data) this.map = await gunzipJson<PriceMap>(data);
    }

    if (!this.map || Date.now() - this.map.asOf > PRICES_REFRESH_MS) {
      void this.rebuild(reads).catch((error) => this.logger.error(error));
    }

    return this.map;
  }

  public async getItems(): Promise<LoadedItems | undefined> {
    if (!isCurrent(this.items, ITEMS_REFRESH_MS)) {
      const stored = await this.readStored<RawItemsResource>(
        ITEMS_KEY,
        this.items?.fetchedAt,
      );
      if (stored) this.items = loadItems(stored);
    }

    if (this.items && isCurrent(this.items, ITEMS_REFRESH_MS)) {
      return this.items.value;
    }

    if (await this.failedRecently(ITEMS_KEY)) return this.items?.value;

    const refetch = this.hypixelService.getSkyBlockItems().then(async (raw) => {
      const copy = { value: raw, fetchedAt: Date.now() };
      const loaded = loadItems(copy);
      await this.store(ITEMS_KEY, copy);
      this.items = loaded;
      return loaded.value;
    });

    return this.staleOrRefetch(ITEMS_KEY, this.items, refetch);
  }

  public async getMayor(): Promise<MayorView | undefined> {
    if (!isMayorCurrent(this.mayor)) {
      const stored = await this.readStored<MayorView>(
        ELECTION_KEY,
        this.mayor?.fetchedAt,
      );
      if (stored) this.mayor = stored;
    }

    if (this.mayor && isMayorCurrent(this.mayor)) return this.mayor.value;
    if (await this.failedRecently(ELECTION_KEY)) return this.mayor?.value;

    const refetch = this.hypixelService
      .getSkyBlockElection()
      .then(async (raw) => {
        const copy = { value: toMayorView(raw), fetchedAt: Date.now() };
        await this.store(ELECTION_KEY, copy);
        this.mayor = copy;
        return copy.value;
      });

    const last = this.mayor;
    if (!last || !isOutdated(last)) {
      return this.staleOrRefetch(ELECTION_KEY, last, refetch);
    }

    // A term that ended waits for the new mayor, or keeps the last on failure.
    const mayor = await this.staleOrRefetch(ELECTION_KEY, undefined, refetch);
    return mayor ?? last.value;
  }

  public async getPrice(id: string): Promise<PriceView> {
    const reads = { bazaar: this.getBazaar(), items: this.getItems() };
    const [map, bazaar, loaded] = await Promise.all([
      this.getPriceMap(reads),
      reads.bazaar,
      reads.items,
    ]);
    if (!map || !bazaar || !loaded) {
      throw new SkyBlockUnavailableException("market");
    }

    const price = toPriceView(id, map, bazaar, loaded.parsed);
    if (price) return price;

    const described = describeKey(id, loaded.parsed);
    throw new SkyBlockNotFoundException(
      described ? "price" : "item",
      described?.name,
    );
  }

  private async getBazaar(): Promise<Bazaar | undefined> {
    if (!isCurrent(this.bazaar, BAZAAR_REFRESH_MS)) {
      const stored = await this.readStored<Bazaar>(
        BAZAAR_KEY,
        this.bazaar?.fetchedAt,
      );
      if (stored) this.bazaar = stored;
    }

    if (this.bazaar && isCurrent(this.bazaar, BAZAAR_REFRESH_MS)) {
      return this.bazaar.value;
    }

    if (await this.failedRecently(BAZAAR_KEY)) return this.bazaar?.value;

    const refetch = this.hypixelService
      .getSkyBlockBazaar()
      .then(async (raw) => {
        const copy = { value: parseBazaar(raw), fetchedAt: Date.now() };
        await this.store(BAZAAR_KEY, copy);
        this.bazaar = copy;
        return copy.value;
      });

    return this.staleOrRefetch(BAZAAR_KEY, this.bazaar, refetch);
  }

  private async rebuild(reads: MarketReads) {
    const lock = await this.redis.set(LOCK_KEY, "1", "PX", LOCK_MS, "NX");
    if (lock !== "OK") return;

    try {
      const [bazaar, loaded] = await Promise.all([
        reads.bazaar ?? this.getBazaar(),
        reads.items ?? this.getItems(),
      ]);
      if (!bazaar || !loaded) {
        throw new Error("no bazaar or items resource to build prices with");
      }

      const result = await this.build({
        timeout: SKYBLOCK_TIMEOUT,
        bazaar,
        items: loaded.parsed,
      });
      if ("error" in result) throw new Error(result.error);

      const data = Buffer.from(result.data);
      const map = await gunzipJson<PriceMap>(data);

      // Under half the last map's BIN prices means the pull was cut short.
      const bins = binCount(map);
      const previous = this.map ? binCount(this.map) : 0;
      if (bins < previous / 2) {
        throw new Error(
          `a rebuild priced ${bins} BIN keys, the last map ${previous}`,
        );
      }

      await this.redis.hset(PRICES_KEY, { data, asOf: result.asOf });
      this.map = map;
      await this.searchService.update(map, loaded.parsed);
    } finally {
      await this.redis.set(LOCK_KEY, "1", "PX", LOCK_MS);
    }
  }

  private build(request: RebuildRequest): Promise<RebuildResult> {
    const url = new URL("skyblock-prices.worker.js", import.meta.url);
    const worker = (this.worker ??= new Worker(url, {
      resourceLimits: { maxOldGenerationSizeMb: 128 },
    }));

    return new Promise((resolve, reject) => {
      const fail = (error: Error) => {
        this.worker = undefined;
        reject(error);
      };

      const exit = (code: number) =>
        fail(new Error(`the price worker exited with code ${code}`));

      worker.once("error", fail);
      worker.once("exit", exit);
      worker.once("message", (result: RebuildResult) => {
        worker.off("error", fail);
        worker.off("exit", exit);
        resolve(result);
      });

      worker.postMessage(request);
    });
  }

  private async readStored<T>(
    key: string,
    since = 0,
  ): Promise<Copy<T> | undefined> {
    const [data, storedAt] = await this.redis.hmgetBuffer(
      key,
      "data",
      "fetchedAt",
    );
    const fetchedAt = Number(storedAt?.toString());
    if (!data || !(fetchedAt > since)) return;

    return { value: await gunzipJson<T>(data), fetchedAt };
  }

  private async store<T>(key: string, { value, fetchedAt }: Copy<T>) {
    await this.redis.hset(key, { data: await gzipJson(value), fetchedAt });
  }

  private async failedRecently(key: string) {
    const failedAt = Number(await this.redis.hget(key, "failedAt"));
    return Date.now() - failedAt < FAILURE_BACKOFF_MS;
  }

  // A stale copy answers at once, since a Hypixel timeout outlasts the bot's.
  private async staleOrRefetch<T>(
    key: string,
    stale: Copy<T> | undefined,
    refetch: Promise<T>,
  ): Promise<T | undefined> {
    const recorded = refetch.catch(async (error) => {
      await this.redis.hset(key, "failedAt", Date.now());
      throw error;
    });

    if (stale) {
      void recorded.catch((error) => this.logger.error(error));
      return stale.value;
    }

    try {
      return await recorded;
    } catch (error) {
      if (!(error instanceof HypixelUnavailableError)) throw error;

      this.logger.error(error);
      return undefined;
    }
  }
}
