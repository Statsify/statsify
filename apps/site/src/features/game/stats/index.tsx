/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BEDWARS_PAGE } from "./bedwars";
import { DUELS_PAGE } from "./duels";
import { SKYWARS_PAGE } from "./skywars";
import { type StatsGame, StatsContext, cellsOf, headingOf, levelOf, pairsOf, rowsIn, statsIn } from "./parts";
import type { GameStatsPage, Heading } from "~/features/game/game-data";

/** The games whose pages the site lays out itself, by their URL segment; the API sends their stats. */
const STATS_GAMES: Record<string, StatsGame> = { bedwars: BEDWARS_PAGE, duels: DUELS_PAGE, skywars: SKYWARS_PAGE };

function gameOf(page: GameStatsPage): StatsGame {
  const game = STATS_GAMES[page.game.key];
  if (!game) throw new Error(`The site has no page for ${page.game.key}`);
  return game;
}

/** A player's page of a game the site lays out, or on a session's page what they gained since it started. */
export function StatsView({ page }: { page: GameStatsPage }) {
  const game = gameOf(page);
  return (
    <StatsContext value={{ game, kind: page.session ? "session" : "player", page }}>
      <game.Page mode={page.mode} submode={page.submode} />
    </StatsContext>
  );
}

/** Two players' pages of a game the site lays out, each table a row per player. */
export function StatsCompareView({ a, b }: { a: GameStatsPage; b: GameStatsPage }) {
  const game = gameOf(a);
  return (
    <StatsContext value={{ game, kind: "compare", a, b }}>
      <game.Page mode={a.mode} submode={a.submode} />
    </StatsContext>
  );
}

/** The card's title, for the route's `head()`. */
export const statsHeading = (page: GameStatsPage): Heading => headingOf(gameOf(page), page);

/** The level and the first numbers of the first table (or of the game-wide row), for a page's link preview. */
export function statsHeadline(page: GameStatsPage) {
  const game = gameOf(page);
  const level = levelOf(game, page);
  const table = rowsIn(game.headline(page.mode, page.submode)).flatMap(({ stats }) => stats);
  const cells = cellsOf(table.length > 0 ? table : statsIn(game.overview(page.mode)), page, false).filter((cell) => !cell.inline);
  return { level: level && { label: level.label, value: level.current }, cells: cells.slice(0, 6) };
}

/** Both players' values in the first table, for a comparison's link preview. */
export function statsHeadlinePairs(a: GameStatsPage, b: GameStatsPage) {
  const game = gameOf(a);
  const table = rowsIn(game.headline(a.mode, a.submode)).flatMap(({ stats }) => stats);
  return pairsOf(table.length > 0 ? table : statsIn(game.overview(a.mode)), a, b);
}
