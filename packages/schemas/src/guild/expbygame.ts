/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData } from "@statsify/util";
import { Field } from "../metadata";
import { FormattedGame } from "../game";

const limit = 50_000;
const fieldName = "GEXP";

/**
 * Removes some useless broken games from the `guildExpByGameType` field such as `SMP` or `SKYBLOCK`
 */
export class ExpByGame {
  @Field({ leaderboard: { name: FormattedGame.ARCADE, fieldName, limit } })
  public ARCADE: number;

  @Field({ leaderboard: { name: FormattedGame.ARENA_BRAWL, fieldName, limit } })
  public ARENA: number;

  @Field({ leaderboard: { name: FormattedGame.WARLORDS, fieldName, limit } })
  public BATTLEGROUND: number;

  @Field({ leaderboard: { name: FormattedGame.BEDWARS, fieldName, limit } })
  public BEDWARS: number;

  @Field({ leaderboard: { name: FormattedGame.BUILD_BATTLE, fieldName, limit } })
  public BUILD_BATTLE: number;

  @Field({ leaderboard: { name: FormattedGame.DUELS, fieldName, limit } })
  public DUELS: number;

  @Field({ leaderboard: { name: FormattedGame.TURBO_KART_RACERS, fieldName, limit } })
  public GINGERBREAD: number;

  @Field({ leaderboard: { name: FormattedGame.HOUSING, fieldName, limit } })
  public HOUSING: number;

  @Field({ leaderboard: { name: FormattedGame.COPS_AND_CRIMS, fieldName, limit } })
  public MCGO: number;

  @Field({ leaderboard: { name: FormattedGame.MURDER_MYSTERY, fieldName, limit } })
  public MURDER_MYSTERY: number;

  @Field({ leaderboard: { name: FormattedGame.PAINTBALL, fieldName, limit } })
  public PAINTBALL: number;

  @Field({ leaderboard: { name: FormattedGame.PIT, fieldName, limit } })
  public PIT: number;

  @Field({ leaderboard: { name: FormattedGame.PROTOTYPE, fieldName, limit } })
  public PROTOTYPE: number;

  @Field({ leaderboard: { name: FormattedGame.QUAKE, fieldName, limit } })
  public QUAKECRAFT: number;

  @Field({ leaderboard: { name: FormattedGame.SKYWARS, fieldName, limit } })
  public SKYWARS: number;

  @Field({ leaderboard: { name: FormattedGame.SPEED_UHC, fieldName, limit } })
  public SPEED_UHC: number;

  @Field({ leaderboard: { name: FormattedGame.SMASH_HEROES, fieldName, limit } })
  public SUPER_SMASH: number;

  @Field({ leaderboard: { name: FormattedGame.BLITZSG, fieldName, limit } })
  public SURVIVAL_GAMES: number;

  @Field({ leaderboard: { name: FormattedGame.TNT_GAMES, fieldName, limit } })
  public TNTGAMES: number;

  @Field({ leaderboard: { name: FormattedGame.UHC, fieldName, limit } })
  public UHC: number;

  @Field({ leaderboard: { name: FormattedGame.VAMPIREZ, fieldName, limit } })
  public VAMPIREZ: number;

  @Field({ leaderboard: { name: FormattedGame.MEGAWALLS, fieldName, limit } })
  public WALLS3: number;

  @Field({ leaderboard: { name: FormattedGame.WALLS, fieldName, limit } })
  public WALLS: number;

  @Field({ leaderboard: { name: FormattedGame.WOOLWARS, fieldName, limit } })
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
