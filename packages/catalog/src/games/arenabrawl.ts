/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ARENA_BRAWL_MODES, type ArenaBrawlModes } from "@statsify/schemas";
import { type Game, type StatEntry, selection } from "../catalog.js";

/** The card's table, the same on every mode. */
const RECORD: Record<string, StatEntry> = {
  wins: { colour: "§a" },
  losses: { colour: "§c" },
  wlr: { colour: "§6" },
  kills: { colour: "§a" },
  deaths: { colour: "§c" },
  kdr: { colour: "§6" },
};

/** The colours and labels of the bot's Arena Brawl card (`arenabrawl.profile.tsx`): its sidebar, table and Skills. */
export const ARENA_BRAWL: Game<ArenaBrawlModes> = {
  key: "arenabrawl",
  id: "ARENA_BRAWL",
  modes: ARENA_BRAWL_MODES,
  game: {
    coins: { colour: "§6" },
    tokens: { colour: "§e" },
    keys: { colour: "§b", label: "stats.magicalKeys" },
    magicalChests: { colour: "§5" },
    // The rune and the four skills, prettified as the card shows them.
    rune: selection("§9"),
    offensive: selection("§c"),
    utility: selection("§e"),
    support: selection("§a"),
    ultimate: selection("§6"),
  },
  shapes: [
    // Overall adds up the three modes but not their winstreaks.
    { modes: ["overall"], stats: RECORD },
    { modes: ["solo", "doubles", "fours"], stats: { ...RECORD, winstreak: { colour: "§a" } } },
  ],
};
