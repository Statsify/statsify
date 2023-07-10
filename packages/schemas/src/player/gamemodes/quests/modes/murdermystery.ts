/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { FormattedGame } from "#game";
import { createGameModeQuests } from "../util.js";

export const MurderMysteryQuests = createGameModeQuests({
  game: FormattedGame.MURDER_MYSTERY,
  fieldPrefix: "mm",
  daily: [
    { field: "daily_win", propertyKey: "winner" },
    { field: "daily_power_play", propertyKey: "powerPlay" },
    { field: "daily_target_kill", propertyKey: "hitman" },
    { field: "daily_infector", propertyKey: "infector" },
  ],
  weekly: [
    { field: "weekly_murderer_kills", propertyKey: "professional" },
    { field: "weekly_wins", propertyKey: "bigWinner" },
  ],
});
