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
  type PriceMap,
  type PriceView,
  type RawItemsResource,
  describeKey,
  parseBazaar,
  parseItemsResource,
  toPriceView,
} from "@statsify/skyblock";
import { type Copy, SkyBlockCopiesService } from "./skyblock-copies.service.js";
import { HypixelService, SKYBLOCK_TIMEOUT_MS } from "#hypixel";
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
import { gunzipJson } from "./zip.js";
import type {
  RebuildRequest,
  RebuildResult,
} from "./skyblock-prices.worker.js";

const PRICES_KEY = "skyblock:prices";
const LOCK_KEY = "skyblock:prices:lock";
const BAZAAR_KEY = "skyblock:bazaar";
const ITEMS_KEY = "skyblock:resource:items";

const PRICES_REFRESH_MS = 15 * 60_000;
const BAZAAR_REFRESH_MS = 60_000;
const ITEMS_REFRESH_MS = 12 * 60 * 60_000;
// The lock spaces rebuilds out too, for when the feed's lastUpdated stops.
const LOCK_MS = 300_000;

const binCount = (map: PriceMap) =>
  Object.values(map.entries).filter(({ source }) => source === "bin").length;

interface LoadedItems {
  raw: RawItemsResource;
  parsed: ItemsResource;
}

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
  private items?: Copy<RawItemsResource>;
  private loadedItems?: LoadedItems;
  private worker?: Worker;

  public constructor(
    private readonly hypixelService: HypixelService,
    private readonly searchService: SkyBlockSearchService,
    private readonly copiesService: SkyBlockCopiesService,
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
    this.items = await this.copiesService.get(
      ITEMS_KEY,
      ITEMS_REFRESH_MS,
      () => this.fetchItems(),
      this.items,
    );

    const raw = this.items?.value;
    if (raw && raw !== this.loadedItems?.raw) {
      this.loadedItems = { raw, parsed: parseItemsResource(raw) };
    }

    return this.loadedItems;
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
    this.bazaar = await this.copiesService.get(
      BAZAAR_KEY,
      BAZAAR_REFRESH_MS,
      () => this.hypixelService.getSkyBlockBazaar().then(parseBazaar),
      this.bazaar,
    );

    return this.bazaar?.value;
  }

  // A response that doesn't parse is never stored, so the last good one stays.
  private async fetchItems() {
    const raw = await this.hypixelService.getSkyBlockItems();
    parseItemsResource(raw);
    return raw;
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
        timeout: SKYBLOCK_TIMEOUT_MS,
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
}
