/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData } from "@statsify/util";
import { Field } from "../../../metadata";
import { Progression } from "../../../progression";

const EXP_REQUIREMENT = 25_000;
const MAX_LEVEL = 100;

export class Event {
  @Field({ leaderboard: { fieldName: "EXP" } })
  public exp: number;

  @Field({ leaderboard: { enabled: false }, store: { default: 1 } })
  public level: number;

  @Field()
  public progression: Progression;

  public constructor(data: APIData = {}) {
    this.exp = data.levelling?.experience ?? 0;
    this.level = Math.min(MAX_LEVEL, Math.floor(this.exp / EXP_REQUIREMENT) + 1);

    this.progression = new Progression(
      this.exp % EXP_REQUIREMENT,
      this.level >= MAX_LEVEL ? 0 : EXP_REQUIREMENT
    );
  }
}

export class Events {
  @Field({ leaderboard: { name: "Summer 2022" } })
  public summer2022: Event;

  @Field({ leaderboard: { name: "Halloween 2022" } })
  public halloween2022: Event;

  @Field()
  public silver: number;

  public constructor(data: APIData = {}) {
    this.summer2022 = new Event(data.summer?.["2022"]);
    this.halloween2022 = new Event(data.halloween?.["2022"]);
    this.silver = data.silver;
  }
}
