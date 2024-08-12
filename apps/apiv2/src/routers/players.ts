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
import { Context } from "#trpc";
import { ONE_MINUTE, shouldCache } from "#util";
import { Players } from "#db";
import { addAutocompleteEntry, createAutocompleteRouter, removeAutocompleteEntry } from "#services/autocomplete";
import { createLeaderboardRouter, addLeaderboardEntries, removeLeaderboardEntries } from "#services/leaderboards";
import { flatten } from "@statsify/util";
import { procedure, router } from "#routing";

export const isUsername = (player: string) => player.length <= 16;

const CACHE_TIME = 2 * ONE_MINUTE;
const PlayerInput = z.object({ player: PlayerTag, caching: Caching });

export async function getPlayer(ctx: Context, input: z.TypeOf<typeof PlayerInput>): Promise<Player> {
  const cachedPlayer = await Players
    .findOne()
    .where(isUsername(input.player) ? "usernameToLower" : "uuid")
    .equals(input.player)
    .lean()
    .exec();

  if (cachedPlayer !== null && shouldCache(cachedPlayer, input.caching)) {
    return deserialize(Player, flatten(cachedPlayer));
  }

  const isInputUsername = isUsername(input.player);

  // Only use the cached UUID if the input is a username and the cached player's expiration time is less than 5 minutes
  // This is to prevent an issue where two players with the same username exist in Hypixel's database because one hasn't logged in after changing their name
  const canUseCachedUuid =
    isInputUsername &&
    cachedPlayer !== null &&
    Date.now() - cachedPlayer.expiresAt <= 5 * ONE_MINUTE;

  const queryType = (canUseCachedUuid || !isInputUsername) ? "uuid" : "name";
  const player = await ctx.hypixel.player(canUseCachedUuid ? cachedPlayer.uuid : input.player, queryType);

  player.expiresAt = Date.now() + CACHE_TIME;
  player.guildId = cachedPlayer?.guildId;
  player.isNew = cachedPlayer === null;

  const flattened = flatten(player);

  // Don't await these operations because they don't affect the response
  Players
    .replaceOne({ uuid: player.uuid }, serialize(Player, flattened), { upsert: true })
    .exec()
    .catch((error) => ctx.logger.error(`Failed to cache player ${player.uuid} in MongoDB`, error));

  addAutocompleteEntry(ctx, Player, player.username);
  addLeaderboardEntries(ctx, Player, flattened, "uuid");

  // If the player's username has changed, remove the old autocomplete entry
  if (cachedPlayer?.uuid === player.uuid && cachedPlayer.username !== player.username) {
    removeAutocompleteEntry(ctx, Player, cachedPlayer.username);
  }

  return deserialize(Player, flattened);
}

export const playersRouter = router({
  get: procedure
    .input(PlayerInput)
    .query(({ ctx, input }): Promise<Player> => getPlayer(ctx, input)),

  delete: procedure
    .input(z.object({ player: PlayerTag }))
    .mutation(async ({ ctx, input }): Promise<{ success: boolean }> => {
      const players = await Players
        .find()
        .where(isUsername(input.player) ? "usernameToLower" : "uuid")
        .equals(input.player)
        .exec();

      if (players.length === 0) return { success: false };

      const transactions = players.map(async (player) => {
        removeAutocompleteEntry(ctx, Player, player.username);
        removeLeaderboardEntries(ctx, Player, player, "uuid");
      });

      transactions.push(
        Players
          .deleteMany({ _id: { $in: players.map((player) => player._id) } })
          .exec()
          .then(() => {})
      );

      await Promise.all(transactions);

      return { success: true };
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