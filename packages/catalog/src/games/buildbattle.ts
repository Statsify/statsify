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
 * The colours and labels of the bot's Build Battle card (`buildbattle.profile.tsx`): its sidebar, and each sub-game's
 * wins. The sub-games store only their wins (and Speed Builders its perfect builds), once for the game.
 */
export const BUILD_BATTLE: Game<BuildBattleModes> = {
  key: "buildbattle",
  id: "BUILD_BATTLE",
  modes: BUILD_BATTLE_MODES,
  game: {
    "coins": { colour: "§6" },
    // Score sets the title.
    "score": { colour: "§a" },
    "votes": { colour: "§c" },
    "superVotes": { colour: "§b" },
    "correctGuesses": { colour: "§9" },
    "speedBuilders.perfectBuilds": { colour: "§e" },
    "overall.wins": { colour: "§a" },
    "pro.wins": { colour: "§a" },
    "speedBuilders.wins": { colour: "§a" },
    "solo.wins": { colour: "§a" },
    "teams.wins": { colour: "§a" },
    "guessTheBuild.wins": { colour: "§a" },
  },
  shapes: [],
};
