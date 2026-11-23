/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type Game, selection } from "../catalog.js";
import { PAINTBALL_MODES, type PaintballModes } from "@statsify/schemas";
import { formatTime } from "@statsify/util";

/** The colors and labels of the bot's Paintball card (`paintball.profile.tsx`): its sidebar, its table and the Perks. */
export const PAINTBALL: Game<PaintballModes> = {
  key: "paintball",
  id: "PAINTBALL",
  modes: PAINTBALL_MODES,
  game: {
    "coins": { color: "§6" },
    "tokens": { color: "§e" },
    // Milliseconds, which the card prints as a time; the stat has no leaderboard to format it.
    "forcefieldTime": { color: "§9", format: (ms) => formatTime(Number(ms)) },
    "killstreaks": { color: "§b" },
    "hat": selection("§7"),
    "wins": { color: "§a" },
    "shotsFired": { color: "§c" },
    "shotAccuracy": { color: "§6", suffix: "%" },
    "kills": { color: "§a" },
    "deaths": { color: "§c" },
    "kdr": { color: "§6" },
    "perks.adrenaline": { color: "§4" },
    "perks.endurance": { color: "§d" },
    "perks.fortune": { color: "§2" },
    "perks.godfather": { color: "§e" },
    "perks.headstart": { color: "§c" },
    "perks.superluck": { color: "§6" },
    "perks.transfusion": { color: "§b" },
  },
  shapes: [],
};
