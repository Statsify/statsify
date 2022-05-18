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
