/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  CacheLevel,
  GUILD_ID_REGEX,
  GuildNotFoundException,
  LeaderboardQuery,
  PlayerNotFoundException,
} from "@statsify/api-client";
import { type Circular, flatten } from "@statsify/util";
import { Guild, Player, getLeaderboardField, serialize } from "@statsify/schemas";
import { HypixelService } from "#hypixel";
import { Inject, Injectable, forwardRef } from "@nestjs/common";
import { InjectModel } from "@m8a/nestjs-typegoose";
import { InjectRedis } from "#redis";
import { LeaderboardAdditionalStats, LeaderboardService } from "#leaderboards";
import { PlayerService } from "#player";
import { Redis } from "ioredis";
import type { ReturnModelType } from "@typegoose/typegoose";

@Injectable()
export class PlayerLeaderboardService extends LeaderboardService {
  public constructor(
    @Inject(forwardRef(() => PlayerService))
    private readonly playerService: Circular<PlayerService>,
    private readonly hypixelService: HypixelService,
    @InjectModel(Player) private readonly playerModel: ReturnModelType<typeof Player>,
    @InjectModel(Guild) private readonly guildModel: ReturnModelType<typeof Guild>,
    @InjectRedis() redis: Redis
  ) {
    super(redis);
  }

  public async getGuildScopedLeaderboard(
    guildInput: string,
    field: string,
    input: number | string,
    type: LeaderboardQuery
  ) {
    const PAGE_SIZE = 10;

    const {
      fieldName,
      additionalFields = [],
      extraDisplay,
      formatter,
      sort,
      name,
      hidden,
    } = getLeaderboardField(Player, field);

    const guild = await this.getGuild(guildInput);
    const memberIds = guild.members.map(({ uuid }) => uuid);

    const scores = await this.redis.call(
      "ZMSCORE",
      `player.${field}`,
      ...memberIds
    ) as (string | null)[];

    const leaderboard = this.getMemberScores(memberIds, scores)
      .sort((a, b) => sort === "ASC" ? a.score - b.score : b.score - a.score)
      .map((doc, index) => ({ ...doc, index }));

    let top: number;
    let bottom: number;
    let highlight: number | undefined = undefined;

    switch (type) {
      case LeaderboardQuery.PAGE:
        top = (input as number) * PAGE_SIZE;
        bottom = top + PAGE_SIZE;
        break;

      case LeaderboardQuery.INPUT: {
        const playerId = await this.getPlayerId(input as string);
        highlight = leaderboard.findIndex(({ id }) => id === playerId);

        if (highlight === -1) throw new PlayerNotFoundException();

        top = highlight - (highlight % PAGE_SIZE);
        bottom = top + PAGE_SIZE;
        break;
      }

      case LeaderboardQuery.POSITION: {
        const position = (input as number) - 1;
        highlight = position;
        top = position - (position % PAGE_SIZE);
        bottom = top + PAGE_SIZE;
        break;
      }
    }

    const page = leaderboard.slice(top, bottom);

    const additionalFieldMetadata = additionalFields.map((k) =>
      getLeaderboardField(Player, k, false)
    );

    const extraDisplayMetadata = extraDisplay ?
      getLeaderboardField(Player, extraDisplay, false) :
      undefined;

    const additionalStats = await this.getAdditionalStats(
      page.map(({ id }) => id),
      [
        ...additionalFields.filter((k) => k !== field),
        ...(extraDisplay ? [extraDisplay] : []),
      ]
    );

    const data = page.map((doc, index) => {
      const stats = additionalStats[index];

      if (extraDisplay) {
        const extraDisplayValue = stats[extraDisplay] ?? extraDisplayMetadata?.default;
        stats.name = extraDisplayValue ? `${extraDisplayValue}§r ${stats.name}` : stats.name;
      }

      const field = formatter ? formatter(doc.score) : doc.score;

      const additionalValues = additionalFields.map((key, index) => {
        const value = stats[key] ?? additionalFieldMetadata[index].default;

        if (additionalFieldMetadata[index].formatter)
          return additionalFieldMetadata[index].formatter?.(value);

        return value;
      });

      const fields = [];

      if (!hidden) fields.push(field);
      fields.push(...additionalValues);

      return {
        id: doc.id,
        fields,
        name: stats.name,
        position: doc.index + 1,
        highlight: doc.index === highlight,
      };
    });

    const fields = [];
    if (!hidden) fields.push(fieldName);
    fields.push(...additionalFieldMetadata.map(({ fieldName }) => fieldName));

    return {
      name: `${name} - ${guild.nameFormatted ?? guild.name}`,
      fields,
      data,
      page: top / PAGE_SIZE,
    };
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

  private async getGuild(input: string) {
    const isGuildId = GUILD_ID_REGEX.test(input);

    const guild = await this.guildModel
      .findOne()
      .where(isGuildId ? "id" : "nameToLower")
      .equals(isGuildId ? input : input.toLowerCase())
      .select({ "id": true, "members.uuid": true, "name": true, "nameFormatted": true })
      .lean()
      .exec();

    if (guild) return guild;

    const fetchedGuild = await this.hypixelService.getGuild(
      input,
      isGuildId ? "id" : "name"
    );

    if (!fetchedGuild) throw new GuildNotFoundException();

    const memberIds = fetchedGuild.members.map(({ uuid }) => uuid);

    await Promise.all([
      this.playerModel
        .updateMany({ uuid: { $in: memberIds } }, { guildId: fetchedGuild.id })
        .lean()
        .exec(),
      this.guildModel
        .replaceOne({ id: fetchedGuild.id }, serialize(Guild, flatten(fetchedGuild)), {
          upsert: true,
        })
        .lean()
        .exec(),
      this.addGuildAutocomplete(fetchedGuild.name),
    ]);

    return fetchedGuild;
  }

  private async addGuildAutocomplete(name: string) {
    if (name.length < 3 || name.length > 32) return;

    await this.redis
      .call("FT.SUGADD", "guild:autocomplete", name, "1", "INCR")
      .catch(() => undefined);
  }

  private async getPlayerId(input: string) {
    if (input.length > 16) return input;

    const player = await this.playerService.get(input, CacheLevel.CACHE_ONLY, {
      uuid: true,
    });

    if (!player) throw new PlayerNotFoundException();

    return player.uuid;
  }

  private getMemberScores(memberIds: string[], scores: (string | null)[]) {
    return scores.flatMap((score, index) =>
      score === null ? [] : [{ id: memberIds[index], score: Number(score) }]
    );
  }
}
