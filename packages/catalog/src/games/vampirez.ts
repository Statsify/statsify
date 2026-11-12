/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { Game, StatEntry } from "../catalog.js";
import { VAMPIREZ_MODES, type VampireZModes } from "@statsify/schemas";

/** A life's table, the same for both, but its kills are the other side's, so their label follows the life. */
const life = (kills: string): Record<string, StatEntry> => ({
  wins: { color: "§e" },
  kills: { color: "§a", label: kills },
  deaths: { color: "§c" },
  kdr: { color: "§6" },
});

/** The colors and labels of the bot's VampireZ card (`vampirez.profile.tsx`): its sidebar and table. */
export const VAMPIREZ: Game<VampireZModes> = {
  key: "vampirez",
  id: "VAMPIREZ",
  modes: VAMPIREZ_MODES,
  game: {
    coins: { color: "§6" },
    tokens: { color: "§e" },
    overallWins: { color: "§a" },
    zombieKills: { color: "§2" },
    mostVampireKills: { color: "§c" },
  },
  shapes: [
    { modes: ["human"], stats: life("stats.vampires-killed") },
    { modes: ["vampire"], stats: life("stats.humans-killed") },
  ],
};
