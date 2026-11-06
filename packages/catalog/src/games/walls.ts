/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { WALLS_MODES, type WallsModes } from "@statsify/schemas";
import type { Game } from "../catalog.js";

/** The colours and labels of the bot's Walls card (`walls.profile.tsx`): its sidebar and table. */
export const WALLS: Game<WallsModes> = {
  key: "walls",
  id: "WALLS",
  modes: WALLS_MODES,
  game: {
    coins: { colour: "§6" },
    tokens: { colour: "§e" },
    wins: { colour: "§a" },
    losses: { colour: "§c" },
    wlr: { colour: "§6" },
    kills: { colour: "§a" },
    deaths: { colour: "§c" },
    kdr: { colour: "§6" },
    assists: { colour: "§e" },
  },
  shapes: [],
};
