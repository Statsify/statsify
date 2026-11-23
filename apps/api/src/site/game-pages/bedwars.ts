/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BEDWARS } from "@statsify/catalog";
import type { PageEntry } from "./layout.js";

/** The site lays the page out (`apps/site/src/features/game/stats/bedwars.tsx`); a session has no Challenges. */
export const BEDWARS_PAGE: PageEntry = {
  game: BEDWARS,
  modes: BEDWARS.modes.getApiModes().map((key) => (key === "challenges" ? { key, session: false } : { key })),
  // Core adds up Solo, Doubles, Threes and Fours, so it never counts as the mode played most.
  mostPlayed: { skip: ["core"] },
};
