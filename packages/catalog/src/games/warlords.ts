/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type Game, type StatEntry, selection } from "../catalog.js";
import { WARLORDS_MODES, type WarlordsModes } from "@statsify/schemas";

/** The four classes, each a mode after Overall and the three game modes. */
export const WARLORDS_CLASSES: string[] = WARLORDS_MODES.getApiModes().filter(
  (mode) => !["overall", "captureTheFlag", "domination", "teamDeathmatch"].includes(mode)
);

/** A class's three specs, as the schema keeps them below the class, in the card's order. */
export const WARLORDS_SPECS = ["attack", "defense", "healer"] as const;

/** The card's column for a class or one of its specs. */
const COLUMN: Record<string, StatEntry> = {
  wins: { color: "§e" },
  damage: { color: "§c" },
  healing: { color: "§a" },
  prevent: { color: "§b" },
  total: { color: "§6", glossary: "warlordsTotal" },
};

/** The colors and labels of the bot's Warlords card (`warlords.profile.tsx` and its tables): one table a mode. */
export const WARLORDS: Game<WarlordsModes> = {
  key: "warlords",
  id: "WARLORDS",
  modes: WARLORDS_MODES,
  game: {
    coins: { color: "§6" },
    class: selection("§e"),
    // Overall's table: there's no `overall` object, so Overall reads these, stored once for the game.
    wins: { color: "§a" },
    losses: { color: "§c" },
    wlr: { color: "§6" },
    gamesPlayed: { color: "§e" },
    kills: { color: "§a" },
    deaths: { color: "§c" },
    kdr: { color: "§6" },
    assists: { color: "§e" },
  },
  shapes: [
    {
      modes: ["captureTheFlag"],
      stats: { wins: { color: "§a" }, kills: { color: "§e" }, flagCaptures: { color: "§c" }, flagReturns: { color: "§9" } },
    },
    {
      modes: ["domination"],
      stats: {
        wins: { color: "§a" },
        kills: { color: "§e" },
        score: { color: "§6" },
        capturePoints: { color: "§2" },
        defendPoints: { color: "§b" },
      },
    },
    { modes: ["teamDeathmatch"], stats: { wins: { color: "§a" }, kills: { color: "§e" } } },
    {
      modes: WARLORDS_CLASSES,
      stats: { ...COLUMN, level: { color: "§a" }, specification: { ...selection("§a"), label: "stats.spec" } },
    },
    { modes: WARLORDS_CLASSES.flatMap((mode) => WARLORDS_SPECS.map((spec) => `${mode}.${spec}`)), stats: COLUMN },
  ],
};
