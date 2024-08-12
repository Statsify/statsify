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

export function createLeaderboardRouter<T>(constructor: Constructor<T>) {
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
        const PAGE_SIZE = 10;

        const metadata = LeaderboardScanner.getLeaderboardField(
          constructor,
          input.field
        ) as LeaderboardEnabledMetadata;

        let top: number;
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

        const leaderboard = await this.getLeaderboardFromRedis(
          constructor,
          input.field,
          top,
          bottom - 1,
          metadata.sort
        );

        const additionalFieldMetadata = metadata.additionalFields.map((k) =>
          LeaderboardScanner.getLeaderboardField(constructor, k, false)
        );

        const extraDisplayMetadata = metadata.extraDisplay ?
          LeaderboardScanner.getLeaderboardField(constructor, metadata.extraDisplay, false) :
          undefined;

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
      }),

    rankings: procedure
      .input(z.object({
        fields: z.array(LeaderboardField),
        tag: z.string(),
      }))
      .query(() => ({})),
  });
}
