/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { CacheLevel, LeaderboardQuery, PlayerNotFoundException } from "@statsify/api-client";
import { type Circular, flatten } from "@statsify/util";
import { type Guild, Player, getLeaderboardField } from "@statsify/schemas";
import { Inject, Injectable, forwardRef } from "@nestjs/common";
import { InjectModel } from "@m8a/nestjs-typegoose";
import { InjectRedis } from "#redis";
import {
  LeaderboardAdditionalStats,
  LeaderboardService,
  PAGE_SIZE,
  isRankedScore,
} from "#leaderboards";
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

  public async getMemberLeaderboard(
    guild: Guild,
    field: string,
    input: number | string,
    type: LeaderboardQuery
  ) {
    const { sort, resetEvery } = getLeaderboardField(Player, field);

    const memberIds = guild.members.map(({ uuid }) => uuid);

    // Mongo keeps a resetting stat's old value until the player is fetched again,
    // while Redis expires the whole board at the reset.
    const [scores, playerId] = await Promise.all([
      resetEvery ?
        this.getRedisScores(field, memberIds) :
        this.getMongoScores(field, memberIds),
      type === LeaderboardQuery.INPUT ? this.getPlayerId(input as string) : undefined,
    ]);

    const members = scores
      .sort((a, b) => sort === "ASC" ? a.score - b.score : b.score - a.score)
      .map((doc, index) => ({ ...doc, index }));

    let top: number;
    let highlight: number | undefined = undefined;

    switch (type) {
      case LeaderboardQuery.PAGE:
        top = (input as number) * PAGE_SIZE;
        break;

      case LeaderboardQuery.INPUT: {
        highlight = members.findIndex(({ id }) => id === playerId);

        if (highlight === -1) throw new PlayerNotFoundException();

        top = highlight - (highlight % PAGE_SIZE);
        break;
      }

      case LeaderboardQuery.POSITION: {
        const position = (input as number) - 1;
        highlight = position;
        top = position - (position % PAGE_SIZE);
        break;
      }
    }

    const leaderboard = await this.formatLeaderboard(
      Player,
      field,
      members.slice(top, top + PAGE_SIZE),
      top / PAGE_SIZE,
      highlight
    );

    return { ...leaderboard, name: `${leaderboard.name} - ${guild.nameFormatted}` };
  }

  protected async searchLeaderboardInput(input: string, field: string): Promise<number> {
    input = await this.getPlayerId(input);

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

    return await Promise.all(
      ids.map(async (id) => {
        const player = await this.playerModel
          .findOne()
          .where("uuid")
          .equals(id)
          .select(selector)
          .lean()
          .exec();

        const additionalStats = flatten(player) as LeaderboardAdditionalStats;
        additionalStats.name = additionalStats.displayName;

        return additionalStats;
      })
    );
  }

  private async getMongoScores(field: string, ids: string[]) {
    const players = await this.playerModel
      .find()
      .where("uuid")
      .in(ids)
      .select({ uuid: true, [field]: true })
      .lean()
      .exec();

    return players.flatMap((player) => {
      const score = (flatten(player) as LeaderboardAdditionalStats)[field];
      return isRankedScore(score) ? [{ id: player.uuid, score }] : [];
    });
  }

  private async getRedisScores(field: string, ids: string[]) {
    const scores = await this.redis.zmscore(`player.${field}`, ...ids);

    return scores.flatMap((score, index) =>
      score === null ? [] : [{ id: ids[index], score: Number(score) }]
    );
  }

  private async getPlayerId(input: string) {
    if (input.length > 16) return input;

    const player = await this.playerService.get(input, CacheLevel.CACHE_ONLY, {
      uuid: true,
    });

    if (!player) throw new PlayerNotFoundException();

    return player.uuid;
  }
}
