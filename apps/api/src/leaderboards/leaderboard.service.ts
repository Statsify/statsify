/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import * as Sentry from "@sentry/node";
import type { Flatten } from "@statsify/util";
import { DateTime } from "luxon";
import { InjectRedis } from "#redis";
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import {
  type EnabledLeaderboard,
  type ModelSchema,
  getField,
  getLeaderboardFields,
} from "@statsify/schemas";
import { LeaderboardQuery } from "@statsify/api-client";
import { Redis } from "ioredis";

const DAYS_IN_WEEK = {
  monday: 0,
  tuesday: 1,
  wednesday: 2,
  thursday: 3,
  friday: 4,
  saturday: 5,
  sunday: 6,
};

export type LeaderboardAdditionalStats = Record<string, any> & { name: string };

// The API formats leaderboard values in English until the bot localizes them
const LOCALE = "en-US";

const getLeaderboardField = (schema: ModelSchema, path: string) => {
  const field = getField(schema, path);
  if (!field) throw new Error(`${path} is not a field for ${schema.name}`);
  return field;
};

const getEnabledLeaderboard = (schema: ModelSchema, path: string) => {
  const { leaderboard } = getLeaderboardField(schema, path);
  if (!leaderboard.enabled) throw new Error(`${path} is not a leaderboard field for ${schema.name}`);
  return leaderboard;
};

@Injectable()
export abstract class LeaderboardService {
  public constructor(@InjectRedis() protected readonly redis: Redis) {}

  public async addLeaderboards<T>(
    schema: ModelSchema,
    instance: Flatten<T>,
    idField: keyof T,
    remove = false
  ) {
    const fields = getLeaderboardFields(schema);
    const transaction = Sentry.getCurrentHub().getScope()?.getTransaction();

    const child = transaction?.startChild({
      op: "redis",
      description: `add ${schema.name} leaderboards`,
    });

    const pipeline = this.redis.pipeline();
    const name = schema.name.toLowerCase();

    const id = instance[idField] as unknown as string;

    for (const { path, leaderboard } of fields) {
      const value = (instance as Record<string, unknown>)[path];
      const key = `${name}.${path}`;

      if (remove || value === 0 || Number.isNaN(value) || typeof value !== "number") {
        pipeline.zrem(key, id);
        continue;
      }

      pipeline.zadd(key, value, id);

      if (leaderboard.resetEvery) {
        const time = this.getLeaderboardExpiryTime(leaderboard);
        pipeline.expireat(key, time);
      }
    }

    await pipeline.exec();

    child?.finish();
  }

  public async getLeaderboard(
    schema: ModelSchema,
    field: string,
    input: number | string,
    type: LeaderboardQuery
  ) {
    const PAGE_SIZE = 10;

    const { fieldName, additionalFields, extraDisplay, format, sort, name, hidden } =
      getEnabledLeaderboard(schema, field);

    let top: number;
    let bottom: number;
    let highlight: number | undefined = undefined;

    switch (type) {
      case LeaderboardQuery.PAGE:
        top = (input as number) * PAGE_SIZE;
        bottom = top + PAGE_SIZE;
        break;

      case LeaderboardQuery.INPUT: {
        const ranking = await this.searchLeaderboardInput(input as string, field);
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

    const leaderboard = await this.getLeaderboardFromRedis(
      schema,
      field,
      top,
      bottom - 1,
      sort
    );

    const additionalFieldMetadata = additionalFields.map((k) => getLeaderboardField(schema, k));

    const extraDisplayMetadata = extraDisplay ? getLeaderboardField(schema, extraDisplay) : undefined;

    const additionalStats = await this.getAdditionalStats(
      leaderboard.map(({ id }) => id),
      [
        ...additionalFields.filter((k) => k !== field),
        ...(extraDisplay ? [extraDisplay] : []),
      ]
    );

    const data = leaderboard.map((doc, index) => {
      const stats = additionalStats[index];

      if (extraDisplay) {
        const extraDisplayValue = stats[extraDisplay] ?? extraDisplayMetadata?.store.default;
        // Only add the extra display if it exists
        stats.name = extraDisplayValue ? `${extraDisplayValue}§r ${stats.name}` : stats.name;
      }

      const field = format ? format.format(doc.score, LOCALE) : doc.score;

      const additionalValues = additionalFields.map((key, index) => {
        const { leaderboard, store } = additionalFieldMetadata[index];
        const value = stats[key] ?? store.default;

        if (leaderboard.format) return leaderboard.format.format(value, LOCALE);

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
    fields.push(...additionalFieldMetadata.map(({ leaderboard }) => leaderboard.fieldName));

    return {
      name,
      fields,
      data,
      page: top / PAGE_SIZE,
    };
  }

  public async getLeaderboardRankings(
    schema: ModelSchema,
    fields: string[],
    id: string
  ) {
    const transaction = Sentry.getCurrentHub().getScope()?.getTransaction();

    const child = transaction?.startChild({
      op: "redis",
      description: `get ${schema.name} rankings`,
    });

    const pipeline = this.redis.pipeline();
    const schemaName = schema.name.toLowerCase();

    const leaderboardFields: EnabledLeaderboard[] = [];

    for (const field of fields) {
      const metadata = getEnabledLeaderboard(schema, field);
      leaderboardFields.push(metadata);

      const key = `${schemaName}.${field}`;

      pipeline.zscore(key, id);

      if (metadata.sort === "ASC") {
        pipeline.zrank(key, id);
      } else {
        pipeline.zrevrank(key, id);
      }
    }

    const responses = await pipeline.exec();

    child?.finish();

    if (!responses) throw new InternalServerErrorException();

    const rankings = [];

    for (let i = 0; i < responses.length; i += 2) {
      const rank = responses[i + 1][1];
      const value = responses[i][1];

      if (rank === undefined || rank === null || !value) continue;

      const index = i / 2;
      const metadata = leaderboardFields[index];

      if (Number(rank) > metadata.limit) continue;

      const numberValue = Number(value);

      const formattedValue = metadata.format ?
        metadata.format.format(numberValue, LOCALE) :
        numberValue;

      rankings.push({
        field: fields[index],
        rank: Number(rank) + 1,
        value: formattedValue,
        name: metadata.name,
      });
    }

    return rankings;
  }

  protected abstract searchLeaderboardInput(
    input: string,
    field: string
  ): Promise<number>;

  protected abstract getAdditionalStats(
    ids: string[],
    fields: string[]
  ): Promise<LeaderboardAdditionalStats[]>;

  private async getLeaderboardFromRedis(
    schema: ModelSchema,
    field: string,
    top: number,
    bottom: number,
    sort = "DESC"
  ) {
    const transaction = Sentry.getCurrentHub().getScope()?.getTransaction();

    const child = transaction?.startChild({
      op: "redis",
      description: `get ${schema.name} leaderboards`,
    });

    const name = schema.name.toLowerCase();
    field = `${name}.${field}`;

    const scores = await (sort === "ASC" ?
      this.redis.zrange(field, top, bottom, "WITHSCORES") :
      this.redis.zrevrange(field, top, bottom, "WITHSCORES"));

    child?.finish();

    const response: { id: string; score: number; index: number }[] = [];

    for (let i = 0; i < scores.length; i += 2) {
      const id = scores[i];
      const score = Number(scores[i + 1]);

      response.push({ id, score, index: i / 2 + top });
    }

    return response;
  }

  private getLeaderboardExpiryTime(leaderboard: EnabledLeaderboard): number {
    if (!leaderboard.resetEvery)
      throw new Error("To get a leaderboard expiry time, `resetEvery` must be specified");

    if (leaderboard.resetEvery === "day")
      return Math.ceil(DateTime.now().endOf("day").toSeconds());

    const now = new Date();
    const dayIndex = DAYS_IN_WEEK[leaderboard.resetEvery];

    // Reset at 12:00 AM on the next day
    now.setDate(now.getDate() + ((dayIndex - now.getDay() + 7) % 7) + 1);
    now.setHours(0, 0, 0, 0);

    return Math.ceil(now.getTime() / 1000);
  }
}
