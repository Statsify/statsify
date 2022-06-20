/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData } from '@statsify/util';
import { Field } from '../metadata';

class GamePlayers {
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
  public BATTLEGROUND: GamePlayers;

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
  public LEGACY: GamePlayers;

  @Field()
  public LIMBO: GamePlayers;

  @Field()
  public MAIN_LOBBY: GamePlayers;

  @Field()
  public MCGO: GamePlayers;

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
  public SUPER_SMASH: GamePlayers;

  @Field()
  public SURVIVAL_GAMES: GamePlayers;

  @Field()
  public TNTGAMES: GamePlayers;

  @Field()
  public TOURNAMENT_LOBBY: GamePlayers;

  @Field()
  public UHC: GamePlayers;

  @Field()
  public WALLS3: GamePlayers;

  @Field()
  public WOOL_GAMES: GamePlayers;

  public constructor(data: APIData = {}) {
    this.ARCADE = new GamePlayers(data.ARCADE);
    this.BATTLEGROUND = new GamePlayers(data.BATTLEGROUND);
    this.BEDWARS = new GamePlayers(data.BEDWARS);
    this.BUILD_BATTLE = new GamePlayers(data.BUILD_BATTLE);
    this.DUELS = new GamePlayers(data.DUELS);
    this.HOUSING = new GamePlayers(data.HOUSING);
    this.IDLE = new GamePlayers(data.IDLE);
    this.LEGACY = new GamePlayers(data.LEGACY);
    this.LIMBO = new GamePlayers(data.LIMBO);
    this.MAIN_LOBBY = new GamePlayers(data.MAIN_LOBBY);
    this.MCGO = new GamePlayers(data.MCGO);
    this.MURDER_MYSTERY = new GamePlayers(data.MURDER_MYSTERY);
    this.PIT = new GamePlayers(data.PIT);
    this.PROTOTYPE = new GamePlayers(data.PROTOTYPE);
    this.QUEUE = new GamePlayers(data.QUEUE);
    this.REPLAY = new GamePlayers(data.REPLAY);
    this.SKYBLOCK = new GamePlayers(data.SKYBLOCK);
    this.SKYWARS = new GamePlayers(data.SKYWARS);
    this.SMP = new GamePlayers(data.SMP);
    this.SPEED_UHC = new GamePlayers(data.SPEED_UHC);
    this.SUPER_SMASH = new GamePlayers(data.SUPER_SMASH);
    this.SURVIVAL_GAMES = new GamePlayers(data.SURVIVAL_GAMES);
    this.TNTGAMES = new GamePlayers(data.TNTGAMES);
    this.TOURNAMENT_LOBBY = new GamePlayers(data.TOURNAMENT_LOBBY);
    this.UHC = new GamePlayers(data.UHC);
    this.WALLS3 = new GamePlayers(data.WALLS3);
    this.WOOL_GAMES = new GamePlayers(data.WOOL_GAMES);
  }
}
