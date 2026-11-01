/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BEDWARS, shapeKeys } from "@statsify/catalog";
import { type CellSpec, type GameLayout, type PageSpec, formattedLevel } from "./layout.js";
import type { PlayerStats } from "@statsify/schemas";

// Slumber tickets show once the player has a wallet, as on the bot's card.
const hasWallet = (_: unknown, { bedwars }: PlayerStats) => bedwars.slumber.wallet > 0;

const TOTALS = ["totalChallenges", "uniqueChallenges"];

// As on the card, winstreak shows only when it isn't 0: the Dreams modes don't track it and always store 0.
const WINSTREAK: CellSpec = { key: "winstreak", when: ({ value }) => value !== 0, session: false };

/**
 * The bot's challenges card, its last mode: the two totals where the game's stats go, then every challenge in the
 * card's order, each green once completed and red before.
 */
const CHALLENGES: PageSpec = {
  heading: { word: "game.challenges", mode: null },
  level: null,
  overview: TOTALS.map((key) => ({ key, at: "challenges" })),
  sections: [
    { cells: shapeKeys(BEDWARS, "challenges").filter((key) => !TOTALS.includes(key)), list: true },
  ],
};

export const BEDWARS_PAGE: GameLayout = {
  game: BEDWARS,
  modes: BEDWARS.modes.getApiModes().map((key) => (key === "challenges" ? { key, session: false } : { key })),
  level: {
    key: "exp",
    read: ({ bedwars }) => formattedLevel(bedwars),
  },
  overview: ["tokens", { key: "slumber.tickets", when: hasWallet }, { key: "slumber.totalTickets", when: hasWallet }],
  // Core adds up Solo, Doubles, Threes and Fours, so it never counts as the mode played most.
  mostPlayed: { skip: ["core"] },
  page: (mode) => mode === "challenges" ? CHALLENGES : ({
    sections: [
      // The card's table: rows of a count, its opposite and their ratio, the kills rows under Final and Normal.
      {
        rows: [
          ["wins", "losses", "wlr"],
          [{ key: "finalKills", short: "stats.kills" }, { key: "finalDeaths", short: "stats.deaths" }, "fkdr"],
          ["kills", "deaths", "kdr"],
          ["bedsBroken", "bedsLost", "bblr"],
        ],
        rowTitles: [null, "game.table.final", "game.table.normal", null],
      },
      {
        title: "game.sections.resources",
        rows: [["itemsCollected.iron", "itemsCollected.gold", "itemsCollected.diamond", "itemsCollected.emerald"]],
      },
      // Core's winstreak is a copy of Overall's, so Core's page leaves it out.
      { title: "game.sections.games", rows: [["gamesPlayed", ...(mode === "core" ? [] : [WINSTREAK])]] },
    ],
  }),
  omit: { "core.winstreak": "A copy of Overall's winstreak, so Core's page leaves it out." },
};
