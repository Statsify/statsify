/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { FormattedGame } from "../../../../../game";
import { createGameModeQuests } from "../util";

export const PaintballQuests = createGameModeQuests({
  game: FormattedGame.PAINTBALL,
  daily: [
    { field: "paintballer", propertyKey: "paintballer" },
    { field: "paintball_killer", propertyKey: "killer" },
  ],
  weekly: [{ field: "paintball_expert", propertyKey: "expert" }],
});
