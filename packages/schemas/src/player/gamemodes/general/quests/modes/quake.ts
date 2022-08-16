/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { FormattedGame } from "../../../../../game";
import { createGameModeQuests } from "../util";

export const QuakeQuests = createGameModeQuests({
  game: FormattedGame.QUAKE,
  fieldPrefix: "quake",
  daily: [
    { field: "daily_play", propertyKey: "player" },
    { field: "daily_kill", propertyKey: "sniper" },
    { field: "daily_win", propertyKey: "winner" },
  ],
  weekly: [{ field: "weekly_play", propertyKey: "bazinga", name: "Bazinga!" }],
});
