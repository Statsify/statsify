/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type Game, selection } from "../catalog.js";
import { MEGAWALLS_MODES, type MegaWallsModes } from "@statsify/schemas";

/** The colors and labels of the bot's Mega Walls card (`megawalls.profile.tsx`): its sidebar and the shared table. */
export const MEGAWALLS: Game<MegaWallsModes> = {
  key: "megawalls",
  id: "MEGAWALLS",
  modes: MEGAWALLS_MODES,
  game: {
    coins: { color: "§6" },
    mythicFavor: { color: "§e", label: "stats.mythic-favor" },
    class: selection("§9"),
  },
  shapes: [
    {
      // Overall and the 27 kits store the same 15.
      modes: MEGAWALLS_MODES.getApiModes(),
      stats: {
        wins: { color: "§a" },
        losses: { color: "§c" },
        wlr: { color: "§6" },
        finalKills: { color: "§a" },
        finalDeaths: { color: "§c" },
        fkdr: { color: "§6" },
        finalAssists: { color: "§e" },
        kills: { color: "§a" },
        deaths: { color: "§c" },
        kdr: { color: "§6" },
        assists: { color: "§e" },
        playtime: { color: "§a" },
        witherDamage: { color: "§c" },
        witherKills: { color: "§6" },
        points: { color: "§e" },
      },
    },
  ],
};
