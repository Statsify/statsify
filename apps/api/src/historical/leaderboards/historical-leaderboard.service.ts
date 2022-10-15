/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import * as Sentry from "@sentry/node";
import Redis from "ioredis";
import { Constructor, Flatten, flatten } from "@statsify/util";
import {
  CurrentHistoricalType,
  HistoricalTimes,
  HistoricalType,
  LeaderboardQuery,
  PlayerNotFoundException,
} from "@statsify/api-client";
import { Daily, Monthly, Weekly } from "../models";
import { HistoricalService } from "../historical.service";
import { InjectModel } from "@m8a/nestjs-typegoose";
import { InjectRedis } from "@nestjs-modules/ioredis";
import { Injectable } from "@nestjs/common";
import { LeaderboardAdditionalStats, LeaderboardService } from "../../leaderboards";
import {
  LeaderboardEnabledMetadata,
  LeaderboardScanner,
  Player,
  createHistoricalPlayer,
} from "@statsify/schemas";
import { ReturnModelType } from "@typegoose/typegoose";

type PlayerModel = ReturnModelType<typeof Player>;

@Injectable()
export class HistoricalLeaderboardService extends LeaderboardService {
  public constructor(
    @InjectModel(Daily) private readonly dailyModel: PlayerModel,
    @InjectModel(Weekly) private readonly weeklyModel: PlayerModel,
    @InjectModel(Monthly) private readonly monthlyModel: PlayerModel,
    @InjectModel(Player) private readonly playerModel: PlayerModel,
    private readonly historicalService: HistoricalService,
    @InjectRedis() redis: Redis
  ) {
    super(redis);
  }

  public async getHistoricalLeaderboard<T>(
    time: CurrentHistoricalType,
    constructor: Constructor<T>,
    field: string,
    input: number | string,
    type: LeaderboardQuery
  ) {
    const PAGE_SIZE = 10;

    const {
      historicalFieldName,
      historicalFields = [],
      extraDisplay,
      formatter,
      sort,
      name,
      hidden,
    } = LeaderboardScanner.getLeaderboardField(
      constructor,
      field
    ) as LeaderboardEnabledMetadata;

    let top: number;
    let bottom: number;
    let highlight: number | undefined = undefined;

    switch (type) {
      case LeaderboardQuery.PAGE:
        top = (input as number) * PAGE_SIZE;
        bottom = top + PAGE_SIZE;
        break;
      case LeaderboardQuery.INPUT: {
        const ranking = await this.searchHistoricalLeaderboardInput(
          time,
          input as string,
          field
        );
        highlight = ranking - 1;
        top = highlight - (highlight % 10);
        bottom = top + PAGE_SIZE;
        break;
      }
      case LeaderboardQuery.POSITION: {
        const position = (input as number) - 1;
        highlight = position;
        top = position - (position % 10);
        bottom = top + PAGE_SIZE;
        break;
      }
    }

    const leaderboard = await this.getHistoricalLeaderboardFromRedis(
      time,
      constructor,
      field,
      top,
      bottom - 1,
      sort
    );

    const additionalFieldMetadata = historicalFields.map((k) =>
      LeaderboardScanner.getLeaderboardField(constructor, k, false)
    );

    const extraDisplayMetadata = extraDisplay
      ? LeaderboardScanner.getLeaderboardField(constructor, extraDisplay, false)
      : undefined;

    const additionalStats = await this.getAdditionalHistoricalStats(
      time,
      leaderboard.map(({ id }) => id),
      [
        field, // Keep field so merge works correctly with ratios
        ...historicalFields.filter((k) => k !== field),
        ...(extraDisplay ? [extraDisplay] : []),
      ]
    );

    const data = leaderboard.map((doc, index) => {
      const stats = additionalStats[index];

      if (extraDisplay)
        stats.name = `${stats[extraDisplay] ?? extraDisplayMetadata?.default}§r ${
          stats.name
        }`;

      const field = formatter ? formatter(doc.score) : doc.score;

      const additionalValues = historicalFields.map((key, index) => {
        const value = stats[key] ?? additionalFieldMetadata[index].default;

        if (additionalFieldMetadata[index].formatter)
          return additionalFieldMetadata[index].formatter?.(value);

        return value;
      });

      const fields = [];

      fields.push(hidden ? doc.score : field);
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
    fields.push(historicalFieldName);
    fields.push(...additionalFieldMetadata.map(({ fieldName }) => fieldName));

    return {
      name,
      fields,
      data,
      page: top / PAGE_SIZE,
    };
  }

  public async addHistoricalLeaderboards<T>(
    time: HistoricalType,
    constructor: Constructor<T>,
    instance: Flatten<T>,
    idField: keyof T,
    remove = false
  ) {
    const fields = LeaderboardScanner.getLeaderboardFields(constructor).filter(
      (v) => (v[1].leaderboard as LeaderboardEnabledMetadata).historical !== false
    );

    const transaction = Sentry.getCurrentHub().getScope()?.getTransaction();

    const child = transaction?.startChild({
      op: "redis",
      description: `add ${time} ${constructor.name} leaderboards`,
    });

    const pipeline = this.redis.pipeline();
    const name = constructor.name.toLowerCase();

    const id = instance[idField] as unknown as string;

    fields
      .filter(([field]) => remove || typeof instance[field] === "number")
      .forEach(([field]) => {
        const value = instance[field] as unknown as number;
        const key = `${time}:${name}.${String(field)}`;

        if (remove || value === 0 || Number.isNaN(value)) return pipeline.zrem(key, id);

        pipeline.zadd(key, value, id);
      });

    await pipeline.exec();

    child?.finish();
  }

  protected async getAdditionalStats(): Promise<LeaderboardAdditionalStats[]> {
    throw new Error("Misuse of getAdditonalStats in historical");
  }

  protected async getAdditionalHistoricalStats(
    time: CurrentHistoricalType,
    ids: string[],
    fields: string[]
  ): Promise<LeaderboardAdditionalStats[]> {
    const selector = fields.reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);

    selector.displayName = true;

    let model: PlayerModel;

    switch (time) {
      case HistoricalTimes.DAILY:
        model = this.dailyModel;
        break;

      case HistoricalTimes.MONTHLY:
        model = this.monthlyModel;
        break;

      case HistoricalTimes.WEEKLY:
        model = this.weeklyModel;
        break;
    }

    return await Promise.all(
      ids.map(async (id) => {
        const oldPlayer = await model
          .findOne()
          .where("uuid")
          .equals(id)
          .select(selector)
          .lean()
          .exec();

        const newPlayer = await this.playerModel
          .findOne()
          .where("uuid")
          .equals(id)
          .select(selector)
          .lean()
          .exec();

        const merged = createHistoricalPlayer(oldPlayer, newPlayer);

        const additionalStats = flatten(merged) as LeaderboardAdditionalStats;
        additionalStats.name = additionalStats.displayName;

        return additionalStats;
      })
    );
  }

  protected async searchLeaderboardInput(): Promise<number> {
    throw new Error("Misuse of searchLeaderboardInput in historical");
  }

  private async searchHistoricalLeaderboardInput(
    time: CurrentHistoricalType,
    input: string,
    field: string
  ): Promise<number> {
    if (input.length <= 16) {
      const player = await this.historicalService.get(input, time);

      if (!player) throw new PlayerNotFoundException();
      input = player.uuid;
    }

    const ranking = await this.getLeaderboardRankings(Player, [field], input);

    if (!ranking || !ranking[0] || !ranking[0].rank) throw new PlayerNotFoundException();

    return ranking[0].rank;
  }

  private async getHistoricalLeaderboardFromRedis<T>(
    time: HistoricalType,
    constructor: Constructor<T>,
    field: string,
    top: number,
    bottom: number,
    sort = "DESC"
  ) {
    const transaction = Sentry.getCurrentHub().getScope()?.getTransaction();

    const child = transaction?.startChild({
      op: "redis",
      description: `get ${time} ${constructor.name} leaderboards`,
    });

    const name = constructor.name.toLowerCase();
    field = `${time}:${name}.${field}`;

    const scores = await (sort === "ASC"
      ? this.redis.zrange(field, top, bottom, "WITHSCORES")
      : this.redis.zrevrange(field, top, bottom, "WITHSCORES"));

    child?.finish();

    const response: { id: string; score: number; index: number }[] = [];

    for (let i = 0; i < scores.length; i += 2) {
      const id = scores[i];
      const score = Number(scores[i + 1]);

      response.push({ id, score, index: i / 2 + top });
    }

    return response;
  }
}
