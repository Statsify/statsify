/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BUILD_BATTLE } from "@statsify/catalog";
import type { GameLayout } from "./layout.js";
import { arrayGroup, prettify } from "@statsify/util";

/** Each sub-game whose wins the card lists, in its order. */
const SUB_GAMES = ["overall", "pro", "speedBuilders", "solo", "teams", "guessTheBuild"] as const;

/** The card's one page: its sidebar, then the wins, three to a row. */
export const BUILD_BATTLE_PAGE: GameLayout = {
  game: BUILD_BATTLE,
  // The title as worn, with its emblem, and the bar between the plain titles.
  level: {
    key: "score",
    label: "stats.title",
    progress: "stats.progression.score",
    read: ({ buildbattle }) => ({
      current: buildbattle.titleFormatted,
      natural: buildbattle.naturalTitleFormatted,
      next: buildbattle.nextTitleFormatted,
      progression: { ...buildbattle.progression },
    }),
  },
  overview: ["coins", "score", "votes", "superVotes", "correctGuesses", "speedBuilders.perfectBuilds"],
  page: () => ({
    place: "",
    sections: [
      {
        title: "stats.wins",
        rows: arrayGroup(SUB_GAMES.map((at) => ({ key: `${at}.wins`, name: `§e${at === "guessTheBuild" ? "GTB" : prettify(at)}` })), 3),
      },
    ],
  }),
};
