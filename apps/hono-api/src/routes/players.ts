/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiException } from "../exception.ts";
import { type CacheLevel, CacheLevelSchema, PlayerSlugSchema, UsernameSchema, UuidSchema, validator } from "../middleware/validation.ts";
import { Hono } from "hono";
import { type LeaderboardAdditionalStats, createLeaderboardService } from "./leaderboards.ts";
import { Permissions, Policy, auth } from "../middleware/auth.ts";
import { Player, deserialize, serialize } from "@statsify/schemas";
import { createAutocompleteService, onRediSearchError } from "./autocomplete.ts";
import { flatten } from "@statsify/util";
import { getModelForClass } from "@typegoose/typegoose";
import { hypixel } from "../hypixel.ts";
import { openapi } from "../middleware/openapi.ts";
import { redis } from "../db/redis.ts";
import { z } from "zod";
import type { Project, Projection } from "../db/project.ts";

const PlayerModel = getModelForClass(Player);

const PlayerNotFoundException = new ApiException(404, ["Player Not Found"]);
const StatusNotFoundException = new ApiException(404, ["Status Not Found"]);
const HypixelInternalException = new ApiException(500, ["Hypixel API Failure"]);

const PlayerReadOrManage = Policy.some(Policy.has(Permissions.PlayerRead), Policy.has(Permissions.PlayerManage));

// TODO: Update Player, Get Player Group

const { router: autocompleteRouter, addAutocomplete, removeAutocomplete } = createAutocompleteService({
  constructor: Player,
  querySchema: UsernameSchema,
  policy: PlayerReadOrManage,
});

const { router: leaderboardsRouter, addLeaderboards, removeLeaderboards } = createLeaderboardService({
  constructor: Player,
  identifier: "uuid",
  identifierSchema: UuidSchema,
  policy: PlayerReadOrManage,
  getAdditionalStats: async (ids, fields) => {
    const projection = fields.reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);

    const players: Player[] = await PlayerModel
      .aggregate()
      .match({ uuid: { $in: ids } })
      .project({
        ...projection,
        name: "$displayName",
        order: {
          $indexOfArray: [ids, "$uuid"],
        },
      })
      .sort({ order: 1 })
      .exec();

    return players.map((player) => flatten(player) as LeaderboardAdditionalStats);
  },
});

export const playersRouter = new Hono()
  .route("/search", autocompleteRouter)
  .route("/leaderboards", leaderboardsRouter)
  .get(
    "/",
    openapi({
      tags: ["Players"],
      operationId: "getPlayer",
      summary: "Get a Player",
    }),
    auth({ policy: PlayerReadOrManage }),
    validator("query", z.object({
      player: PlayerSlugSchema,
      cache: CacheLevelSchema.default("Cache"),
    })),
    async (c) => {
      const { player: tag, cache } = c.req.valid("query");
      const player = await getPlayer(tag, cache);

      return c.json({ player });
    })
  // Update Player
  .post(
    "/",
    openapi({
      tags: ["Players"],
      operationId: "updatePlayer",
      summary: "Update a Player",
    }),
    auth({ policy: Policy.has(Permissions.PlayerManage) }),
    (c) => c.text("Hello World")
  )
  // Delete Player
  .delete(
    "/",
    openapi({
      tags: ["Players"],
      operationId: "deletePlayer",
      summary: "Delete a Player",
    }),
    auth({ policy: Policy.has(Permissions.PlayerManage) }),
    validator("query", z.object({ player: PlayerSlugSchema })),
    async (c) => {
      const { player: tag } = c.req.valid("query");
      const kind = identifyTagKind(tag);

      const players = await PlayerModel
        .find()
        .where(kind)
        .equals(tag)
        .lean()
        .exec();

      if (!players.length) throw PlayerNotFoundException;

      const pipeline = redis.pipeline();

      for (const player of players) {
        removeLeaderboards(pipeline, player);
        removeAutocomplete(pipeline, player.username);
      }

      try {
        await Promise.allSettled([
          PlayerModel.deleteMany({ uuid: { $in: players.map((player) => player.uuid) } }).exec(),
          pipeline.exec(),
        ]);
      } catch (error) {
        onRediSearchError(error);
      }

      return c.json({ success: true });
    })
  // Get Player Status
  .get(
    "/status",
    openapi({
      tags: ["Players"],
      operationId: "getPlayerStatus",
      summary: "Get a Player's Status",
    }),
    auth({ policy: PlayerReadOrManage, weight: 3 }),
    validator("query", z.object({ player: PlayerSlugSchema })),
    async (c) => {
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
      ]).catch((error) => {
        console.error(error);
        throw HypixelInternalException;
      });

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
    openapi({
      tags: ["Players"],
      operationId: "getPlayerGroup",
      summary: "Get a Group of Players",
    }),
    auth({ policy: Policy.has(Permissions.PlayerManage) }),
    validator("query", z.object({
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
    .select(projection as Record<string, boolean>)
    .lean()
    .exec();

  if (cachedPlayer) cachedPlayer.cached = true;

  if (cachedPlayer && shouldCachePlayer(cachedPlayer, cache)) {
    const player = deserialize(Player, flatten(cachedPlayer));
    return player as Project<Player, P>;
  }

  let player: Player | undefined;

  try {
    player = await hypixel.player(tag, kind);
  } catch (error) {
    console.error(error);

    if (cachedPlayer) {
      const player = deserialize(Player, flatten(cachedPlayer));
      return player as Project<Player, P>;
    }
  }

  if (!player) throw PlayerNotFoundException;

  player.expiresAt = Date.now() + 120_000;
  player.sessionReset = cachedPlayer?.sessionReset;
  player.guildId = cachedPlayer?.guildId;

  const flatPlayer = await savePlayer(player, true, cachedPlayer?.username);
  flatPlayer.isNew = !cachedPlayer;

  return deserialize(Player, flatPlayer) as Project<Player, P>;
}

async function savePlayer(player: Player, registerSearch: boolean, oldUsername?: string) {
  const flatPlayer = flatten(player);

  const pipeline = redis.pipeline();
  addLeaderboards(pipeline, flatPlayer);
  if (oldUsername && oldUsername !== player.username) removeAutocomplete(pipeline, oldUsername);
  if (registerSearch) addAutocomplete(pipeline, player.username);

  try {
    await Promise.allSettled([
      PlayerModel.replaceOne({ uuid: player.uuid }, serialize(Player, flatPlayer), { upsert: true }).exec(),
      pipeline.exec(),
    ]);
  } catch (error) {
    onRediSearchError(error);
  }

  return flatPlayer;
}
