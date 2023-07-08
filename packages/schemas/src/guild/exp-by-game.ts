/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Field } from "#metadata";
import { FormattedGame, GameCodeMapping } from "#game";
import type { APIData } from "@statsify/util";

const limit = 100_000;
const fieldName = "GEXP";

/**
 * Removes some useless broken games from the `guildExpByGameType` field such as `SMP` or `SKYBLOCK`
 */
export class ExpByGame {
  @Field({ leaderboard: { name: FormattedGame.ARCADE, fieldName, limit } })
  public ARCADE: number;

  @Field({ leaderboard: { name: FormattedGame.ARENA_BRAWL, fieldName, limit } })
  public ARENA_BRAWL: number;

  @Field({ leaderboard: { name: FormattedGame.BEDWARS, fieldName, limit } })
  public BEDWARS: number;

  @Field({ leaderboard: { name: FormattedGame.BLITZSG, fieldName, limit } })
  public BLITZSG: number;

  @Field({ leaderboard: { name: FormattedGame.BUILD_BATTLE, fieldName, limit } })
  public BUILD_BATTLE: number;

  @Field({ leaderboard: { name: FormattedGame.COPS_AND_CRIMS, fieldName, limit } })
  public COPS_AND_CRIMS: number;

  @Field({ leaderboard: { name: FormattedGame.DUELS, fieldName, limit } })
  public DUELS: number;

  @Field({ leaderboard: { name: FormattedGame.HOUSING, fieldName, limit } })
  public HOUSING: number;

  @Field({ leaderboard: { name: FormattedGame.MEGAWALLS, fieldName, limit } })
  public MEGAWALLS: number;

  @Field({ leaderboard: { name: FormattedGame.MURDER_MYSTERY, fieldName, limit } })
  public MURDER_MYSTERY: number;

  @Field({ leaderboard: { name: FormattedGame.PAINTBALL, fieldName, limit } })
  public PAINTBALL: number;

  @Field({ leaderboard: { name: FormattedGame.PIT, fieldName, limit } })
  public PIT: number;

  @Field({ leaderboard: { name: FormattedGame.PROTOTYPE, fieldName, limit } })
  public PROTOTYPE: number;

  @Field({ leaderboard: { name: FormattedGame.QUAKE, fieldName, limit } })
  public QUAKE: number;

  @Field({ leaderboard: { name: FormattedGame.SKYWARS, fieldName, limit } })
  public SKYWARS: number;

  @Field({ leaderboard: { name: FormattedGame.SMASH_HEROES, fieldName, limit } })
  public SMASH_HEROES: number;

  @Field({ leaderboard: { name: FormattedGame.SPEED_UHC, fieldName, limit } })
  public SPEED_UHC: number;

  @Field({ leaderboard: { name: FormattedGame.TNT_GAMES, fieldName, limit } })
  public TNT_GAMES: number;

  @Field({ leaderboard: { name: FormattedGame.TURBO_KART_RACERS, fieldName, limit } })
  public TURBO_KART_RACERS: number;

  @Field({ leaderboard: { name: FormattedGame.UHC, fieldName, limit } })
  public UHC: number;

  @Field({ leaderboard: { name: FormattedGame.VAMPIREZ, fieldName, limit } })
  public VAMPIREZ: number;

  @Field({ leaderboard: { name: FormattedGame.WALLS, fieldName, limit } })
  public WALLS: number;

  @Field({ leaderboard: { name: FormattedGame.WARLORDS, fieldName, limit } })
  public WARLORDS: number;

  @Field({ leaderboard: { name: FormattedGame.WOOLWARS, fieldName, limit } })
  public WOOLWARS: number;

  public constructor(data: APIData) {
    this.ARCADE = data[GameCodeMapping.ARCADE];
    this.ARENA_BRAWL = data[GameCodeMapping.ARENA_BRAWL];
    this.BEDWARS = data[GameCodeMapping.BEDWARS];
    this.BLITZSG = data[GameCodeMapping.BLITZSG];
    this.BUILD_BATTLE = data[GameCodeMapping.BUILD_BATTLE];
    this.COPS_AND_CRIMS = data[GameCodeMapping.COPS_AND_CRIMS];
    this.DUELS = data[GameCodeMapping.DUELS];
    this.HOUSING = data[GameCodeMapping.HOUSING];
    this.MEGAWALLS = data[GameCodeMapping.MEGAWALLS];
    this.MURDER_MYSTERY = data[GameCodeMapping.MURDER_MYSTERY];
    this.PAINTBALL = data[GameCodeMapping.PAINTBALL];
    this.PIT = data[GameCodeMapping.PIT];
    this.PROTOTYPE = data[GameCodeMapping.PROTOTYPE];
    this.QUAKE = data[GameCodeMapping.QUAKE];
    this.SKYWARS = data[GameCodeMapping.SKYWARS];
    this.SMASH_HEROES = data[GameCodeMapping.SMASH_HEROES];
    this.SPEED_UHC = data[GameCodeMapping.SPEED_UHC];
    this.TNT_GAMES = data[GameCodeMapping.TNT_GAMES];
    this.TURBO_KART_RACERS = data[GameCodeMapping.TURBO_KART_RACERS];
    this.UHC = data[GameCodeMapping.UHC];
    this.VAMPIREZ = data[GameCodeMapping.VAMPIREZ];
    this.WALLS = data[GameCodeMapping.WALLS];
    this.WARLORDS = data[GameCodeMapping.WARLORDS];
    this.WOOLWARS = data[GameCodeMapping.WOOLWARS];
  }
}
