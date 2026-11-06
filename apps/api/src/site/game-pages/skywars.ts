/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type GameLayout, formattedLevel } from "./layout.js";
import { SKYWARS, SKYWARS_CHALLENGES } from "@statsify/catalog";

/**
 * The card's sidebar over the table every mode shares, with the mode's kit as a line, then Games Played. Overall adds
 * the challenge wins, which the bot gives a card of its own: they're stored once for the game, not per mode.
 */
export const SKYWARS_PAGE: GameLayout = {
  game: SKYWARS,
  level: { key: "exp", read: ({ skywars }) => formattedLevel(skywars) },
  overview: ["coins", "tokens", "souls", "opals", "heads", "potionsBrewed"],
  mostPlayed: {},
  page: (mode) => ({
    sections: [
      { rows: [["wins", "losses", "wlr"], ["kills", "deaths", "kdr"], ["assists", "playtime"], [{ key: "kit", inline: true }]] },
      { title: "game.sections.games", rows: [["gamesPlayed"]] },
      ...(mode === "overall" ?
        [{ title: "game.sections.challenges", cells: SKYWARS_CHALLENGES.map((key) => ({ key, at: "" })), list: true }] :
        []),
    ],
  }),
};
