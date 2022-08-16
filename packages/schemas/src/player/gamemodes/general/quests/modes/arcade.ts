/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { FormattedGame } from "../../../../../game";
import { createGameModeQuests } from "../util";

export const ArcadeQuests = createGameModeQuests({
  game: FormattedGame.ARCADE,
  fieldPrefix: "arcade",
  daily: [
    { field: "gamer", propertyKey: "gamer" },
    { field: "winner", propertyKey: "winner" },
  ],
  weekly: [{ field: "specialist", propertyKey: "specialist" }],
});
