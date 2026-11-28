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
        "25",
        "WITHPAYLOADS",
      )
      .catch((error) => {
        this.logger.error(error);
        throw new SkyBlockUnavailableException("market");
      })) as string[] | null;

    return arrayGroup(reply ?? [], 2).map(([name, payload]) => ({
      name,
      ...JSON.parse(payload),
    }));
  }

  // Each rebuild fills a new key and renames it, so a search never sees half.
  public async update(map: PriceMap, items: ItemsResource) {
    const next = `${AUTOCOMPLETE_KEY}:next`;
    const pipeline = this.redis.pipeline().del(next);

    for (const key of Object.keys(map.entries)) {
      const described = describeKey(key, items);
      if (!described) continue;

      const payload = JSON.stringify({ id: key, rarity: described.rarity });
      pipeline.call("FT.SUGADD", next, described.name, "1", "PAYLOAD", payload);
    }

    await pipeline.rename(next, AUTOCOMPLETE_KEY).exec();
  }
}
