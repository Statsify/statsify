/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { CellSpec, GameLayout, SectionSpec } from "./layout.js";
import { MURDER_MYSTERY } from "@statsify/catalog";

const KILLS = ["kills", "deaths", "kdr", "killsAsMurderer"];
const WEAPONS = ["thrownKnifeKills", "trapKills", "heroKills", "bowKills", "suicides"];

/** The card's table for each mode. */
const TABLES: Record<string, CellSpec[][]> = {
  overall: [["wins", "murdererWins", "detectiveWins", "heroWins"], KILLS, WEAPONS],
  classic: [["wins", "murdererWins", "detectiveWins"], KILLS, WEAPONS, [{ key: "fastestMurdererWin", session: false }, { key: "fastestDetectiveWin", session: false }]],
  assassins: [["wins", "kills", "deaths", "kdr"], ["thrownKnifeKills", "trapKills", "bowKills"]],
  infection: [["wins", { key: "lastAliveGames", session: false }], ["killsAsInfected", "killsAsSurvivor"], ["alphaWins", "killsAsAlpha"]],
};

/** What the card leaves off Assassins and Infection, which have leaderboards. */
const MORE: Record<string, string[]> = {
  assassins: ["knifeKills"],
  infection: ["kills", "deaths", "kdr", "bowKills"],
};

/**
 * The card's header, with the active knife's prestige as the level and the prefix as a line, over a table per mode; the
 * card's per-mode sidebar rows are each mode's Games.
 */
export const MURDER_MYSTERY_PAGE: GameLayout = {
  game: MURDER_MYSTERY,
  level: {
    key: "knife.name",
    label: "stats.knife",
    maxedWord: "prestiged",
    colours: { current: "§e", slash: "§7", max: "§d", maxed: "§d" },
    // The knife's name stands in for a level, so its bar has none at either end.
    read: ({ murdermystery: { knife } }) => ({ current: `§a${knife.name}`, natural: "", next: "", progression: { ...knife.progression } }),
  },
  overview: ["tokens", { key: "prefix", inline: true }],
  mostPlayed: {},
  page: (mode) => {
    const sections: SectionSpec[] = [
      { rows: TABLES[mode === "doubleUp" ? "classic" : mode] },
      { title: "game.sections.games", rows: [["gamesPlayed", "goldPickedUp"]] },
    ];
    if (MORE[mode]) sections.push({ title: "game.sections.more", rows: [MORE[mode]] });
    return { sections };
  },
};
