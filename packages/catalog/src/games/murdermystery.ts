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
  wins: { colour: "§a" },
  gamesPlayed: { colour: "§b" },
  kills: { colour: "§a" },
  deaths: { colour: "§c" },
  kdr: { colour: "§6" },
  bowKills: { colour: "§6" },
  goldPickedUp: { colour: "§6" },
};

/** Overall's, Classic's and Double Up's roles and kills. */
const STANDARD: Record<string, StatEntry> = {
  ...BASE,
  murdererWins: { colour: "§c" },
  detectiveWins: { colour: "§b" },
  killsAsMurderer: { colour: "§4" },
  thrownKnifeKills: { colour: "§a" },
  trapKills: { colour: "§c" },
  heroKills: { colour: "§e" },
  suicides: { colour: "§4" },
};

/** The colours and labels of the bot's Murder Mystery card (`murdermystery.profile.tsx`): a table per mode. */
export const MURDER_MYSTERY: Game<MurderMysteryModes> = {
  key: "murdermystery",
  id: "MURDER_MYSTERY",
  modes: MURDER_MYSTERY_MODES,
  game: {
    tokens: { colour: "§2" },
    prefix: { colour: "§7" },
    // The level panel's name for the knife, which has no leaderboard.
    "knife.name": { colour: "§a" },
  },
  shapes: [
    { modes: ["overall"], stats: { ...STANDARD, heroWins: { colour: "§e" } } },
    {
      modes: ["classic", "doubleUp"],
      stats: {
        ...STANDARD,
        fastestMurdererWin: { colour: "§c", unset: "N/A" },
        fastestDetectiveWin: { colour: "§b", unset: "N/A" },
      },
    },
    {
      modes: ["assassins"],
      stats: {
        ...BASE,
        // This card draws Wins in §e.
        wins: { colour: "§e" },
        thrownKnifeKills: { colour: "§a" },
        trapKills: { colour: "§c" },
        knifeKills: { colour: "§a" },
      },
    },
    {
      modes: ["infection"],
      stats: {
        ...BASE,
        lastAliveGames: { colour: "§b" },
        killsAsInfected: { colour: "§2" },
        killsAsSurvivor: { colour: "§6" },
        alphaWins: { colour: "§c" },
        killsAsAlpha: { colour: "§4" },
      },
    },
  ],
};
