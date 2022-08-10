/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import * as Sentry from "@sentry/node";
import { Constructor, Flatten } from "@statsify/util";
import { InjectRedis, Redis } from "@nestjs-modules/ioredis";
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { LeaderboardEnabledMetadata, LeaderboardScanner } from "@statsify/schemas";
import { LeaderboardQuery } from "@statsify/api-client";

export type LeaderboardAdditionalStats = Record<string, any> & { name: string };

@Injectable()
export abstract class LeaderboardService {
  public constructor(@InjectRedis() private readonly redis: Redis) {}

  public async addLeaderboards<T>(
    constructor: Constructor<T>,
    instance: Flatten<T>,
    idField: keyof T,
    fields: string[] = LeaderboardScanner.getLeaderboardFields(constructor),
    remove = false
  ) {
    const transaction = Sentry.getCurrentHub().getScope()?.getTransaction();

    const child = transaction?.startChild({
      op: "redis",
      description: `add ${constructor.name} leaderboards`,
    });

    const pipeline = this.redis.pipeline();
    const name = constructor.name.toLowerCase();

    const id = instance[idField] as unknown as string;

    fields
      .filter((field) => remove || typeof instance[field] === "number")
      .forEach((field) => {
        const value = instance[field] as unknown as number;

        if (remove || value === 0 || Number.isNaN(value)) {
          pipeline.zrem(`${name}.${String(field)}`, id);
        } else {
          pipeline.zadd(`${name}.${String(field)}`, value, id);
        }
      });

    await pipeline.exec();

    child?.finish();
  }

  public async getLeaderboard<T>(
    constructor: Constructor<T>,
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
      constructor,
      field,
      top,
      bottom - 1,
      sort
    );

    const additionalFieldMetadata = additionalFields.map((k) =>
      LeaderboardScanner.getLeaderboardField(
        constructor,
        k.startsWith("this.")
          ? k.replace(/this/, field.split(".").slice(0, -1).join("."))
          : k,
        false
      )
    );

    const extraDisplayMetadata = extraDisplay
      ? LeaderboardScanner.getLeaderboardField(constructor, extraDisplay, false)
      : undefined;

    const additionalStats = await this.getAdditionalStats(
      leaderboard.map(({ id }) => id),
      [
        ...additionalFields.filter((k) => k !== field),
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
      name,
      fields,
      data,
      page: top / PAGE_SIZE,
    };
  }

  public async getLeaderboardRankings<T>(
    constructor: Constructor<T>,
    fields: string[],
    id: string
  ) {
    const transaction = Sentry.getCurrentHub().getScope()?.getTransaction();

    const child = transaction?.startChild({
      op: "redis",
      description: `get ${constructor.name} rankings`,
    });

    const pipeline = this.redis.pipeline();
    const constructorName = constructor.name.toLowerCase();

    const leaderboardFields: LeaderboardEnabledMetadata[] = [];

    fields.forEach((field) => {
      const metadata = LeaderboardScanner.getLeaderboardField(constructor, field);
      leaderboardFields.push(metadata);

      const key = `${constructorName}.${field}`;

      pipeline.zscore(key, id);

      if (metadata.sort === "ASC") {
        pipeline.zrank(key, id);
      } else {
        pipeline.zrevrank(key, id);
      }
    });

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

      const formattedValue = metadata.formatter
        ? metadata.formatter(numberValue)
        : numberValue;

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

  private async getLeaderboardFromRedis<T>(
    constructor: Constructor<T>,
    field: string,
    top: number,
    bottom: number,
    sort = "DESC"
  ) {
    const transaction = Sentry.getCurrentHub().getScope()?.getTransaction();

    const child = transaction?.startChild({
      op: "redis",
      description: `get ${constructor.name} leaderboards`,
    });

    const name = constructor.name.toLowerCase();
    field = `${name}.${field}`;

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
