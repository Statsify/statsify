/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type Game, selection } from "../catalog.js";
import { MEGAWALLS_MODES, type MegaWallsModes } from "@statsify/schemas";

/** The colours and labels of the bot's Mega Walls card (`megawalls.profile.tsx`): its sidebar and the shared table. */
export const MEGAWALLS: Game<MegaWallsModes> = {
  key: "megawalls",
  id: "MEGAWALLS",
  modes: MEGAWALLS_MODES,
  game: {
    coins: { colour: "§6" },
    mythicFavor: { colour: "§e", label: "stats.mythic-favor" },
    class: selection("§9"),
  },
  shapes: [
    {
      // Overall and the 27 kits store the same 15.
      modes: MEGAWALLS_MODES.getApiModes(),
      stats: {
        wins: { colour: "§a" },
        losses: { colour: "§c" },
        wlr: { colour: "§6" },
        finalKills: { colour: "§a" },
        finalDeaths: { colour: "§c" },
        fkdr: { colour: "§6" },
        finalAssists: { colour: "§e" },
        kills: { colour: "§a" },
        deaths: { colour: "§c" },
        kdr: { colour: "§6" },
        assists: { colour: "§e" },
        playtime: { colour: "§a" },
        witherDamage: { colour: "§c" },
        witherKills: { colour: "§6" },
        points: { colour: "§e" },
      },
    },
  ],
};
