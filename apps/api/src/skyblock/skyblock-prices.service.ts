/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  type Bazaar,
  type ItemMatch,
  type ItemsResource,
  type PriceMap,
  type PriceView,
  type RawBazaar,
  describeKey,
  parseBazaar,
  parseItemsResource,
  toPriceView,
} from "@statsify/skyblock";
import { HttpService } from "@nestjs/axios";
import { InjectRedis } from "#redis";
import { Injectable, type OnModuleDestroy } from "@nestjs/common";
import { Logger } from "@statsify/logger";
import { Redis } from "ioredis";
import { SKYBLOCK_TIMEOUT } from "#hypixel";
import { SkyBlockNotFoundException, SkyBlockUnavailableException } from "@statsify/api-client";
import { Singleflight } from "./singleflight.js";
import { Worker } from "node:worker_threads";
import { arrayGroup, config } from "@statsify/util";
import { lastValueFrom } from "rxjs";
import { unzip, zip } from "./zip.js";
import type { RebuildRequest, RebuildResult } from "./skyblock-prices.worker.js";

const PRICES_KEY = "skyblock:prices";
const LOCK_KEY = "skyblock:prices:lock";
const BAZAAR_KEY = "skyblock:bazaar";
const ITEMS_KEY = "skyblock:resource:items";
const AUTOCOMPLETE_KEY = "skyblock:items:autocomplete";

const PRICES_REFRESH = (await config("skyblock.pricesRefreshMinutes", { default: 15 })) * 60_000;
const BAZAAR_REFRESH = 60_000;
const ITEMS_REFRESH = 12 * 60 * 60_000;
// Outlives the slowest rebuild, and holds the next pull back as long after each one, so a feed whose lastUpdated
// stops moving isn't pulled back to back
const LOCK_MS = 300_000;

type RawItemsResource = Parameters<typeof parseItemsResource>[0];

const binCount = (map?: PriceMap) => Object.values(map?.entries ?? {}).filter(({ source }) => source === "bin").length;

interface Copy<T> {
  value: T;
  fetchedAt: number;
}

@Injectable()
export class SkyBlockPricesService implements OnModuleDestroy {
  private readonly logger = new Logger("SkyBlockPricesService");
  private readonly singleflight = new Singleflight();
  private readonly copies = new Map<string, Copy<unknown>>();
  private map?: PriceMap;
  private items?: ItemsResource;
  private worker?: Worker;

  public constructor(
    private readonly httpService: HttpService,
    @InjectRedis() private readonly redis: Redis
  ) {}

  public async onModuleDestroy() {
    await this.worker?.terminate();
  }

  public async getPriceMap(): Promise<PriceMap | undefined> {
    const asOf = Number(await this.redis.hget(PRICES_KEY, "asOf"));
    if (asOf > (this.map?.asOf ?? 0)) {
      const data = await this.redis.hgetBuffer(PRICES_KEY, "data");
      if (data) this.map = await unzip<PriceMap>(data);
    }

    if (!this.map || Date.now() - this.map.asOf > PRICES_REFRESH) void this.rebuild();
    return this.map;
  }

  private getBazaar(): Promise<Bazaar | undefined> {
    return this.getCopy(BAZAAR_KEY, BAZAAR_REFRESH, async () =>
      parseBazaar(await this.get<RawBazaar>("/v2/skyblock/bazaar"))
    );
  }

  public async getItems(): Promise<ItemsResource | undefined> {
    const raw = await this.getCopy(ITEMS_KEY, ITEMS_REFRESH, () =>
      this.get<RawItemsResource>("/v2/resources/skyblock/items")
    );

    if (!raw) return;
    if (raw.lastUpdated !== this.items?.lastUpdated) this.items = parseItemsResource(raw);
    return this.items;
  }

  public async getPrice(id: string): Promise<PriceView> {
    const [map, bazaar, items] = await Promise.all([this.getPriceMap(), this.getBazaar(), this.getItems()]);
    if (!map || !bazaar || !items) throw new SkyBlockUnavailableException("market");

    const price = toPriceView(id, map, bazaar, items);
    if (price) return price;
    const described = describeKey(id, items);
    throw new SkyBlockNotFoundException(described ? "price" : "item", described?.name);
  }

  public async searchItems(query: string): Promise<ItemMatch[]> {
    try {
      const reply = (await this.redis.call(
        "FT.SUGGET",
        AUTOCOMPLETE_KEY,
        query,
        "FUZZY",
        "MAX",
        "25",
        "WITHPAYLOADS"
      )) as string[] | null;

      return arrayGroup(reply ?? [], 2).map(([name, payload]) => ({ name, ...JSON.parse(payload) }));
    } catch (error) {
      this.logger.error(error);
      return [];
    }
  }

  private async rebuild() {
    if ((await this.redis.set(LOCK_KEY, "1", "PX", LOCK_MS, "NX")) !== "OK") return;

    try {
      const [bazaar, items] = await Promise.all([this.getBazaar(), this.getItems()]);
      if (!bazaar || !items) throw new Error("no bazaar or items resource to build prices with");

      const result = await this.build({ timeout: SKYBLOCK_TIMEOUT, bazaar, items: { ...items, raw: [] } });
      if ("error" in result) throw new Error(result.error);

      const data = Buffer.from(result.data);
      const map = await unzip<PriceMap>(data);

      // Under half the last map's BIN prices means a reshaped or partial pull; bazaar and NPC prices don't come from it
      const [bins, previous] = [binCount(map), binCount(this.map)];
      if (bins < previous / 2) throw new Error(`a rebuild priced ${bins} BIN keys, the last map ${previous}`);

      await this.redis.hset(PRICES_KEY, { data, asOf: result.asOf });
      this.map = map;
      await this.updateAutocomplete(map, items);
    } catch (error) {
      this.logger.error(error);
    } finally {
      await this.redis.set(LOCK_KEY, "1", "PX", LOCK_MS);
    }
  }

  private build(request: RebuildRequest): Promise<RebuildResult> {
    const worker = (this.worker ??= new Worker(new URL("skyblock-prices.worker.js", import.meta.url), {
      resourceLimits: { maxOldGenerationSizeMb: 128 },
    }));

    return new Promise((resolve, reject) => {
      const fail = (error: Error) => {
        this.worker = undefined;
        reject(error);
      };

      const exit = (code: number) => fail(new Error(`the price worker exited with code ${code}`));

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

  private async updateAutocomplete(map: PriceMap, items: ItemsResource) {
    const next = `${AUTOCOMPLETE_KEY}:next`;
    const pipeline = this.redis.pipeline().del(next);

    for (const key of Object.keys(map.entries)) {
      const described = describeKey(key, items);
      if (!described) continue;
      const payload = JSON.stringify({ id: key, rarity: described.rarity, texture: described.texture });
      pipeline.call("FT.SUGADD", next, described.name, "1", "PAYLOAD", payload);
    }

    await pipeline.rename(next, AUTOCOMPLETE_KEY).exec();
  }

  private async getCopy<T>(key: string, maxAge: number, fetch: () => Promise<T>): Promise<T | undefined> {
    let copy = this.copies.get(key) as Copy<T> | undefined;

    if (!copy || Date.now() - copy.fetchedAt > maxAge) {
      const [data, storedAt] = await this.redis.hmgetBuffer(key, "data", "fetchedAt");
      const fetchedAt = Number(storedAt?.toString());
      if (data && fetchedAt > (copy?.fetchedAt ?? 0)) {
        copy = { value: await unzip<T>(data), fetchedAt };
        this.copies.set(key, copy);
      }
    }

    if (copy && Date.now() - copy.fetchedAt <= maxAge) return copy.value;

    const refetch = this.singleflight.run(key, async () => {
      const value = await fetch();
      const fetchedAt = Date.now();
      await this.redis.hset(key, { data: await zip(value), fetchedAt });
      this.copies.set(key, { value, fetchedAt });
      return value;
    });

    // A stale copy answers at once, since waiting out a Hypixel timeout would outlast the bot's request
    if (copy) {
      void refetch.catch((error) => this.logger.error(error));
      return copy.value;
    }

    try {
      return await refetch;
    } catch (error) {
      this.logger.error(error);
      return undefined;
    }
  }

  private get<T>(url: string) {
    return lastValueFrom(this.httpService.get<T>(url)).then((response) => response.data);
  }
}
