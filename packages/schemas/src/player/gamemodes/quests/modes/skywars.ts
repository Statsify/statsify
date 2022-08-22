/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { FormattedGame } from "../../../../game";
import { createGameModeQuests } from "../util";

export const SkyWarsQuests = createGameModeQuests({
  game: FormattedGame.SKYWARS,
  fieldPrefix: "skywars",
  daily: [
    { field: "solo_win", propertyKey: "soloWin" },
    { field: "solo_kills", propertyKey: "soloKills" },
    { field: "team_win", propertyKey: "doublesWin" },
    { field: "team_kills", propertyKey: "doublesKills" },
    { field: "arcade_win", propertyKey: "labWin" },
    { field: "corrupt_win", propertyKey: "corruptedWin" },
    { field: "daily_tokens", propertyKey: "tokens", name: "Tokens!" },
  ],
  weekly: [
    { field: "weekly_kills", propertyKey: "weeklyKills" },
    { field: "weekly_arcade_win_all", propertyKey: "scientist" },
    { field: "weekly_free_loot_chest", propertyKey: "freeLootChest" },
  ],
});
