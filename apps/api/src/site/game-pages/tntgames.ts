/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type CellSpec, type GameLayout, type LevelSpec, type PageSpec, prefixLevel, selectedMode } from "./layout.js";
import { type ColourCode, TNT_GAMES, TNT_WIZARDS_CLASSES, modeName } from "@statsify/catalog";

type Prefixed = "tntRun" | "pvpRun" | "bowSpleef" | "tntTag" | "wizards";

/** A mode's prefix, set by its wins, as the card's header shows it; a Wizards class shows the Wizards prefix. */
const prefix = (mode: Prefixed): LevelSpec => ({
  key: "wins",
  at: mode,
  label: "stats.prefix",
  progress: "stats.progression.win",
  read: ({ tntgames }) => prefixLevel(tntgames[mode]),
});

/** A mode's best time, which a session leaves out, as the bot's does. */
const RECORD: CellSpec = { key: "record", session: false };

/** The colours of a column's cells on Overall, by their place in it, whatever the stat. */
const PLACES: ColourCode[] = ["§a", "§c", "§6"];

/** Overall's five columns, each a mode's three stats, as the card draws them; Overall stores none of its own. */
const COLUMNS: [mode: Prefixed, keys: string[]][] = [
  ["tntRun", ["wins", "wlr", "record"]],
  ["pvpRun", ["wins", "kills", "kdr"]],
  ["bowSpleef", ["wins", "hits", "wlr"]],
  ["tntTag", ["wins", "kills", "tags"]],
  ["wizards", ["wins", "kills", "kdr"]],
];

const OVERALL: PageSpec = {
  sections: COLUMNS.map(([mode, keys]) => ({
    name: `§6${modeName(TNT_GAMES, mode)}`,
    box: true,
    rows: [keys.map((key, index): CellSpec => ({ ...(key === "record" ? RECORD : { key }), at: mode, colour: PLACES[index] }))],
  })),
};

/** Each mode's table, a lone sidebar stat (TNT Tag's Power-Ups) last. */
const TABLES: Record<Exclude<Prefixed, "wizards">, CellSpec[][]> = {
  tntRun: [["wins", "losses", "wlr"], ["potionsSplashed", "blocksRan", RECORD]],
  pvpRun: [["kills", "deaths", "kdr"], ["wins", RECORD]],
  bowSpleef: [["wins", "losses", "wlr", "hits"]],
  tntTag: [["kills", "deaths", "kdr"], ["wins", "tags", "powerups"]],
};

/** Wizards' Overall, stored on the mode itself: the class as a line, then its table with Power Orbs last. */
const WIZARDS: PageSpec = {
  place: "wizards",
  level: prefix("wizards"),
  sections: [{ rows: [[{ key: "class", inline: true }], ["kills", "deaths", "kdr", "assists"], ["wins", "points", "airTime", "powerOrbs"]] }],
};

/**
 * The card's pages: Overall's five columns, with no level, then a table per mode under its prefix. Wizards' classes
 * are submodes, Overall first, the player's own marked.
 */
export const TNT_GAMES_PAGE: GameLayout = {
  game: TNT_GAMES,
  modes: TNT_GAMES.modes.getModes().map(({ api, submodes }) =>
    api === "wizards" ?
      {
        key: api,
        submodes: submodes.map(({ api: key, formatted: name }) => ({ key, name })),
        selected: ({ tntgames }) => selectedMode(TNT_GAMES, tntgames.wizards.class, TNT_WIZARDS_CLASSES),
      } :
      { key: api }),
  overview: ["coins", "wins"],
  // By wins, which every mode stores; only TNT Run and Bow Spleef store losses.
  mostPlayed: { by: "wins" },
  page: (mode, submode) => {
    if (mode === "overall") return OVERALL;
    if (mode !== "wizards") return { level: prefix(mode as Prefixed), sections: [{ rows: TABLES[mode as keyof typeof TABLES] }] };
    if (submode === "overall") return WIZARDS;
    return { level: prefix("wizards"), sections: [{ rows: [["kills", "deaths", "kdr", "assists"]] }] };
  },
};
