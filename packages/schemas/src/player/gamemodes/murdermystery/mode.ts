/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type APIData, formatTime } from "@statsify/util";
import { Field } from "#metadata";
import { ratio } from "@statsify/math";

export class BaseMurderMysteryMode {
  @Field()
  public wins: number;

  @Field()
  public gamesPlayed: number;

  @Field()
  public bowKills: number;

  @Field()
  public goldPickedUp: number;

  public constructor(data: APIData, mode: string) {
    mode = mode ? `_${mode}` : mode;

    this.goldPickedUp = data[`coins_pickedup${mode}`];

    this.wins = data[`wins${mode}`];
    this.gamesPlayed = data[`games${mode}`];

    this.bowKills = data[`bow_kills${mode}`];
  }
}

export class StandardMurderMysteryMode extends BaseMurderMysteryMode {
  @Field()
  public kills: number;

  @Field()
  public deaths: number;

  @Field()
  public kdr: number;

  @Field()
  public trapKills: number;

  @Field()
  public thrownKnifeKills: number;

  @Field()
  public heroWins: number;

  @Field()
  public detectiveWins: number;

  @Field()
  public murdererWins: number;

  @Field()
  public killsAsMurderer: number;

  @Field()
  public suicides: number;

  public constructor(data: APIData, mode: string) {
    super(data, mode);
    mode = mode ? `_${mode}` : mode;

    this.kills = data[`kills${mode}`];
    this.deaths = data[`deaths${mode}`];
    this.kdr = ratio(this.kills, this.deaths);

    this.trapKills = data[`trap_kills${mode}`];
    this.thrownKnifeKills = data[`thrown_knife_kills${mode}`];

    this.heroWins = data[`was_hero${mode}`];
    this.detectiveWins = data[`detective_wins${mode}`];
    this.murdererWins = data[`murderer_wins${mode}`];
    this.killsAsMurderer = data[`kills_as_murderer${mode}`];
    this.suicides = data[`suicides${mode}`];
  }
}

export class ClassicMurderMysteryMode extends StandardMurderMysteryMode {
  @Field({
    leaderboard: { sort: "ASC", formatter: formatTime },
    historical: { enabled: false },
  })
  public fastestDetectiveWin: number;

  @Field({
    leaderboard: { sort: "ASC", formatter: formatTime },
    historical: { enabled: false },
  })
  public fastestMurdererWin: number;

  public constructor(data: APIData, mode: string) {
    super(data, mode);
    mode = mode ? `_${mode}` : mode;

    this.fastestDetectiveWin
      = (data[`quickest_detective_win_time_seconds${mode}`] ?? 0) * 1000;
    this.fastestMurdererWin
      = (data[`quickest_murderer_win_time_seconds${mode}`] ?? 0) * 1000;
  }
}

export class InfectionMurderMysteryMode extends BaseMurderMysteryMode {
  @Field()
  public survivorWins: number;

  @Field()
  public killsAsSurvivor: number;

  @Field()
  public killsAsInfected: number;

  @Field()
  public lastAliveGames: number;

  public constructor(data: APIData, mode: string) {
    super(data, mode);

    this.survivorWins = data.survivor_wins_MURDER_INFECTION;

    this.killsAsSurvivor = data.kills_as_survivor_MURDER_INFECTION;

    this.killsAsInfected = data.kills_as_infected_MURDER_INFECTION;
    this.lastAliveGames = data.last_one_alive_MURDER_INFECTION;
  }
}

export class AssassinsMurderMysteryMode extends BaseMurderMysteryMode {
  @Field()
  public kills: number;

  @Field()
  public deaths: number;

  @Field()
  public kdr: number;

  @Field()
  public trapKills: number;

  @Field()
  public thrownKnifeKills: number;

  @Field()
  public knifeKills: number;

  public constructor(data: APIData, mode: string) {
    super(data, mode);

    this.kills = data.kills_MURDER_ASSASSINS;
    this.deaths = data.deaths_MURDER_ASSASSINS;
    this.kdr = ratio(this.kills, this.deaths);

    this.trapKills = data.trap_kills_MURDER_ASSASSINS;
    this.thrownKnifeKills = data.thrown_knife_kills_MURDER_ASSASSINS;
    this.knifeKills = data.knife_kills_MURDER_ASSASSINS;
  }
}
