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

/** The colours and labels of the bot's Paintball card (`paintball.profile.tsx`): its sidebar, its table and the Perks. */
export const PAINTBALL: Game<PaintballModes> = {
  key: "paintball",
  id: "PAINTBALL",
  modes: PAINTBALL_MODES,
  game: {
    "coins": { colour: "§6" },
    "tokens": { colour: "§e" },
    // Milliseconds, which the card prints as a time; the stat has no leaderboard to format it.
    "forcefieldTime": { colour: "§9", format: (ms) => formatTime(Number(ms)) },
    "killstreaks": { colour: "§b" },
    "hat": selection("§7"),
    "wins": { colour: "§a" },
    "shotsFired": { colour: "§c" },
    "shotAccuracy": { colour: "§6", suffix: "%" },
    "kills": { colour: "§a" },
    "deaths": { colour: "§c" },
    "kdr": { colour: "§6" },
    "perks.adrenaline": { colour: "§4" },
    "perks.endurance": { colour: "§d" },
    "perks.fortune": { colour: "§2" },
    "perks.godfather": { colour: "§e" },
    "perks.headstart": { colour: "§c" },
    "perks.superluck": { colour: "§6" },
    "perks.transfusion": { colour: "§b" },
  },
  shapes: [],
};
