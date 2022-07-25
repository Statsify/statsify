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
import { VampireZLife } from "./life";
import { add } from "@statsify/math";

export const VAMPIREZ_MODES = new GameModes([{ api: "human" }, { api: "vampire" }]);
export type VampireZModes = IGameModes<typeof VAMPIREZ_MODES>;

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

  @Field({
    leaderboard: {
      extraDisplay: "stats.vampirez.vampire.naturalPrefix",
      fieldName: "Humans Killed",
      name: "Humans Killed",
    },
  })
  public humanKills: number;

  @Field({
    leaderboard: { extraDisplay: "stats.vampirez.human.naturalPrefix" },
  })
  public human: VampireZLife;

  @Field({
    leaderboard: {
      extraDisplay: "stats.vampirez.human.naturalPrefix",
      fieldName: "Vampires Killed",
      name: "Vampires Killed",
    },
  })
  public vampireKills: number;

  @Field({
    leaderboard: {
      extraDisplay: "stats.vampirez.vampire.naturalPrefix",
    },
  })
  public vampire: VampireZLife;

  public constructor(data: APIData, legacy: APIData) {
    this.coins = data.coins;
    this.tokens = legacy.vampirez_tokens;

    this.mostVampireKills = data.most_vampire_kills_new;
    this.zombieKills = data.zombie_kills;

    this.human = new VampireZLife(data, "human");
    this.vampire = new VampireZLife(data, "vampire");

    this.vampireKills = data.vampire_kills;
    this.humanKills = data.human_kills;

    this.vampire.kills = this.humanKills;
    this.human.kills = this.vampireKills;

    VampireZLife.applyRatios(this.vampire);
    VampireZLife.applyRatios(this.human);

    this.overallWins = add(this.human.wins, this.vampire.wins);
  }
}

export * from "./life";
