/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type GameLayout, formattedLevel } from "./layout.js";
import { UHC } from "@statsify/catalog";

/** The card's sidebar, with the title and kit as lines, over the table every mode shares. */
export const UHC_PAGE: GameLayout = {
  game: UHC,
  // The level is looked up from score, whose leaderboard ranks it.
  level: { key: "score", progress: "stats.progression.score", read: ({ uhc }) => formattedLevel(uhc) },
  overview: ["coins", "score", { key: "title", inline: true }, { key: "kit", inline: true }],
  mostPlayed: {},
  page: () => ({ sections: [{ rows: [["wins", "kills", "deaths", "kdr"], ["headsEaten", "ultimatesCrafted", "extraUltimates"]] }] }),
};
