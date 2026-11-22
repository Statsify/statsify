/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type CellSpec, type GameLayout, type LevelSpec, type PageSpec, type SectionSpec, submodeOptions } from "./layout.js";
import { DUELS, shapeAt, shapeKeys } from "@statsify/catalog";
import { type ApiModeFromGameModes, DUELS_MODES, type DuelsModes, type PlayerStats } from "@statsify/schemas";
import { prettify } from "@statsify/util";

const titled = ({ duels }: PlayerStats, mode: string) => duels[mode as ApiModeFromGameModes<DuelsModes>];

/** Where a mode keeps the wins its title counts: its Overall where it has submodes, both Spleef modes' total for Spleef. */
const winsOf = (mode: string): { key: string; at: string } => {
  if (mode === "spleef") return { key: "overallWins", at: "spleef" };
  return { key: "wins", at: shapeAt(DUELS, `${mode}.overall`) ? `${mode}.overall` : mode };
};

/** The card's header line for a mode: its title, the bar to the next one, and Win Progress, linked to the wins. */
const title = (mode: string): LevelSpec => ({
  ...winsOf(mode),
  label: "stats.title",
  progress: "stats.progression.win",
  read: (stats) => {
    const { titleFormatted, titleLevelFormatted, nextTitleLevelFormatted, progression } = titled(stats, mode);
    return { current: titleFormatted, natural: titleLevelFormatted, next: nextTitleLevelFormatted, progression: { ...progression } };
  },
});

const RECORD = ["wins", "losses", "wlr"];
const KILLS = ["kills", "deaths", "kdr"];
const WINSTREAK_KEYS = ["winstreak", "bestWinstreak"];

// Hypixel leaves winstreaks out for a player who hides them, which reads back as 0. One win is a streak of one, so
// wins with no best winstreak mean they're hidden.
export const winstreaksHidden = ({ duels }: PlayerStats) => duels.overall.wins > 0 && !duels.overall.bestWinstreak;

const streak = (key: string, at?: string): CellSpec => ({ key, ...(at && { at }), hidden: winstreaksHidden });

/** The modes on Overall's Titles, as the card lists them (every mode but Arena), each with its title and wins. */
const TITLES: CellSpec[] = [
  "bedwars", "blitzsg", "bow", "spleef", "boxing", "bridge", "classic", "combo", "megawalls", "nodebuff", "op", "quake", "parkour",
  "skywars", "sumo", "uhc",
].map((mode) => ({ ...winsOf(mode), name: (stats: PlayerStats) => titled(stats, mode).titleFormatted, color: "§f" }));

/** The Bridge and UHC submodes whose card shows the mode's overall Shots Fired in place of their own. */
const SHOTS_FIRED_OFF = ["bridge.solo", "bridge.doubles", "bridge.threes", "bridge.fours", "uhc.solo", "uhc.doubles", "uhc.fours", "uhc.deathmatch"];

/** The card's sidebar rows that belong to the mode (the game's go in the overview), and UHC's golden apples on its Overall. */
function more(place: string): SectionSpec {
  const stored = shapeKeys(DUELS, place);
  const keys = ["shotsFired", "headshots", "bestTime", "checkpoints", "itemsPurchased", "blocksBroken"]
    .filter((key) => stored.includes(key))
    .filter((key) => key !== "shotsFired" || !SHOTS_FIRED_OFF.includes(place));
  const rows: CellSpec[][] = [place === "uhc.overall" ? [...keys, { key: "gapplesEaten", at: "uhc" }] : keys];
  if (stored.includes("kit")) rows.push([{ key: "kit", inline: true }]);
  return { title: "game.sections.more", rows };
}

/** Classic, OP and SkyWars: the card's three boxes, Overall, Solo and Doubles, each with its own Shots Fired. */
const boxes = (mode: string): SectionSpec[] =>
  ["overall", "solo", "doubles"].map((box) => ({
    name: `§6${prettify(box)}`,
    box: true,
    rows: [WINSTREAK_KEYS, ["wins", "kills"], ["losses", "deaths"], ["wlr", "kdr"], ["shotsFired"]].map((row) =>
      row.map((key) => (WINSTREAK_KEYS.includes(key) ? streak(key, `${mode}.${box}`) : { key, at: `${mode}.${box}` }))),
  }));

/** A mode's submodes as the registry names them. Overall's Titles are a section of its page, not a submode. */
const submodesOf = (mode: string) =>
  mode === "overall" ?
    [] :
    submodeOptions(DUELS_MODES.getModes().find(({ api }) => api === mode)?.submodes ?? []);

function page(mode: string, submode: string | undefined): PageSpec {
  const place = submode ? `${mode}.${submode}` : mode;
  const level = title(mode);

  if (mode === "classic" || mode === "op" || mode === "skywars") {
    return { level, sections: [...boxes(mode), ...(mode === "skywars" ? [more("skywars")] : [])] };
  }

  const stored = shapeKeys(DUELS, place);
  const rows: CellSpec[][] = [WINSTREAK_KEYS.map((key) => streak(key))];

  if (mode === "bridge") rows.push([...RECORD, "goals"], KILLS);
  else if (place === "bedwars.overall") rows.push(RECORD, ["finalKills", "finalDeaths", "fkdr"], KILLS, ["bedsBroken", "bedsLost", "bblr"]);
  else rows.push(RECORD, ...(stored.includes("kills") ? [KILLS] : []));

  const sections: SectionSpec[] = [{ rows }, more(place)];
  if (mode === "overall") sections.push({ title: "game.sections.titles", cells: TITLES, sort: "desc", list: true, plain: true });

  // BedWars and Spleef name their games without the mode, as the card does ("Bed Rush", "Bow Spleef").
  const own = (mode === "bedwars" && submode !== "overall") || mode === "spleef";
  const name = submodesOf(mode).find(({ key }) => key === submode)?.name;

  return { level, ...(own && name && { heading: { mode: name } }), sections };
}

export const DUELS_PAGE: GameLayout = {
  game: DUELS,
  modes: DUELS_MODES.getApiModes().map((key) => {
    const submodes = submodesOf(key);
    return submodes.length > 0 ? { key, submodes } : { key };
  }),
  overview: ["tokens", "pingRange", { key: "blocksPlaced", at: "overall" }],
  page,
  // A mode with submodes is weighed at its Overall (Bridge at `bridge.overall`), or by its submodes added up where it has
  // none (Spleef's two).
  mostPlayed: {
    place: (mode) => {
      if (shapeAt(DUELS, `${mode}.overall`)) return `${mode}.overall`;
      const submodes = submodesOf(mode).map(({ key }) => `${mode}.${key}`);
      return submodes.length > 0 ? submodes : mode;
    },
  },
  omit: {
    ...Object.fromEntries(
      SHOTS_FIRED_OFF.map((place) => [`${place}.shotsFired`, "The card shows the mode's overall Shots Fired here, not this submode's."])
    ),
  },
};
