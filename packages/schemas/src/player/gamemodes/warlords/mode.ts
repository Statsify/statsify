/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Field } from "#metadata";
import type { APIData } from "@statsify/util";

export class WarlordsDomination {
  @Field()
  public capturePoints: number;

  @Field()
  public defendPoints: number;

  @Field()
  public kills: number;

  @Field()
  public score: number;

  @Field()
  public wins: number;

  public constructor(data: APIData) {
    this.capturePoints = data.dom_point_captures;
    this.defendPoints = data.dom_point_defends;
    this.kills = data.kills_domination;
    this.score = data.total_domination_score;
    this.wins = data.wins_domination;
  }
}

export class WarlordsCaptureTheFlag {
  @Field()
  public wins: number;

  @Field()
  public kills: number;

  @Field()
  public flagCaptures: number;

  @Field()
  public flagReturns: number;

  public constructor(data: APIData) {
    this.wins = data.wins_capturetheflag;
    this.kills = data.kills_capturetheflag;

    this.flagCaptures = data.flag_conquer_self;
    this.flagReturns = data.flag_returns;
  }
}

export class WarlordsTeamDeathmatch {
  @Field()
  public wins: number;

  @Field()
  public kills: number;

  public constructor(data: APIData) {
    this.wins = data.wins_teamdeathmatch;
    this.kills = data.kills_teamdeathmatch;
  }
}

