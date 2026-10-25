/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { CHALLENGES, modeName, shapeKeys } from "@statsify/catalog";
import { FormattedGame, type GameId } from "@statsify/schemas";
import { type GameLayout, type PageSpec, rankingPage } from "./layout.js";

/** The games in the schema's field order, which the card keeps on a tie (the registry's puts Duels first). */
const GAMES = CHALLENGES.shapes.flatMap(({ modes }) => modes) as GameId[];

/** Overall: every game's total under its name and icon, highest first, the values in the card's default white. */
const OVERALL = rankingPage(GAMES, { at: (game) => game, sort: "desc", colour: "§f" });

/**
 * A game: its challenges, most completed first, in rows that grow with the count as the card's do (four for a short
 * list, about the root of the count otherwise), each row a colour down from §a; the game's total beside the overall.
 */
function game(id: GameId): PageSpec {
  const keys = shapeKeys(CHALLENGES, id);
  // The card sizes rows by the game's entries, its total among them.
  const size = keys.length < 5 ? 4 : (keys.length - 1) ** 0.5;

  return {
    heading: { word: null, mode: `§l${FormattedGame[id]}` },
    overview: ["total", { key: "total", at: id, label: "stats.game-total", params: { game: modeName(CHALLENGES, id) } }],
    sections: [
      {
        cells: keys.filter((key) => key !== "total"),
        sort: "desc",
        ranks: { size, colours: ["§a", "§e", "§6", "§c", "§4"] },
      },
    ],
  };
}

/** The bot's `/challenges`: a page of its own, as the stats have their own root and a ranking of the games. */
export const CHALLENGES_PAGE: GameLayout = {
  game: CHALLENGES,
  name: "§aChallenges",
  overview: ["total"],
  page: (mode) => (mode === "overall" ? OVERALL : game(mode as GameId)),
  played: ({ challenges }) => challenges.total > 0,
};
