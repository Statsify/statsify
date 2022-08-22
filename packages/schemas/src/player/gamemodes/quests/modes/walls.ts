/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { FormattedGame } from "../../../../game";
import { createGameModeQuests } from "../util";

export const WallsQuests = createGameModeQuests({
  game: FormattedGame.WALLS,
  fieldPrefix: "walls",
  daily: [
    { field: "daily_play", propertyKey: "waller" },
    { field: "daily_kill", propertyKey: "kills" },
    { field: "daily_win", propertyKey: "win" },
  ],
  weekly: [{ field: "weekly", propertyKey: "wallsWeekly" }],
});
