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
  CHALLENGE_MODES,
  COPS_AND_CRIMS_MODES,
  DUELS_MODES,
  GENERAL_MODES,
  MEGAWALLS_MODES,
  MURDER_MYSTERY_MODES,
  PAINTBALL_MODES,
  PARKOUR_MODES,
  PIT_MODES,
  QUAKE_MODES,
  QUEST_MODES,
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
  type ApiModeFromGameModes,
  type ApiSubModeForMode,
  type ArcadeModes,
  type ArenaBrawlModes,
  type BedWarsModes,
  type BlitzSGModes,
  type BuildBattleModes,
  type ChallengeModes,
  type CopsAndCrimsModes,
  type DuelsModes,
  type GameModes,
  type GeneralModes,
  type MegaWallsModes,
  type Mode,
  type MurderMysteryModes,
  type PaintballModes,
  type ParkourModes,
  type PitModes,
  type QuakeModes,
  type QuestModes,
  type SkyWarsModes,
  type SmashHeroesModes,
  type SpeedUHCModes,
  type TNTGamesModes,
  type TurboKartRacersModes,
  type UHCModes,
  type VampireZModes,
  type WallsModes,
  type WarlordsModes,
  type WoolGamesModes,
} from "@statsify/schemas";

const getDefaultApiMode = <T extends Mode[]>(modes: GameModes<T>) =>
  modes.getApiModes()[0];

export type GamesWithBackgrounds =
  | ArcadeModes |
  ArenaBrawlModes |
  BedWarsModes |
  BlitzSGModes |
  BuildBattleModes |
  CopsAndCrimsModes |
  DuelsModes |
  GeneralModes |
  ChallengeModes |
  MegaWallsModes |
  MurderMysteryModes |
  PaintballModes |
  ParkourModes |
  PitModes |
  QuakeModes |
  SkyWarsModes |
  SmashHeroesModes |
  SpeedUHCModes |
  TNTGamesModes |
  TurboKartRacersModes |
  UHCModes |
  VampireZModes |
  WallsModes |
  WarlordsModes |
  WoolGamesModes |
  QuestModes |
  ChallengeModes;

/** The background a card draws on for a game, mode and submode: [the folder under assets, the map]. */
export const mapBackground = <T extends GamesWithBackgrounds, M extends ApiModeFromGameModes<T>>(
  modes: GameModes<T>,
  mode: M,
  submode?: ApiSubModeForMode<T, M>
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

        case "oneBlock":
          map = "oneBlock";
          break;

        default:
          map = "overall";
          break;
      }

      return ["bedwars", map];
    }
    case ARCADE_MODES:
      if (mode === "seasonal") return ["arcade", "overall"];
      if (mode === "zombies" && submode !== "overall") return ["arcade", `zombies_${submode}`];
      return ["arcade", mode];

    case ARENA_BRAWL_MODES:
      return ["arenabrawl", "overall"];

    case BLITZSG_MODES:
      return ["blitzsg", "overall"];

    case BUILD_BATTLE_MODES:
      return ["buildbattle", "overall"];

    case COPS_AND_CRIMS_MODES:
      return ["copsandcrims", "overall"];

    case DUELS_MODES: {
      let map: string;

      switch (mode) {
        case "bedwars":
          map = submode === "rush" ? "bedwars_rush" : "bedwars";
          break;

        case "spleef":
          map = submode === "bowSpleef" ? "bowSpleef" : "spleef";
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

        case "quake":
          map = "quake";
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
      return ["parkour", "overall"];

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
          return ["tntgames", "overall"];

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
          return ["woolgames", "overall"];
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

        case "mini":
          map = "mini";
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
      return ["tntgames", mode];

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
