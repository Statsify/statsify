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
import { createPrefixProgression, defaultPrefix, getFormattedPrefix } from "../prefixes";
import { humanPrefixes, vampirePrefixes } from "./prefixes";
import { ratio } from "@statsify/math";

export class VampireZHuman {
  @Field({ leaderboard: { fieldName: "Vampires Killed" } })
  public kills: number;

  @Field()
  public deaths: number;

  @Field()
  public kdr: number;

  @Field()
  public wins: number;

  @Field()
  public currentPrefix: string;

  @Field()
  public nextPrefix: string;

  @Field({ store: { default: defaultPrefix(humanPrefixes) } })
  public naturalPrefix: string;

  @Field()
  public progression: Progression;

  public constructor(data: APIData, mode: string) {
    this.wins = data[`${mode}_wins`];
    this.kills = data[`${mode === "human" ? "vampire" : "human"}_kills`];
    this.deaths = data[`${mode}_deaths`];

    const prefixes = mode === "human" ? humanPrefixes : vampirePrefixes;
    const score = mode === "human" ? this.wins : data[`human_kills`];

    this.currentPrefix = getFormattedPrefix({ prefixes, score });

    this.naturalPrefix = getFormattedPrefix({
      prefixes,
      score,
      trueScore: true,
      abbreviation: false,
    });

    this.nextPrefix = getFormattedPrefix({
      prefixes,
      score,
      skip: true,
    });

    this.progression = createPrefixProgression(prefixes, score);

    VampireZHuman.applyRatios(this);
  }

  public static applyRatios(data: VampireZHuman) {
    data.kdr = ratio(data.kills, data.deaths);
  }
}

export class VampireZVampire extends VampireZHuman {
  @Field({ leaderboard: { fieldName: "Humans Killed" } })
  public declare kills: number;
}
