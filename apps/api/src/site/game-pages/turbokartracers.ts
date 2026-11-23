/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type GameLayout, prefixLevel } from "./layout.js";
import { TURBO_KART_RACERS } from "@statsify/catalog";

/** The card's one page: its sidebar over the table of rates, games and trophies. */
export const TURBO_KART_RACERS_PAGE: GameLayout = {
  game: TURBO_KART_RACERS,
  // Gold trophies set the prefix.
  level: {
    key: "gold",
    label: "stats.prefix",
    progress: "stats.progression.goldTrophy",
    read: ({ turbokartracers }) => prefixLevel(turbokartracers),
  },
  overview: ["coins", "tokens", "boxesPickedUp", "grandPrixTokens", "lapsCompleted"],
  page: () => ({
    place: "",
    sections: [{ rows: [["goldRate", "trophyRate", "gamesPlayed"], ["gold", "silver", "bronze", "total"]] }],
  }),
};
