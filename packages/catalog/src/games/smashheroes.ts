/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type Game, selection } from "../catalog.js";
import { SMASH_HEROES_MODES, type SmashHeroesModes } from "@statsify/schemas";

/** The colors and labels of the bot's Smash Heroes card (`smashheroes.profile.tsx`): its sidebar and the shared table. */
export const SMASH_HEROES: Game<SmashHeroesModes> = {
  key: "smashheroes",
  id: "SMASH_HEROES",
  modes: SMASH_HEROES_MODES,
  game: {
    coins: { color: "§6" },
    // The level as the card shows it (`§b12§6✶`): it has no progression or leaderboard, so it's a cell, not a panel.
    levelFormatted: { color: "§b", label: "stats.level" },
    kit: { ...selection("§d"), label: "stats.class" },
  },
  shapes: [
    {
      // The modes and the 16 classes store the same six.
      modes: SMASH_HEROES_MODES.getApiModes(),
      stats: {
        wins: { color: "§a" },
        losses: { color: "§c" },
        wlr: { color: "§6" },
        kills: { color: "§a" },
        deaths: { color: "§c" },
        kdr: { color: "§6" },
      },
    },
  ],
};
