/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BoxPanels, GameShell, HeadlinePanels, type Level } from "~/features/game/game-page";
import { Children, Fragment, type ReactElement, type ReactNode, createContext, isValidElement, use } from "react";
import { CompareSection, CompareShell, type Pair, compareSides } from "~/features/compare/compare-page";
import { SectionTitle, StatPanel } from "~/features/game/stat-panel";
import type { GameContent, GameFrame, GameStatsPage, Heading } from "~/features/game/game-data";
import type { StatCell, StatSection } from "@statsify/contract";

type Leaf = number | string;

/** A stat's path below the game in the game's stats (`solo.wins`), checked against its schema. */
export type StatPath<T> = {
  [K in keyof T & string]: NonNullable<T[K]> extends Leaf ? K : NonNullable<T[K]> extends object ? `${K}.${StatPath<NonNullable<T[K]>>}` : never;
}[keyof T & string];

/** One stat as a game's page shows it. Anything read from the player's stats is a function of them, as a comparison has two. */
export interface StatProps<G> {
  path: StatPath<G>;
  /** The bot's color code, or one by the value (a challenge is green once done). */
  color: string | ((value: number) => string);
  /** A `stats.*` locale key; `stats.<the path's last key>` by default. */
  label?: string;
  /** A shorter label under its row's heading (Kills under Final). */
  short?: string;
  /** The card's own Minecraft-formatted name in place of the label; a stat the API names (a challenge) has it already. */
  name?: (stats: G) => string;
  /** The stat it is out of (`12/25`). */
  of?: StatPath<G>;
  suffix?: string;
  /** Text for the value where the card doesn't print the number (a time, a kit's name). */
  format?: (value: Leaf) => string;
  /** What the card prints for a 0 that means "never set"; such a 0 isn't on the leaderboard. */
  unset?: string;
  /** A selection (a kit): a `Label: value` line rather than a cell, never a link. */
  inline?: boolean;
  /** The player hides it from Hypixel's API, so the page says Hidden. */
  hidden?: (stats: G) => boolean;
  /** Left out where this is false for the player (for both, on a comparison). */
  show?: (stats: G) => boolean;
  /** Left off a session's page: the difference between two saves means nothing for a streak, a best or a setting. */
  session?: false;
}

/** What a page reads at runtime, its paths and functions no longer tied to one game's stats. */
type AnyStat = Omit<StatProps<object>, "path" | "of" | "name" | "hidden" | "show"> & {
  path: string;
  of?: string;
  name?: (stats: object) => string;
  hidden?: (stats: object) => boolean;
  show?: (stats: object) => boolean;
};

/** Marks a stat for the table or list around it, which reads it; it draws nothing on its own. */
export const Stat: <G>(props: StatProps<G>) => null = () => null;

/** `Stat` for one game's stats, so its paths are checked against them. */
export const statFor = <G,>() => Stat as (props: StatProps<G>) => null;

/** A row of a table's `<Stat>`s, under a heading where it has one (Final, Normal). */
export const StatRow: (props: { title?: string; children: ReactNode }) => null = () => null;

/** The level header a game's stats give, linked to the leaderboard of the stat `key` names. */
export interface LevelText {
  key: string;
  /** `stats.level` by default. */
  label?: string;
  current: string;
  natural: string;
  next: string;
  progression: Level["progression"];
  /** `stats.progression.exp` by default. */
  progress?: string;
}

/** A game the site lays out itself. The API checks a page's mode against the game's registry, so `M` holds. */
export interface StatsGame<G = object, M extends string = string> {
  Page(props: { mode: M; submode: string | null }): ReactNode;
  /** The card's title where it isn't "Stats (Mode Submode)". */
  heading?(page: GameFrame): Partial<Heading>;
  level(stats: G, mode: M): LevelText | null;
  /** The game-wide stats over the mode's, as `<Stat>`s. */
  overview(mode: M): ReactNode;
  /** The mode's first table, as `<StatRow>`s: the page leads with it, and its link preview quotes it. */
  headline(mode: M, submode: string | null): ReactNode;
}

/** A page as the parts read it: the player's stats, and what every player's page of the game shares. */
export type StatsPage = GameStatsPage & GameContent;

/** Where a page reads its stats: the player's, what they gained in a session, or two players' side by side. */
export type StatsSource = { game: StatsGame } & (
  | { kind: "player" | "session"; page: StatsPage }
  | { kind: "compare"; a: StatsPage; b: StatsPage }
);

export const StatsContext = createContext<StatsSource | null>(null);

function useSource(): StatsSource {
  const source = use(StatsContext);
  if (!source) throw new Error("A game's stats parts need a StatsContext");
  return source;
}

/** The player's stats on their own page or a session's, to order a list by; none on a comparison, which has no lists. */
export function usePlayerStats<G>(): G | null {
  const source = useSource();
  return source.kind === "compare" ? null : (source.page.stats as G);
}

/** The card's own names for the game's stats (a challenge's), the same for every player. */
export function useStatNames(): Record<string, string> {
  const source = useSource();
  return source.kind === "compare" ? source.a.names : source.page.names;
}

function elementsOf(children: ReactNode): ReactElement[] {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement(child)) return [];
    if (child.type === Fragment) return elementsOf((child.props as { children?: ReactNode }).children);
    return [child];
  });
}

/** The `<Stat>`s a list or a row holds. */
export const statsIn = (children: ReactNode): AnyStat[] =>
  elementsOf(children).map((element) => {
    if (element.type !== Stat) throw new Error("A stat list or row holds only <Stat>s");
    return element.props as AnyStat;
  });

/** The `<StatRow>`s a table holds. */
export const rowsIn = (children: ReactNode): { title?: string; stats: AnyStat[] }[] =>
  elementsOf(children).map((element) => {
    if (element.type !== StatRow) throw new Error("A stat table holds only <StatRow>s");
    const { title, children: stats } = element.props as { title?: string; children: ReactNode };
    return { title, stats: statsIn(stats) };
  });

/** A value in the stats by its dotted path. */
export const readStat = (stats: object, path: string): unknown =>
  path.split(".").reduce<unknown>((value, key) => (value as Record<string, unknown> | undefined)?.[key], stats);

// A value the schema couldn't work out (NaN) shows as one never set.
const finite = (value: number) => (Number.isFinite(value) ? value : 0);

// By the content's own list, which the query cache keeps, as a page with it is put together on every render.
const rankedSets = new WeakMap<readonly string[], Set<string>>();

function isRanked(page: StatsPage, path: string) {
  let ranked = rankedSets.get(page.ranked);
  if (!ranked) rankedSets.set(page.ranked, (ranked = new Set(page.ranked)));
  return ranked.has(path);
}

/** One stat of a player's (or a session's) stats as the page draws it. A session's numbers rank nowhere. */
function cellOf(stat: AnyStat, page: StatsPage, session: boolean): StatCell {
  const { stats } = page;
  const stored = readStat(stats, stat.path);
  const raw = typeof stored === "number" ? finite(stored) : stored;
  const unset = stat.unset !== undefined && !raw;
  const value = unset ? stat.unset! : stat.format ? stat.format(raw as Leaf) : typeof raw === "string" ? raw : Number(raw ?? 0);
  const color = typeof stat.color === "function" ? stat.color(Number(raw)) : stat.color;
  const name = stat.name ? stat.name(stats) : stat.label ? undefined : page.names[stat.path];
  const hidden = stat.hidden?.(stats) ?? false;
  const of = stat.of === undefined || session ? undefined : finite(Number(readStat(stats, stat.of) ?? 0));

  return {
    key: stat.path,
    label: stat.label ?? `stats.${stat.path.slice(stat.path.lastIndexOf(".") + 1)}`,
    ...(stat.short && { short: stat.short }),
    ...(name !== undefined && { name }),
    value,
    ...(hidden && { hidden }),
    ...(stat.suffix && !hidden && { suffix: stat.suffix }),
    ...(of !== undefined && { of }),
    color,
    leaderboard: !session && isRanked(page, stat.path) && !unset && !hidden && !stat.inline ? `stats.${page.game.key}.${stat.path}` : null,
    ...(stat.inline && { inline: true }),
  };
}

/** The stats a page shows: a session leaves off its `session={false}`s, and in a list the ones it didn't move. */
export const cellsOf = (stats: AnyStat[], page: StatsPage, session: boolean, list = false): StatCell[] =>
  stats
    .filter((stat) => !(session && stat.session === false) && (stat.show?.(page.stats) ?? true))
    .map((stat) => cellOf(stat, page, session))
    .filter((cell) => !session || !list || cell.value !== 0);

/** Both players' values of each stat that shows for both; a selection (a kit) has no difference to show. */
export const pairsOf = (stats: AnyStat[], a: StatsPage, b: StatsPage): Pair[] =>
  stats
    .filter((stat) => !stat.inline && [a, b].every((page) => stat.show?.(page.stats) ?? true))
    .map((stat) => ({ a: cellOf(stat, a, false), b: cellOf(stat, b, false) }));

interface TableHeading {
  /** A `game.sections.*` key in `site.json`, or the card's `stats.*` heading. */
  title?: string;
  /** The card's own Minecraft-formatted heading (`§6Solo`). */
  name?: string;
  color?: string;
}

/** A table's rows as the page draws them, without the rows a session empties, or nothing when it empties them all. */
function tableOf(rows: ReturnType<typeof rowsIn>, page: StatsPage, session: boolean, { title, name, color }: TableHeading): StatSection | null {
  const kept = rows.map((row) => ({ title: row.title, cells: cellsOf(row.stats, page, session) })).filter(({ cells }) => cells.length > 0);
  if (kept.length === 0) return null;
  const titled = rows.some((row) => row.title !== undefined);

  return {
    title: title ?? null,
    ...(name && { name }),
    ...(color && { color }),
    rows: kept.map(({ cells }) => cells),
    ...(titled && { rowTitles: kept.map((row) => row.title ?? null) }),
  };
}

function CompareTable({ heading, stats, a, b }: { heading: TableHeading; stats: AnyStat[]; a: StatsPage; b: StatsPage }) {
  const pairs = pairsOf(stats, a, b);
  if (pairs.length === 0) return null;
  const titled = heading.title !== undefined || heading.name !== undefined;
  const title = titled && <SectionTitle section={{ title: heading.title ?? null, name: heading.name, color: heading.color, rows: [] }} />;
  return <CompareSection title={title} pairs={pairs} sides={compareSides(a, b)} />;
}

/** A table of `<StatRow>`s, as the card draws it; on a comparison, a row per player. */
export function StatTable({ children, ...heading }: TableHeading & { children: ReactNode }) {
  const source = useSource();
  const rows = rowsIn(children);

  if (source.kind === "compare") return <CompareTable heading={heading} stats={rows.flatMap(({ stats }) => stats)} a={source.a} b={source.b} />;

  const section = tableOf(rows, source.page, source.kind === "session", heading);
  return section && <StatPanel section={section} username={source.page.username} />;
}

/** The mode's first table (`children`, its `<StatRow>`s), and from `lg` up its other tables (`aside`) beside it. */
export function Headline({ children, aside, ...heading }: TableHeading & { children: ReactNode; aside?: ReactNode }) {
  const source = useSource();

  if (source.kind === "compare") {
    return (
      <>
        <StatTable {...heading}>{children}</StatTable>
        {aside}
      </>
    );
  }

  const section = tableOf(rowsIn(children), source.page, source.kind === "session", heading);
  return section && <HeadlinePanels headline={section} username={source.page.username} aside={aside} />;
}

/** The card's boxes side by side (each a `<StatTable>` with its name), in as many columns from `lg` up. */
export function Boxes({ children }: { children: ReactNode }) {
  return useSource().kind === "compare" ? children : <BoxPanels>{children}</BoxPanels>;
}

/** Name and value lines (titles, challenges) under a heading, left off a comparison, as two players' lists differ. */
export function StatList({ title, plain = false, children }: { title?: string; plain?: boolean; children: ReactNode }) {
  const source = useSource();
  if (source.kind === "compare") return null;

  const cells = cellsOf(statsIn(children), source.page, source.kind === "session", true);
  if (cells.length === 0) return null;

  const section: StatSection = { title: title ?? null, rows: [cells], list: true, ...(plain && { plain }) };
  return <StatPanel section={section} username={source.page.username} />;
}

/**
 * MAXED, as on the card, at the last level (no `max`, which a stored player reads back as 0) and past a max, which
 * Hypixel keeps counting beyond.
 */
function levelProgression({ current, max = 0, percent }: Level["progression"]): Level["progression"] {
  if (!finite(max) || finite(current) >= max) return { current: finite(current), percent: 1 };
  return { current: finite(current), max, percent: Math.min(1, Math.max(0, finite(percent))) };
}

/** The level header of a player's page in a mode, linked to its leaderboard; none on a mode without one. */
export function levelOf(game: StatsGame, page: StatsPage): Level | null {
  const level = game.level(page.stats, page.mode);
  if (!level) return null;
  const { key, label = "stats.level", progress = "stats.progression.exp", progression, ...text } = level;
  return {
    label,
    ...text,
    progression: levelProgression(progression),
    progress,
    leaderboard: isRanked(page, key) ? `stats.${page.game.key}.${key}` : null,
  };
}

/** The card's title: "Stats" (a session's "Session") and the mode, with the submode where it has them. */
export function headingOf(game: StatsGame, page: GameFrame): Heading {
  const mode = page.modes.find(({ key }) => key === page.mode)?.name;
  const submode = page.submodes.find(({ key }) => key === page.submode)?.name;

  return {
    word: "game.stats",
    // A game with one mode leaves it out of the title, as its card does.
    mode: page.modes.length > 1 ? `${mode}${submode ? ` ${submode}` : ""}` : null,
    ...game.heading?.(page),
    ...(page.session && { word: "game.session" }),
  };
}

/**
 * The root of a game's page: the nametag, the level and the game-wide stats (`overview`, as `<Stat>`s), the switchers,
 * then the page's tables and lists (`children`). On a comparison, both nametags and each table as a row per player.
 */
export function PageLayout({ overview, children }: { overview: ReactNode; children: ReactNode }) {
  const source = useSource();
  const stats = statsIn(overview);

  if (source.kind === "compare") {
    const { game, a, b } = source;
    const levels: [string | undefined, string | undefined] = [levelOf(game, a)?.current, levelOf(game, b)?.current];

    return (
      <CompareShell a={a} b={b} heading={headingOf(game, a)} levels={levels}>
        <CompareTable heading={{}} stats={stats} a={a} b={b} />
        {children}
      </CompareShell>
    );
  }

  const { game, page } = source;
  const session = source.kind === "session";

  return (
    <GameShell page={page} heading={headingOf(game, page)} level={session ? null : levelOf(game, page)} overview={cellsOf(stats, page, session)}>
      {children}
    </GameShell>
  );
}
