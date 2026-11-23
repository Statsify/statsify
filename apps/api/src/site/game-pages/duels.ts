/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { DUELS, shapeAt } from "@statsify/catalog";
import { DUELS_MODES, type PlayerStats } from "@statsify/schemas";
import { type PageEntry, submodeOptions } from "./layout.js";

// Hypixel leaves winstreaks out for a player who hides them, which reads back as 0. One win is a streak of one, so
// wins with no best winstreak mean they're hidden.
export const winstreaksHidden = ({ duels }: PlayerStats) => duels.overall.wins > 0 && !duels.overall.bestWinstreak;

/** A mode's submodes as the registry names them. Overall's Titles are a section of its page, not a submode. */
const submodesOf = (mode: string) =>
  mode === "overall" ?
    [] :
    submodeOptions(DUELS_MODES.getModes().find(({ api }) => api === mode)?.submodes ?? []);

/** The site lays the page out (`apps/site/src/features/game/stats/duels.tsx`). */
export const DUELS_PAGE: PageEntry = {
  game: DUELS,
  modes: DUELS_MODES.getApiModes().map((key) => {
    const submodes = submodesOf(key);
    return submodes.length > 0 ? { key, submodes } : { key };
  }),
  // A mode with submodes is weighed at its Overall (Bridge at `bridge.overall`), or by its submodes added up where it has
  // none (Spleef's two).
  mostPlayed: {
    place: (mode) => {
      if (shapeAt(DUELS, `${mode}.overall`)) return `${mode}.overall`;
      const submodes = submodesOf(mode).map(({ key }) => `${mode}.${key}`);
      return submodes.length > 0 ? submodes : mode;
    },
  },
};
