/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type GameLayout, formattedLevel } from "./layout.js";
import { PIT } from "@statsify/catalog";

/** The mystics enchanted at each tier, each under "Tier" and its numeral. */
const TIERS = [
  ["tier1MysticsEnchanted", "I"],
  ["tier2MysticsEnchanted", "II"],
  ["tier3MysticsEnchanted", "III"],
] as const;

/** The card's sidebar (with Gold Earned beside Gold) and table, then the mystics and the counts the card leaves out. */
export const PIT_PAGE: GameLayout = {
  game: PIT,
  // The level carries its prestige; its bar runs from the level itself across the prestige.
  level: { key: "exp", read: ({ pit }) => formattedLevel(pit) },
  overview: ["gold", "goldEarned", "contractsCompleted", "renown", "lifetimeRenown", "bounty", "blocksPlaced"],
  page: () => ({
    place: "",
    sections: [
      { rows: [["kills", "deaths", "kdr"], [{ key: "highestStreak", session: false }, "playtime", "assists"]] },
      {
        title: "stats.mysticsEnchanted",
        rows: [[...TIERS.map(([key, tier]) => ({ key, params: { tier } })), "totalMysticsEnchanted"]],
      },
      { title: "game.sections.more", rows: [["joins", "ragePotatoesEaten", "goldIngotsGathered", "vampireHealing"]] },
    ],
  }),
};
