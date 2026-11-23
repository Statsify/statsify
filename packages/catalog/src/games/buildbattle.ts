/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BUILD_BATTLE_MODES, type BuildBattleModes } from "@statsify/schemas";
import type { Game } from "../catalog.js";

/**
 * The colors and labels of the bot's Build Battle card (`buildbattle.profile.tsx`): its sidebar, and each sub-game's
 * wins. The sub-games store only their wins (and Speed Builders its perfect builds), once for the game.
 */
export const BUILD_BATTLE: Game<BuildBattleModes> = {
  key: "buildbattle",
  id: "BUILD_BATTLE",
  modes: BUILD_BATTLE_MODES,
  game: {
    "coins": { color: "§6" },
    // Score sets the title.
    "score": { color: "§a" },
    "votes": { color: "§c" },
    "superVotes": { color: "§b" },
    "correctGuesses": { color: "§9" },
    "speedBuilders.perfectBuilds": { color: "§e" },
    "overall.wins": { color: "§a" },
    "pro.wins": { color: "§a" },
    "speedBuilders.wins": { color: "§a" },
    "solo.wins": { color: "§a" },
    "teams.wins": { color: "§a" },
    "guessTheBuild.wins": { color: "§a" },
  },
  shapes: [],
};
