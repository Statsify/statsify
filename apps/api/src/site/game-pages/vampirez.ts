/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type GameLayout, type LevelSpec, prefixLevel } from "./layout.js";
import { VAMPIREZ } from "@statsify/catalog";

/** Each life's prefix: Human's set by its wins, Vampire's by the humans it killed. */
const LEVELS: Record<string, LevelSpec> = {
  human: {
    key: "wins",
    at: "human",
    label: "stats.prefix",
    progress: "stats.progression.win",
    read: ({ vampirez }) => prefixLevel(vampirez.human),
  },
  vampire: {
    key: "kills",
    at: "vampire",
    label: "stats.prefix",
    progress: "stats.progression.kill",
    read: ({ vampirez }) => prefixLevel(vampirez.vampire),
  },
};

/** The card's two lives, with no Overall: the game-wide totals are the sidebar's. */
export const VAMPIREZ_PAGE: GameLayout = {
  game: VAMPIREZ,
  overview: ["coins", "tokens", "overallWins", "zombieKills", { key: "mostVampireKills", session: false }],
  mostPlayed: {},
  page: (mode) => ({ level: LEVELS[mode], sections: [{ rows: [["wins", "kills", "deaths", "kdr"]] }] }),
};
