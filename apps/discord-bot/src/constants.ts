/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  ARCADE_MODES,
  ARENA_BRAWL_MODES,
  BEDWARS_MODES,
  BLITZSG_MODES,
  BUILD_BATTLE_MODES,
  COPS_AND_CRIMS_MODES,
  DUELS_MODES,
  FormattedGame,
  GENERAL_MODES,
  GameCodeMapping,
  GameId,
  GameModes,
  MEGAWALLS_MODES,
  MURDER_MYSTERY_MODES,
  PAINTBALL_MODES,
  PARKOUR_MODES,
  PIT_MODES,
  PlayerStats,
  QUAKE_MODES,
  SKYWARS_MODES,
  SMASH_HEROES_MODES,
  SPEED_UHC_MODES,
  TNT_GAMES_MODES,
  TURBO_KART_RACERS_MODES,
  UHC_MODES,
  VAMPIREZ_MODES,
  WALLS_MODES,
  WARLORDS_MODES,
  WOOLGAMES_MODES,
} from "@statsify/schemas";
import { type GamesWithBackgrounds, mapBackground } from "@statsify/profiles";
import { noop, prettify } from "@statsify/util";

export { type GamesWithBackgrounds, mapBackground } from "@statsify/profiles";

const GAME_ID_TO_MODES: Record<GameId, GameModes<any> | null> = {
  ARCADE: ARCADE_MODES,
  ARENA_BRAWL: ARENA_BRAWL_MODES,
  BEDWARS: BEDWARS_MODES,
  BLITZSG: BLITZSG_MODES,
  BUILD_BATTLE: BUILD_BATTLE_MODES,
  COPS_AND_CRIMS: COPS_AND_CRIMS_MODES,
  DUELS: DUELS_MODES,
  GENERAL: GENERAL_MODES,
  MEGAWALLS: MEGAWALLS_MODES,
  MURDER_MYSTERY: MURDER_MYSTERY_MODES,
  PAINTBALL: PAINTBALL_MODES,
  PARKOUR: PARKOUR_MODES,
  QUAKE: QUAKE_MODES,
  SKYWARS: SKYWARS_MODES,
  SMASH_HEROES: SMASH_HEROES_MODES,
  SPEED_UHC: SPEED_UHC_MODES,
  TNT_GAMES: TNT_GAMES_MODES,
  TURBO_KART_RACERS: TURBO_KART_RACERS_MODES,
  UHC: UHC_MODES,
  VAMPIREZ: VAMPIREZ_MODES,
  WALLS: WALLS_MODES,
  WARLORDS: WARLORDS_MODES,
  WOOLGAMES: WOOLGAMES_MODES,
  PIT: PIT_MODES,
  HOUSING: noop(),
  PROTOTYPE: noop(),
  SKYBLOCK: noop(),
  SKYCLASH: noop(),
  TOURNAMENT_LOBBY: noop(),
  MAIN_LOBBY: noop(),
  CLASSIC: noop(),
  CRAZY_WALLS: noop(),
  QUEUE: noop(),
  REPLAY: noop(),
  LIMBO: noop(),
  IDLE: noop(),
  SMP: noop(),
};

export const MODES_TO_API = new Map<GameModes<GamesWithBackgrounds>, keyof PlayerStats>([
  [ARCADE_MODES, "arcade"],
  [ARENA_BRAWL_MODES, "arenabrawl"],
  [BEDWARS_MODES, "bedwars"],
  [BLITZSG_MODES, "blitzsg"],
  [BUILD_BATTLE_MODES, "buildbattle"],
  [COPS_AND_CRIMS_MODES, "copsandcrims"],
  [DUELS_MODES, "duels"],
  [GENERAL_MODES, "general"],
  [MEGAWALLS_MODES, "megawalls"],
  [MURDER_MYSTERY_MODES, "murdermystery"],
  [PAINTBALL_MODES, "paintball"],
  [PIT_MODES, "pit"],
  [PARKOUR_MODES, "parkour"],
  [QUAKE_MODES, "quake"],
  [SKYWARS_MODES, "skywars"],
  [SMASH_HEROES_MODES, "smashheroes"],
  [SPEED_UHC_MODES, "speeduhc"],
  [TNT_GAMES_MODES, "tntgames"],
  [TURBO_KART_RACERS_MODES, "turbokartracers"],
  [UHC_MODES, "uhc"],
  [VAMPIREZ_MODES, "vampirez"],
  [WALLS_MODES, "walls"],
  [WARLORDS_MODES, "warlords"],
  [WOOLGAMES_MODES, "woolgames"],
]);

export const MODES_TO_FORMATTED = new Map<GameModes<GamesWithBackgrounds>, FormattedGame>(
  [
    [ARCADE_MODES, FormattedGame.ARCADE],
    [ARENA_BRAWL_MODES, FormattedGame.ARENA_BRAWL],
    [BEDWARS_MODES, FormattedGame.BEDWARS],
    [BLITZSG_MODES, FormattedGame.BLITZSG],
    [BUILD_BATTLE_MODES, FormattedGame.BUILD_BATTLE],
    [COPS_AND_CRIMS_MODES, FormattedGame.COPS_AND_CRIMS],
    [DUELS_MODES, FormattedGame.DUELS],
    [GENERAL_MODES, FormattedGame.GENERAL],
    [MEGAWALLS_MODES, FormattedGame.MEGAWALLS],
    [MURDER_MYSTERY_MODES, FormattedGame.MURDER_MYSTERY],
    [PAINTBALL_MODES, FormattedGame.PAINTBALL],
    [PIT_MODES, FormattedGame.PIT],
    [PARKOUR_MODES, FormattedGame.PARKOUR],
    [QUAKE_MODES, FormattedGame.QUAKE],
    [SKYWARS_MODES, FormattedGame.SKYWARS],
    [SMASH_HEROES_MODES, FormattedGame.SMASH_HEROES],
    [SPEED_UHC_MODES, FormattedGame.SPEED_UHC],
    [TNT_GAMES_MODES, FormattedGame.TNT_GAMES],
    [TURBO_KART_RACERS_MODES, FormattedGame.TURBO_KART_RACERS],
    [UHC_MODES, FormattedGame.UHC],
    [VAMPIREZ_MODES, FormattedGame.VAMPIREZ],
    [WALLS_MODES, FormattedGame.WALLS],
    [WARLORDS_MODES, FormattedGame.WARLORDS],
    [WOOLGAMES_MODES, FormattedGame.WOOLGAMES],
  ]
);

export const mapGameIdToBackground = (id: GameId) => {
  const modes = GAME_ID_TO_MODES[id] ?? GENERAL_MODES;
  return mapBackground(modes, modes.getApiModes()[0]);
};

const HYPIXEL_GAME_LIST = Object.fromEntries(
  Object.entries(GAME_ID_TO_MODES).map(([key, g]) => [key, g?.getHypixelModes()])
);

export const mapGame = (game: GameId, mode: string) => {
  if (HYPIXEL_GAME_LIST[game] && mode in HYPIXEL_GAME_LIST[game]!)
    return HYPIXEL_GAME_LIST[game]![mode];

  // Pit's mode in the  api is also called PIT
  if (mode === game) return prettify(mode);

  return prettify(mode.replace(`${GameCodeMapping[game]}_`, "").replace(game, ""));
};
