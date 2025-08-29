/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Field } from "#metadata";
import { type GameCode, type GameId, GameIdMapping } from "./constants.js";

export class Game {
  @Field({
    docs: {
      enumName: "GameCode",
    },
    type: () => String,
  })
  public code: GameCode;

  @Field({
    docs: {
      enumName: "GameId",
    },
    type: () => String,
  })
  public id: GameId;

  public constructor(code: GameCode) {
    this.code = code;
    this.id = GameIdMapping[code];
  }

  public toString() {
    return this.code;
  }
}
