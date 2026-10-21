/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BEDWARS } from "@statsify/catalog";
import { type GameLayout, formattedLevel } from "./layout.js";
import type { PlayerStats } from "@statsify/schemas";

// Slumber tickets show once the player has a wallet, as on the bot's card.
const hasWallet = (_: unknown, { bedwars }: PlayerStats) => bedwars.slumber.wallet > 0;

export const BEDWARS_PAGE: GameLayout = {
  game: BEDWARS,
  modes: BEDWARS.modes.getApiModes().filter((mode) => mode !== "challenges").map((key) => ({ key })),
  level: {
    key: "exp",
    read: ({ bedwars }) => formattedLevel(bedwars),
  },
  overview: ["tokens", { key: "slumber.tickets", when: hasWallet }, { key: "slumber.totalTickets", when: hasWallet }],
  page: () => ({
    sections: [
      // The card's table: rows of a count, its opposite and their ratio.
      {
        rows: [
          ["wins", "losses", "wlr"],
          ["finalKills", "finalDeaths", "fkdr"],
          ["kills", "deaths", "kdr"],
          ["bedsBroken", "bedsLost", "bblr"],
        ],
      },
      {
        title: "game.sections.resources",
        rows: [["itemsCollected.iron", "itemsCollected.gold", "itemsCollected.diamond", "itemsCollected.emerald"]],
      },
      // As on the card, winstreak shows only when it isn't 0: the Dreams modes don't track it and always store 0. Core's
      // is a copy of Overall's, so Core's page leaves it out.
      {
        title: "game.sections.games",
        rows: [["gamesPlayed", { key: "winstreak", when: ({ key, value }) => value !== 0 && key !== "core.winstreak" }]],
      },
    ],
  }),
};
