/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiException } from "../exception.ts";
import { type Day, endOfToday, nextDay, startOfDay } from "date-fns";
import { Hono } from "hono";
import { type LeaderboardEnabledMetadata, LeaderboardScanner } from "@statsify/schemas";
import { Permissions, Policy, type Predicate, auth } from "../auth.ts";
import { redis } from "../db/redis.ts";
import { validator } from "../validation.ts";
import { z } from "zod";
import type { ChainableCommander } from "ioredis";
import type { Constructor, Flatten } from "@statsify/util";
import type { KeysOfType } from "../db/project.ts";

const LEADERBOARD_PAGE_SIZE = 10;

const LeaderboardPageNotFound = new ApiException(404, ["Leaderboard Page Not Found"]);
const RankingsNotFound = new ApiException(404, ["Rankings Not Found"]);

export type LeaderboardAdditionalStats = Record<string, any> & { name: string };

type LeaderboardServiceOptions<T extends object, K extends keyof T> = {
  constructor: Constructor<T>;
  identifier: T[K] extends string ? K : never;
  identifierSchema: z.ZodSchema<string>;
  getAdditionalStats: (ids: string[], fields: string[]) => Promise<LeaderboardAdditionalStats[]>;
  policy?: Predicate;
};

export function createLeaderboardService<T extends object, K extends keyof T>({
  constructor,
  identifier,
  identifierSchema,
  getAdditionalStats,
  policy,
}: LeaderboardServiceOptions<T, K>) {
  const name = constructor.name.toLowerCase();
  const fields = LeaderboardScanner.getLeaderboardFields(constructor);

  const fieldsSchema = z.enum(
    fields.map(([field]) => field) as [KeysOfType<T, number>, ...(KeysOfType<T, number>[])]
  );

  function modifyLeaderboards(pipeline: ChainableCommander, instance: Flatten<T>, method: "add" | "remove") {
    const id = instance[identifier];
    const isRemove = method === "remove";

    for (const [field, metadata] of fields) {
      const value = instance[field] as unknown as number;
      const key = `${name}.${String(field)}`;

      if (isRemove || value === 0 || Number.isNaN(value) || typeof value !== "number") {
        pipeline.zrem(key, id);
        continue;
      }

      pipeline.zadd(key, value, id);

      if (metadata.leaderboard.enabled && metadata.leaderboard.resetEvery) {
        const date = leaderboardExpireyDate(metadata.leaderboard);
        const time = Math.ceil(date.getTime() / 1000);
        pipeline.expireat(key, time);
      }
    }
  }

  const addLeaderboards = (pipeline: ChainableCommander, instance: Flatten<T>) => modifyLeaderboards(pipeline, instance, "add");
  const removeLeaderboards = (pipeline: ChainableCommander, instance: Flatten<T>) => modifyLeaderboards(pipeline, instance, "remove");

  async function getRedisLeaderboard(field: string, start: number, end: number, sort: "ASC" | "DESC") {
    const name = constructor.name.toLowerCase();
    field = `${name}.${field}`;

    const range = sort === "ASC" ? redis.zrange : redis.zrevrange;
    const scores = await range.call(redis, field, start, end, "WITHSCORES");

    const leaderboard: { id: string; score: number; index: number }[] = [];

    for (let i = 0; i < scores.length; i += 2) {
      const id = scores[i];
      const score = Number(scores[i + 1]);
      leaderboard.push({ id, score, index: i / 2 + start });
    }

    return leaderboard;
  }

  async function getRedisRankings(id: string, fields: string[]) {
    const pipeline = redis.pipeline();

    const fieldMetadata: LeaderboardEnabledMetadata[] = [];

    for (const field of fields) {
      console.log(field);
      const metadata = LeaderboardScanner.getLeaderboardField(constructor, field);
      fieldMetadata.push(metadata);

      const key = `${name}.${field}`;
      pipeline.zscore(key, id);

      const rank = metadata.sort === "ASC" ? pipeline.zrank : pipeline.zrevrank;
      rank.call(pipeline, key, id);
    }

    const responses = await pipeline.exec();
    if (!responses) throw RankingsNotFound;

    const rankings = [];

    for (let i = 0; i < responses.length; i += 2) {
      const rank = responses[i + 1][1];
      const value = responses[i][1];

      if (rank === undefined || rank === null || !value) continue;

      const index = i / 2;
      const metadata = fieldMetadata[index];

      // Skip any ranking that is past the leaderboard's limit since it is probably inaccurate
      if (Number(rank) > metadata.limit) continue;

      const numberValue = Number(value);

      const formattedValue = metadata.formatter ?
        metadata.formatter(numberValue) :
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

  const router = new Hono()
    .get(
      "/",
      auth({ policy: Policy.all(Policy.has(Permissions.LeaderboardRead), policy), weight: 3 }),
      validator("query", z.intersection(z.object({ field: fieldsSchema }), z.union([
        z.object({ page: z.coerce.number().int().nonnegative() }),
        z.object({ id: identifierSchema }),
        z.object({ position: z.coerce.number().int().nonnegative().describe("A zero-index leaderboard position") }),
      ]))),
      async (c) => {
        const query = c.req.valid("query");

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
          query.field
        ) as LeaderboardEnabledMetadata;

        let start: number;
        let highlight: number | undefined = undefined;

        if ("page" in query) {
          start = query.page * LEADERBOARD_PAGE_SIZE;
        } else if ("id" in query) {
          const rankings = await getRedisRankings(query.id, [query.field]);
          if (!rankings.length) throw LeaderboardPageNotFound;

          highlight = rankings[0].rank - 1;
          start = highlight - (highlight % 10);
        } else {
          highlight = query.position;
          start = query.position - (query.position % 10);
        }

        const end = start + LEADERBOARD_PAGE_SIZE;

        const leaderboard = await getRedisLeaderboard(
          query.field,
          start,
          end - 1,
          sort
        );

        const additionalFieldMetadata = additionalFields.map((k) =>
          LeaderboardScanner.getLeaderboardField(constructor, k, false)
        );

        const extraDisplayMetadata = extraDisplay ?
          LeaderboardScanner.getLeaderboardField(constructor, extraDisplay, false) :
          undefined;

        const additionalStats = await getAdditionalStats(
          leaderboard.map(({ id }) => id),
          [
            ...additionalFields.filter((k) => k !== query.field),
            ...(extraDisplay ? [extraDisplay] : []),
          ]
        );

        // If not all the data for each item can be found through getAdditionalFields then don't display this page
        if (additionalStats.length !== leaderboard.length) throw LeaderboardPageNotFound;

        const data = leaderboard.map((doc, index) => {
          const stats = additionalStats[index];

          if (extraDisplay) {
            const extraDisplayValue = stats[extraDisplay] ?? extraDisplayMetadata?.default;
            // Only add the extra display if it exists
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
        if (!hidden) fields.push(fieldName!);
        fields.push(...additionalFieldMetadata.map(({ fieldName }) => fieldName!));

        return c.json({
          name,
          fields,
          data,
          page: start / LEADERBOARD_PAGE_SIZE,
        });
      }
    );

  return { router, addLeaderboards, removeLeaderboards };
}

const DaysInWeek: Record<string, Day> = {
  monday: 0,
  tuesday: 1,
  wednesday: 2,
  thursday: 3,
  friday: 4,
  saturday: 5,
  sunday: 6,
};

function leaderboardExpireyDate(leaderboard: LeaderboardEnabledMetadata): Date {
  if (!leaderboard.resetEvery)
    throw new Error("To get a leaderboard expiry time, `resetEvery` must be specified");

  if (leaderboard.resetEvery === "day")
    return endOfToday();

  // Reset at 12:00 AM on the next dayIndex
  const dayIndex = DaysInWeek[leaderboard.resetEvery];
  const nextResetDate = startOfDay(nextDay(new Date(), dayIndex));
  return nextResetDate;
}
