/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type GameLayout, prefixLevel } from "./layout.js";
import { PAINTBALL } from "@statsify/catalog";

/** The card's one page: its sidebar over the table, then the Perks, every stat stored once for the game. */
export const PAINTBALL_PAGE: GameLayout = {
  game: PAINTBALL,
  // Kills set the prefix.
  level: {
    key: "kills",
    label: "stats.prefix",
    progress: "stats.progression.kill",
    read: ({ paintball }) => prefixLevel(paintball),
  },
  overview: ["coins", "tokens", "forcefieldTime", "killstreaks", { key: "hat", inline: true }],
  page: () => ({
    place: "",
    sections: [
      { rows: [["wins", "shotsFired", "shotAccuracy"], ["kills", "deaths", "kdr"]] },
      {
        name: "§6Perks",
        session: false,
        rows: [
          ["perks.adrenaline", "perks.endurance", "perks.fortune"],
          ["perks.godfather", "perks.headstart", "perks.superluck", "perks.transfusion"],
        ],
      },
    ],
  }),
};
