/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { FormattedGame } from "#game";
import { createGameModeQuests } from "../util.js";

export const CopsAndCrimsQuests = createGameModeQuests({
  game: FormattedGame.COPS_AND_CRIMS,
  fieldPrefix: "cvc",
  daily: [
    { field: "win_daily_normal", propertyKey: "winAGame", name: "Win a Game! (Defusal)" },
    {
      field: "kill_daily_normal",
      propertyKey: "kill15Players",
      name: "Kill 15 Players! (Defusal)",
      fieldName: "Kill 15 Players",
    },
    {
      field: "kill",
      propertyKey: "get300Points",
      name: "Get 300 Points! (Deathmatch)",
      fieldName: "Get 300 Points",
    },
    { field: "win_daily_deathmatch", propertyKey: "winAGameDeathmatch", name: "Win a Game! (Deathmatch)", fieldName: "Win a Game" },
    {
      field: "play_daily_gungame",
      propertyKey: "play3Games",
      name: "Play 3 Games! (Gun Game)",
      fieldName: "Play 3 Games",
    },
  ],
  weekly: [
    {
      field: "kill_weekly",
      propertyKey: "killsAndPoints",
      name: "100 Kills and 1,500 Points",
    },
  ],
});
