/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData } from "@statsify/util";
import { Field } from "../../../metadata";
import { GameModes, IGameModes } from "../../../game";
import { Progression } from "../../../progression";
import { VampireZLife } from "./life";
import { add } from "@statsify/math";

export const VAMPIREZ_MODES = new GameModes([{ api: "human" }, { api: "vampire" }]);
export type VampireZModes = IGameModes<typeof VAMPIREZ_MODES>;

export const humanPrefixes = [
  { color: "8", score: 0 },
  { color: "7", score: 20 },
  { color: "f", score: 50 },
  { color: "6", score: 100 },
  { color: "e", score: 150 },
  { color: "2", score: 200 },
  { color: "a", score: 250 },
  { color: "5", score: 300 },
  { color: "d", score: 500 },
  { color: "1", score: 750 },
  { color: "9§l", score: 1000 },
  { color: "b§l", score: 1500 },
  { color: "3§l", score: 2000 },
  { color: "b§l", score: 2500 },
  { color: "c§l", score: 3000 },
  { color: "4§l", score: 5000 },
  { color: "0§l", score: 7500 },
  { color: "rainbow", score: 15_000 },
];

export const vampirePrefixes = [
  { color: "8", score: 0 },
  { color: "f", score: 50 },
  { color: "e", score: 100 },
  { color: "a", score: 250 },
  { color: "d", score: 500 },
  { color: "b", score: 750 },
  { color: "c", score: 1000 },
  { color: "6", score: 1500 },
  { color: "3", score: 2000 },
  { color: "a", score: 2500 },
  { color: "2", score: 3000 },
  { color: "f", score: 5000 },
  { color: "9", score: 7500 },
  { color: "1§l", score: 10_000 },
  { color: "4", score: 20_000 },
  { color: "4§l", score: 30_000 },
  { color: "d§l", score: 40_000 },
  { color: "0§l", score: 50_000 },
  { color: "rainbow", score: 100_000 },
];

export class VampireZ {
  @Field()
  public coins: number;

  @Field()
  public tokens: number;

  @Field()
  public overallWins: number;

  @Field()
  public mostVampireKills: number;

  @Field()
  public zombieKills: number;

  @Field()
  public human: VampireZLife;

  @Field()
  public vampire: VampireZLife;

  @Field()
  public progression: Progression;

  @Field()
  public currentPrefix: string;

  @Field()
  public nextPrefix: string;

  public constructor(data: APIData, legacy: APIData) {
    this.coins = data.coins;
    this.tokens = legacy.vampirez_tokens;

    this.mostVampireKills = data.most_vampire_kills_new;
    this.zombieKills = data.zombie_kills;

    this.human = new VampireZLife(data, "human");
    this.vampire = new VampireZLife(data, "vampire");

    const vampireKills = this.vampire.kills;
    this.vampire.kills = this.human.kills;
    this.human.kills = vampireKills;

    VampireZLife.applyRatios(this.vampire);
    VampireZLife.applyRatios(this.human);

    this.overallWins = add(this.human.wins, this.vampire.wins);
  }
}

export * from "./life";
