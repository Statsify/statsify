/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { GameLayout } from "./layout.js";
import { PARKOUR } from "@statsify/catalog";

/** The card's list: every lobby with its game's icon, fastest first, and the lobbies never finished last. */
export const PARKOUR_PAGE: GameLayout = {
  game: PARKOUR,
  overview: [],
  page: () => ({
    place: "",
    heading: { word: "game.times" },
    sections: [
      {
        title: "game.sections.bestTimes",
        cells: Object.keys(PARKOUR.game).map((lobby) => ({ key: lobby, icon: lobby })),
        sort: "asc",
        list: true,
      },
    ],
  }),
};
