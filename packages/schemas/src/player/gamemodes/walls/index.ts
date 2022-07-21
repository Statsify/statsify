/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData, getFormattedLevel, getPrefixRequirement } from "@statsify/util";
import { Field } from "../../../metadata";
import { GameModes, IGameModes } from "../../../game";
import { Progression } from "../../../progression";
import { ratio } from "@statsify/math";

export const WALLS_MODES = new GameModes([{ api: "overall" }]);

export type WallsModes = IGameModes<typeof WALLS_MODES>;

const prefixes = [
  { color: "8", score: 0 },
  { color: "7", score: 25 },
  { color: "f", score: 50 },
  { color: "e", score: 100 },
  { color: "a", score: 200 },
  { color: "2", score: 300 },
  { color: "9", score: 400 },
  { color: "1", score: 500 },
  { color: "d", score: 750 },
  { color: "4", score: 1000 },
  { color: "6", score: 2000 },
  { color: "rainbow", score: 2500 },
];

export class Walls {
  @Field()
  public coins: number;

  @Field()
  public wins: number;

  @Field()
  public losses: number;

  @Field()
  public wlr: number;

  @Field()
  public kills: number;

  @Field()
  public deaths: number;

  @Field()
  public kdr: number;

  @Field()
  public assists: number;

  @Field()
  public tokens: number;

  @Field()
  public progression: Progression;

  @Field()
  public currentPrefix: string;

  @Field({
    store: { default: getFormattedLevel({ prefixes, prefixScore: prefixes[0].score }) },
  })
  public naturalPrefix: string;

  @Field()
  public nextPrefix: string;

  public constructor(data: APIData, legacy: APIData) {
    this.coins = data.coins;
    this.wins = data.wins;
    this.losses = data.losses;
    this.wlr = ratio(this.wins, this.losses);
    this.kills = data.kills;
    this.deaths = data.deaths;
    this.kdr = ratio(this.kills, this.deaths);
    this.assists = data.assists;
    this.tokens = legacy.walls_tokens;

    const prefixScore = this.wins;
    this.currentPrefix = getFormattedLevel({ prefixes, prefixScore });
    this.naturalPrefix = getFormattedLevel({
      prefixes,
      prefixScore,
      trueScore: true,
    });
    this.nextPrefix = getFormattedLevel({
      prefixes,
      prefixScore,
      skip: true,
    });

    this.progression = new Progression(
      Math.abs(this.wins - getPrefixRequirement(prefixes, this.wins)),
      getPrefixRequirement(prefixes, this.wins, 1) -
        getPrefixRequirement(prefixes, this.wins)
    );
  }
}
