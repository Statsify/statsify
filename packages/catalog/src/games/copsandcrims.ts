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

/** What every mode stores, in the card's colours. */
const BASE: Record<string, StatEntry> = {
  wins: { colour: "§a" },
  kills: { colour: "§a" },
  deaths: { colour: "§c" },
  kdr: { colour: "§6" },
  assists: { colour: "§e" },
};

/** The colours and labels of the bot's Cops and Crims card (`copsandcrims.profile.tsx`): its sidebar and three tables. */
export const COPS_AND_CRIMS: Game<CopsAndCrimsModes> = {
  key: "copsandcrims",
  id: "COPS_AND_CRIMS",
  modes: COPS_AND_CRIMS_MODES,
  game: {
    coins: { colour: "§6" },
    score: { colour: "§a" },
  },
  shapes: [
    // The four counts only Overall stores, which the card's sidebar repeats on every page.
    {
      modes: ["overall"],
      stats: {
        ...BASE,
        knifeKills: { colour: "§7" },
        headshotKills: { colour: "§4" },
        grenadeKills: { colour: "§2" },
        shotsFired: { colour: "§6" },
      },
    },
    {
      modes: ["defusal"],
      stats: { ...BASE, roundWins: { colour: "§b" }, bombsDefused: { colour: "§a" }, bombsPlanted: { colour: "§c" } },
    },
    { modes: ["deathmatch"], stats: BASE },
    {
      modes: ["gunGame"],
      stats: {
        ...BASE,
        // Milliseconds, which the card prints as a time; the field has no leaderboard to format it.
        fastestWin: { colour: "§b", label: "stats.bestTime", format: (ms) => formatTime(Number(ms)), unset: "N/A" },
      },
    },
  ],
};
