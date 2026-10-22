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
 * The colours and labels of the bot's Pit card (`pit.profile.tsx`): its sidebar and table, and the session card's EXP
 * and levels gained. The card doesn't show the mystics or the last four counts yet; their colours are the site's.
 */
export const PIT: Game<PitModes> = {
  key: "pit",
  id: "PIT",
  modes: PIT_MODES,
  game: {
    // The level's leaderboard ranks EXP.
    exp: { colour: "§b" },
    trueLevel: { colour: "§b", label: "stats.levelsGained" },
    gold: { colour: "§6" },
    goldEarned: { colour: "§6" },
    contractsCompleted: { colour: "§a", label: "stats.contracts" },
    renown: { colour: "§e" },
    lifetimeRenown: { colour: "§b" },
    bounty: { colour: "§6" },
    blocksPlaced: { colour: "§9" },
    kills: { colour: "§a" },
    deaths: { colour: "§c" },
    kdr: { colour: "§6" },
    highestStreak: { colour: "§d" },
    playtime: { colour: "§b" },
    assists: { colour: "§e" },
    // "Tier {{tier}}", with the tier's numeral where a page shows it.
    tier1MysticsEnchanted: { colour: "§a", label: "stats.tier" },
    tier2MysticsEnchanted: { colour: "§e", label: "stats.tier" },
    tier3MysticsEnchanted: { colour: "§c", label: "stats.tier" },
    totalMysticsEnchanted: { colour: "§6", label: "stats.total" },
    joins: { colour: "§e" },
    ragePotatoesEaten: { colour: "§a" },
    goldIngotsGathered: { colour: "§6" },
    vampireHealing: { colour: "§a" },
  },
  shapes: [],
};
