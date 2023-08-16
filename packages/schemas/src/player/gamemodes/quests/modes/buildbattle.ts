/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { FormattedGame } from "#game";
import { createGameModeQuests } from "../util.js";

export const BuildBattleQuests = createGameModeQuests({
  game: FormattedGame.BUILD_BATTLE,
  fieldPrefix: "build_battle",
  daily: [
    { field: "player", propertyKey: "player" },
    { field: "winner", propertyKey: "winner" },
  ],
  weekly: [{ field: "weekly", propertyKey: "masterArchitect" }],
});
