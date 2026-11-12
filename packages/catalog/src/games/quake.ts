/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { QUAKE_MODES, type QuakeModes } from "@statsify/schemas";
import type { Game } from "../catalog.js";

/** The colors and labels of the bot's Quake card (`quake.profile.tsx`): its sidebar and the table every mode shares. */
export const QUAKE: Game<QuakeModes> = {
  key: "quake",
  id: "QUAKE",
  modes: QUAKE_MODES,
  game: {
    coins: { color: "§6" },
    tokens: { color: "§e" },
    godlikes: { color: "§3" },
    // Seconds, stored as 1.3, which the card prints as 1.3s; the stat has no leaderboard.
    trigger: { color: "§b", suffix: "s", trim: true },
    highestKillstreak: { color: "§4" },
  },
  shapes: [
    {
      modes: ["overall", "solo", "teams"],
      stats: {
        wins: { color: "§a" },
        kwr: { color: "§c" },
        killstreaks: { color: "§6" },
        shotsFired: { color: "§a" },
        headshots: { color: "§c" },
        quakeShotAccuracy: { color: "§6", label: "stats.shotAccuracy", suffix: "%" },
        kills: { color: "§a" },
        deaths: { color: "§c" },
        kdr: { color: "§6" },
        // The kills since Hypixel's 2017 update, which Shot Accuracy counts; the card leaves them out.
        postUpdateKills: { color: "§a" },
      },
    },
  ],
};
