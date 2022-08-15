/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { FormattedGame } from "../../../../../game";
import { createGameModeQuests } from "../util";

export const DuelsQuests = createGameModeQuests({
  game: FormattedGame.DUELS,
  fieldPrefix: "duels",
  daily: [{ field: "player" }, { field: "kills" }, { field: "winner" }],
  weekly: [
    { field: "weekly_kills", propertyKey: "weeklyKills" },
    { field: "weekly_wins", propertyKey: "weeklyWins" },
  ],
});
