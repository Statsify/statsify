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
  ApiModeFromGameModes,
  ArcadeModes,
  ArenaBrawlModes,
  BEDWARS_MODES,
  BLITZSG_MODES,
  BRIDGE_MODES,
  BUILD_BATTLE_MODES,
  BedWarsModes,
  BlitzSGModes,
  BridgeModes,
  BuildBattleModes,
  CHALLENGE_MODES,
  COPS_AND_CRIMS_MODES,
  ChallengeModes,
  CopsAndCrimsModes,
  DROPPER_MODES,
  DUELS_MODES,
  DropperModes,
  DuelsModes,
  FormattedGame,
  GENERAL_MODES,
  GameCodeMapping,
  GameId,
  GameModes,
  GeneralModes,
  MEGAWALLS_MODES,
  MURDER_MYSTERY_MODES,
  MegaWallsModes,
  Mode,
  MurderMysteryModes,
  PAINTBALL_MODES,
  PARKOUR_MODES,
  PARTY_GAMES_MODES,
  PIT_MODES,
  PaintballModes,
  ParkourModes,
  PartyGamesModes,
  PitModes,
  PlayerStats,
  QUAKE_MODES,
  QUEST_MODES,
  QuakeModes,
  QuestModes,
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
  WOOLGAMES_MODES,
  WallsModes,
  WarlordsModes,
  WoolGamesModes,
} from "@statsify/schemas";
import { noop, prettify } from "@statsify/util";

const getDefaultApiMode = <T extends Mode[]>(modes: GameModes<T>) =>
  modes.getApiModes()[0];

export type GamesWithBackgrounds =
  | ArcadeModes
  | ArenaBrawlModes
  | BedWarsModes
  | BridgeModes
  | BlitzSGModes
  | BuildBattleModes
  | CopsAndCrimsModes
  | DropperModes
  | DuelsModes
  | GeneralModes
  | ChallengeModes
  | MegaWallsModes
  | MurderMysteryModes
  | PaintballModes
  | ParkourModes
  | PartyGamesModes
  | PitModes
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
  | WoolGamesModes
  | QuestModes
  | ChallengeModes;

export const mapBackground = <T extends GamesWithBackgrounds>(
  modes: GameModes<T>,
  mode: ApiModeFromGameModes<T>
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
      return ["arcade", mode === "seasonal" ? "overall" : mode];

    case ARENA_BRAWL_MODES:
      return ["arenabrawl", "overall"];

    case BLITZSG_MODES:
      return ["blitzsg", "overall"];

    case BUILD_BATTLE_MODES:
      return ["buildbattle", "overall"];

    case COPS_AND_CRIMS_MODES:
      return ["copsandcrims", "overall"];

    case BRIDGE_MODES:
      return ["duels", "bridge"];

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
    case DROPPER_MODES:
      return ["arcade", "dropper"];
    case PARKOUR_MODES:
      return ["parkour", "overall"];

    case PARTY_GAMES_MODES:
      return ["arcade", "partyGames"];

    case QUEST_MODES:
    case CHALLENGE_MODES:
      switch (mode) {
        case "overall":
          return mapBackground(GENERAL_MODES, getDefaultApiMode(GENERAL_MODES));

        case "ARCADE":
          return mapBackground(ARCADE_MODES, getDefaultApiMode(ARCADE_MODES));

        case "ARENA_BRAWL":
          return mapBackground(ARENA_BRAWL_MODES, getDefaultApiMode(ARENA_BRAWL_MODES));

        case "BEDWARS":
          return mapBackground(BEDWARS_MODES, getDefaultApiMode(BEDWARS_MODES));

        case "BLITZSG":
          return mapBackground(BLITZSG_MODES, getDefaultApiMode(BLITZSG_MODES));

        case "BUILD_BATTLE":
          return mapBackground(BUILD_BATTLE_MODES, getDefaultApiMode(BUILD_BATTLE_MODES));

        case "DUELS":
          return mapBackground(DUELS_MODES, getDefaultApiMode(DUELS_MODES));

        case "COPS_AND_CRIMS":
          return mapBackground(
            COPS_AND_CRIMS_MODES,
            getDefaultApiMode(COPS_AND_CRIMS_MODES)
          );

        case "MEGAWALLS":
          return mapBackground(MEGAWALLS_MODES, getDefaultApiMode(MEGAWALLS_MODES));

        case "MURDER_MYSTERY":
          return mapBackground(
            MURDER_MYSTERY_MODES,
            getDefaultApiMode(MURDER_MYSTERY_MODES)
          );

        case "PAINTBALL":
          return mapBackground(PAINTBALL_MODES, getDefaultApiMode(PAINTBALL_MODES));

        case "PIT":
          return mapBackground(PIT_MODES, getDefaultApiMode(PIT_MODES));

        case "QUAKE":
          return mapBackground(QUAKE_MODES, getDefaultApiMode(QUAKE_MODES));

        case "SKYWARS":
          return mapBackground(SKYWARS_MODES, getDefaultApiMode(SKYWARS_MODES));

        case "SMASH_HEROES":
          return mapBackground(SMASH_HEROES_MODES, getDefaultApiMode(SMASH_HEROES_MODES));

        case "SPEED_UHC":
          return mapBackground(SPEED_UHC_MODES, getDefaultApiMode(SPEED_UHC_MODES));

        case "TNT_GAMES":
          return mapBackground(TNT_GAMES_MODES, getDefaultApiMode(TNT_GAMES_MODES));

        case "TURBO_KART_RACERS":
          return mapBackground(
            TURBO_KART_RACERS_MODES,
            getDefaultApiMode(TURBO_KART_RACERS_MODES)
          );

        case "UHC":
          return mapBackground(UHC_MODES, getDefaultApiMode(UHC_MODES));

        case "VAMPIREZ":
          return mapBackground(VAMPIREZ_MODES, getDefaultApiMode(VAMPIREZ_MODES));

        case "WALLS":
          return mapBackground(WALLS_MODES, getDefaultApiMode(WALLS_MODES));

        case "WARLORDS":
          return mapBackground(WARLORDS_MODES, getDefaultApiMode(WARLORDS_MODES));

        case "WOOLGAMES":
          return mapBackground(WOOLGAMES_MODES, getDefaultApiMode(WOOLGAMES_MODES));
      }

      throw new Error(`Missing background for mode: ${mode}`);

    case GENERAL_MODES:
      return ["hypixel", "overall"];

    case MEGAWALLS_MODES:
      return ["megawalls", "overall"];

    case MURDER_MYSTERY_MODES:
      return ["murdermystery", "overall"];

    case PAINTBALL_MODES:
      return ["paintball", "overall"];

    case PIT_MODES:
      return ["pit", "overall"];

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
      return ["speeduhc", "overall"];

    case UHC_MODES:
      return ["uhc", "overall"];

    case VAMPIREZ_MODES:
      return ["vampirez", "overall"];

    case WALLS_MODES:
      return ["walls", "overall"];

    case WARLORDS_MODES:
      return ["warlords", "overall"];

    case WOOLGAMES_MODES:
      return ["woolgames", mode];

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
