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
import { type GameContent, type GameStatsPage, type Heading, gameContentQuery } from "~/features/game/game-data";
import { type QueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { type StatsGame, StatsContext, cellsOf, headingOf, levelOf, pairsOf, rowsIn, statsIn } from "./parts";

/** The games whose pages the site lays out itself, by their URL segment; the API sends their stats. */
const STATS_GAMES: Record<string, StatsGame> = { bedwars: BEDWARS_PAGE, duels: DUELS_PAGE, skywars: SKYWARS_PAGE };

function gameOf(page: GameStatsPage): StatsGame {
  const game = STATS_GAMES[page.game.key];
  if (!game) throw new Error(`The site has no page for ${page.game.key}`);
  return game;
}

/**
 * For a game the site lays out, starts loading what its pages share alongside the player's page, which a loader then
 * awaits with `gameContentQuery`.
 */
export function prefetchGameContent(queryClient: QueryClient, game: string) {
  if (Object.hasOwn(STATS_GAMES, game)) void queryClient.prefetchQuery(gameContentQuery(game));
}

const useGameContent = (page: GameStatsPage) => useSuspenseQuery(gameContentQuery(page.game.key)).data;

/** A player's page of a game the site lays out, or on a session's page what they gained since it started. */
export function StatsView({ page }: { page: GameStatsPage }) {
  const game = gameOf(page);
  const content = useGameContent(page);
  return (
    <StatsContext value={{ game, kind: page.session ? "session" : "player", page: { ...page, ...content } }}>
      <game.Page mode={page.mode} submode={page.submode} />
    </StatsContext>
  );
}

/** Two players' pages of a game the site lays out, each table a row per player. */
export function StatsCompareView({ a, b }: { a: GameStatsPage; b: GameStatsPage }) {
  const game = gameOf(a);
  const content = useGameContent(a);
  return (
    <StatsContext value={{ game, kind: "compare", a: { ...a, ...content }, b: { ...b, ...content } }}>
      <game.Page mode={a.mode} submode={a.submode} />
    </StatsContext>
  );
}

/** The card's title, for the route's `head()`. */
export const statsHeading = (page: GameStatsPage): Heading => headingOf(gameOf(page), page);

/** The level and the first numbers of the first table (or of the game-wide row), for a page's link preview. */
export function statsHeadline(player: GameStatsPage, content: GameContent) {
  const game = gameOf(player);
  const page = { ...player, ...content };
  const level = levelOf(game, page);
  const table = rowsIn(game.headline(page.mode, page.submode)).flatMap(({ stats }) => stats);
  const cells = cellsOf(table.length > 0 ? table : statsIn(game.overview(page.mode)), page, false).filter((cell) => !cell.inline);
  return { level: level && { label: level.label, value: level.current }, cells: cells.slice(0, 6) };
}

/** Both players' values in the first table, for a comparison's link preview. */
export function statsHeadlinePairs(a: GameStatsPage, b: GameStatsPage, content: GameContent) {
  const game = gameOf(a);
  const table = rowsIn(game.headline(a.mode, a.submode)).flatMap(({ stats }) => stats);
  return pairsOf(table.length > 0 ? table : statsIn(game.overview(a.mode)), { ...a, ...content }, { ...b, ...content });
}
