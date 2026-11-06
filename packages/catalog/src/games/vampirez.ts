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
  wins: { colour: "§e" },
  kills: { colour: "§a", label: kills },
  deaths: { colour: "§c" },
  kdr: { colour: "§6" },
});

/** The colours and labels of the bot's VampireZ card (`vampirez.profile.tsx`): its sidebar and table. */
export const VAMPIREZ: Game<VampireZModes> = {
  key: "vampirez",
  id: "VAMPIREZ",
  modes: VAMPIREZ_MODES,
  game: {
    coins: { colour: "§6" },
    tokens: { colour: "§e" },
    overallWins: { colour: "§a" },
    zombieKills: { colour: "§2" },
    mostVampireKills: { colour: "§c" },
  },
  shapes: [
    { modes: ["human"], stats: life("stats.vampires-killed") },
    { modes: ["vampire"], stats: life("stats.humans-killed") },
  ],
};
