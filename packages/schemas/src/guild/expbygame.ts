/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData } from '@statsify/util';
import { Field } from '../metadata';

/**
 * Removes some useless broken games from the `guildExpByGameType` field such as `SMP` or `SKYBLOCK`
 */
export class ExpByGame {
  @Field()
  public ARCADE: number;

  @Field()
  public ARENA: number;

  @Field()
  public BATTLEGROUND: number;

  @Field()
  public BEDWARS: number;

  @Field()
  public BUILD_BATTLE: number;

  @Field()
  public DUELS: number;

  @Field()
  public GINGERBREAD: number;

  @Field()
  public HOUSING: number;

  @Field()
  public MCGO: number;

  @Field()
  public MURDER_MYSTERY: number;

  @Field()
  public PAINTBALL: number;

  @Field()
  public PIT: number;

  @Field()
  public PROTOTYPE: number;

  @Field()
  public QUAKECRAFT: number;

  @Field()
  public SKYWARS: number;

  @Field()
  public SPEED_UHC: number;

  @Field()
  public SUPER_SMASH: number;

  @Field()
  public SURVIVAL_GAMES: number;

  @Field()
  public TNTGAMES: number;

  @Field()
  public UHC: number;

  @Field()
  public VAMPIREZ: number;

  @Field()
  public WALLS3: number;

  @Field()
  public WALLS: number;

  @Field()
  public WOOL_GAMES: number;

  public constructor(data: APIData) {
    this.ARCADE = data.ARCADE;
    this.ARENA = data.ARENA;
    this.BATTLEGROUND = data.BATTLEGROUND;
    this.BEDWARS = data.BEDWARS;
    this.BUILD_BATTLE = data.BUILD_BATTLE;
    this.DUELS = data.DUELS;
    this.GINGERBREAD = data.GINGERBREAD;
    this.HOUSING = data.HOUSING;
    this.MCGO = data.MCGO;
    this.MURDER_MYSTERY = data.MURDER_MYSTERY;
    this.PAINTBALL = data.PAINTBALL;
    this.PIT = data.PIT;
    this.PROTOTYPE = data.PROTOTYPE;
    this.QUAKECRAFT = data.QUAKECRAFT;
    this.SKYWARS = data.SKYWARS;
    this.SPEED_UHC = data.SPEED_UHC;
    this.SUPER_SMASH = data.SUPER_SMASH;
    this.SURVIVAL_GAMES = data.SURVIVAL_GAMES;
    this.TNTGAMES = data.TNTGAMES;
    this.UHC = data.UHC;
    this.VAMPIREZ = data.VAMPIREZ;
    this.WALLS = data.WALLS;
    this.WALLS3 = data.WALLS3;
    this.WOOL_GAMES = data.WOOL_GAMES;
  }
}
