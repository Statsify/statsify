/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { SKYWARS } from "@statsify/catalog";
import type { PageEntry } from "./layout.js";

/** The site lays the page out (`apps/site/src/features/game/stats/skywars.tsx`). */
export const SKYWARS_PAGE: PageEntry = { game: SKYWARS, mostPlayed: {} };
