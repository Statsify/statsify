/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData, formatTime } from "@statsify/util";
import { Field } from "../../../metadata";
import { FormattedGame, GameModes, IGameModes } from "../../../game";

export const PARKOUR_MODES = new GameModes([{ api: "overall" }]);

export type ParkourModes = IGameModes<typeof PARKOUR_MODES>;

const fieldOptions = { sort: "ASC", formatter: formatTime, fieldName: "Time" };

export class Parkour {
  @Field({ leaderboard: { ...fieldOptions, name: `${FormattedGame.ARCADE} Lobby` } })
  public ARCADE: number;

  @Field({ leaderboard: { ...fieldOptions, name: `${FormattedGame.BEDWARS} Lobby` } })
  public BEDWARS: number;

  @Field({ leaderboard: { ...fieldOptions, name: `${FormattedGame.BLITZSG} Lobby` } })
  public BLITZSG: number;

  @Field({
    leaderboard: { ...fieldOptions, name: `${FormattedGame.BUILD_BATTLE} Lobby` },
  })
  public BUILD_BATTLE: number;

  @Field({ leaderboard: { ...fieldOptions, name: `${FormattedGame.CLASSIC} Lobby` } })
  public CLASSIC: number;

  @Field({
    leaderboard: { ...fieldOptions, name: `${FormattedGame.COPS_AND_CRIMS} Lobby` },
  })
  public COPS_AND_CRIMS: number;

  @Field({ leaderboard: { ...fieldOptions, name: `${FormattedGame.DUELS} Lobby` } })
  public DUELS: number;

  @Field({ leaderboard: { ...fieldOptions, name: `${FormattedGame.HOUSING} Lobby` } })
  public HOUSING: number;

  @Field({ leaderboard: { ...fieldOptions, name: FormattedGame.MAIN_LOBBY } })
  public MAIN_LOBBY: number;

  @Field({ leaderboard: { ...fieldOptions, name: `${FormattedGame.MEGAWALLS} Lobby` } })
  public MEGAWALLS: number;

  @Field({
    leaderboard: { ...fieldOptions, name: `${FormattedGame.MURDER_MYSTERY} Lobby` },
  })
  public MURDER_MYSTERY: number;

  @Field({ leaderboard: { ...fieldOptions, name: `${FormattedGame.PROTOTYPE} Lobby` } })
  public PROTOTYPE: number;

  @Field({ leaderboard: { ...fieldOptions, name: `${FormattedGame.SKYWARS} Lobby` } })
  public SKYWARS: number;

  @Field({
    leaderboard: { ...fieldOptions, name: `${FormattedGame.SMASH_HEROES} Lobby` },
  })
  public SMASH_HEROES: number;

  @Field({ leaderboard: { ...fieldOptions, name: `${FormattedGame.TNT_GAMES} Lobby` } })
  public TNT_GAMES: number;

  @Field({ leaderboard: { ...fieldOptions, name: FormattedGame.TOURNAMENT_LOBBY } })
  public TOURNAMENT_LOBBY: number;

  @Field({ leaderboard: { ...fieldOptions, name: `${FormattedGame.UHC} Lobby` } })
  public UHC: number;

  @Field({ leaderboard: { ...fieldOptions, name: `${FormattedGame.WARLORDS} Lobby` } })
  public WARLORDS: number;

  @Field({ leaderboard: { ...fieldOptions, name: `${FormattedGame.WOOLWARS} Lobby` } })
  public WOOLWARS: number;

  public constructor(data: APIData) {
    const getTime = (key: string): number =>
      data[key]?.sort?.((a: any, b: any) => a.timeTook - b.timeTook)[0]?.timeTook;

    this.ARCADE = getTime("ArcadeGames");
    this.BEDWARS = getTime("Bedwars");
    this.BLITZSG = getTime("BlitzLobby");
    this.BUILD_BATTLE = getTime("BuildBattle");
    this.CLASSIC = getTime("Legacy");
    this.COPS_AND_CRIMS = getTime("CopsnCrims");
    this.DUELS = getTime("Duels");
    this.HOUSING = getTime("Housing");
    this.MAIN_LOBBY = getTime("mainLobby2017");
    this.MEGAWALLS = getTime("MegaWalls");
    this.MURDER_MYSTERY = getTime("MurderMystery");
    this.PROTOTYPE = getTime("Prototype");
    this.SKYWARS = getTime("SkywarsAug2017");
    this.SMASH_HEROES = getTime("SuperSmash");
    this.TNT_GAMES = getTime("TNT");
    this.TOURNAMENT_LOBBY = getTime("Tourney");
    this.UHC = getTime("uhc");
    this.WARLORDS = getTime("Warlords");
    this.WOOLWARS = getTime("WoolGames");
  }
}
