/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData } from "@statsify/util";
import { Field } from "../metadata";
import { GameCodeMapping } from "../game/game";

export class GamePlayers {
  @Field()
  public players: number;

  @Field()
  public modes?: Record<string, number>;

  public constructor(game: APIData) {
    this.players = game?.players;
    this.modes = game?.modes;
  }
}

export class Gamecounts {
  @Field()
  public ARCADE: GamePlayers;

  @Field()
  public WARLORDS: GamePlayers;

  @Field()
  public BEDWARS: GamePlayers;

  @Field()
  public BUILD_BATTLE: GamePlayers;

  @Field()
  public DUELS: GamePlayers;

  @Field()
  public HOUSING: GamePlayers;

  @Field()
  public IDLE: GamePlayers;

  @Field()
  public VAMPIREZ: GamePlayers;

  @Field()
  public TURBO_KART_RACERS: GamePlayers;

  @Field()
  public WALLS: GamePlayers;

  @Field()
  public QUAKE: GamePlayers;

  @Field()
  public PAINTBALL: GamePlayers;

  @Field()
  public ARENA_BRAWL: GamePlayers;

  @Field()
  public LIMBO: GamePlayers;

  @Field()
  public MAIN_LOBBY: GamePlayers;

  @Field()
  public COPS_AND_CRIMS: GamePlayers;

  @Field()
  public MURDER_MYSTERY: GamePlayers;

  @Field()
  public PIT: GamePlayers;

  @Field()
  public PROTOTYPE: GamePlayers;

  @Field()
  public QUEUE: GamePlayers;

  @Field()
  public REPLAY: GamePlayers;

  @Field()
  public SKYBLOCK: GamePlayers;

  @Field()
  public SKYWARS: GamePlayers;

  @Field()
  public SMP: GamePlayers;

  @Field()
  public SPEED_UHC: GamePlayers;

  @Field()
  public SMASH_HEROES: GamePlayers;

  @Field()
  public BLITZSG: GamePlayers;

  @Field()
  public TNT_GAMES: GamePlayers;

  @Field()
  public TOURNAMENT_LOBBY: GamePlayers;

  @Field()
  public UHC: GamePlayers;

  @Field()
  public MEGAWALLS: GamePlayers;

  @Field()
  public WOOLWARS: GamePlayers;

  public constructor(data: APIData = {}) {
    this.ARCADE = new GamePlayers(data[GameCodeMapping.ARCADE]);
    this.WARLORDS = new GamePlayers(data[GameCodeMapping.WARLORDS]);
    this.BEDWARS = new GamePlayers(data[GameCodeMapping.BEDWARS]);
    this.BUILD_BATTLE = new GamePlayers(data[GameCodeMapping.BUILD_BATTLE]);
    this.DUELS = new GamePlayers(data[GameCodeMapping.DUELS]);
    this.HOUSING = new GamePlayers(data[GameCodeMapping.HOUSING]);
    this.IDLE = new GamePlayers(data[GameCodeMapping.IDLE]);
    this.LIMBO = new GamePlayers(data[GameCodeMapping.LIMBO]);
    this.MAIN_LOBBY = new GamePlayers(data[GameCodeMapping.MAIN_LOBBY]);
    this.COPS_AND_CRIMS = new GamePlayers(data[GameCodeMapping.COPS_AND_CRIMS]);
    this.MURDER_MYSTERY = new GamePlayers(data[GameCodeMapping.MURDER_MYSTERY]);
    this.PIT = new GamePlayers(data[GameCodeMapping.PIT]);
    this.PROTOTYPE = new GamePlayers(data[GameCodeMapping.PROTOTYPE]);
    this.QUEUE = new GamePlayers(data[GameCodeMapping.QUEUE]);
    this.REPLAY = new GamePlayers(data[GameCodeMapping.REPLAY]);
    this.SKYBLOCK = new GamePlayers(data[GameCodeMapping.SKYBLOCK]);
    this.SKYWARS = new GamePlayers(data[GameCodeMapping.SKYWARS]);
    this.SMP = new GamePlayers(data[GameCodeMapping.SMP]);
    this.SPEED_UHC = new GamePlayers(data[GameCodeMapping.SPEED_UHC]);
    this.SMASH_HEROES = new GamePlayers(data[GameCodeMapping.SMASH_HEROES]);
    this.BLITZSG = new GamePlayers(data[GameCodeMapping.BLITZSG]);
    this.TNT_GAMES = new GamePlayers(data[GameCodeMapping.TNT_GAMES]);
    this.TOURNAMENT_LOBBY = new GamePlayers(data[GameCodeMapping.TOURNAMENT_LOBBY]);
    this.UHC = new GamePlayers(data[GameCodeMapping.UHC]);
    this.MEGAWALLS = new GamePlayers(data[GameCodeMapping.MEGAWALLS]);
    this.WOOLWARS = new GamePlayers(data[GameCodeMapping.WOOLWARS]);

    this.VAMPIREZ = new GamePlayers({
      players: data[GameCodeMapping.CLASSIC]?.modes[GameCodeMapping.VAMPIREZ],
    });

    this.TURBO_KART_RACERS = new GamePlayers({
      players: data[GameCodeMapping.CLASSIC]?.modes[GameCodeMapping.TURBO_KART_RACERS],
    });

    this.WALLS = new GamePlayers({
      players: data[GameCodeMapping.CLASSIC]?.modes[GameCodeMapping.WALLS],
    });

    this.QUAKE = new GamePlayers({
      players: data[GameCodeMapping.CLASSIC]?.modes[GameCodeMapping.QUAKE],
    });

    this.PAINTBALL = new GamePlayers({
      players: data[GameCodeMapping.CLASSIC]?.modes[GameCodeMapping.PAINTBALL],
    });

    this.ARENA_BRAWL = new GamePlayers({
      players: data[GameCodeMapping.CLASSIC]?.modes[GameCodeMapping.ARENA_BRAWL],
    });
  }
}
