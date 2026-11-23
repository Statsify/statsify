/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type CellSpec, type GameLayout, formattedLevel } from "./layout.js";
import { COPS_AND_CRIMS } from "@statsify/catalog";

/** Overall's counts the card's sidebar repeats on every page. */
const OVERALL_COUNTS = ["knifeKills", "headshotKills", "grenadeKills", "shotsFired"];

/** Overall and Deathmatch share the card's table. */
const SHARED: CellSpec[][] = [["wins", "assists"], ["kills", "deaths", "kdr"]];

/** The card's three tables over the four modes, in its rows of 2 to 4. */
const TABLES: Record<string, CellSpec[][]> = {
  overall: SHARED,
  defusal: [["wins", "roundWins"], ["kills", "deaths", "kdr", "assists"], ["bombsDefused", "bombsPlanted"]],
  deathmatch: SHARED,
  gunGame: [["wins", { key: "fastestWin", session: false }], ["kills", "deaths", "kdr", "assists"]],
};

export const COPS_AND_CRIMS_PAGE: GameLayout = {
  game: COPS_AND_CRIMS,
  // The level is looked up from score, whose leaderboard ranks it.
  level: { key: "score", progress: "stats.progression.score", read: ({ copsandcrims }) => formattedLevel(copsandcrims) },
  overview: ["coins", "score", ...OVERALL_COUNTS.map((key) => ({ key, at: "overall" }))],
  mostPlayed: {},
  page: (mode) => ({ sections: [{ rows: TABLES[mode] }] }),
};
