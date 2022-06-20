/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  ArcadeModes,
  ARCADE_MODES,
  ArenaBrawlModes,
  ARENA_BRAWL_MODES,
  BedWarsModes,
  BEDWARS_MODES,
  BlitzSGModes,
  BLITZSG_MODES,
  BuildBattleModes,
  BUILD_BATTLE_MODES,
  CopsAndCrimsModes,
  COPS_AND_CRIMS_MODES,
  DuelsModes,
  DUELS_MODES,
  GeneralModes,
  GENERAL_MODES,
  MegaWallsModes,
  MEGAWALLS_MODES,
  MurderMysteryModes,
  MURDER_MYSTERY_MODES,
  PaintballModes,
  PAINTBALL_MODES,
  ParkourModes,
  PARKOUR_MODES,
  QuakeModes,
  QUAKE_MODES,
  SkyWarsModes,
  SKYWARS_MODES,
  SmashHeroesModes,
  SMASH_HEROES_MODES,
  SpeedUHCModes,
  SPEED_UHC_MODES,
  TNTGamesModes,
  TNT_GAMES_MODES,
  TurboKartRacersModes,
  TURBO_KART_RACERS_MODES,
  UHCModes,
  UHC_MODES,
  VampireZModes,
  VAMPIREZ_MODES,
  WallsModes,
  WALLS_MODES,
  WarlordsModes,
  WARLORDS_MODES,
  WoolWarsModes,
  WOOL_WARS_MODES,
} from '@statsify/schemas';

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
  modes: T,
  mode: T[number]
): [game: string, mode: string] => {
  switch (modes) {
    case BEDWARS_MODES: {
      let map: string;

      switch (mode) {
        case 'solo':
        case 'doubles':
          map = 'eight';
          break;
        case 'threes':
        case 'fours':
          map = 'four';
          break;
        case '4v4':
          map = '4v4';
          break;
        case 'castle':
          map = 'castle';
          break;
        default:
          map = 'overall';
          break;
      }

      return ['bedwars', map];
    }
    case ARCADE_MODES:
      return ['arcade', 'overall'];
    case ARENA_BRAWL_MODES:
      return ['arenabrawl', 'overall'];
    case BLITZSG_MODES:
      return ['blitzsg', 'overall'];
    case BUILD_BATTLE_MODES:
      return ['buildbattle', 'overall'];
    //TODO(amony): add cops and crims backgrounds
    case COPS_AND_CRIMS_MODES:
      return ['hypixel', 'overall'];
    case DUELS_MODES: {
      let map: string;

      switch (mode) {
        case 'bowSpleef':
          map = 'bowspleef';
          break;
        case 'bridge':
          map = 'bridge';
          break;
        case 'bow':
        case 'boxing':
        case 'blitzsg':
        case 'classic':
        case 'combo':
        case 'megawalls':
        case 'nodebuff':
        case 'op':
        case 'uhc':
          map = 'maps';
          break;
        case 'parkour':
          map = 'parkour';
          break;
        case 'skywars':
          map = 'skywars';
          break;
        case 'sumo':
          map = 'sumo';
          break;
        case 'overall':
        case 'arena':
        default:
          map = 'overall';
          break;
      }

      return ['duels', map];
    }
    case PARKOUR_MODES:
    case GENERAL_MODES:
      return ['hypixel', 'overall'];
    case MEGAWALLS_MODES:
      return ['megawalls', 'overall'];
    case MURDER_MYSTERY_MODES:
      return ['murdermystery', 'overall'];
    case PAINTBALL_MODES:
      return ['paintball', 'overall'];
    //PIT
    case QUAKE_MODES:
      return ['quake', 'overall'];
    case SKYWARS_MODES: {
      let map: string;

      switch (mode) {
        case 'solo':
        case 'doubles':
          map = 'map';
          break;
        case 'overall':
        default:
          map = 'overall';
          break;
      }

      return ['skywars', map];
    }
    case SMASH_HEROES_MODES:
      return ['smashheroes', 'overall'];
    case TNT_GAMES_MODES:
      return ['tntgames', 'overall'];
    case TURBO_KART_RACERS_MODES:
      return ['turbokartracers', 'overall'];
    case SPEED_UHC_MODES:
    case UHC_MODES:
      return ['uhc', 'overall'];
    case VAMPIREZ_MODES:
      return ['vampirez', 'overall'];
    case WALLS_MODES:
      return ['walls', 'overall'];
    case WARLORDS_MODES:
      return ['warlords', 'overall'];
    //TODO(amony): add woolwars backgrounds
    case WOOL_WARS_MODES:
      return ['woolwars', 'overall'];
    default:
      return ['default', ''];
  }
};
