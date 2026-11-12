/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { PIT_MODES, type PitModes } from "@statsify/schemas";
import type { Game } from "../catalog.js";

/**
 * The colors and labels of the bot's Pit card (`pit.profile.tsx`): its sidebar and table, and the session card's EXP
 * and levels gained. The card doesn't show the mystics or the last four counts yet; their colors are the site's.
 */
export const PIT: Game<PitModes> = {
  key: "pit",
  id: "PIT",
  modes: PIT_MODES,
  game: {
    // The level's leaderboard ranks EXP.
    exp: { color: "§b" },
    trueLevel: { color: "§b", label: "stats.levelsGained" },
    gold: { color: "§6" },
    goldEarned: { color: "§6" },
    contractsCompleted: { color: "§a", label: "stats.contracts" },
    renown: { color: "§e" },
    lifetimeRenown: { color: "§b" },
    bounty: { color: "§6" },
    blocksPlaced: { color: "§9" },
    kills: { color: "§a" },
    deaths: { color: "§c" },
    kdr: { color: "§6" },
    highestStreak: { color: "§d" },
    playtime: { color: "§b" },
    assists: { color: "§e" },
    // "Tier {{tier}}", with the tier's numeral where a page shows it.
    tier1MysticsEnchanted: { color: "§a", label: "stats.tier" },
    tier2MysticsEnchanted: { color: "§e", label: "stats.tier" },
    tier3MysticsEnchanted: { color: "§c", label: "stats.tier" },
    totalMysticsEnchanted: { color: "§6", label: "stats.total" },
    joins: { color: "§e" },
    ragePotatoesEaten: { color: "§a" },
    goldIngotsGathered: { color: "§6" },
    vampireHealing: { color: "§a" },
  },
  shapes: [],
};
