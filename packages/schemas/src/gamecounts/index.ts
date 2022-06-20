/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData } from '@statsify/util';
import { Field } from '../metadata';

export class Gamecounts {
  @Field()
  public ARCADE: number;

  @Field()
  public BATTLEGROUND: number;

  @Field()
  public BEDWARS: number;

  @Field()
  public BUILD_BATTLE: number;

  @Field()
  public DUELS: number;

  @Field()
  public HOUSING: number;

  @Field()
  public IDLE: number;

  @Field()
  public LEGACY: number;

  @Field()
  public LIMBO: number;

  @Field()
  public MAIN_LOBBY: number;

  @Field()
  public MCGO: number;

  @Field()
  public MURDER_MYSTERY: number;

  @Field()
  public PIT: number;

  @Field()
  public PROTOTYPE: number;

  @Field()
  public QUEUE: number;

  @Field()
  public REPLAY: number;

  @Field()
  public SKYBLOCK: number;

  @Field()
  public SKYWARS: number;

  @Field()
  public SMP: number;

  @Field()
  public SPEED_UHC: number;

  @Field()
  public SUPER_SMASH: number;

  @Field()
  public SURVIVAL_GAMES: number;

  @Field()
  public TNTGAMES: number;

  @Field()
  public TOURNAMENT_LOBBY: number;

  @Field()
  public UHC: number;

  @Field()
  public WALLS3: number;

  @Field()
  public WOOL_GAMES: number;

  public constructor(data: APIData = {}) {
    this.ARCADE = data.ARCADE?.players;
    this.BATTLEGROUND = data.BATTLEGROUND?.players;
    this.BEDWARS = data.BEDWARS?.players;
    this.BUILD_BATTLE = data.BUILD_BATTLE?.players;
    this.DUELS = data.DUELS?.players;
    this.HOUSING = data.HOUSING?.players;
    this.IDLE = data.IDLE?.players;
    this.LEGACY = data.LEGACY?.players;
    this.LIMBO = data.LIMBO?.players;
    this.MAIN_LOBBY = data.MAIN_LOBBY?.players;
    this.MCGO = data.MCGO?.players;
    this.MURDER_MYSTERY = data.MURDER_MYSTERY?.players;
    this.PIT = data.PIT?.players;
    this.PROTOTYPE = data.PROTOTYPE?.players;
    this.QUEUE = data.QUEUE?.players;
    this.REPLAY = data.REPLAY?.players;
    this.SKYBLOCK = data.SKYBLOCK?.players;
    this.SKYWARS = data.SKYWARS?.players;
    this.SMP = data.SMP?.players;
    this.SPEED_UHC = data.SPEED_UHC?.players;
    this.SUPER_SMASH = data.SUPER_SMASH?.players;
    this.SURVIVAL_GAMES = data.SURVIVAL_GAMES?.players;
    this.TNTGAMES = data.TNTGAMES?.players;
    this.TOURNAMENT_LOBBY = data.TOURNAMENT_LOBBY?.players;
    this.UHC = data.UHC?.players;
    this.WALLS3 = data.WALLS3?.players;
    this.WOOL_GAMES = data.WOOL_GAMES?.players;
  }
}
