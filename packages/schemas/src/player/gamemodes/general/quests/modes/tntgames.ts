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
  daily: [
    { field: "daily_win", propertyKey: "winner" },
    {
      field: "tntrun_daily",
      propertyKey: "tntRunDaily",
      fieldName: "TNT Run",
      overall: { fieldName: "TNT Run (Daily)" },
    },
    {
      field: "pvprun_daily",
      propertyKey: "pvpRunDaily",
      fieldName: "PVP Run",
      overall: { fieldName: "PVP Run (Daily)" },
    },
    {
      field: "bowspleef_daily",
      propertyKey: "bowSpleefDaily",
      fieldName: "Bow Spleef",
      overall: { fieldName: "Bow Spleef (Daily)" },
    },
    {
      field: "tnttag_daily",
      propertyKey: "tntTagDaily",
      fieldName: "TNT Tag",
      overall: { fieldName: "TNT Tag (Daily)" },
    },
    {
      field: "wizards_daily",
      propertyKey: "tntWizardsDaily",
      fieldName: "TNT Wizards",
      overall: { fieldName: "TNT Wizards (Daily)" },
    },
  ],
  weekly: [
    { field: "weekly_play", propertyKey: "explosiveFanatic" },
    {
      field: "tntrun_weekly",
      propertyKey: "tntRunWeekly",
      fieldName: "TNT Run",
      overall: { fieldName: "TNT Run (Weekly)" },
    },
    {
      field: "pvprun_weekly",
      propertyKey: "pvpRunWeekly",
      fieldName: "PVP Run",
      overall: { fieldName: "PVP Run (Weekly)" },
    },
    {
      field: "bowspleef_weekly",
      propertyKey: "bowSpleefWeekly",
      fieldName: "Bow Spleef",
      overall: { fieldName: "Bow Spleef (Weekly)" },
    },
    {
      field: "tnttag_weekly",
      propertyKey: "tntTagWeekly",
      fieldName: "TNT Tag",
      overall: { fieldName: "TNT Tag (Weekly)" },
    },
    {
      field: "wizards_weekly",
      propertyKey: "tntWizardsWeekly",
      fieldName: "TNT Wizards",
      overall: { fieldName: "TNT Wizards (Weekly)" },
    },
  ],
});
