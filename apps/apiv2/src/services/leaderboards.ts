/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import z from "zod";
import { LeaderboardEnabledMetadata, LeaderboardScanner } from "@statsify/schemas";
import { procedure, router } from "#routing";
import type { Constructor } from "@statsify/util";

const PAGE_SIZE = 10;

export function createLeaderboardRouter<T, K extends { name: string }>(
  constructor: Constructor<T>,
  getDatabaseStats: (ids: string[], fields: (keyof K)[]) => Promise<K[]>
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

        console.log(additionalFieldsMetadata);

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
      .query(() => ({})),
  });
}
