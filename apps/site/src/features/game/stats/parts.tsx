/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BoxPanels, GameShell, HeadlinePanels, type Level, headlineSpan, overviewPlace } from "~/features/game/game-page";
import { Children, type ReactNode, createContext, use } from "react";
import { CompareShell, PairedStat } from "~/features/compare/compare-page";
import { GameStat, ListLines, ListPanel, ListStat, PanelHeading, SelectionStat, StatGrid, StatGridRow } from "~/features/game/stat-panel";
import type { GameContent, GameFrame, GameStatsPage, Heading } from "~/features/game/game-data";
import type { StatCell } from "@statsify/contract";

type Leaf = number | string;

/** A stat's path below the game in the game's stats (`solo.wins`), checked against its schema. */
export type StatPath<T> = {
  [K in keyof T & string]: NonNullable<T[K]> extends Leaf ? K : NonNullable<T[K]> extends object ? `${K}.${StatPath<NonNullable<T[K]>>}` : never;
}[keyof T & string];

/** What a stat's label and value are on a page, read from the player's stats (each player's, on a comparison). */
export interface StatValue<G> {
  path: StatPath<G>;
  /** A `stats.*` locale key; `stats.<the path's last key>` by default. */
  label?: string;
  /** The card's own Minecraft-formatted name in place of the label; a stat the API names (a challenge) has it already. */
  name?(stats: G): string;
  /** The stat it is out of (`12/25`). */
  of?: StatPath<G>;
  suffix?: string;
  /** Text for the value where the card doesn't print the number (a time, a kit's name). */
  format?: (value: Leaf) => string;
  /** What the card prints for a 0 that means "never set"; such a 0 isn't on the leaderboard. */
  unset?: string;
  /** The player hides it from Hypixel's API, so the page says Hidden. */
  hidden?(stats: G): boolean;
}

export interface StatProps<G> extends StatValue<G> {
  /** The bot's color code, or one by the value (a challenge is green once done). */
  color: string | ((value: number) => string);
  /** A shorter label under its row's heading (Kills under Final). */
  short?: string;
}

/** What a page reads at runtime, its paths and functions no longer tied to one game's stats. */
type AnyValue = Omit<StatValue<object>, "path" | "of" | "name" | "hidden"> & {
  path: string;
  of?: string;
  name?(stats: object): string;
  hidden?(stats: object): boolean;
};

type AnyStat = AnyValue & Pick<StatProps<object>, "color" | "short">;

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
export interface StatsGame<G, M extends string> {
  Page(props: { mode: M; submode: string | null }): ReactNode;
  /** The card's title where it isn't "Stats (Mode Submode)". */
  heading?(page: GameFrame): Partial<Heading>;
  level(stats: G, mode: M): LevelText | null;
  /** The first stats of the mode's first table (of the game-wide row on a page without one), which its link preview quotes. */
  preview(mode: M, submode: string | null): StatValue<G>[];
}

/** Any game the site lays out, as its registry holds them. */
export type AnyStatsGame = Omit<StatsGame<object, string>, "preview"> & {
  preview(mode: string, submode: string | null): AnyValue[];
};

/** A page as the parts read it: the player's stats, and what every player's page of the game shares. */
export type StatsPage = GameStatsPage & GameContent;

/** Where a page reads its stats: the player's, what they gained in a session, or two players' side by side. */
export type StatsSource = { game: AnyStatsGame } & (
  | { kind: "player" | "session"; page: StatsPage }
  | { kind: "compare"; a: StatsPage; b: StatsPage }
);

export const StatsContext = createContext<StatsSource | null>(null);

function useSource(): StatsSource {
  const source = use(StatsContext);
  if (!source) throw new Error("A game's stats parts need a StatsContext");
  return source;
}

/**
 * Whose stats the page shows. A session's page has what the player gained since it started, which means nothing for a
 * streak, a best or a setting, so a page leaves those out of it.
 */
export const useStatsKind = (): StatsSource["kind"] => useSource().kind;

/** Whether `test` holds for the player's stats, or for both players' on a comparison: a stat it's false for is left out. */
export function useShown<G>(test: (stats: G) => boolean): boolean {
  const source = useSource();
  return source.kind === "compare" ? test(source.a.stats as G) && test(source.b.stats as G) : test(source.page.stats as G);
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

/** The stats a list shows: on a session's page, only the ones the session moved. */
export function useListed<P extends string>(paths: P[]): P[] {
  const source = useSource();
  if (source.kind !== "session") return paths;
  return paths.filter((path) => valueOf({ path }, source.page, true).value !== 0);
}

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

function readValue(stat: AnyValue, stats: object) {
  const stored = readStat(stats, stat.path);
  return typeof stored === "number" ? finite(stored) : stored;
}

/**
 * A stat's label and value on a page, for its cell and the link preview alike. A session's numbers rank nowhere, and
 * a selection never links.
 */
export function valueOf(
  stat: AnyValue,
  page: StatsPage,
  session: boolean,
  selection = false
): Pick<StatCell, "label" | "name" | "params" | "value" | "hidden" | "suffix" | "of" | "leaderboard"> {
  const { stats } = page;
  const raw = readValue(stat, stats);
  const unset = stat.unset !== undefined && !raw;
  const value = unset ? stat.unset! : stat.format ? stat.format(raw as Leaf) : typeof raw === "string" ? raw : Number(raw ?? 0);
  const name = stat.name ? stat.name(stats) : stat.label ? undefined : page.names[stat.path];
  const hidden = stat.hidden?.(stats) ?? false;
  const of = stat.of === undefined || session ? undefined : finite(Number(readStat(stats, stat.of) ?? 0));

  return {
    label: stat.label ?? `stats.${stat.path.slice(stat.path.lastIndexOf(".") + 1)}`,
    ...(name !== undefined && { name }),
    value,
    ...(hidden && { hidden }),
    ...(stat.suffix && !hidden && { suffix: stat.suffix }),
    ...(of !== undefined && { of }),
    leaderboard: !session && isRanked(page, stat.path) && !unset && !hidden && !selection ? `stats.${page.game.key}.${stat.path}` : null,
  };
}

function cellOf(stat: AnyStat, page: StatsPage, session: boolean, selection = false): StatCell {
  return {
    key: stat.path,
    ...valueOf(stat, page, session, selection),
    ...(stat.short && { short: stat.short }),
    color: typeof stat.color === "function" ? stat.color(Number(readValue(stat, page.stats))) : stat.color,
    ...(selection && { inline: true }),
  };
}

/** How the table, list or selections around a `Stat` draw it. */
const StatPlace = createContext<"cell" | "selection" | "line" | "plain line">("cell");

/**
 * One stat, drawn as its table's cell, its list's line or its row's selection; on a comparison the cell has both
 * players' values. A row boxes each of its children, so a page leaves out a stat it doesn't show (`{shown && <Stat />}`).
 */
export function Stat<G>(props: StatProps<G>) {
  const stat = props as unknown as AnyStat;
  const source = useSource();
  const place = use(StatPlace);

  if (source.kind === "compare") {
    const { a, b } = source;
    return <PairedStat pair={{ a: cellOf(stat, a, false), b: cellOf(stat, b, false) }} players={[a, b]} />;
  }

  const { page } = source;
  const cell = cellOf(stat, page, source.kind === "session", place === "selection");
  if (place === "selection") return <SelectionStat cell={cell} />;
  if (place === "cell") return <GameStat cell={cell} username={page.username} />;
  return <ListStat cell={cell} username={page.username} plain={place === "plain line"} />;
}

/** `Stat` for one game's stats, so its paths are checked against them. */
export const statFor = <G,>(): ((props: StatProps<G>) => ReactNode) => Stat;

interface TableHeading {
  /** A `game.sections.*` key in `site.json`, or the card's `stats.*` heading. */
  title?: string;
  /** The card's own Minecraft-formatted heading (`§6Solo`). */
  name?: string;
  color?: string;
}

const tableTitle = ({ title, name, color }: TableHeading) =>
  title === undefined && name === undefined ? undefined : <PanelHeading section={{ title: title ?? null, name, color }} />;

/** A row of a table's `<Stat>`s, each child a cell, under a heading where it has one (Final, Normal). */
export function StatRow({ title, children }: { title?: string; children: ReactNode }) {
  return <StatGridRow title={title}>{children}</StatGridRow>;
}

/** A row of the card's selections (a kit) as `Label: value` lines in one box; a comparison leaves it out. */
export function Selections({ children }: { children: ReactNode }) {
  if (useStatsKind() === "compare") return null;
  return (
    <StatGridRow selections>
      <StatPlace value="selection">{children}</StatPlace>
    </StatGridRow>
  );
}

/**
 * A panel of stats as the card draws it. A table of one row has its `<Stat>`s as children; a taller one has
 * `<StatRow>`s (and `<Selections>`), `columns` wide: its widest row's count.
 */
export function StatTable({
  columns,
  className,
  children,
  ...heading
}: TableHeading & { columns?: number; className?: string; children: ReactNode }) {
  return (
    <StatGrid heading={tableTitle(heading)} columns={columns ?? Children.toArray(children).length} className={className}>
      {columns === undefined ? <StatRow>{children}</StatRow> : children}
    </StatGrid>
  );
}

/** The mode's first table, `columns` wide, and from `lg` up its other tables (`aside`) beside it. */
export function HeadlineTable({
  columns,
  aside,
  children,
  ...heading
}: TableHeading & { columns: number; aside?: ReactNode; children: ReactNode }) {
  const compare = useStatsKind() === "compare";
  const table = (
    <StatGrid heading={tableTitle(heading)} columns={columns} headline className={compare ? undefined : headlineSpan(aside)}>
      {children}
    </StatGrid>
  );

  if (compare) {
    return (
      <>
        {table}
        {aside}
      </>
    );
  }

  return <HeadlinePanels aside={aside}>{table}</HeadlinePanels>;
}

/** The game-wide stats in one row: under the level, or beside the nametag on a page without one. */
export function OverviewTable({ children }: { children: ReactNode }) {
  const source = useSource();
  if (source.kind === "compare") return <StatTable>{children}</StatTable>;

  const level = source.kind === "session" ? null : levelOf(source.game, source.page);
  return <StatTable className={overviewPlace(level)}>{children}</StatTable>;
}

/** The card's boxes side by side (each a `<StatTable>` with its name), in as many columns from `lg` up. */
export function Boxes({ children }: { children: ReactNode }) {
  return useStatsKind() === "compare" ? children : <BoxPanels>{children}</BoxPanels>;
}

/** Name and value lines (titles, challenges) under a heading, left off a comparison, as two players' lists differ. */
export function StatList({ title, plain = false, children }: { title?: string; plain?: boolean; children: ReactNode }) {
  if (useStatsKind() === "compare" || Children.toArray(children).length === 0) return null;

  return (
    <ListPanel heading={title === undefined ? undefined : <PanelHeading section={{ title }} />}>
      <StatPlace value={plain ? "plain line" : "line"}>
        <ListLines>{children}</ListLines>
      </StatPlace>
    </ListPanel>
  );
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
export function levelOf(game: AnyStatsGame, page: StatsPage): Level | null {
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
export function headingOf(game: AnyStatsGame, page: GameFrame): Heading {
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
 * The root of a game's page: the nametag, the level and the game-wide stats (`overview`, an `<OverviewTable>`), the
 * switchers, then the page's tables and lists (`children`). On a comparison, both nametags over the tables.
 */
export function PageLayout({ overview, children }: { overview: ReactNode; children: ReactNode }) {
  const source = useSource();

  if (source.kind === "compare") {
    const { game, a, b } = source;
    return (
      <CompareShell a={a} b={b} heading={headingOf(game, a)} levels={[levelOf(game, a)?.current, levelOf(game, b)?.current]}>
        {overview}
        {children}
      </CompareShell>
    );
  }

  const { game, page } = source;
  const session = source.kind === "session";

  return (
    <GameShell page={page} heading={headingOf(game, page)} level={session ? null : levelOf(game, page)} overview={overview}>
      {children}
    </GameShell>
  );
}
