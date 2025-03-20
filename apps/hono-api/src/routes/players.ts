/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type CacheLevel, CacheLevelSchema, PlayerSlugSchema } from "../validation.js";
import { HTTPException } from "hono/http-exception";
import { Hono } from "hono";
import { Player, deserialize, serialize } from "@statsify/schemas";
import { flatten } from "@statsify/util";
import { getModelForClass } from "@typegoose/typegoose";
import { hypixel } from "../hypixel.js";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import type { Project, Projection } from "../project.js";

const PlayerModel = getModelForClass(Player);

const PlayerNotFoundException = new HTTPException(404, { message: "Player not found" });
const StatusNotFoundException = new HTTPException(404, { message: "Status not found" });

// TODO: Update Player, Get Player Group

export const playersRouter = new Hono()
  // Get Player
  .get(
    "/",
    zValidator("query", z.object({
      player: PlayerSlugSchema,
      cache: CacheLevelSchema.default("Cache"),
    })),
    async (c) => {
      const { player: tag, cache } = c.req.valid("query");
      const player = await getPlayer(tag, cache);

      return c.json({ player });
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
  .get("/status", zValidator("query", z.object({ player: PlayerSlugSchema })), async (c) => {
    const { player: tag } = c.req.valid("query");

    const player = await getPlayer(tag, "Cache", {
      uuid: true,
      displayName: true,
      prefixName: true,
      status: true,
    });

    const [status, recentGames] = await Promise.all([
      hypixel.status(player.uuid),
      hypixel.recentGames(player.uuid),
    ]);

    if (!status) throw StatusNotFoundException;

    status.uuid = player.uuid;
    status.displayName = player.displayName;
    status.prefixName = player.prefixName;
    status.actions = player.status;
    status.recentGames = recentGames;

    return c.json({ player });
  })
  // Get a Group of Players
  .get(
    "/group",
    zValidator("query", z.object({
      start: z.number().int().nonnegative(),
      end: z.number().int().positive(),
    })),
    (c) => c.text("Hello World")
  );

/**
 *
 * @param tag a player slug
 * @returns whether a player slug is a Uuid or a Username
 */
function identifyTagKind(tag: string) {
  return tag.length >= 32 ? "uuid" : "name";
}

function shouldCachePlayer(player: Player, cache: CacheLevel) {
  return (
    cache !== "Live" &&
    (cache === "CacheOnly" || Date.now() < player.expiresAt)
  );
}

async function getPlayer(tag: string, cache: CacheLevel): Promise<Player>;
async function getPlayer<P extends Projection<Player>>(
  tag: string,
  cache: CacheLevel,
  projection: P
): Promise<Project<Player, P>>;
async function getPlayer<P extends Projection<Player>>(
  tag: string,
  cache: CacheLevel,
  projection?: P
): Promise<Project<Player, P>> {
  const kind = identifyTagKind(tag);

  const cachedPlayer = await PlayerModel
    .findOne()
    .where(kind === "name" ? "usernameToLower" : "uuid")
    .equals(tag)
    .projection(projection)
    .lean()
    .exec();

  if (cachedPlayer) cachedPlayer.cached = true;

  if (cachedPlayer && shouldCachePlayer(cachedPlayer, cache)) {
    const player = deserialize(Player, flatten(cachedPlayer));
    return player;
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

  return deserialize(Player, flatPlayer) as Project<Player, P>;
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
