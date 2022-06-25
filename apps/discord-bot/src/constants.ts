/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  ARCADE_MODES,
  ARENA_BRAWL_MODES,
  ArcadeModes,
  ArenaBrawlModes,
  BEDWARS_MODES,
  BLITZSG_MODES,
  BUILD_BATTLE_MODES,
  BedWarsModes,
  BlitzSGModes,
  BuildBattleModes,
  COPS_AND_CRIMS_MODES,
  CopsAndCrimsModes,
  DUELS_MODES,
  DuelsModes,
  GENERAL_MODES,
  GameCodeMapping,
  GameId,
  GameModes,
  GeneralModes,
  MEGAWALLS_MODES,
  MURDER_MYSTERY_MODES,
  MegaWallsModes,
  MurderMysteryModes,
  PAINTBALL_MODES,
  PARKOUR_MODES,
  PaintballModes,
  ParkourModes,
  QUAKE_MODES,
  QuakeModes,
  SKYWARS_MODES,
  SMASH_HEROES_MODES,
  SPEED_UHC_MODES,
  SkyWarsModes,
  SmashHeroesModes,
  SpeedUHCModes,
  TNTGamesModes,
  TNT_GAMES_MODES,
  TURBO_KART_RACERS_MODES,
  TurboKartRacersModes,
  UHCModes,
  UHC_MODES,
  VAMPIREZ_MODES,
  VampireZModes,
  WALLS_MODES,
  WARLORDS_MODES,
  WOOLWARS_MODES,
  WallsModes,
  WarlordsModes,
  WoolWarsModes,
} from "@statsify/schemas";
import { noop, prettify } from "@statsify/util";

export const ERROR_COLOR = 0xff0000;
export const SUCCESS_COLOR = 0x00ff00;
export const INFO_COLOR = 0x187ccd;
export const WARNING_COLOR = 0xffff00;

export type GamesWithBackgrounds =
  | ArcadeModes
  | ArenaBrawlModes
  | BedWarsModes
  | BlitzSGModes
  | BuildBattleModes
  | CopsAndCrimsModes
  | DuelsModes
  | GeneralModes
  | MegaWallsModes
  | MurderMysteryModes
  | PaintballModes
  | ParkourModes
  | QuakeModes
  | SkyWarsModes
  | SmashHeroesModes
  | SpeedUHCModes
  | TNTGamesModes
  | TurboKartRacersModes
  | UHCModes
  | VampireZModes
  | WallsModes
  | WarlordsModes
  | WoolWarsModes;

export const mapBackground = <T extends GamesWithBackgrounds>(
  modes: GameModes<T>,
  mode: T[number]
): [game: string, mode: string] => {
  switch (modes) {
    case BEDWARS_MODES: {
      let map: string;

      switch (mode) {
        case "solo":
        case "doubles":
          map = "eight";
          break;
        case "threes":
        case "fours":
          map = "four";
          break;
        case "4v4":
          map = "4v4";
          break;
        case "castle":
          map = "castle";
          break;
        default:
          map = "overall";
          break;
      }

      return ["bedwars", map];
    }
    case ARCADE_MODES:
      return ["arcade", "overall"];
    case ARENA_BRAWL_MODES:
      return ["arenabrawl", "overall"];
    case BLITZSG_MODES:
      return ["blitzsg", "overall"];
    case BUILD_BATTLE_MODES:
      return ["buildbattle", "overall"];
    //TODO(amony): add cops and crims backgrounds
    case COPS_AND_CRIMS_MODES:
      return ["hypixel", "overall"];
    case DUELS_MODES: {
      let map: string;

      switch (mode) {
        case "bowSpleef":
          map = "bowspleef";
          break;
        case "bridge":
          map = "bridge";
          break;
        case "bow":
        case "boxing":
        case "blitzsg":
        case "classic":
        case "combo":
        case "megawalls":
        case "nodebuff":
        case "op":
        case "uhc":
          map = "maps";
          break;
        case "parkour":
          map = "parkour";
          break;
        case "skywars":
          map = "skywars";
          break;
        case "sumo":
          map = "sumo";
          break;
        case "overall":
        case "arena":
        default:
          map = "overall";
          break;
      }

      return ["duels", map];
    }
    case PARKOUR_MODES:
    case GENERAL_MODES:
      return ["hypixel", "overall"];
    case MEGAWALLS_MODES:
      return ["megawalls", "overall"];
    case MURDER_MYSTERY_MODES:
      return ["murdermystery", "overall"];
    case PAINTBALL_MODES:
      return ["paintball", "overall"];
    //PIT
    case QUAKE_MODES:
      return ["quake", "overall"];
    case SKYWARS_MODES: {
      let map: string;

      switch (mode) {
        case "solo":
        case "doubles":
          map = "map";
          break;
        case "overall":
        default:
          map = "overall";
          break;
      }

      return ["skywars", map];
    }
    case SMASH_HEROES_MODES:
      return ["smashheroes", "overall"];
    case TNT_GAMES_MODES:
      return ["tntgames", "overall"];
    case TURBO_KART_RACERS_MODES:
      return ["turbokartracers", "overall"];
    case SPEED_UHC_MODES:
    case UHC_MODES:
      return ["uhc", "overall"];
    case VAMPIREZ_MODES:
      return ["vampirez", "overall"];
    case WALLS_MODES:
      return ["walls", "overall"];
    case WARLORDS_MODES:
      return ["warlords", "overall"];
    //TODO(amony): add woolwars backgrounds
    case WOOLWARS_MODES:
      return ["woolwars", "overall"];
    default:
      return ["default", ""];
  }
};

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
  WOOLWARS: WOOLWARS_MODES,
  HOUSING: noop(),
  PIT: noop(),
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

  return prettify(mode.replace(`${GameCodeMapping[game]}_`, "").replace(game, ""));
};
