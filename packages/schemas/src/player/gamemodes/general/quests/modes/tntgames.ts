/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { FormattedGame } from "../../../../../game";
import { createGameModeQuests } from "../util";

export const TNTGamesQuests = createGameModeQuests({
  game: FormattedGame.TNT_GAMES,
  fieldPrefix: "tnt",
  //TODO: daily and weekly collide
  daily: [
    { field: "daily_win", propertyKey: "winner" },
    { field: "tntrun_daily", propertyKey: "tntRunDaily" },
    { field: "pvprun_daily", propertyKey: "pvpRunDaily" },
    { field: "bowspleef_daily", propertyKey: "bowSpleefDaily" },
    { field: "tnttag_daily", propertyKey: "tntTagDaily" },
    { field: "wizards_daily", propertyKey: "tntWizardsDaily" },
  ],
  weekly: [
    { field: "weekly_play", propertyKey: "explosiveFanatic" },
    { field: "tntrun_weekly", propertyKey: "tntRunWeekly" },
    { field: "pvprun_weekly", propertyKey: "pvpRunWeekly" },
    { field: "bowspleef_weekly", propertyKey: "bowSpleefWeekly" },
    { field: "tnttag_weekly", propertyKey: "tntTagWeekly" },
    { field: "wizards_weekly", propertyKey: "tntWizardsWeekly" },
  ],
});
