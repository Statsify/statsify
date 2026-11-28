/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  type ItemMatch,
  type ItemsResource,
  type PriceMap,
  describeKey,
} from "@statsify/skyblock";
import { InjectRedis } from "#redis";
import { Injectable } from "@nestjs/common";
import { Logger } from "@statsify/logger";
import { Redis } from "ioredis";
import { SkyBlockUnavailableException } from "@statsify/api-client";
import { arrayGroup } from "@statsify/util";

const AUTOCOMPLETE_KEY = "skyblock:items:autocomplete";

// Discord shows at most 25 autocomplete choices.
const MAX_MATCHES = 25;

@Injectable()
export class SkyBlockSearchService {
  private readonly logger = new Logger("SkyBlockSearchService");

  public constructor(@InjectRedis() private readonly redis: Redis) {}

  public async get(query: string): Promise<ItemMatch[]> {
    const reply = (await this.redis
      .call(
        "FT.SUGGET",
        AUTOCOMPLETE_KEY,
        query,
        "FUZZY",
        "MAX",
        String(MAX_MATCHES),
        "WITHPAYLOADS",
      )
      .catch((error) => {
        this.logger.error(error);
        throw new SkyBlockUnavailableException("market");
      })) as string[] | null;

    return arrayGroup(reply ?? [], 2)
      .flatMap(([name, payload]) =>
        (JSON.parse(payload) as Omit<ItemMatch, "name">[]).map((key) => ({
          ...key,
          name,
        })),
      )
      .slice(0, MAX_MATCHES);
  }

  // Each rebuild fills a new key and renames it, so a search never sees half.
  public async update(map: PriceMap, items: ItemsResource) {
    const next = `${AUTOCOMPLETE_KEY}:next`;
    const pipeline = this.redis.pipeline().del(next);

    const described = Object.keys(map.entries)
      .map((key) => describeKey(key, items))
      .filter((view) => view !== undefined);

    // Redis keeps one suggestion per name, so its payload lists every key.
    for (const [name, keys] of Map.groupBy(described, ({ name }) => name)) {
      const payload = JSON.stringify(
        keys.map(({ id, rarity }) => ({ id, rarity })),
      );
      pipeline.call("FT.SUGADD", next, name, "1", "PAYLOAD", payload);
    }

    await pipeline.rename(next, AUTOCOMPLETE_KEY).exec();
  }
}
