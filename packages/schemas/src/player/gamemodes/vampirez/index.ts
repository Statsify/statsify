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
import { deepAdd } from "@statsify/math";

export const VAMPIREZ_MODES = new GameModes([{ api: "overall" }]);

export type VampireZModes = IGameModes<typeof VAMPIREZ_MODES>;

export class VampireZ {
  @Field()
  public coins: number;

  @Field()
  public overall: VampireZLife;

  @Field()
  public human: VampireZLife;

  @Field()
  public vampire: VampireZLife;

  public constructor(data: APIData) {
    this.coins = data.coins;

    this.human = new VampireZLife(data, "human");
    this.vampire = new VampireZLife(data, "vampire");

    this.overall = deepAdd(this.human, this.vampire);
    VampireZLife.applyRatios(this.overall);
  }
}

export * from "./life";
