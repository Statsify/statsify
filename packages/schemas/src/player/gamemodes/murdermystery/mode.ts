/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData, formatTime } from "@statsify/util";
import { Field } from "../../../metadata";
import { ratio, sub } from "@statsify/math";

export class BaseMurderMysteryMode {
  @Field()
  public wins: number;

  @Field()
  public gamesPlayed: number;

  @Field()
  public kills: number;

  @Field()
  public trapKills: number;

  @Field()
  public deaths: number;

  @Field()
  public kdr: number;

  public constructor(data: APIData, mode: string) {
    mode = mode ? `_${mode}` : mode;

    this.wins = data[`wins${mode}`];
    this.gamesPlayed = data[`games${mode}`];
    this.kills = data[`kills${mode}`];
    this.trapKills = data[`trap_kills${mode}`];
    this.deaths = data[`deaths${mode}`];
    this.kdr = ratio(this.kills, this.deaths);
  }
}

export class ClassicMurderMysteryMode extends BaseMurderMysteryMode {
  @Field()
  public goldGathered: number;

  @Field({ leaderboard: { enabled: false } })
  public bowKills: number;

  @Field({ leaderboard: { enabled: false } })
  public knifeKills: number;

  @Field({ leaderboard: { enabled: false } })
  public thrownKnifeKills: number;

  @Field()
  public heroWins: number;

  @Field()
  public murdererWins: number;

  @Field()
  public detectiveWins: number;

  @Field()
  public suicides: number;

  @Field({ leaderboard: { sort: "ASC", formatter: formatTime } })
  public fastestDetectiveWin: number;

  @Field({ leaderboard: { sort: "ASC", formatter: formatTime } })
  public fastestMurdererWin: number;

  public constructor(data: APIData, mode: string) {
    super(data, mode);
    this.goldGathered = data[`coins_pickedup_${mode}`];
    this.heroWins = data[`was_hero_${mode}`];
    this.murdererWins = data[`murderer_wins_${mode}`];
    this.detectiveWins = data[`detective_wins_${mode}`];
    this.suicides = data[`suicides_${mode}`];
    this.bowKills = data[`bow_kills_${mode}`];
    this.knifeKills = data[`knife_kills_${mode}`];
    this.thrownKnifeKills = data[`thrown_knife_kills_${mode}`];

    this.fastestDetectiveWin =
      (data[`quickest_detective_win_time_seconds_${mode}`] ?? 0) * 1000;
    this.fastestMurdererWin =
      (data[`quickest_murderer_win_time_seconds_${mode}`] ?? 0) * 1000;
  }
}

export class InfectionMurderMysteryMode extends BaseMurderMysteryMode {
  @Field()
  public survivorWins: number;

  @Field()
  public killsAsSurvivor: number;

  @Field()
  public infectedWins: number;

  @Field()
  public killsAsInfected: number;

  @Field()
  public lastAliveGames: number;

  @Field({ leaderboard: { formatter: formatTime } })
  public longestSurvivalTime: number;

  public constructor(data: APIData, mode: string) {
    super(data, mode);

    this.survivorWins = data.survivor_wins_MURDER_INFECTION;
    this.killsAsSurvivor = data.kills_as_survivor_MURDER_INFECTION;
    this.infectedWins = sub(this.wins, this.survivorWins);
    this.killsAsInfected = data.kills_as_infected_MURDER_INFECTION;
    this.lastAliveGames = data.last_one_alive_MURDER_INFECTION;
    this.longestSurvivalTime =
      (data.longest_time_as_survivor_seconds_MURDER_INFECTION ?? 0) * 1000;
  }
}

export class AssassinsMurderMysteryMode extends BaseMurderMysteryMode {
  @Field({ leaderboard: { enabled: false } })
  public thrownKnifeKills: number;

  @Field({ leaderboard: { enabled: false } })
  public knifeKills: number;

  @Field({ leaderboard: { enabled: false } })
  public bowKills: number;

  public constructor(data: APIData, mode: string) {
    super(data, mode);

    this.thrownKnifeKills = data.thrown_knife_kills_MURDER_ASSASSINS;
    this.knifeKills = data.knife_kills_MURDER_ASSASSINS;
    this.bowKills = data.bow_kills_MURDER_ASSASSINS;
  }
}
