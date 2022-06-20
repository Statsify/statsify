/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData } from '@statsify/util';
import { FormattedGame } from '../game';
import { Field } from '../metadata';

const limit = 50_000;

/**
 * Removes some useless broken games from the `guildExpByGameType` field such as `SMP` or `SKYBLOCK`
 */
export class ExpByGame {
  @Field({ leaderboard: { fieldName: FormattedGame.ARCADE, limit } })
  public ARCADE: number;

  @Field({ leaderboard: { fieldName: FormattedGame.ARENA_BRAWL, limit } })
  public ARENA: number;

  @Field({ leaderboard: { fieldName: FormattedGame.WARLORDS, limit } })
  public BATTLEGROUND: number;

  @Field({ leaderboard: { fieldName: FormattedGame.BEDWARS, limit } })
  public BEDWARS: number;

  @Field({ leaderboard: { fieldName: FormattedGame.BUILD_BATTLE, limit } })
  public BUILD_BATTLE: number;

  @Field({ leaderboard: { fieldName: FormattedGame.DUELS, limit } })
  public DUELS: number;

  @Field({ leaderboard: { fieldName: FormattedGame.TURBO_KART_RACERS, limit } })
  public GINGERBREAD: number;

  @Field({ leaderboard: { fieldName: FormattedGame.HOUSING, limit } })
  public HOUSING: number;

  @Field({ leaderboard: { fieldName: FormattedGame.COPS_AND_CRIMS, limit } })
  public MCGO: number;

  @Field({ leaderboard: { fieldName: FormattedGame.MURDER_MYSTERY, limit } })
  public MURDER_MYSTERY: number;

  @Field({ leaderboard: { fieldName: FormattedGame.PAINTBALL, limit } })
  public PAINTBALL: number;

  @Field({ leaderboard: { fieldName: FormattedGame.PIT, limit } })
  public PIT: number;

  @Field({ leaderboard: { fieldName: FormattedGame.PROTOTYPE, limit } })
  public PROTOTYPE: number;

  @Field({ leaderboard: { fieldName: FormattedGame.QUAKE, limit } })
  public QUAKECRAFT: number;

  @Field({ leaderboard: { fieldName: FormattedGame.SKYWARS, limit } })
  public SKYWARS: number;

  @Field({ leaderboard: { fieldName: FormattedGame.SPEED_UHC, limit } })
  public SPEED_UHC: number;

  @Field({ leaderboard: { fieldName: FormattedGame.SMASH_HEROES, limit } })
  public SUPER_SMASH: number;

  @Field({ leaderboard: { fieldName: FormattedGame.BLITZSG, limit } })
  public SURVIVAL_GAMES: number;

  @Field({ leaderboard: { fieldName: FormattedGame.TNT_GAMES, limit } })
  public TNTGAMES: number;

  @Field({ leaderboard: { fieldName: FormattedGame.UHC, limit } })
  public UHC: number;

  @Field({ leaderboard: { fieldName: FormattedGame.VAMPIREZ, limit } })
  public VAMPIREZ: number;

  @Field({ leaderboard: { fieldName: FormattedGame.MEGAWALLS, limit } })
  public WALLS3: number;

  @Field({ leaderboard: { fieldName: FormattedGame.WALLS, limit } })
  public WALLS: number;

  @Field({ leaderboard: { fieldName: FormattedGame.WOOLWARS, limit } })
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
