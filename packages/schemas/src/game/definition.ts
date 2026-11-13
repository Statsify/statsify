/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type GameCode, type GameId, GameIdMapping } from "./constants.js";
import { s } from "#definition/s";

export const GameSchema = s.object({
  code: s.string<GameCode>(),
  id() {
    return s.string<GameId>().computed((code) => GameIdMapping[code], [this.code]);
  },
});

export type Game = s.infer<typeof GameSchema>;
