/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type Game, type StatEntry, selection } from "../catalog.js";
import { SPEED_UHC_MODES, type SpeedUHCModes } from "@statsify/schemas";

/** The nine masteries, each a mode of its own after Overall, Solo and Teams. */
export const SPEED_UHC_MASTERIES = SPEED_UHC_MODES.getApiModes().filter((mode) => !["overall", "solo", "teams"].includes(mode));

const RECORD: Record<string, StatEntry> = {
  wins: { colour: "§a" },
  losses: { colour: "§c" },
  wlr: { colour: "§6" },
  kills: { colour: "§a" },
  deaths: { colour: "§c" },
  kdr: { colour: "§6" },
};

/** The colours and labels of the bot's Speed UHC card (`speeduhc.profile.tsx`): its sidebar and the table all 12 share. */
export const SPEED_UHC: Game<SpeedUHCModes> = {
  key: "speeduhc",
  id: "SPEED_UHC",
  modes: SPEED_UHC_MODES,
  game: {
    coins: { colour: "§6" },
    score: { colour: "§b" },
    // The title as stored and the mastery prettified, as the card shows them.
    title: { colour: "§e" },
    activeMastery: { ...selection("§a"), label: "stats.mastery" },
  },
  shapes: [
    { modes: ["overall", "solo", "teams"], stats: { ...RECORD, assists: { colour: "§e" } } },
    // The masteries store no assists.
    { modes: SPEED_UHC_MASTERIES, stats: RECORD },
  ],
};
