/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BEDWARS_MODES, BedWarsModeChallenges, type BedWarsModes, scanMetadata } from "@statsify/schemas";
import { type Game, type StatEntry, doneColor } from "../catalog.js";
import { prettify } from "@statsify/util";

/**
 * The challenges card (`bedwars-challenges.profile.tsx`): the two totals in its sidebar, then every challenge under its
 * leaderboard name, green once completed and red before.
 */
const CHALLENGES: Record<string, StatEntry> = {
  totalChallenges: { color: "§6", name: "Total Completions" },
  uniqueChallenges: { color: "§e", name: "Unique Completions" },
  ...Object.fromEntries(
    scanMetadata(BedWarsModeChallenges)
      .filter(([key]) => key !== "totalChallenges" && key !== "uniqueChallenges")
      .map(([key, { leaderboard }]): [string, StatEntry] => [
        key,
        { color: doneColor, name: leaderboard.fieldName ?? prettify(key) },
      ])
  ),
};

/** The colors and labels of the bot's BedWars card (`bedwars.profile.tsx`); games played is the site's addition. */
export const BEDWARS: Game<BedWarsModes> = {
  key: "bedwars",
  id: "BEDWARS",
  modes: BEDWARS_MODES,
  game: {
    // The level's leaderboard ranks EXP; the session card shows EXP gained in §b.
    "exp": { color: "§b" },
    "tokens": { color: "§2" },
    "slumber.tickets": { color: "§b", label: "stats.slumberTickets", of: "slumber.wallet" },
    "slumber.totalTickets": { color: "§d", label: "stats.totalSlumberTickets" },
  },
  shapes: [
    {
      modes: BEDWARS_MODES.getApiModes().filter((mode) => mode !== "challenges"),
      stats: {
        "wins": { color: "§a" },
        "losses": { color: "§c" },
        "wlr": { color: "§6" },
        "finalKills": { color: "§a" },
        "finalDeaths": { color: "§c" },
        "fkdr": { color: "§6" },
        "kills": { color: "§a" },
        "deaths": { color: "§c" },
        "kdr": { color: "§6" },
        "bedsBroken": { color: "§a" },
        "bedsLost": { color: "§c" },
        "bblr": { color: "§6" },
        "winstreak": { color: "§a" },
        "gamesPlayed": { color: "§e" },
        "itemsCollected.iron": { color: "§7", label: "stats.iron" },
        "itemsCollected.gold": { color: "§6", label: "stats.gold" },
        "itemsCollected.diamond": { color: "§b", label: "stats.diamonds" },
        "itemsCollected.emerald": { color: "§2", label: "stats.emeralds" },
      },
    },
    { modes: ["challenges"], stats: CHALLENGES },
  ],
};
