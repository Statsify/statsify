/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Field } from './metadata';

export const games = [
  { name: 'Arcade', code: 'ARCADE', id: 14 },
  { name: 'Arena Brawl', code: 'ARENA', id: 17 },
  { name: 'BedWars', code: 'BEDWARS', id: 58 },
  { name: 'Blitz Survival Games', code: 'SURVIVAL_GAMES', id: 5 },
  { name: 'Build Battle', code: 'BUILD_BATTLE', id: 60 },
  { name: 'Classic Games', code: 'LEGACY', id: 56 },
  { name: 'Cops and Crims', code: 'MCGO', id: 21 },
  { name: 'Crazy Walls', code: 'TRUE_COMBAT', id: 52 },
  { name: 'Duels', code: 'DUELS', id: 61 },
  { name: 'Housing', code: 'HOUSING', id: 26 },
  { name: 'Idle', code: 'IDLE', id: -6 },
  { name: 'Limbo', code: 'LIMBO', id: -2 },
  { name: 'Main Lobby', code: 'MAIN_LOBBY', id: -4 },
  { name: 'Mega Walls', code: 'WALLS3', id: 13 },
  { name: 'Murder Mystery', code: 'MURDER_MYSTERY', id: 59 },
  { name: 'Paintball', code: 'PAINTBALL', id: 4 },
  { name: 'Pit', code: 'PIT', id: 64 },
  { name: 'Prototype', code: 'PROTOTYPE', id: 57 },
  { name: 'Quake Craft', code: 'QUAKECRAFT', id: 2 },
  { name: 'Queue', code: 'QUEUE', id: -3 },
  { name: 'Replay', code: 'REPLAY', id: -1 },
  { name: 'SkyBlock', code: 'SKYBLOCK', id: 63 },
  { name: 'SkyClash', code: 'SKYCLASH', id: 55 },
  { name: 'SkyWars', code: 'SKYWARS', id: 51 },
  { name: 'Smash Heroes', code: 'SUPER_SMASH', id: 24 },
  { name: 'Speed UHC', code: 'SPEED_UHC', id: 54 },
  { name: 'TNT Games', code: 'TNTGAMES', id: 6 },
  { name: 'Tournament Lobby', code: 'TOURNAMENT_LOBBY', id: -5 },
  { name: 'Turbo Kart Racers', code: 'GINGERBREAD', id: 25 },
  { name: 'UHC', code: 'UHC', id: 20 },
  { name: 'VampireZ', code: 'VAMPIREZ', id: 7 },
  { name: 'Walls', code: 'WALLS', id: 3 },
  { name: 'Warlords', code: 'BATTLEGROUND', id: 23 },
  { name: 'Wool Wars', code: 'WOOL_GAMES', id: 68 },
];

export enum GameCodeToName {
  ARCADE = 'ARCADE',
  ARENA = 'ARENA_BRAWL',
  BEDWARS = 'BEDWARS',
  SURVIVAL_GAMES = 'BLITZSG',
  BUILD_BATTLE = 'BUILD_BATTLE',
  MCGO = 'COPS_AND_CRIMS',
  DUELS = 'DUELS',
  GENERAL = 'GENERAL',
  HOUSING = 'HOUSING',
  WALLS3 = 'MEGAWALLS',
  MURDER_MYSTERY = 'MURDER_MYSTERY',
  PAINTBALL = 'PAINTBALL',
  PIT = 'PIT',
  PARKOUR = 'PARKOUR',
  PROTOTYPE = 'PROTOTYPE',
  QUAKECRAFT = 'QUAKE',
  SKYBLOCK = 'SKYBLOCK',
  SKYCLASH = 'SKYCLASH',
  SKYWARS = 'SKYWARS',
  SUPER_SMASH = 'SMASH_HEROES',
  SPEED_UHC = 'SPEED_UHC',
  TNTGAMES = 'TNT_GAMES',
  GINGERBREAD = 'TURBO_KART_RACERS',
  UHC = 'UHC',
  VAMPIREZ = 'VAMPIREZ',
  WALLS = 'WALLS',
  BATTLEGROUND = 'WARLORDS',
  WOOL_GAMES = 'WOOLWARS',
}
export const modes: Record<string, Record<string, string>> = {
  ARCADE: {
    PARTY: 'Party Games',
    DEFENDER: 'Creeper Attack',
    SIMON_SAYS: 'Hypixel Says',
    DAYONE: 'Blocking Dead',
    DRAW_THEIR_THING: 'Pixel Painters',
    ONEINTHEQUIVER: 'Bounty Hunters',
    SOCCER: 'Football',
    ENDER: 'Ender Spleef',
  },
  BATTLEGROUND: {
    ctf_mini: 'Capture the Flag',
  },
  MCGO: {
    normal: 'Defusal',
    deathmatch: 'Team Deathmatch',
    gungame: 'Gun Game',
  },
};

export enum FormattedGame {
  ARCADE = '§cA§6r§ec§aa§bd§de§f',
  ARENA_BRAWL = '§6Arena Brawl§f',
  BEDWARS = '§cBed§fWars§f',
  BLITZSG = '§2Blitz§6SG§f',
  BUILD_BATTLE = '§6Build Battle§f',
  COPS_AND_CRIMS = '§6Cops §fand §aCrims§f',
  DUELS = '§bDuels§f',
  GENERAL = '§fGeneral§f',
  HOUSING = '§9Housing§f',
  MEGAWALLS = '§7MegaWalls§f',
  MURDER_MYSTERY = '§4Murder Mystery§f',
  PAINTBALL = '§bPaint§fball§f',
  PIT = '§eThe §aPit§',
  PARKOUR = '§fParkour§f',
  PROTOTYPE = '§3Proto§ftype§f',
  QUAKE = '§5Quake§f',
  SKYBLOCK = '§bSky§fblock§f',
  SKYCLASH = '§7Sky§6clash§f',
  SKYWARS = '§bSky§eWars§f',
  SMASH_HEROES = '§dSmash §eHeroes§f',
  SPEED_UHC = '§bSpeed§6UHC§f',
  TNT_GAMES = '§cT§fN§cT Games§f',
  TURBO_KART_RACERS = '§aTurbo Kart Racers§f',
  UHC = '§6UHC§f',
  VAMPIREZ = '§4VampireZ§f',
  WALLS = '§eWalls§f',
  WARLORDS = '§eWarlords§f',
  WOOLWARS = '§cWool§9Wars§f',
}

/**
 * The full game name
 */
export type GameCode = typeof games[number]['code'];

/**
 * A number that represents a game.
 */
export type GameId = typeof games[number]['id'];
export type GameName = typeof games[number]['name'];

export class Game {
  @Field({
    docs: {
      enum: games.map((g) => g.id),
      enumName: 'GameId',
      examples: ['' + games[0].id],
    },
    type: () => String,
  })
  public id: GameId;

  @Field({
    docs: { enum: games.map((g) => g.code), enumName: 'GameCode', examples: [games[0].code] },
    type: () => String,
  })
  public code: GameCode;

  @Field({
    docs: {
      enum: games.map((g) => g.name),
      enumName: 'GameName',
      examples: [games[0].name],
    },
    type: () => String,
  })
  public name: GameName;

  public constructor(tag: GameId | GameCode) {
    const game = games.find((g) => g.id === tag || g.code === tag)!;

    this.id = game?.id;
    this.code = game?.code;
    this.name = game?.name;
  }

  public toString() {
    return this.code;
  }
}
