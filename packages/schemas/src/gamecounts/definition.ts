/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { APIData } from "@statsify/util";
import { GameCodeMapping } from "#game";
import { s } from "#definition/s";

const GamePlayersSchema = s.object({
  players: s.number(),
  modes: s.record(s.number()),
});

export type GamePlayers = s.infer<typeof GamePlayersSchema>;

export const GameCountsSchema = s.object({
  ARCADE: GamePlayersSchema,
  ARENA_BRAWL: GamePlayersSchema,
  BEDWARS: GamePlayersSchema,
  BLITZSG: GamePlayersSchema,
  BUILD_BATTLE: GamePlayersSchema,
  COPS_AND_CRIMS: GamePlayersSchema,
  DUELS: GamePlayersSchema,
  HOUSING: GamePlayersSchema,
  IDLE: GamePlayersSchema,
  LIMBO: GamePlayersSchema,
  MAIN_LOBBY: GamePlayersSchema,
  MEGAWALLS: GamePlayersSchema,
  MURDER_MYSTERY: GamePlayersSchema,
  PAINTBALL: GamePlayersSchema,
  PIT: GamePlayersSchema,
  PROTOTYPE: GamePlayersSchema,
  QUAKE: GamePlayersSchema,
  QUEUE: GamePlayersSchema,
  REPLAY: GamePlayersSchema,
  SKYBLOCK: GamePlayersSchema,
  SKYWARS: GamePlayersSchema,
  SMASH_HEROES: GamePlayersSchema,
  SMP: GamePlayersSchema,
  SPEED_UHC: GamePlayersSchema,
  TNT_GAMES: GamePlayersSchema,
  TOURNAMENT_LOBBY: GamePlayersSchema,
  TURBO_KART_RACERS: GamePlayersSchema,
  UHC: GamePlayersSchema,
  VAMPIREZ: GamePlayersSchema,
  WALLS: GamePlayersSchema,
  WARLORDS: GamePlayersSchema,
  WOOLGAMES: GamePlayersSchema,
});

export type GameCounts = s.infer<typeof GameCountsSchema>;

function gamePlayers(game: APIData | undefined): s.input<typeof GamePlayersSchema> {
  return { players: game?.players, modes: game?.modes };
}

export function gameCounts(data: APIData = {}): s.input<typeof GameCountsSchema> {
  // Hypixel counts these as modes of its classic games
  const classic = (game: keyof typeof GameCodeMapping) =>
    gamePlayers({ players: data[GameCodeMapping.CLASSIC]?.modes?.[GameCodeMapping[game]] });

  return {
    ARCADE: gamePlayers(data[GameCodeMapping.ARCADE]),
    ARENA_BRAWL: classic("ARENA_BRAWL"),
    BEDWARS: gamePlayers(data[GameCodeMapping.BEDWARS]),
    BLITZSG: gamePlayers(data[GameCodeMapping.BLITZSG]),
    BUILD_BATTLE: gamePlayers(data[GameCodeMapping.BUILD_BATTLE]),
    COPS_AND_CRIMS: gamePlayers(data[GameCodeMapping.COPS_AND_CRIMS]),
    DUELS: gamePlayers(data[GameCodeMapping.DUELS]),
    HOUSING: gamePlayers(data[GameCodeMapping.HOUSING]),
    IDLE: gamePlayers(data[GameCodeMapping.IDLE]),
    LIMBO: gamePlayers(data[GameCodeMapping.LIMBO]),
    MAIN_LOBBY: gamePlayers(data[GameCodeMapping.MAIN_LOBBY]),
    MEGAWALLS: gamePlayers(data[GameCodeMapping.MEGAWALLS]),
    MURDER_MYSTERY: gamePlayers(data[GameCodeMapping.MURDER_MYSTERY]),
    PAINTBALL: classic("PAINTBALL"),
    PIT: gamePlayers(data[GameCodeMapping.PIT]),
    PROTOTYPE: gamePlayers(data[GameCodeMapping.PROTOTYPE]),
    QUAKE: classic("QUAKE"),
    QUEUE: gamePlayers(data[GameCodeMapping.QUEUE]),
    REPLAY: gamePlayers(data[GameCodeMapping.REPLAY]),
    SKYBLOCK: gamePlayers(data[GameCodeMapping.SKYBLOCK]),
    SKYWARS: gamePlayers(data[GameCodeMapping.SKYWARS]),
    SMASH_HEROES: gamePlayers(data[GameCodeMapping.SMASH_HEROES]),
    SMP: gamePlayers(data[GameCodeMapping.SMP]),
    SPEED_UHC: gamePlayers(data[GameCodeMapping.SPEED_UHC]),
    TNT_GAMES: gamePlayers(data[GameCodeMapping.TNT_GAMES]),
    TOURNAMENT_LOBBY: gamePlayers(data[GameCodeMapping.TOURNAMENT_LOBBY]),
    TURBO_KART_RACERS: classic("TURBO_KART_RACERS"),
    UHC: gamePlayers(data[GameCodeMapping.UHC]),
    VAMPIREZ: classic("VAMPIREZ"),
    WALLS: classic("WALLS"),
    WARLORDS: gamePlayers(data[GameCodeMapping.WARLORDS]),
    WOOLGAMES: gamePlayers(data[GameCodeMapping.WOOLGAMES]),
  };
}
