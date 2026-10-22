/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type GameLayout, formattedLevel, selectedMode } from "./layout.js";
import { SPEED_UHC, SPEED_UHC_MASTERIES, shapeKeys } from "@statsify/catalog";

/**
 * The card's sidebar, with the title and mastery as lines, over the table all 12 modes share: Overall, Solo and Teams,
 * then the nine masteries in the registry's order, the player's own marked.
 */
export const SPEED_UHC_PAGE: GameLayout = {
  game: SPEED_UHC,
  selected: ({ speeduhc }) => selectedMode(SPEED_UHC, speeduhc.activeMastery),
  // The level is looked up from score, whose leaderboard ranks it.
  level: { key: "score", progress: "stats.progression.score", read: ({ speeduhc }) => formattedLevel(speeduhc) },
  overview: ["coins", "score", { key: "title", inline: true }, { key: "activeMastery", inline: true }],
  // A mastery's games are Solo's and Teams' too, so the masteries compete among themselves.
  mostPlayed: { among: SPEED_UHC_MASTERIES },
  // The masteries store no assists.
  page: (mode) => {
    const assists = shapeKeys(SPEED_UHC, mode).includes("assists") ? ["assists"] : [];
    return { sections: [{ rows: [["wins", "losses", "wlr"], ["kills", "deaths", "kdr", ...assists]] }] };
  },
};
