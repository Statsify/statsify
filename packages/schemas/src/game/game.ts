/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Field } from "../metadata";

export const GameIdMapping = {
  ARCADE: "ARCADE",
  ARENA: "ARENA_BRAWL",
  BEDWARS: "BEDWARS",
  SURVIVAL_GAMES: "BLITZSG",
  BUILD_BATTLE: "BUILD_BATTLE",
  MCGO: "COPS_AND_CRIMS",
  DUELS: "DUELS",
  GENERAL: "GENERAL",
  HOUSING: "HOUSING",
  WALLS3: "MEGAWALLS",
  MURDER_MYSTERY: "MURDER_MYSTERY",
  PAINTBALL: "PAINTBALL",
  PIT: "PIT",
  PARKOUR: "PARKOUR",
  PROTOTYPE: "PROTOTYPE",
  QUAKECRAFT: "QUAKE",
  SKYBLOCK: "SKYBLOCK",
  SKYCLASH: "SKYCLASH",
  SKYWARS: "SKYWARS",
  SUPER_SMASH: "SMASH_HEROES",
  SPEED_UHC: "SPEED_UHC",
  TNTGAMES: "TNT_GAMES",
  GINGERBREAD: "TURBO_KART_RACERS",
  UHC: "UHC",
  VAMPIREZ: "VAMPIREZ",
  WALLS: "WALLS",
  BATTLEGROUND: "WARLORDS",
  WOOL_GAMES: "WOOLWARS",
  TOURNAMENT_LOBBY: "TOURNAMENT_LOBBY",
  MAIN_LOBBY: "MAIN_LOBBY",
  MAIN: "MAIN_LOBBY",
  LEGACY: "CLASSIC",
  TRUE_COMBAT: "CRAZY_WALLS",
  QUEUE: "QUEUE",
  REPLAY: "REPLAY",
  LIMBO: "LIMBO",
  IDLE: "IDLE",
  SMP: "SMP",
} as const;

export const GameCodeMapping = Object.fromEntries(
  Object.entries(GameIdMapping).map(([code, id]) => [id, code])
) as Record<GameId, GameCode>;

export enum FormattedGame {
  ARCADE = "§cA§6r§ec§aa§bd§de§f",
  ARENA_BRAWL = "§3Arena §6Brawl§f",
  BEDWARS = "§cBed§fWars§f",
  BRIDGE = "§9Bri§cdge",
  BLITZSG = "§2Blitz§6SG§f",
  BUILD_BATTLE = "§dBuild Battle§f",
  COPS_AND_CRIMS = "§6Cops §fand §aCrims§f",
  DUELS = "§bDuels§f",
  EVENTS = "§eEvents§f",
  GENERAL = "§fGeneral§f",
  HOUSING = "§9Housing§f",
  MEGAWALLS = "§7MegaWalls§f",
  MURDER_MYSTERY = "§4Murder Mystery§f",
  PAINTBALL = "§bPaint§fball§f",
  PARKOUR = "§fParkour§f",
  PIT = "§eThe §aPit",
  PROTOTYPE = "§3Proto§ftype§f",
  QUAKE = "§5Quake§f",
  SKYBLOCK = "§bSky§fblock§f",
  SKYCLASH = "§7Sky§6clash§f",
  SKYWARS = "§bSky§eWars§f",
  SMASH_HEROES = "§dSmash §eHeroes§f",
  SPEED_UHC = "§bSpeed§6UHC§f",
  TNT_GAMES = "§cT§fN§cT Games§f",
  TURBO_KART_RACERS = "§aTurbo Kart Racers§f",
  UHC = "§6UHC§f",
  VAMPIREZ = "§4VampireZ§f",
  WALLS = "§eWalls§f",
  WARLORDS = "§cWar§elords§f",
  WOOLWARS = "§cWool§9Wars§f",

  TOURNAMENT_LOBBY = "§4Tourn§6ament §fLobby",
  MAIN_LOBBY = "§3Main §fLobby",
  CLASSIC = "§bCla§fs§csic§f",
  CRAZY_WALLS = "§fCrazy Walls§f",
  QUEUE = "§fQueue§f",
  REPLAY = "§fReplay§f",
  IDLE = "§fIdle§f",
  LIMBO = "§fLimbo§f",
  SMP = "§fSMP§f",
}

/**
 * The full game name
 */
export type GameCode = keyof typeof GameIdMapping;

export type GameId = typeof GameIdMapping[keyof typeof GameIdMapping];

export class Game {
  @Field({
    docs: {
      enumName: "GameCode",
    },
    type: () => String,
  })
  public code: GameCode;

  @Field({
    docs: {
      enumName: "GameId",
    },
    type: () => String,
  })
  public id: GameId;

  public constructor(code: GameCode) {
    this.code = code;
    this.id = GameIdMapping[code];
  }

  public toString() {
    return this.code;
  }
}
