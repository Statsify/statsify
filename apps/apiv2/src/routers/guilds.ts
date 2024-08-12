/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import z from "zod";
import { Caching, GuildInput } from "#validation";
import { Guild } from "@statsify/schemas";
import { Guilds } from "#db";
import { createAutocompleteRouter } from "#services/autocomplete";
import { createLeaderboardRouter } from "#services/leaderboards";
import { flatten } from "@statsify/util";
import { procedure, router } from "#routing";

export const guildsRouter = router({
  get: procedure
    .input(z.intersection(GuildInput, z.object({ caching: Caching })))
    .query(({ ctx, input }) => {
      const guild = new Guild();

      return { guild };
    }),

  delete: procedure
    .input(GuildInput)
    .mutation(() => ({ players: [] })),

  leaderboards: createLeaderboardRouter(
    Guild,
    (ids, fields) => Guilds
      .aggregate()
      .match({ id: { $in: ids } })
      .append({ $set: { _index: { $indexOfArray: [ids, "$id"] } } })
      .sort({ _index: 1 })
      .append({ $unset: "_index" })
      .project({ name: 1, ...Object.fromEntries(fields.map((field) => [field, 1])) })
      .exec()
      .then((guilds) => guilds.map((guild) => flatten(guild) as any))
  ),
  autocomplete: createAutocompleteRouter(),
});
