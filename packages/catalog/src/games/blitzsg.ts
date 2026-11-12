/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BLITZSG_MODES, type BlitzSGModes } from "@statsify/schemas";
import { type ColorCode, type Game, selection } from "../catalog.js";
import { romanNumeral } from "@statsify/util";

/** A kit level's color on the card, I to X; a prestiged kit is §6. */
const LEVEL_COLORS: ColorCode[] = ["§a", "§a", "§2", "§2", "§e", "§e", "§6", "§6", "§c", "§4"];

const prestigeOf = (kit: Record<string, unknown>) => Number(kit.prestige ?? 0);

/** The colors and labels of the bot's BlitzSG card (`blitzsg.profile.tsx`): Overall's table, and one for every kit. */
export const BLITZSG: Game<BlitzSGModes> = {
  key: "blitzsg",
  id: "BLITZSG",
  modes: BLITZSG_MODES,
  game: {
    coins: { color: "§6" },
    kit: selection("§e"),
  },
  shapes: [
    { modes: ["overall"], stats: { wins: { color: "§e" }, kills: { color: "§a" }, deaths: { color: "§c" }, kdr: { color: "§6" } } },
    { modes: ["solo", "doubles"], stats: { wins: { color: "§e" }, kills: { color: "§a" } } },
    {
      modes: BLITZSG_MODES.getApiModes().filter((mode) => mode !== "overall"),
      stats: {
        wins: { color: "§a" },
        losses: { color: "§c" },
        wlr: { color: "§6" },
        kills: { color: "§a" },
        deaths: { color: "§c" },
        kdr: { color: "§6" },
        playtime: { color: "§e" },
        gamesPlayed: { color: "§b" },
        // The card's level: a numeral, or a star per prestige once prestiged, bold at X.
        level: {
          color: (level, kit) => (prestigeOf(kit) ? "§6" : LEVEL_COLORS[Number(level) - 1] ?? "§a"),
          format: (level, kit) => {
            const prestige = prestigeOf(kit);
            const shown = prestige ? `§6${"✫".repeat(prestige)}` : romanNumeral(Number(level));
            return Number(level) === 10 ? `§l${shown}` : shown;
          },
        },
        exp: { color: "§b" },
        // Shown through the level.
        prestige: { color: "§6" },
      },
    },
  ],
};
