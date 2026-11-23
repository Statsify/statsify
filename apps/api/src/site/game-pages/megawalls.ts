/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type GameLayout, selectedMode } from "./layout.js";
import { MEGAWALLS } from "@statsify/catalog";

/**
 * The card's sidebar, with the class as a line, over the table all 28 modes share: Overall, then every kit in the
 * registry's order (the card orders them by the player's class points), the player's own marked.
 */
export const MEGAWALLS_PAGE: GameLayout = {
  game: MEGAWALLS,
  selected: ({ megawalls }) => selectedMode(MEGAWALLS, megawalls.class),
  overview: ["coins", "mythicFavor", { key: "class", inline: true }],
  mostPlayed: {},
  page: () => ({
    sections: [
      {
        rows: [
          ["wins", "losses", "wlr"],
          ["finalKills", "finalDeaths", "fkdr", "finalAssists"],
          ["kills", "deaths", "kdr", "assists"],
          ["playtime", "witherDamage", "witherKills", "points"],
        ],
      },
    ],
  }),
};
