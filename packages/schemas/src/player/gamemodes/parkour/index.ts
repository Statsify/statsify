/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type APIData, formatTime } from "@statsify/util";
import { type ExtractGameModes, FormattedGame, GameModes } from "#game";
import { Field } from "#metadata";

export const PARKOUR_MODES = new GameModes([{ api: "overall" }] as const);

export type ParkourModes = ExtractGameModes<typeof PARKOUR_MODES>;

const fieldOptions = { sort: "ASC", formatter: formatTime, fieldName: "Time" };
const historical = { enabled: false };

// A 0ms run is a real time, so store 0 and leave lobbies without a run undefined
const store = { required: false, serialize: false, deserialize: false };

export class Parkour {
  @Field({
    leaderboard: { ...fieldOptions, name: `${FormattedGame.ARCADE} Lobby` },
    historical,
    store,
  })
  public ARCADE?: number;

  @Field({
    leaderboard: { ...fieldOptions, name: `${FormattedGame.BEDWARS} Lobby` },
    historical,
    store,
  })
  public BEDWARS?: number;

  @Field({
    leaderboard: { ...fieldOptions, name: `${FormattedGame.BLITZSG} Lobby` },
    historical,
    store,
  })
  public BLITZSG?: number;

  @Field({
    leaderboard: { ...fieldOptions, name: `${FormattedGame.BUILD_BATTLE} Lobby` },
    historical,
    store,
  })
  public BUILD_BATTLE?: number;

  @Field({
    leaderboard: { ...fieldOptions, name: `${FormattedGame.CLASSIC} Lobby` },
    historical,
    store,
  })
  public CLASSIC?: number;

  @Field({
    leaderboard: { ...fieldOptions, name: `${FormattedGame.COPS_AND_CRIMS} Lobby` },
    historical,
    store,
  })
  public COPS_AND_CRIMS?: number;

  @Field({
    leaderboard: { ...fieldOptions, name: `${FormattedGame.DUELS} Lobby` },
    historical,
    store,
  })
  public DUELS?: number;

  @Field({
    leaderboard: { ...fieldOptions, name: `${FormattedGame.HOUSING} Lobby` },
    historical,
    store,
  })
  public HOUSING?: number;

  @Field({
    leaderboard: { ...fieldOptions, name: FormattedGame.MAIN_LOBBY },
    historical,
    store,
  })
  public MAIN_LOBBY?: number;

  @Field({
    leaderboard: { ...fieldOptions, name: `${FormattedGame.MEGAWALLS} Lobby` },
    historical,
    store,
  })
  public MEGAWALLS?: number;

  @Field({
    leaderboard: { ...fieldOptions, name: `${FormattedGame.MURDER_MYSTERY} Lobby` },
    historical,
    store,
  })
  public MURDER_MYSTERY?: number;

  @Field({
    leaderboard: { ...fieldOptions, name: `${FormattedGame.PROTOTYPE} Lobby` },
    historical,
    store,
  })
  public PROTOTYPE?: number;

  @Field({
    leaderboard: { ...fieldOptions, name: `${FormattedGame.SKYWARS} Lobby` },
    historical,
    store,
  })
  public SKYWARS?: number;

  @Field({
    leaderboard: { ...fieldOptions, name: `${FormattedGame.SMASH_HEROES} Lobby` },
    historical,
    store,
  })
  public SMASH_HEROES?: number;

  @Field({
    leaderboard: { ...fieldOptions, name: `${FormattedGame.TNT_GAMES} Lobby` },
    historical,
    store,
  })
  public TNT_GAMES?: number;

  @Field({
    leaderboard: { ...fieldOptions, name: FormattedGame.TOURNAMENT_LOBBY },
    historical,
    store,
  })
  public TOURNAMENT_LOBBY?: number;

  @Field({
    leaderboard: { ...fieldOptions, name: `${FormattedGame.UHC} Lobby` },
    historical,
    store,
  })
  public UHC?: number;

  @Field({
    leaderboard: { ...fieldOptions, name: `${FormattedGame.WARLORDS} Lobby` },
    historical,
    store,
  })
  public WARLORDS?: number;

  @Field({
    leaderboard: { ...fieldOptions, name: `${FormattedGame.WOOLGAMES} Lobby` },
    historical,
    store,
  })
  public WOOLGAMES?: number;

  public constructor(data: APIData) {
    const getTime = (key: string): number | undefined =>
      data[key]?.reduce?.(
        (best: number | undefined, { timeTook }: APIData) =>
          best === undefined || timeTook < best ? timeTook : best,
        undefined
      );

    this.ARCADE = getTime("ArcadeGames2");
    this.BEDWARS = getTime("BedwarsSpring2023");
    this.BLITZSG = getTime("BlitzLobby");
    this.BUILD_BATTLE = getTime("BuildBattle");
    this.CLASSIC = getTime("Legacy");
    this.COPS_AND_CRIMS = getTime("CopsnCrims2024");
    this.DUELS = getTime("Duels");
    this.HOUSING = getTime("Housing");
    this.MAIN_LOBBY = getTime("mainLobby2022");
    this.MEGAWALLS = getTime("MegaWalls");
    this.MURDER_MYSTERY = getTime("MurderMystery");
    this.PROTOTYPE = getTime("Prototype2025");
    this.SKYWARS = getTime("SkywarsStandard2022");
    this.SMASH_HEROES = getTime("SuperSmash");
    this.TNT_GAMES = getTime("tntLobby2024");
    this.TOURNAMENT_LOBBY = getTime("Tourney");
    this.UHC = getTime("uhc");
    this.WARLORDS = getTime("Warlords");
    this.WOOLGAMES = getTime("WoolGames");
  }
}
