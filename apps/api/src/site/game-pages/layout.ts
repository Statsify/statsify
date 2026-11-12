/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type ColorCode, type Game, type Stat, modeName, shapeKeys, statAt } from "@statsify/catalog";
import { freshness } from "../cooldown.js";
import { gameName, siteName } from "../names.js";
import { arrayGroup } from "@statsify/util";
import type { GameId, Player, PlayerStats } from "@statsify/schemas";
import type { GamePage, StatCell, StatSection } from "@statsify/contract";

/**
 * A stat on the page by its catalog key, below the page's place in the game (its mode, or mode and submode) unless
 * `at` says where: `""` for a game stat, or another mode's place (Arcade's Overall reads each mode's wins).
 */
export type CellSpec =
  | string
  | {
    key: string;
    at?: string;
    /** The page's color, where the card draws the stat here in another color than the catalog's. */
    color?: ColorCode;
    /** The page's heading for the stat, in place of the catalog's label or name. */
    label?: string;
    /** A shorter heading under the row's title, where the title says the rest (`stats.kills` under Final). */
    short?: string;
    name?: string | ((stats: PlayerStats) => string);
    params?: Record<string, string>;
    /** A `GameId` whose icon goes before the name. */
    icon?: string;
    /** A selection (kit, trail): a `Label: value` line. */
    inline?: boolean;
    /** Shows the cell only when this allows it (a winstreak that isn't 0), given the stored object the stat is in. */
    when?: (cell: StatCell, stats: PlayerStats, parent: Record<string, unknown>) => boolean;
    /** Whether the player hides the stat from Hypixel's API (winstreaks): the cell says so and doesn't link. */
    hidden?: (stats: PlayerStats) => boolean;
  };

/**
 * A value the page works out from stored ones where the schema stores none (Quests' Monthly Total, every game's monthly
 * quests added up). It has no leaderboard, as there's no field to rank.
 */
export interface ComputedSpec {
  key: string;
  label: string;
  color: ColorCode;
  compute: (stats: PlayerStats) => number;
}

/** An overview cell: a stat, or a value worked out from stats. */
export type OverviewSpec = CellSpec | ComputedSpec;

const isComputed = (spec: OverviewSpec): spec is ComputedSpec => typeof spec !== "string" && "compute" in spec;

/** A group of stats: the card's rows, or cells ordered and grouped as the card does. */
export interface SectionSpec {
  /** A `game.sections.*` key or the card's `stats.*` heading; none for the headline table. */
  title?: string;
  /** The card's own heading where it doesn't translate one (`§6Solo`). */
  name?: string;
  /** The card's color for the translated `title`. */
  color?: ColorCode;
  rows?: CellSpec[][];
  /** A `site.json` heading over each of `rows`, by index, or null for none (BedWars' Final and Normal). */
  rowTitles?: (string | null)[];
  /** The card's own heading over each of a list's `rows`, by index (Dropper's §cHard, §eMedium and §aEasy). */
  rowNames?: string[];
  /** Cells to order (`sort`) and group into rows (`ranks`); one row if neither is set. */
  cells?: CellSpec[];
  /**
   * By value: most first, or least first with unset values last (fastest times), or by the share of its cap, best first
   * (a period's quests done out of the game's). Ties keep the given order.
   */
  sort?: "desc" | "asc" | "share";
  /** Rows of `size` cells, the n-th in the n-th color (the last color repeats), as the card colors by rank. */
  ranks?: { size: number; colors?: ColorCode[] };
  /** One of the card's boxes drawn side by side, as Classic Duels draws Overall, Solo and Doubles. */
  box?: boolean;
  /** Name and value lines rather than table cells. */
  list?: boolean;
  /** List names in the card's own formatting rather than bold (Duels titles). */
  plain?: boolean;
  /** Folded behind its heading and count until opened. */
  collapsed?: boolean;
  /** Searched by the page's filter box, for a list too long to scan. */
  search?: boolean;
  /** Two lines across on a phone, for a list whose every line fits half its width at the widest values. */
  pairs?: boolean;
  /** Values as a tick or a cross, for whether each was done (a period's quests). */
  ticks?: boolean;
}

/** The level header: the stat its leaderboard ranks, what the card calls the level and its bar, and the level. */
export interface LevelSpec {
  key: string;
  /** Where that stat is stored below the game; a game stat by default. */
  at?: string;
  /** `stats.level` by default. */
  label?: string;
  /** `stats.progression.exp` by default. */
  progress?: string;
  /** The word at the last level: MAXED by default, PRESTIGED where reaching it prestiges (Murder Mystery's knife). */
  maxedWord?: "maxed" | "prestiged";
  /** The card's colors for the progress, where they aren't the panel's (Murder Mystery's knife). */
  colors?: { current: ColorCode; slash: ColorCode; max: ColorCode; maxed: ColorCode };
  read: (stats: PlayerStats) => Omit<
    NonNullable<GamePage["level"]>,
    "leaderboard" | "label" | "progress" | "maxedWord" | "colors"
  >;
}

/**
 * A formatted level as most games store it (BedWars' stars, The Pit's prestige and level): the level as the player
 * wears it, and the bar from the level in its standard colors, where the game stores that too, else from the level.
 */
export const formattedLevel = (stored: {
  levelFormatted: string;
  naturalLevelFormatted?: string;
  nextLevelFormatted: string;
  progression: Progression;
}): ReturnType<LevelSpec["read"]> => ({
  current: stored.levelFormatted,
  natural: stored.naturalLevelFormatted ?? stored.levelFormatted,
  next: stored.nextLevelFormatted,
  progression: { ...stored.progression },
});

/**
 * A prefix earned by a count (BlitzSG's kills, Walls' wins): the prefix with the player's own count as the level, and
 * the bar from the prefix they have reached to the next.
 */
export const prefixLevel = (stored: {
  naturalPrefix: string;
  currentPrefix: string;
  nextPrefix: string;
  progression: Progression;
}): ReturnType<LevelSpec["read"]> => ({
  current: stored.naturalPrefix,
  natural: stored.currentPrefix,
  next: stored.nextPrefix,
  progression: { ...stored.progression },
});

/**
 * The mode of the kit or class a player has selected, as the schema stores it: the mode's key in another case or with
 * underscores (`wild_specialist`, `Zombie`), or its name with spaces (`Void Crawler`). None where no mode matches.
 * `among` names the submodes to look in instead, where a mode's submodes are its classes (TNT's Wizards).
 */
export const selectedMode = (game: Game, stored: string, among: readonly string[] = game.modes.getApiModes()): string | undefined => {
  const squashed = stored.toLowerCase().replaceAll(/[^a-z]/g, "");
  return among.find((mode) => mode.toLowerCase() === squashed);
};

/** The games of a page with a mode per game (Quests, Challenges): its modes after Overall. */
export const gamesOf = (game: Game): GameId[] => game.modes.getApiModes().filter((mode) => mode !== "overall") as GameId[];

/** Overall on a page with a mode per game: each game's total (at `at`) under its name and icon, as a sorted list. */
export const rankingPage = (
  games: GameId[],
  { at, sort, color }: { at: (game: GameId) => string; sort: "desc" | "share"; color?: ColorCode }
): PageSpec => ({
  heading: { word: null },
  sections: [
    {
      cells: games.map((game) => ({ key: "total", at: at(game), name: gameName(game), icon: game, ...(color && { color }) })),
      sort,
      list: true,
    },
  ],
});

/** One page: a mode, or a mode's submode. */
export interface PageSpec {
  /**
   * Where the page's cells are stored when not at its mode (or mode and submode): `""` for a game that stores every
   * stat once for the game (Paintball, Walls).
   */
  place?: string;
  /** The card's title after the game's name; `game.stats` and the mode's name by default. */
  heading?: Partial<GamePage["heading"]>;
  /** The page's own level header, or null for none; the game's otherwise. */
  level?: LevelSpec | null;
  /** The page's own overview; the game's otherwise. */
  overview?: OverviewSpec[];
  sections: SectionSpec[];
}

/**
 * Which modes the switcher weighs for the one the player has played most. Overall and the other modes that add up
 * others never count, nor does a mode that stores none of games played, wins and losses, or wins.
 */
export interface MostPlayedSpec {
  /** Modes besides Overall that add up others (BedWars' Core). */
  skip?: string[];
  /** The modes that compete, where only some of the rest do; every mode not skipped by default. */
  among?: string[];
  /**
   * Where a mode stores its stats, when not at the mode itself (Duels' Bridge at `bridge.overall`), or the places it adds
   * up (Duels' Spleef, at `spleef.spleef` and `spleef.bowSpleef`).
   */
  place?: (mode: string) => string | string[];
  /**
   * The count to weigh by, where the usual order would pick one that only a few modes store (Arcade counts wins, since
   * only three of its games count games played).
   */
  by?: Counted;
}

/** A mode the site offers, and the second switcher it gets when its submodes split its games. */
export interface ModeSpec {
  key: string;
  submodes?: { key: string; name: string }[];
  /** The submode of the class the player has selected, where the submodes are classes (TNT's Wizards). */
  selected?: (stats: PlayerStats) => string | undefined;
  /** Marks the submode the player has played most, weighed as a game's modes are, each at `<mode>.<submode>` by default. */
  mostPlayed?: MostPlayedSpec;
}

/**
 * The site's page for one game: which of the catalog's stats it shows, in what groups and order. The bot's card for the
 * game has its own layout; both take labels, colors and leaderboards from the catalog.
 */
export interface GameLayout {
  game: Game;
  /** The page's name where it isn't a game's (Challenges), Minecraft-formatted. */
  name?: string;
  /** The modes, in order; every registry mode by default, without submodes. */
  modes?: ModeSpec[];
  /** The mode of the kit or class the player has selected, when Hypixel sends one. */
  selected?: (stats: PlayerStats) => string | undefined;
  /** The site's name for a mode whose registry name, shared with the bot, runs Hypixel's words together. */
  modeNames?: Record<string, string>;
  level?: LevelSpec;
  /** Game-wide stats and selections, game stats unless `at` says otherwise. */
  overview: OverviewSpec[];
  /**
   * The periods a mode's page covers, where the stats are counted over periods (Quests' all time, daily, weekly and
   * monthly); the first is the default. None by default.
   */
  periods?: (mode: string) => readonly string[];
  /** When a period's counts began, for counts taken at `at` (ms), for the page's dates; none for all time. */
  periodStart?: (period: string, at: number) => number | undefined;
  page: (mode: string, submode: string | undefined, period: string | undefined) => PageSpec;
  /** Marks the mode the player has played most in the switcher. */
  mostPlayed?: MostPlayedSpec;
  /** Whether the player has played the game, for a page that isn't a game's; a game's comes from its overview panel. */
  played?: (stats: PlayerStats) => boolean;
  /**
   * Stats with a leaderboard the pages leave out, by path below the game, each with why: the site shows every other one
   * (a test checks), and leaves a stat off while its stored value is wrong.
   */
  omit?: Record<string, string>;
}

/** The modes a game page offers, with any submodes; the first of each is its default. */
export function pageModes(layout: GameLayout): ModeSpec[] {
  return layout.modes ?? layout.game.modes.getApiModes().map((key) => ({ key }));
}

/** A value in a document by its dotted path (`stats.bedwars.overall.wins` in the player). */
export const read = (document: object, path: string): unknown =>
  path.split(".").reduce<unknown>((value, key) => (value as Record<string, unknown> | undefined)?.[key], document);

const parentOf = (player: Player, path: string) => (read(player, path.slice(0, path.lastIndexOf("."))) ?? {}) as Record<string, unknown>;

type Spec = Exclude<CellSpec, string>;
const specOf = (cell: CellSpec): Spec => (typeof cell === "string" ? { key: cell } : cell);

/**
 * A number the schema couldn't work out (NaN, or an Infinity) as 0. The contract's numbers reject both, so one would
 * turn the player's page into an error rather than an empty value.
 */
const finite = (value: number) => (Number.isFinite(value) ? value : 0);

/** A stat's cell as the card shows it, with the page's color, heading or icon where its layout gives one. */
function cell(player: Player, stat: Stat, spec: Spec): StatCell {
  const stored = read(player, stat.path);
  // A value the schema couldn't work out shows as one never set: 0, or the stat's own empty text.
  const raw = typeof stored === "number" ? finite(stored) : stored;
  const parent = parentOf(player, stat.path);
  // A 0 that means "never set" isn't on the leaderboard, so it doesn't link either.
  const unset = stat.unset !== undefined && !raw;
  const value = unset ? stat.unset! : stat.format ? stat.format(raw, parent) : typeof raw === "string" ? raw : Number(raw ?? 0);
  const color = spec.color ?? (typeof stat.color === "function" ? stat.color(raw, parent) : stat.color);
  const name = typeof spec.name === "function" ? spec.name(player.stats) : spec.name ?? (spec.label ? undefined : stat.name);
  const hidden = spec.hidden?.(player.stats) ?? false;

  return {
    key: stat.path.slice(stat.path.indexOf(".", "stats.".length) + 1),
    label: spec.label ?? stat.label,
    ...(spec.short && { short: spec.short }),
    ...(name !== undefined && { name: siteName(name) }),
    ...(spec.params && { params: spec.params }),
    value,
    ...(hidden && { hidden }),
    ...(stat.suffix && !hidden && { suffix: stat.suffix }),
    ...(stat.trim && { trim: true }),
    ...(stat.of !== undefined && { of: typeof stat.of === "number" ? stat.of : finite(Number(read(player, stat.of) ?? 0)) }),
    color,
    leaderboard: stat.leaderboard && !unset && !hidden && !spec.inline ? stat.path : null,
    ...(spec.icon && { icon: spec.icon }),
    ...(spec.inline && { inline: true }),
    // The catalog's own entry for what the stat means in this game, where it isn't the label's; the site derives that
    // one. A card's name, the stat's or the page's, isn't a stat to explain.
    ...(name === undefined && stat.glossary !== undefined && stat.glossary !== stat.label.slice(stat.label.lastIndexOf(".") + 1) && {
      glossary: stat.glossary,
    }),
  };
}

/** The raw number behind a cell, for ordering; an unset or NaN value counts as 0. */
const numberOf = (player: Player, stat: Stat) => Number(read(player, stat.path)) || 0;

/** Resolves a page's specs into cells, dropping those whose `when` refuses them. */
function cells(player: Player, game: Game, place: string, specs: CellSpec[]) {
  return specs.flatMap((entry) => {
    const spec = specOf(entry);
    const stat = statAt(game, spec.at ?? place, spec.key);
    const built = cell(player, stat, spec);
    return spec.when && !spec.when(built, player.stats, parentOf(player, stat.path)) ? [] : [{ stat, cell: built }];
  });
}

function section(player: Player, game: Game, place: string, spec: SectionSpec): StatSection {
  let rows: StatCell[][];

  if (spec.cells) {
    let resolved = cells(player, game, place, spec.cells);

    if (spec.sort === "desc") resolved = resolved.toSorted((a, b) => numberOf(player, b.stat) - numberOf(player, a.stat));
    if (spec.sort === "asc") {
      // Unset (0) last, as the card lists a time that was never set after every real one.
      const key = (entry: (typeof resolved)[number]) => numberOf(player, entry.stat) || Infinity;
      resolved = resolved.toSorted((a, b) => key(a) - key(b));
    }
    if (spec.sort === "share") {
      const share = ({ stat, cell }: (typeof resolved)[number]) => (cell.of ? numberOf(player, stat) / cell.of : 0);
      resolved = resolved.toSorted((a, b) => share(b) - share(a));
    }

    const flat = resolved.map(({ cell }) => cell);
    const { ranks } = spec;
    rows = ranks ? arrayGroup(flat, ranks.size) : [flat];

    if (ranks?.colors) {
      const { colors } = ranks;
      rows = rows.map((row, index) => row.map((cell) => ({ ...cell, color: colors[Math.min(index, colors.length - 1)] })));
    }
  } else {
    rows = (spec.rows ?? []).map((row) => cells(player, game, place, row).map(({ cell }) => cell));
  }

  // A row whose cells all fell to their `when`s goes, and its heading with it.
  const kept = rows.flatMap((row, index) => (row.length > 0 ? [index] : []));
  const titles = spec.rows && spec.rowTitles;
  const names = spec.rows && spec.rowNames;

  return {
    title: spec.title ?? null,
    ...(spec.name && { name: spec.name }),
    ...(spec.color && { color: spec.color }),
    rows: kept.map((index) => rows[index]),
    ...(titles && { rowTitles: kept.map((index) => titles[index] ?? null) }),
    ...(names && { rowNames: kept.map((index) => names[index]) }),
    ...(spec.box && { box: true }),
    ...(spec.list && { list: true }),
    ...(spec.plain && { plain: true }),
    ...(spec.collapsed && { collapsed: true }),
    ...(spec.search && { search: true }),
    ...(spec.pairs && { pairs: true }),
    ...(spec.ticks && { ticks: true }),
  };
}

/** The overview's cells: its stats, and the values it works out (with no leaderboard). */
function overview(player: Player, game: Game, specs: OverviewSpec[]): StatCell[] {
  return specs.flatMap((spec) =>
    isComputed(spec) ?
      [{ key: spec.key, label: spec.label, value: finite(spec.compute(player.stats)), color: spec.color, leaderboard: null }] :
      cells(player, game, "", [spec]).map(({ cell }) => cell));
}

type Counted = NonNullable<GamePage["modes"][number]["mostPlayed"]>;

/** What each way of counting adds up, in the order a game's modes are weighed by. */
const COUNTS: [by: Counted, keys: string[]][] = [
  ["gamesPlayed", ["gamesPlayed"]],
  ["winsLosses", ["wins", "losses"]],
  ["wins", ["wins"]],
];

/**
 * The mode (or a mode's submode) the player has played most, counted the first way any competing one stores (games
 * played, else wins and losses, else wins alone) unless the game names one, so each is weighed by the same count and
 * one that doesn't store it counts 0. A tie goes to the first, and nothing played marks nothing.
 */
function mostPlayed(player: Player, game: Game, modes: { key: string }[], spec: MostPlayedSpec) {
  const skip = ["overall", ...(spec.skip ?? [])];
  const competing = modes.map(({ key }) => key).filter((mode) => !skip.includes(mode) && (spec.among?.includes(mode) ?? true));
  const places = (mode: string) => [spec.place?.(mode) ?? mode].flat();
  const stores = (place: string, keys: string[]) => keys.every((key) => shapeKeys(game, place).includes(key));
  const count = COUNTS.find(([by, keys]) =>
    spec.by ? by === spec.by : competing.some((mode) => places(mode).some((place) => stores(place, keys))));
  if (!count) return;

  const [by, keys] = count;
  let most: { mode: string; played: number } | undefined;

  for (const mode of competing) {
    let played = 0;
    for (const place of places(mode).filter((place) => stores(place, keys))) {
      for (const key of keys) played += numberOf(player, statAt(game, place, key));
    }
    if (played > (most?.played ?? 0)) most = { mode, played };
  }

  return most && { mode: most.mode, by };
}

type Progression = NonNullable<GamePage["level"]>["progression"];

/**
 * A level's progression as the panel draws it. The last level has no next step: the schema leaves `max` out, and a
 * stored player reads it back as 0. Hypixel also keeps counting past a max (a Murder Mystery knife at 942 of 500).
 * Either way the panel says MAXED, as the card does, rather than "/0" or a bar past its end. Otherwise the percent
 * stays within the bar.
 */
export function levelProgression(progression: Progression): Progression {
  const current = finite(progression.current);
  const max = finite(progression.max ?? 0);
  if (!max || current >= max) return { current, percent: 1 };
  return { current, max, percent: Math.min(1, Math.max(0, finite(progression.percent))) };
}

function level(player: Player, game: Game, spec: LevelSpec): NonNullable<GamePage["level"]> {
  const stat = statAt(game, spec.at ?? "", spec.key);
  const { progression, ...read } = spec.read(player.stats);

  return {
    label: spec.label ?? "stats.level",
    ...read,
    progression: levelProgression(progression),
    progress: spec.progress ?? "stats.progression.exp",
    ...(spec.maxedWord && { maxedWord: spec.maxedWord }),
    ...(spec.colors && { colors: spec.colors }),
    leaderboard: stat.leaderboard ? stat.path : null,
  };
}

/** A page's name: its own, or its game's. */
export function pageName(layout: GameLayout): string {
  if (layout.name) return layout.name;
  if (!layout.game.id) throw new Error(`${layout.game.key} has neither a name nor a game id`);
  return gameName(layout.game.id);
}

/**
 * The `player.game` view model, but for the nav to the player's other games: one page of one game, in one of its
 * mode's periods where it has them (the first by default).
 */
export function buildGamePage(
  player: Player,
  layout: GameLayout,
  mode: string,
  submode?: string,
  period?: string
): Omit<GamePage, "games"> {
  const { game } = layout;
  const modes = pageModes(layout);
  const modeSpec = modes.find(({ key }) => key === mode);
  if (!modeSpec) throw new Error(`${game.key} has no ${mode} page`);

  const name = (key: string) => layout.modeNames?.[key] ?? siteName(modeName(game, key));
  const submodes = modeSpec.submodes ?? [];
  const sub = submodes.length > 0 ? submode ?? submodes[0].key : undefined;
  const periods = layout.periods?.(mode) ?? [];
  const shownPeriod = periods.length > 0 ? period ?? periods[0] : undefined;
  if (shownPeriod !== undefined && !periods.includes(shownPeriod)) throw new Error(`${game.key} has no ${mode} ${shownPeriod} page`);
  const page = layout.page(mode, sub, shownPeriod);
  const { updatedAt } = freshness(player);
  const start = shownPeriod === undefined ? undefined : layout.periodStart?.(shownPeriod, updatedAt);
  const place = page.place ?? (sub ? `${mode}.${sub}` : mode);
  const selected = layout.selected?.(player.stats);
  const selectedSub = modeSpec.selected?.(player.stats);
  const levelSpec = page.level === undefined ? layout.level : page.level;
  const most = layout.mostPlayed && mostPlayed(player, game, modes, layout.mostPlayed);
  const subMost = modeSpec.mostPlayed && mostPlayed(player, game, submodes, { place: (key) => `${mode}.${key}`, ...modeSpec.mostPlayed });

  return {
    uuid: player.uuid,
    username: player.username,
    displayName: player.displayName,
    game: { key: game.key, id: game.id, name: pageName(layout) },
    heading: {
      word: "game.stats",
      // A game with one mode leaves it out of the title, as its card does.
      mode: modes.length > 1 ? `${name(mode)}${sub ? ` ${submodes.find(({ key }) => key === sub)?.name}` : ""}` : null,
      ...page.heading,
    },
    modes: modes.map(({ key }) => ({
      key,
      name: name(key),
      ...(key === selected && { selected: true }),
      ...(key === most?.mode && { mostPlayed: most.by }),
    })),
    mode,
    submodes: submodes.map((submode) => ({
      ...submode,
      ...(submode.key === selectedSub && { selected: true }),
      ...(submode.key === subMost?.mode && { mostPlayed: subMost.by }),
    })),
    submode: sub ?? null,
    ...(shownPeriod !== undefined && { periods: [...periods], period: shownPeriod }),
    ...(start !== undefined && { window: { start, end: updatedAt } }),
    level: levelSpec ? level(player, game, levelSpec) : null,
    overview: overview(player, game, page.overview ?? layout.overview),
    sections: page.sections
      .map((spec) => section(player, game, place, spec))
      .filter(({ rows }) => rows.length > 0),
    updatedAt,
    expiresAt: player.expiresAt,
  };
}

/** Every page of a layout: each mode, each of its submodes, and each of its periods. */
export function pagesOf(layout: GameLayout): { mode: string; submode?: string; period?: string }[] {
  return pageModes(layout).flatMap(({ key: mode, submodes }) => {
    const pages = submodes?.length ? submodes.map(({ key: submode }) => ({ mode, submode })) : [{ mode }];
    const periods = layout.periods?.(mode) ?? [];
    return periods.length > 0 ? pages.flatMap((page) => periods.map((period) => ({ ...page, period }))) : pages;
  });
}

/** Every stat a layout can show, by path, whatever its `when`s decide: for the tests. Throws for a key not in the catalog. */
export function shownPaths(layout: GameLayout): Set<string> {
  const { game } = layout;
  const shown = new Set<string>();
  const add = (place: string, specs: OverviewSpec[]) => {
    for (const entry of specs) {
      // A worked-out value has no field.
      if (isComputed(entry)) continue;
      const spec = specOf(entry);
      shown.add(statAt(game, spec.at ?? place, spec.key).path);
    }
  };

  for (const { mode, submode, period } of pagesOf(layout)) {
    const page = layout.page(mode, submode, period);
    const level = page.level === undefined ? layout.level : page.level;
    if (level) shown.add(statAt(game, level.at ?? "", level.key).path);
    add("", page.overview ?? layout.overview);
    const place = page.place ?? (submode ? `${mode}.${submode}` : mode);
    for (const spec of page.sections) add(place, [...(spec.rows ?? []).flat(), ...(spec.cells ?? [])]);
  }

  return shown;
}
