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
  wins: { colour: "§e" },
  damage: { colour: "§c" },
  healing: { colour: "§a" },
  prevent: { colour: "§b" },
  total: { colour: "§6", glossary: "warlordsTotal" },
};

/** The colours and labels of the bot's Warlords card (`warlords.profile.tsx` and its tables): one table a mode. */
export const WARLORDS: Game<WarlordsModes> = {
  key: "warlords",
  id: "WARLORDS",
  modes: WARLORDS_MODES,
  game: {
    coins: { colour: "§6" },
    class: selection("§e"),
    // Overall's table: there's no `overall` object, so Overall reads these, stored once for the game.
    wins: { colour: "§a" },
    losses: { colour: "§c" },
    wlr: { colour: "§6" },
    gamesPlayed: { colour: "§e" },
    kills: { colour: "§a" },
    deaths: { colour: "§c" },
    kdr: { colour: "§6" },
    assists: { colour: "§e" },
  },
  shapes: [
    {
      modes: ["captureTheFlag"],
      stats: { wins: { colour: "§a" }, kills: { colour: "§e" }, flagCaptures: { colour: "§c" }, flagReturns: { colour: "§9" } },
    },
    {
      modes: ["domination"],
      stats: {
        wins: { colour: "§a" },
        kills: { colour: "§e" },
        score: { colour: "§6" },
        capturePoints: { colour: "§2" },
        defendPoints: { colour: "§b" },
      },
    },
    { modes: ["teamDeathmatch"], stats: { wins: { colour: "§a" }, kills: { colour: "§e" } } },
    {
      modes: WARLORDS_CLASSES,
      stats: { ...COLUMN, level: { colour: "§a" }, specification: { ...selection("§a"), label: "stats.spec" } },
    },
    { modes: WARLORDS_CLASSES.flatMap((mode) => WARLORDS_SPECS.map((spec) => `${mode}.${spec}`)), stats: COLUMN },
  ],
};
