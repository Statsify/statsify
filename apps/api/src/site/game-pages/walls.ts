/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type GameLayout, prefixLevel } from "./layout.js";
import { WALLS } from "@statsify/catalog";

/** The card's one page: coins and tokens over the table. */
export const WALLS_PAGE: GameLayout = {
  game: WALLS,
  // Wins set the prefix.
  level: { key: "wins", label: "stats.prefix", progress: "stats.progression.win", read: ({ walls }) => prefixLevel(walls) },
  overview: ["coins", "tokens"],
  page: () => ({
    place: "",
    sections: [{ rows: [["wins", "losses", "wlr"], ["kills", "deaths", "kdr", "assists"]] }],
  }),
};
