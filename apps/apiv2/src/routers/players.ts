/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import z from "zod";
import { Caching, PlayerTag } from "#validation";
import { deserialize, Player, serialize } from "@statsify/schemas";
import { Players } from "#db";
import { addAutocompleteEntry, createAutocompleteRouter } from "#services/autocomplete";
import { createLeaderboardRouter, modifyLeaderboardEntries } from "#services/leaderboards";
import { flatten } from "@statsify/util";
import { procedure, router } from "#routing";

const isUsername = (player: string) => player.length <= 16;
const shouldCache = (record: { expiresAt: number }, caching: z.TypeOf<typeof Caching>) => caching === "CacheOnly" || (caching === "Cached" && record.expiresAt > Date.now());

export const playersRouter = router({
  get: procedure
    .input(z.object({ player: PlayerTag, caching: Caching }))
    .query(async ({ ctx, input }): Promise<Player> => {
      const cachedPlayer = await Players
        .findOne()
        .where(isUsername(input.player) ? "usernameToLower" : "uuid")
        .equals(input.player)
        .lean()
        .exec();

      if (cachedPlayer !== null && shouldCache(cachedPlayer, input.caching)) {
        return deserialize(Player, flatten(cachedPlayer));
      }

      const player = await ctx.hypixel.player(input.player, isUsername(input.player) ? "name" : "uuid");
      const flattened = flatten(player);

      await Promise.all([
        Players.replaceOne({ uuid: player.uuid }, serialize(Player, flattened), { upsert: true }).exec(),
        addAutocompleteEntry(ctx, Player, player.username),
        modifyLeaderboardEntries(ctx, Player, flattened, "uuid", "add")
      ]);

      return player;
    }),

  delete: procedure
    .input(z.object({ player: PlayerTag }))
    .mutation(async ({ input }) => {
      const result = await Players
        .deleteOne()
        .where(isUsername(input.player) ? "usernameToLower" : "uuid")
        .equals(input.player)
        .exec();

      return { success: result.acknowledged };
    }),

  leaderboards: createLeaderboardRouter(
    Player,
    (ids, fields) => Players
      .aggregate()
      .match({ uuid: { $in: ids } })
      .append({ $set: { _index: { $indexOfArray: [ids, "$uuid"] } } })
      .sort({ _index: 1 })
      .append({ $unset: "_index" })
      .project({ name: "$displayName", ...Object.fromEntries(fields.map((field) => [field, 1])) })
      .exec()
      .then((players) => players.map((player) => flatten(player) as any))
  ),

  autocomplete: createAutocompleteRouter(Player),
});
