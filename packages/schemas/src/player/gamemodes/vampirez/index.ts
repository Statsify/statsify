/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData } from "@statsify/util";
import { Field } from "../../../metadata";
import { GameModes } from "../../../game";
import {
  GameType,
  GetMetadataModes,
  Mode,
  StatsifyApiModes,
} from "../../../metadata/GameType";
import { VampireZHuman, VampireZVampire } from "./life";
import { add } from "@statsify/math";

@GameType()
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

  @Mode()
  @Field({
    leaderboard: {
      extraDisplay: "stats.vampirez.human.naturalPrefix",
      fieldName: "Human -",
    },
  })
  public human: VampireZHuman;

  @Mode()
  @Field({
    leaderboard: {
      extraDisplay: "stats.vampirez.vampire.naturalPrefix",
      fieldName: "Vampire -",
    },
  })
  public vampire: VampireZVampire;

  public constructor(data: APIData, legacy: APIData) {
    this.coins = data.coins;
    this.tokens = legacy.vampirez_tokens;

    this.mostVampireKills = data.most_vampire_kills_new;
    this.zombieKills = data.zombie_kills;

    this.human = new VampireZHuman(data, "human");
    this.vampire = new VampireZVampire(data, "vampire");

    this.overallWins = add(this.human.wins, this.vampire.wins);
  }
}

export type VampireZModes = StatsifyApiModes<VampireZ>;
export const VAMPIREZ_MODES = new GameModes<VampireZModes>(GetMetadataModes(VampireZ));

export * from "./life";
