/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { COPS_AND_CRIMS_MODES, type CopsAndCrimsModes } from "@statsify/schemas";
import type { Game, StatEntry } from "../catalog.js";
import { formatTime } from "@statsify/util";

/** What every mode stores, in the card's colors. */
const BASE: Record<string, StatEntry> = {
  wins: { color: "§a" },
  kills: { color: "§a" },
  deaths: { color: "§c" },
  kdr: { color: "§6" },
  assists: { color: "§e" },
};

/** The colors and labels of the bot's Cops and Crims card (`copsandcrims.profile.tsx`): its sidebar and three tables. */
export const COPS_AND_CRIMS: Game<CopsAndCrimsModes> = {
  key: "copsandcrims",
  id: "COPS_AND_CRIMS",
  modes: COPS_AND_CRIMS_MODES,
  game: {
    coins: { color: "§6" },
    score: { color: "§a" },
  },
  shapes: [
    // The four counts only Overall stores, which the card's sidebar repeats on every page.
    {
      modes: ["overall"],
      stats: {
        ...BASE,
        knifeKills: { color: "§7" },
        headshotKills: { color: "§4" },
        grenadeKills: { color: "§2" },
        shotsFired: { color: "§6" },
      },
    },
    {
      modes: ["defusal"],
      stats: { ...BASE, roundWins: { color: "§b" }, bombsDefused: { color: "§a" }, bombsPlanted: { color: "§c" } },
    },
    { modes: ["deathmatch"], stats: BASE },
    {
      modes: ["gunGame"],
      stats: {
        ...BASE,
        // Milliseconds, which the card prints as a time; the field has no leaderboard to format it.
        fastestWin: { color: "§b", label: "stats.bestTime", format: (ms) => formatTime(Number(ms)), unset: "N/A" },
      },
    },
  ],
};
