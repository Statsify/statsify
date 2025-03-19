/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { HTTPException } from "hono/http-exception";
import { Hono } from "hono";
import { Player, deserialize, serialize } from "@statsify/schemas";
import { PlayerSlugSchema } from "../validation.js";
import { flatten } from "@statsify/util";
import { getModelForClass } from "@typegoose/typegoose";
import { hypixel } from "../hypixel.js";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const PlayerModel = getModelForClass(Player);

const PlayerNotFoundException = new HTTPException(404, { message: "Player not found" });

export const playersRouter = new Hono()
  // Get Player
  .get("/", zValidator("query", z.object({ player: PlayerSlugSchema })), async (c) => {
    const { player: tag } = c.req.valid("query");
    const kind = identifyTagKind(tag);

    const cachedPlayer = await PlayerModel
      .findOne()
      .where(kind === "name" ? "usernameToLower" : "uuid")
      .equals(tag)
      .lean()
      .exec();

    if (cachedPlayer) cachedPlayer.cached = true;

    if (cachedPlayer && shouldCachePlayer(cachedPlayer, CacheLevels.Cache)) {
      const player = deserialize(Player, flatten(cachedPlayer));
      return c.json({ success: true, player });
    }

    const player = await hypixel.player(tag, kind);

    if (!player) throw PlayerNotFoundException;

    player.expiresAt = Date.now() + 120_000;
    player.sessionReset = cachedPlayer?.sessionReset;
    player.guildId = cachedPlayer?.guildId;

    if (cachedPlayer && cachedPlayer.username !== player.username) {
      // TODO: delete autocomplete
      // await this.playerSearchService.delete(mongoPlayer.username);
    }

    const flatPlayer = await savePlayer(player, true);
    flatPlayer.isNew = !cachedPlayer;

    return c.json({ player: deserialize(Player, flatPlayer) });
  })
  // Update Player
  .post("/", (c) => c.text("Hello World"))
  // Delete Player
  .delete("/", zValidator("query", z.object({ player: PlayerSlugSchema })), async (c) => {
    const { player: tag } = c.req.valid("query");
    const kind = identifyTagKind(tag);

    const players = await PlayerModel
      .find()
      .where(kind)
      .equals(tag)
      .lean()
      .exec();

    if (!players.length) throw PlayerNotFoundException;

    // TODO: delete from leaderboards and autocomplete
    await PlayerModel
      .deleteMany({ uuid: { $in: players.map((player) => player.uuid) } })
      .exec();

    return c.json({ success: true });
  })
  // Get Player Status
  .get("/status", zValidator("query", z.object({ player: PlayerSlugSchema })), (c) => c.text("Hello World"))
  // Get a Group of Players
  .get("/group", zValidator("query", z.object({ start: z.number().int().nonnegative(), end: z.number().int().positive() })), (c) => c.text("Hello World"));

/**
 *
 * @param tag a player slug
 * @returns whether a player slug is a Uuid or a Username
 */
function identifyTagKind(tag: string) {
  return tag.length >= 32 ? "uuid" : "name";
}

const CacheLevels = {
  Cache: "CACHE",
  CacheOnly: "CACHE_ONLY",
  Live: "LIVE",
} as const;

type CacheLevel = (typeof CacheLevels)[keyof typeof CacheLevels];

function shouldCachePlayer(player: Player, cacheLevel: CacheLevel) {
  return (
    cacheLevel !== CacheLevels.Live &&
    (cacheLevel === CacheLevels.CacheOnly || Date.now() < player.expiresAt)
  );
}

async function savePlayer(player: Player, registerSearch: boolean) {
  const flatPlayer = flatten(player);

  const promises = [
    PlayerModel
      .replaceOne({ uuid: player.uuid }, serialize(Player, flatPlayer), { upsert: true })
      .exec(),
    // TODO: add player to leaderboards
    // this.playerLeaderboardService.addLeaderboards(Player, flatPlayer, "uuid", false),
  ];

  if (registerSearch) {
    // TODO: add player to autocomplete
    //   promises.push(this.playerSearchService.add(flatPlayer as RedisPlayer));
  }

  await Promise.all(promises);

  return flatPlayer;
}
