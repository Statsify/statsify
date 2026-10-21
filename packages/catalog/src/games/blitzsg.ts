/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BLITZSG_MODES, type BlitzSGModes } from "@statsify/schemas";
import { type ColourCode, type Game, selection } from "../catalog.js";
import { romanNumeral } from "@statsify/util";

/** A kit level's colour on the card, I to X; a prestiged kit is §6. */
const LEVEL_COLOURS: ColourCode[] = ["§a", "§a", "§2", "§2", "§e", "§e", "§6", "§6", "§c", "§4"];

const prestigeOf = (kit: Record<string, unknown>) => Number(kit.prestige ?? 0);

/** The colours and labels of the bot's BlitzSG card (`blitzsg.profile.tsx`): Overall's table, and one for every kit. */
export const BLITZSG: Game<BlitzSGModes> = {
  key: "blitzsg",
  id: "BLITZSG",
  modes: BLITZSG_MODES,
  game: {
    coins: { colour: "§6" },
    kit: selection("§e"),
  },
  shapes: [
    { modes: ["overall"], stats: { wins: { colour: "§e" }, kills: { colour: "§a" }, deaths: { colour: "§c" }, kdr: { colour: "§6" } } },
    { modes: ["solo", "doubles"], stats: { wins: { colour: "§e" }, kills: { colour: "§a" } } },
    {
      modes: BLITZSG_MODES.getApiModes().filter((mode) => mode !== "overall"),
      stats: {
        wins: { colour: "§a" },
        losses: { colour: "§c" },
        wlr: { colour: "§6" },
        kills: { colour: "§a" },
        deaths: { colour: "§c" },
        kdr: { colour: "§6" },
        playtime: { colour: "§e" },
        gamesPlayed: { colour: "§b" },
        // The card's level: a numeral, or a star per prestige once prestiged, bold at X.
        level: {
          colour: (level, kit) => (prestigeOf(kit) ? "§6" : LEVEL_COLOURS[Number(level) - 1] ?? "§a"),
          format: (level, kit) => {
            const prestige = prestigeOf(kit);
            const shown = prestige ? `§6${"✫".repeat(prestige)}` : romanNumeral(Number(level));
            return Number(level) === 10 ? `§l${shown}` : shown;
          },
        },
        exp: { colour: "§b" },
        // Shown through the level.
        prestige: { colour: "§6" },
      },
    },
  ],
};
