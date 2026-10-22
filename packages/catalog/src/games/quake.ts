/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { QUAKE_MODES, type QuakeModes } from "@statsify/schemas";
import type { Game } from "../catalog.js";

/** The colours and labels of the bot's Quake card (`quake.profile.tsx`): its sidebar and the table every mode shares. */
export const QUAKE: Game<QuakeModes> = {
  key: "quake",
  id: "QUAKE",
  modes: QUAKE_MODES,
  game: {
    coins: { colour: "§6" },
    tokens: { colour: "§e" },
    godlikes: { colour: "§3" },
    // Seconds, stored as 1.3, which the card prints as 1.3s; the stat has no leaderboard.
    trigger: { colour: "§b", suffix: "s" },
    highestKillstreak: { colour: "§4" },
  },
  shapes: [
    {
      modes: ["overall", "solo", "teams"],
      stats: {
        wins: { colour: "§a" },
        kwr: { colour: "§c" },
        killstreaks: { colour: "§6" },
        shotsFired: { colour: "§a" },
        headshots: { colour: "§c" },
        quakeShotAccuracy: { colour: "§6", label: "stats.shotAccuracy", suffix: "%" },
        kills: { colour: "§a" },
        deaths: { colour: "§c" },
        kdr: { colour: "§6" },
        // The kills since Hypixel's 2017 update, which Shot Accuracy counts; the card leaves them out.
        postUpdateKills: { colour: "§a" },
      },
    },
  ],
};
