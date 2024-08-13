/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import z from "zod";
import { Context } from "#trpc";
import { DateTime } from "luxon";
import { LeaderboardEnabledMetadata, LeaderboardMetadata, LeaderboardScanner } from "@statsify/schemas";
import { procedure, router } from "#routing";
import type { Constructor, Flatten } from "@statsify/util";

const PAGE_SIZE = 10;

export function createLeaderboardRouter<T, K extends { name: string }>(
  constructor: Constructor<T>,
  getDatabaseStats: (ids: string[], fields: (keyof K)[]) => Promise<K[]>,
  getIdFromTag: (tag: string) => Promise<string | undefined>
) {
  const fields = LeaderboardScanner.getLeaderboardFields(constructor);

  const paths = new Set(fields.map(([path]) => path));
  const LeaderboardField = z.string().refine((s) => paths.has(s));

  return router({
    get: procedure
      .input(z.intersection(
        z.object({ field: LeaderboardField }),
        z.union([
          z.object({ page: z.number().int().min(0) }),
          z.object({ tag: z.string() }),
          // [TODO]: adjust discord-bot by subtracting position by 1
          z.object({ position: z.number().int().min(0) }),
        ])
      ))
      .query(async ({ ctx, input }) => {
        const metadata = LeaderboardScanner.getLeaderboardField(
          constructor,
          input.field
        ) as LeaderboardEnabledMetadata;

        // The fisrt leaderboard position of the page
        let top: number;
        // A position searched by the user either via position or tag
        let highlight: number | undefined = undefined;

        if ("page" in input) {
          top = input.page * PAGE_SIZE;
        } else if ("position" in input) {
          highlight = input.position;
          top = input.position - (input.position % PAGE_SIZE);
        } else {
          // [TODO]: find ranking of tag
          const id = await getIdFromTag(input.tag);
          const ranking = 0;
          highlight = ranking;
          top = ranking - (ranking % PAGE_SIZE);
        }

        const bottom = top + PAGE_SIZE;

        // Query the redis sorted set for the leaderboard
        const scores = await (metadata.sort === "ASC" ?
          ctx.redis.zrange(`${constructor.name.toLowerCase()}.${input.field}`, top, bottom, "WITHSCORES") :
          ctx.redis.zrevrange(`${constructor.name.toLowerCase()}.${input.field}`, top, bottom, "WITHSCORES"));

        const parsedScores: { id: string; score: number; position: number }[] = [];

        for (let i = 0; i < scores.length; i += 2) {
          parsedScores.push({ id: scores[i], score: Number(scores[i + 1]), position: i / 2 + top });
        }

        const prefixField = metadata.extraDisplay as keyof K | undefined;

        const additionalFields = (metadata
          .additionalFields
          ?.filter((field) => field !== input.field) ?? []) as unknown as (keyof K)[];

        const databaseFields = [...additionalFields];
        if (prefixField) databaseFields.push(prefixField);

        // Query the database for the additional fields and the prefix field
        const databaseStats = await getDatabaseStats(
          parsedScores.map(({ id }) => id),
          databaseFields
        );

        const prefixMetadata = prefixField ?
          LeaderboardScanner.getLeaderboardField(constructor, prefixField as string, false) :
          undefined;

        const additionalFieldsMetadata = metadata
          .additionalFields
          ?.map((field) => LeaderboardScanner.getLeaderboardField(constructor, field, false)) ?? [];

        const items = parsedScores.map((item, index) => {
          const itemStats = databaseStats[index];

          // Append the extra display field to the name
          if (prefixField) {
            const prefix = itemStats[prefixField] ?? prefixMetadata?.default;
            itemStats.name = `${prefix}§r ${itemStats.name}`;
          }

          const value = metadata.formatter ? metadata.formatter(item.score) : item.score;

          const fields = additionalFields.map((field, index) => {
            const fieldMetadata = additionalFieldsMetadata[index];
            const value = itemStats[field] ?? fieldMetadata.default;
            return fieldMetadata.formatter ? fieldMetadata.formatter(value) : value;
          });

          if (!metadata.hidden) fields.unshift(value);

          return {
            id: item.id,
            fields,
            name: itemStats.name,
            position: item.position,
            highlight: item.position === highlight,
          };
        });

        const fields = additionalFieldsMetadata.map((field) => field.fieldName!);
        if (!metadata.hidden) fields.unshift(metadata.fieldName!);

        return {
          title: metadata.name,
          page: top / PAGE_SIZE,
          items,
          fields,
        };
      }),

    rankings: procedure
      .input(z.object({
        fields: z.array(LeaderboardField),
        tag: z.string(),
      }))
      .query(async ({ ctx, input }) => {
        const id = await getIdFromTag(input.tag);
        const pipeline = ctx.redis.pipeline();
        const constructorName = constructor.name.toLowerCase();

        const leaderboardFields: LeaderboardEnabledMetadata[] = [];

        input.fields.forEach((field) => {
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

        const responses = await pipeline.exec() ?? [];
        const rankings: { field: string; position: number; value: any; title: string }[] = [];

        for (let i = 0; i < responses.length; i += 2) {
          const rank = responses[i + 1][1];
          const value = responses[i][1];

          if (rank === undefined || rank === null || !value) continue;

          const index = i / 2;
          const metadata = leaderboardFields[index];

          // Filter out any invalid rankings
          if (Number(rank) > metadata.limit) continue;

          const numberValue = Number(value);

          const formattedValue = metadata.formatter ?
            metadata.formatter(numberValue) :
            numberValue;

          rankings.push({
            field: input.fields[index],
            position: Number(rank),
            value: formattedValue,
            title: metadata.name,
          });
        }

        return { id, rankings };
      }),
  });
}

export function addLeaderboardEntries<T>(
  ctx: Context,
  constructor: Constructor<T>,
  instance: Flatten<T>,
  idField: keyof T
) {
  return modifyLeaderboardEntries(ctx, constructor, "add", instance, idField);
}

export function removeLeaderboardEntries<T>(
  ctx: Context,
  constructor: Constructor<T>,
  instance: Flatten<T>,
  idField: keyof T
) {
  return modifyLeaderboardEntries(ctx, constructor, "remove", instance, idField);
}

async function modifyLeaderboardEntries<T>(ctx: Context, constructor: Constructor<T>, method: "add" | "remove", instance: Flatten<T>, idField: keyof T) {
  const isRemove = method === "remove";
  const fields = LeaderboardScanner.getLeaderboardFields(constructor);
  const pipeline = ctx.redis.pipeline();
  const name = constructor.name.toLowerCase();

  const id = instance[idField] as unknown as string;

  for (const [field, metadata] of fields) {
    const value = instance[field] as unknown as number;
    const key = `${name}.${String(field)}`;

    // Remove the entry if the method is remove or if the value is an invalid leaderboard value
    if (isRemove || value === 0 || Number.isNaN(value) || typeof value !== "number") {
      pipeline.zrem(key, id);
      continue;
    }

    pipeline.zadd(key, value, id);

    if (metadata.leaderboard.enabled && metadata.leaderboard.resetEvery) {
      pipeline.expireat(key, getResetTime(metadata.leaderboard.resetEvery));
    }
  }

  try {
    await pipeline.exec();
  } catch (error) {
    ctx.logger.error(`Failed to ${method} ${constructor.name.toLowerCase()} ${id} in the leaderboard: ${error}`);
  }
}

type ResetEvery = NonNullable<LeaderboardMetadata["resetEvery"]>;

const DAYS_IN_WEEK: Record<Exclude<ResetEvery, "day">, number> = {
  monday: 0,
  tuesday: 1,
  wednesday: 2,
  thursday: 3,
  friday: 4,
  saturday: 5,
  sunday: 6,
};

function getResetTime(resetEvery: ResetEvery) {
  if (resetEvery === "day")
    return Math.ceil(DateTime.now().endOf("day").toSeconds());

  const now = new Date();
  const dayIndex = DAYS_IN_WEEK[resetEvery];

  // Reset at 12:00 AM on the next day
  now.setDate(now.getDate() + ((dayIndex - now.getDay() + 7) % 7) + 1);
  now.setHours(0, 0, 0, 0);

  return Math.ceil(now.getTime() / 1000);
}
