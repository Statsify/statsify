/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { GameModes, IGameModes } from "../../../game";

export const PIT_MODES = new GameModes([{ hypixel: "PIT", formatted: "Pit" }]);
export type PitModes = IGameModes<typeof PIT_MODES>;
