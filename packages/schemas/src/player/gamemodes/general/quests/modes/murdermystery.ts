/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { FormattedGame } from "../../../../../game";
import { createGameModeQuests } from "../util";

export const MurderMysteryQuests = createGameModeQuests({
  game: FormattedGame.MURDER_MYSTERY,
  fieldPrefix: "mm",
  daily: [
    { field: "win", propertyKey: "daily_winner" },
    { field: "power_play", propertyKey: "daily_powerPlay" },
    { field: "target_kill", propertyKey: "daily_hitman" },
    { field: "infector", propertyKey: "daily_infector" },
  ],
  weekly: [
    { field: "weekly_murderer_kills", propertyKey: "professional" },
    { field: "weekly_wins", propertyKey: "bigWinner" },
  ],
});
