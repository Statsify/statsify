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
import { PaintballPerks } from "./perks";
import { Progression } from "../../../progression";
import { ratio } from "@statsify/math";

export const PAINTBALL_MODES = new GameModes([{ api: "overall" }]);

export type PaintballModes = IGameModes<typeof PAINTBALL_MODES>;

const prefixes = [
  { color: "8", score: 0 },
  { color: "7", score: 1000 },
  { color: "f", score: 2500 },
  { color: "2", score: 5000 },
  { color: "e", score: 10_000 },
  { color: "a", score: 20_000 },
  { color: "9", score: 50_000 },
  { color: "3", score: 75_000 },
  { color: "d", score: 100_000 },
  { color: "5", score: 200_000 },
  { color: "4", score: 500_000 },
  { color: "6", score: 1_000_000 },
];

export class Paintball {
  @Field()
  public coins: number;

  @Field({ leaderboard: { enabled: false } })
  public forcefieldTime: number;

  @Field()
  public kills: number;

  @Field()
  public deaths: number;

  @Field()
  public killstreaks: number;

  @Field({ leaderboard: { enabled: false } })
  public shotsFired: number;

  @Field({ store: { default: "none" } })
  public hat: string;

  @Field()
  public wins: number;

  @Field()
  public kdr: number;

  @Field({ leaderboard: { enabled: false } })
  public shotAccuracy: number;

  @Field()
  public perks: PaintballPerks;

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
    this.forcefieldTime = (data.forcefieldTime ?? 0) * 1000;
    this.kills = data.kills;
    this.deaths = data.deaths;
    this.killstreaks = data.killstreaks;
    this.shotsFired = data.shots_fired;
    this.wins = data.wins;
    this.hat = data.hat;
    this.kdr = ratio(this.kills, this.deaths);
    this.shotAccuracy = ratio(this.kills, this.shotsFired, 100);
    this.perks = new PaintballPerks(data);
    this.tokens = legacy.paintball_tokens;

    const prefixScore = this.kills;
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
      Math.abs(this.kills - getPrefixRequirement(prefixes, this.kills)),
      getPrefixRequirement(prefixes, this.kills, 1) -
        getPrefixRequirement(prefixes, this.kills)
    );
  }
}

export * from "./perks";
