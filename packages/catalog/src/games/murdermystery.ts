/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { Game, StatEntry } from "../catalog.js";
import { MURDER_MYSTERY_MODES, type MurderMysteryModes } from "@statsify/schemas";

/** What every mode stores: the card's kills row and its per-mode sidebar rows. */
const BASE: Record<string, StatEntry> = {
  wins: { color: "§a" },
  gamesPlayed: { color: "§b" },
  kills: { color: "§a" },
  deaths: { color: "§c" },
  kdr: { color: "§6" },
  bowKills: { color: "§6" },
  goldPickedUp: { color: "§6" },
};

/** Overall's, Classic's and Double Up's roles and kills. */
const STANDARD: Record<string, StatEntry> = {
  ...BASE,
  murdererWins: { color: "§c" },
  detectiveWins: { color: "§b" },
  killsAsMurderer: { color: "§4" },
  thrownKnifeKills: { color: "§a" },
  trapKills: { color: "§c" },
  heroKills: { color: "§e" },
  suicides: { color: "§4" },
};

/** The colors and labels of the bot's Murder Mystery card (`murdermystery.profile.tsx`): a table per mode. */
export const MURDER_MYSTERY: Game<MurderMysteryModes> = {
  key: "murdermystery",
  id: "MURDER_MYSTERY",
  modes: MURDER_MYSTERY_MODES,
  game: {
    tokens: { color: "§2" },
    prefix: { color: "§7" },
    // The level panel's name for the knife, which has no leaderboard.
    "knife.name": { color: "§a" },
  },
  shapes: [
    { modes: ["overall"], stats: { ...STANDARD, heroWins: { color: "§e" } } },
    {
      modes: ["classic", "doubleUp"],
      stats: {
        ...STANDARD,
        fastestMurdererWin: { color: "§c", unset: "N/A" },
        fastestDetectiveWin: { color: "§b", unset: "N/A" },
      },
    },
    {
      modes: ["assassins"],
      stats: {
        ...BASE,
        // This card draws Wins in §e.
        wins: { color: "§e" },
        thrownKnifeKills: { color: "§a" },
        trapKills: { color: "§c" },
        knifeKills: { color: "§a" },
      },
    },
    {
      modes: ["infection"],
      stats: {
        ...BASE,
        lastAliveGames: { color: "§b" },
        killsAsInfected: { color: "§2" },
        killsAsSurvivor: { color: "§6" },
        alphaWins: { color: "§c" },
        killsAsAlpha: { color: "§4" },
      },
    },
  ],
};
