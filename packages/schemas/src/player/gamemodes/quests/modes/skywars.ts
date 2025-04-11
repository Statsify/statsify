/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { FormattedGame } from "#game";
import { createGameModeQuests } from "../util.js";

export const SkyWarsQuests = createGameModeQuests({
  game: FormattedGame.SKYWARS,
  fieldPrefix: "skywars",
  daily: [
    { field: "daily_mini_win", propertyKey: "miniSkyWarsWins" },
    { field: "solo_win", propertyKey: "skyWarsSoloWins" },
    { field: "team_win", propertyKey: "skyWarsDoublesWins" },
    { field: "arcade_win", propertyKey: "luckyBlockSkyWarsWins" },
    { field: "daily_mega_kills", propertyKey: "megaSkyWarsKills" },
  ],
  weekly: [
    { field: "weekly_wins", propertyKey: "skyWarsWins" },
    { field: "weekly_kills", propertyKey: "skyWarsKills" },
  ],
  monthly: [
    { field: "monthly_earn_opals", propertyKey: "earnAnOpal" },
  ],
});
