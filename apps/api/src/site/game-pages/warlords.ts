/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { CellSpec, GameLayout, PageSpec } from "./layout.js";
import { type ClassMetadata, METADATA_KEY, WarlordsMage, WarlordsPaladin, WarlordsShaman, WarlordsWarrior } from "@statsify/schemas";
import { type ColourCode, WARLORDS, WARLORDS_CLASSES, WARLORDS_SPECS } from "@statsify/catalog";

/** Each class's schema type, whose metadata names its specs (`@Field` leaderboard names the bot doesn't localize). */
const CLASS_TYPES: Record<string, { prototype: object }> = {
  mage: WarlordsMage,
  warrior: WarlordsWarrior,
  paladin: WarlordsPaladin,
  shaman: WarlordsShaman,
};

const specName = (mode: string, spec: string) =>
  (Reflect.getMetadata(METADATA_KEY, CLASS_TYPES[mode].prototype) as ClassMetadata)[spec].leaderboard.name;

/** The card's colours: each class's column heading, and each spec's by its place (attack, defense, healer). */
const CLASS_COLOURS: Record<string, ColourCode> = { mage: "§b", warrior: "§7", paladin: "§e", shaman: "§2" };
const SPEC_COLOURS: ColourCode[] = ["§4", "§7", "§3"];

const COLUMN = ["wins", "damage", "healing", "prevent", "total"];

/** Overall's and each game mode's table, as the card draws them. */
const TABLES: Record<string, PageSpec> = {
  overall: { place: "", sections: [{ rows: [["wins", "losses", "wlr", "gamesPlayed"], ["kills", "deaths", "kdr", "assists"]] }] },
  captureTheFlag: { sections: [{ rows: [["wins", "kills"], ["flagCaptures", "flagReturns"]] }] },
  domination: { sections: [{ rows: [["wins", "kills", "score"], ["capturePoints", "defendPoints"]] }] },
  teamDeathmatch: { sections: [{ rows: [["wins", "kills"]] }] },
};

/** A class's page: its level and spec over its column of the card, then a section per spec under the spec's name. */
const classPage = (mode: string): PageSpec => ({
  overview: ["coins", { key: "specification", at: mode, inline: true }, { key: "level", at: mode }],
  sections: [
    { name: `${CLASS_COLOURS[mode]}Overall`, rows: [COLUMN] },
    ...WARLORDS_SPECS.map((spec, index) => ({
      name: `${SPEC_COLOURS[index]}${specName(mode, spec)}`,
      rows: [COLUMN.map((key): CellSpec => ({ key, at: `${mode}.${spec}` }))],
    })),
  ],
});

/**
 * The title from wins, the coins and the player's class and spec, then Overall's table (the game's own fields) or each
 * game mode's; a class's page has its own overview, its column and its three specs.
 */
export const WARLORDS_PAGE: GameLayout = {
  game: WARLORDS,
  selected: ({ warlords }) => warlords.class,
  level: {
    key: "wins",
    label: "stats.title",
    progress: "stats.progression.win",
    read: ({ warlords }) => ({
      current: warlords.titleFormatted,
      natural: warlords.titleFormatted,
      next: warlords.nextTitleFormatted,
      progression: { ...warlords.progression },
    }),
  },
  // The chosen class's spec: one line, read from wherever that class keeps it.
  overview: [
    "coins",
    { key: "class", inline: true },
    ...WARLORDS_CLASSES.map((mode): CellSpec => ({
      key: "specification",
      at: mode,
      inline: true,
      when: (_, { warlords }) => warlords.class === mode,
    })),
  ],
  // A class's games are the game modes' too, so the classes compete among themselves.
  mostPlayed: { among: WARLORDS_CLASSES },
  page: (mode) => (WARLORDS_CLASSES.includes(mode) ? classPage(mode) : TABLES[mode]),
};
