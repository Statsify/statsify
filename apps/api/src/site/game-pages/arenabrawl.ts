/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type CellSpec, type GameLayout, prefixLevel } from "./layout.js";
import { ARENA_BRAWL } from "@statsify/catalog";

/** The rune and the card's Skills, game-wide choices it repeats on every mode. */
const SELECTIONS = ["rune", "offensive", "utility", "support", "ultimate"];

const WINSTREAK: CellSpec = { key: "winstreak", when: ({ value }) => value !== 0 };

/** The card's sidebar, with the rune and skills as lines, over the table every mode shares. */
export const ARENA_BRAWL_PAGE: GameLayout = {
  game: ARENA_BRAWL,
  // Overall wins set the prefix.
  level: {
    key: "wins",
    at: "overall",
    label: "stats.prefix",
    progress: "stats.progression.win",
    read: ({ arenabrawl }) => prefixLevel(arenabrawl),
  },
  overview: ["coins", "tokens", "keys", "magicalChests", ...SELECTIONS.map((key) => ({ key, inline: true }))],
  mostPlayed: {},
  page: (mode) => ({
    sections: [
      { rows: [["wins", "losses", "wlr"], ["kills", "deaths", "kdr"]] },
      // A mode's winstreak, which the card shows once it isn't 0; Overall stores none.
      ...(mode === "overall" ? [] : [{ title: "game.sections.games", rows: [[WINSTREAK]] }]),
    ],
  }),
};
