/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { FormattedGame } from "../../../../../game";
import { createGameModeQuests } from "../util";

export const BlitzSGQuests = createGameModeQuests({
  game: FormattedGame.BLITZSG,
  fieldPrefix: "blitz",
  daily: [
    { field: "game_of_the_day", propertyKey: "gameOfTheDay" },
    { field: "win", propertyKey: "winNormal" },
    { field: "loot_chest_daily", propertyKey: "chestLooter" },
    { field: "kills", propertyKey: "kills" },
  ],
  weekly: [
    { field: "weekly_master", propertyKey: "master" },
    { field: "loot_chest_weekly", propertyKey: "expert" },
  ],
});
