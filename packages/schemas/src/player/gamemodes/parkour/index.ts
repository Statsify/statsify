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
  public arcade: number;

  @Field({ leaderboard: { ...fieldOptions, name: `${FormattedGame.BEDWARS} Lobby` } })
  public bedwars: number;

  @Field({ leaderboard: { ...fieldOptions, name: `${FormattedGame.BLITZSG} Lobby` } })
  public blitzsg: number;

  @Field({
    leaderboard: { ...fieldOptions, name: `${FormattedGame.BUILD_BATTLE} Lobby` },
  })
  public buildbattle: number;

  @Field({ leaderboard: { ...fieldOptions, name: "Classic Lobby" } })
  public classic: number;

  @Field({
    leaderboard: { ...fieldOptions, name: `${FormattedGame.COPS_AND_CRIMS} Lobby` },
  })
  public copsandcrims: number;

  @Field({ leaderboard: { ...fieldOptions, name: `${FormattedGame.DUELS} Lobby` } })
  public duels: number;

  @Field({ leaderboard: { ...fieldOptions, name: "Housing Lobby" } })
  public housing: number;

  @Field({ leaderboard: { ...fieldOptions, name: "Main Lobby" } })
  public mainLobby: number;

  @Field({ leaderboard: { ...fieldOptions, name: `${FormattedGame.MEGAWALLS} Lobby` } })
  public megawalls: number;

  @Field({
    leaderboard: { ...fieldOptions, name: `${FormattedGame.MURDER_MYSTERY} Lobby` },
  })
  public murdermystery: number;

  @Field({ leaderboard: { ...fieldOptions, name: "Prototype Lobby" } })
  public proto: number;

  @Field({ leaderboard: { ...fieldOptions, name: `${FormattedGame.SKYWARS} Lobby` } })
  public skywars: number;

  @Field({
    leaderboard: { ...fieldOptions, name: `${FormattedGame.SMASH_HEROES} Lobby` },
  })
  public smashheroes: number;

  @Field({ leaderboard: { ...fieldOptions, name: `${FormattedGame.TNT_GAMES} Lobby` } })
  public tntgames: number;

  @Field({ leaderboard: { ...fieldOptions, name: "Tournament Lobby" } })
  public tourney: number;

  @Field({ leaderboard: { ...fieldOptions, name: `${FormattedGame.UHC} Lobby` } })
  public uhc: number;

  @Field({ leaderboard: { ...fieldOptions, name: `${FormattedGame.WARLORDS} Lobby` } })
  public warlords: number;

  @Field({ leaderboard: { ...fieldOptions, name: `${FormattedGame.WOOLWARS} Lobby` } })
  public woolwars: number;

  public constructor(data: APIData) {
    const getTime = (key: string): number =>
      data[key]?.sort?.((a: any, b: any) => a.timeTook - b.timeTook)[0]?.timeTook;

    this.arcade = getTime("ArcadeGames");
    this.bedwars = getTime("Bedwars");
    this.blitzsg = getTime("BlitzLobby");
    this.buildbattle = getTime("BuildBattle");
    this.classic = getTime("Legacy");
    this.copsandcrims = getTime("CopsnCrims");
    this.duels = getTime("Duels");
    this.housing = getTime("Housing");
    this.mainLobby = getTime("mainLobby2017");
    this.megawalls = getTime("MegaWalls");
    this.murdermystery = getTime("MurderMystery");
    this.proto = getTime("Prototype");
    this.skywars = getTime("SkywarsAug2017");
    this.smashheroes = getTime("SuperSmash");
    this.tntgames = getTime("TNT");
    this.tourney = getTime("Tourney");
    this.uhc = getTime("uhc");
    this.warlords = getTime("Warlords");
    this.woolwars = getTime("WoolGames");
  }
}
