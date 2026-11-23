/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type GameLayout, selectedMode } from "./layout.js";
import { SMASH_HEROES } from "@statsify/catalog";

/** The 16 classes, after Overall, Solo, Doubles and Teams. */
const CLASSES = SMASH_HEROES.modes.getApiModes().filter((mode) => !["overall", "solo", "doubles", "teams"].includes(mode));

/**
 * The card's sidebar, the level a cell in it and the class a line, over the table all 20 modes share, the 16 classes in
 * the registry's order with the player's own marked.
 */
export const SMASH_HEROES_PAGE: GameLayout = {
  game: SMASH_HEROES,
  // The schema stores the card's name for the class, one of them shortened ("Sgt. Shield" for `sergeantShield`).
  selected: ({ smashheroes: { kit } }) => selectedMode(SMASH_HEROES, kit === "Sgt. Shield" ? "sergeantShield" : kit),
  overview: ["coins", { key: "levelFormatted", session: false }, { key: "kit", inline: true }],
  // A class's games are Solo's, Doubles' or Teams' too, so the classes compete among themselves.
  mostPlayed: { among: CLASSES },
  page: () => ({ sections: [{ rows: [["wins", "losses", "wlr"], ["kills", "deaths", "kdr"]] }] }),
};
