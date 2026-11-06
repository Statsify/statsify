/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { CacheLevel, PlayerNotFoundException } from "@statsify/api-client";
import { type Circular, flatten } from "@statsify/util";
import { Inject, Injectable, forwardRef } from "@nestjs/common";
import { InjectModel } from "@m8a/nestjs-typegoose";
import { InjectRedis } from "#redis";
import { LeaderboardAdditionalStats, LeaderboardService } from "#leaderboards";
import { Player } from "@statsify/schemas";
import { PlayerService } from "#player";
import { Redis } from "ioredis";
import type { ReturnModelType } from "@typegoose/typegoose";

@Injectable()
export class PlayerLeaderboardService extends LeaderboardService {
  public constructor(
    @Inject(forwardRef(() => PlayerService))
    private readonly playerService: Circular<PlayerService>,
    @InjectModel(Player) private readonly playerModel: ReturnModelType<typeof Player>,
    @InjectRedis() redis: Redis
  ) {
    super(redis);
  }

  protected async searchLeaderboardInput(input: string, field: string): Promise<number> {
    if (input.length <= 16) {
      const player = await this.playerService.get(input, CacheLevel.CACHE_ONLY, {
        uuid: true,
      });

      if (!player) throw new PlayerNotFoundException();
      input = player.uuid;
    }

    const ranking = await this.getLeaderboardRankings(Player, [field], input);

    if (!ranking || !ranking[0] || !ranking[0].rank) throw new PlayerNotFoundException();

    return ranking[0].rank;
  }

  protected async getAdditionalStats(
    ids: string[],
    fields: string[]
  ): Promise<LeaderboardAdditionalStats[]> {
    const selector = fields.reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);

    selector.displayName = true;
    selector.uuid = true;

    // One query for the whole page instead of one per row. `$in` returns documents in no
    // particular order, so the rows are rebuilt in the leaderboard's order from `ids`; a missing player
    // flattens to the same empty row the one-query-per-row lookup produced.
    const players = await this.playerModel
      .find({ uuid: { $in: ids } })
      .select(selector)
      .lean()
      .exec();

    const playersByUuid = new Map(players.map((player) => [player.uuid, player]));

    return ids.map((id) => {
      const additionalStats = flatten(playersByUuid.get(id) ?? null) as LeaderboardAdditionalStats;
      additionalStats.name = additionalStats.displayName;

      return additionalStats;
    });
  }
}

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

  describe("PlayerLeaderboardService.getAdditionalStats", () => {
    it("returns rows in leaderboard order, with an empty row for a missing player", async () => {
      // Mongo hands `$in` matches back in its own order, here reversed, with one id missing.
      const players = [
        { uuid: "c", displayName: "C", stats: { bedwars: { wins: 3 } } },
        { uuid: "a", displayName: "A", stats: { bedwars: { wins: 1 } } },
      ];

      const playerModel = {
        find: () => ({ select: () => ({ lean: () => ({ exec: () => Promise.resolve(players) }) }) }),
      };

      class Exposed extends PlayerLeaderboardService {
        public stats(ids: string[], fields: string[]) {
          return this.getAdditionalStats(ids, fields);
        }
      }

      const service = new Exposed(undefined as never, playerModel as never, undefined as never);

      expect(await service.stats(["a", "b", "c"], ["stats.bedwars.wins"])).toEqual([
        { uuid: "a", displayName: "A", name: "A", "stats.bedwars.wins": 1 },
        // `flatten(null)`, as the one-query-per-row lookup returned for a missing player.
        { "": null },
        { uuid: "c", displayName: "C", name: "C", "stats.bedwars.wins": 3 },
      ]);
    });
  });
}
