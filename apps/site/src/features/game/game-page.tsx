/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Background, backgroundFor } from "~/components/ui/background";
import { Box } from "~/components/ui/box";
import { Check } from "~/components/icons/check";
import { Chevron } from "~/components/icons/chevron";
import { Command } from "~/components/ui/command";
import { Cross } from "~/components/icons/cross";
import { FilterBox, wordMatcher } from "~/components/filter-box";
import { Fragment, type ReactNode, useEffect, useId, useRef, useState } from "react";
import { GameIcon, hasGameIcon } from "~/components/ui/game-icon";
import { Hidden, InlineStat, LeaderboardLink, StatCell } from "~/components/ui/stat";
import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { Menu } from "~/components/icons/menu";
import { MinecraftText, colourClass, colourOf, leadingColourClass, plainText } from "~/components/ui/minecraft-text";
import { RefreshBar } from "~/features/player/refresh-bar";
import { SkinBust } from "~/components/ui/skin";
import { cn } from "~/lib/util";
import { gamePageQuery, modeSearch, periodSearch, submodeSearch } from "./game-data";
import { minigameXpBar } from "~/components/ui/progression";
import { orpc } from "~/lib/orpc";
import { refreshGame } from "~/features/player/player-actions";
import { useNumberFormat } from "~/i18n/use-number-format";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { GamePage, StatCell as Stat, StatSection } from "@statsify/contract";

type Level = NonNullable<GamePage["level"]>;

/** A stat's label: the bot's word in `default.json`, or the site's own for a stat the bot doesn't show. */
const LABEL_NAMESPACES = ["default", "site"];

/** On a phone an odd last cell spans its row, centred, rather than sitting alone in the first column. */
const ODD_LAST = "max-sm:[&>:last-child:nth-child(odd)]:col-span-2";

/**
 * A table's columns by its widest row: up to two on phones (three in the headline, as on the card), and from `sm` up to
 * five, a longer row wrapping evenly (six as 3 + 3, seven as 4 + 3).
 */
const COLUMNS = [
  "grid-cols-1",
  "grid-cols-1",
  "grid-cols-2",
  `grid-cols-2 sm:grid-cols-3 ${ODD_LAST}`,
  `grid-cols-2 sm:grid-cols-4 ${ODD_LAST}`,
  `grid-cols-2 sm:grid-cols-5 ${ODD_LAST}`,
];

const MOST_COLUMNS = COLUMNS.length - 1;

const columnsOf = (count: number, headline: boolean) =>
  headline && count === 3 ?
    "grid-cols-3" :
    COLUMNS[count <= MOST_COLUMNS ? count : Math.ceil(count / Math.ceil(count / MOST_COLUMNS))];

/**
 * Every row of a section takes the columns of its widest, so the cells line up down the table and a short row leaves
 * its last columns blank (Duels' two winstreaks over Wins and Losses).
 */
const sectionColumns = (rows: Stat[][]) =>
  Math.max(0, ...rows.filter((row) => !row.every((cell) => cell.inline)).map((row) => row.length));

const cellsOf = (sections: StatSection[]) => sections.flatMap(({ rows }) => rows.flat());

/**
 * The mode switcher goes by how many modes there are, not the screen's width, so the server's render and the hydrated
 * page agree. Up to `PHONE_TABS` it's tabs at every width; past that, a select below `md`. Up to `DESKTOP_TABS` it's
 * links from `md` up; past that, the select at every width.
 */
const PHONE_TABS = 4;
const DESKTOP_TABS = 10;

/** The card's side-by-side boxes, in as many equal columns from `lg` up; four go two by two, as the card draws them. */
const BOX_COLUMNS = ["", "", "lg:grid-cols-2", "lg:grid-cols-3", "lg:grid-cols-2"];

/**
 * A player's page for one game, in the order of the bot's card: nametag and title, level and progress, the stats for
 * the whole game, then one mode's stats under the mode switcher (and the submode's, where a mode has them). Every stat
 * opens its leaderboard at the player. Phones stack the panels; from `lg` up the nametag sits beside the level, the
 * card's boxes sit side by side, and the headline table beside the mode's other tables. Lists (maps, challenges) take
 * the full width below, and one filter box above the first long one searches them all.
 */
export function GameView({ page }: { page: GamePage }) {
  const { t } = useTranslation();
  const n = useNumberFormat();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("");
  const mode = modeSearch(page, page.mode);
  const submode = submodeSearch(page, page.submode);
  const period = periodSearch(page, page.period);
  const boxes = page.sections.filter(({ box }) => box);
  const lists = page.sections.filter(({ box, list }) => !box && list);
  // The first other table is the headline; the rest go beside it.
  const headline = page.sections.find(({ box, list }) => !box && !list);
  const tables = page.sections.filter((section) => section !== headline && !section.box && !section.list);
  const searched = lists.filter(({ search }) => search);
  const searchedCells = cellsOf(searched);
  const labelText = useLabelText();
  const matches = wordMatcher(filter);
  const shown = searchedCells.filter((cell) => matches(labelText(cell))).length;

  const boxPanels = boxes.length > 0 && (
    <div key="boxes" className={cn("grid grid-cols-1 gap-2", BOX_COLUMNS[Math.min(boxes.length, BOX_COLUMNS.length - 1)])}>
      {boxes.map((section, index) => (
        <StatPanel key={section.title ?? section.name ?? index} section={section} username={page.username} />
      ))}
    </div>
  );

  const headlinePanels = headline && (
    <div key="headline" className="grid grid-cols-1 gap-2 lg:grid-cols-[3fr_2fr]">
      <StatPanel section={headline} username={page.username} headline className={cn(tables.length === 0 && "lg:col-span-2")} />
      {tables.length > 0 && (
        <div className="flex flex-col gap-2">
          {tables.map((section, index) => (
            <StatPanel key={section.title ?? section.name ?? index} section={section} username={page.username} />
          ))}
        </div>
      )}
    </div>
  );

  // Everything cached for this player predates the refresh: it reloads the next time it's shown.
  const refresh = async () => {
    const result = await refreshGame({ data: { uuid: page.uuid, game: page.game.key, mode, submode, period } });

    if (result.ok) {
      await queryClient.invalidateQueries({ queryKey: orpc.player.key({ input: { uuid: page.uuid } }), refetchType: "none" });
      queryClient.setQueryData(gamePageQuery(page.uuid, page.game.key, mode, submode, period).queryKey, result.data);
    }

    return result;
  };

  return (
    <div className="relative grow">
      <Background
        background={backgroundFor(page.game.key)}
        priority
        className="h-full"
        mask="linear-gradient(rgb(255 255 255) 30%, rgb(0 0 0 / 0) 95%)"
      />
      <div className="absolute h-full w-full bg-[rgb(17_17_17_/0.7)] -z-10" />
      <div className="w-container flex flex-col gap-4 px-4 py-6 text-mc-white md:px-8">
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-[3fr_2fr]">
          {/* With neither a level nor an overview beside it (Parkour), the nametag takes the whole row. */}
          <GameHeader page={page} className={page.level || page.overview.length > 0 ? "lg:row-span-2" : "lg:col-span-2"} />
          {page.level && <LevelPanel level={page.level} username={page.username} />}
          {page.overview.length > 0 && (
            <StatPanel
              section={overviewSection(page.overview)}
              username={page.username}
              // With no level beside the nametag, the overview takes the nametag's height, its row in the middle.
              className={cn(!page.level && "lg:row-span-2 content:flex content:flex-col content:justify-center")}
            />
          )}
          <RefreshBar
            updatedAt={page.updatedAt}
            expiresAt={page.expiresAt}
            refresh={refresh}
            row
            className="mb-2 lg:col-span-2 lg:mt-2 lg:mb-0"
          />
        </div>
        {/* The Games button and the mode select share a row (on phones, so the tables start nearer the top); the open
            Games grid lies over the page below it. On phones the tabs share it too; from `md` links and tabs take rows
            of their own. */}
        <div className="relative flex flex-wrap items-start gap-x-2 gap-y-4 empty:hidden">
          {page.games.length > 1 && <GameNav page={page} className="shrink-0" />}
          {page.modes.length > 1 && <ModeSwitcher page={page} />}
        </div>
        {page.submodes.length > 1 && <ModeSwitcher page={page} kind="submode" />}
        {(page.periods?.length ?? 0) > 1 && <ModeSwitcher page={page} kind="period" />}
        {page.window && <PeriodDates {...page.window} />}
        {page.games.find(({ key }) => key === page.game.key)?.played === false && (
          <NeverPlayed name={page.username} game={plainText(page.game.name)} />
        )}
        <p className="text-mc-1 text-mc-gray">
          {t("game.hint", { name: page.username })}{" "}
          {/* The game's index of leaderboards, opened and scrolled to this mode's. */}
          <Link
            to="/{-$locale}/leaderboards/$field"
            params={{ field: page.game.key }}
            search={{ mode: page.mode }}
            hash={page.mode}
            className="text-mc-yellow underline underline-offset-2"
          >
            {t("leaderboards.gameTitle", { game: plainText(page.game.name) })}
          </Link>
        </p>
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-mc-1 text-mc-gray">
          {t("game.discord")}
          <Command command={botCommand(page)} />
          <a href="/invite-user" target="_blank" rel="noreferrer" className="text-mc-yellow underline underline-offset-2">
            {t("game.addApp")}
            <span className="sr-only"> {t("nav.newTab")}</span>
          </a>
        </p>
        {page.sections[0]?.box ? [boxPanels, headlinePanels] : [headlinePanels, boxPanels]}
        {lists.map((section, index) => (
          <Fragment key={section.title ?? section.name ?? index}>
            {section === searched[0] && (
              <FilterBox
                value={filter}
                onChange={setFilter}
                label={t("game.filter")}
                count={t("filter.count", { shown: n(shown), total: n(searchedCells.length) })}
              />
            )}
            {section === searched[0] && shown === 0 && <NoStatMatches query={filter} />}
            <StatPanel section={section} username={page.username} filter={section.search ? filter : undefined} />
          </Fragment>
        ))}
      </div>
    </div>
  );
}

/**
 * The bot's command for the page's game and player, `/bedwars player:anrie`. Only Quests' pages have periods, and its
 * command takes the period as a subcommand: `/quests daily player:anrie`.
 */
function botCommand({ game, period, username }: GamePage) {
  return `/${game.key}${period === undefined ? "" : ` ${period}`} player:${username}`;
}

/** A game the player has never played: its page is all zeros, so it says so rather than look like real stats. */
export function NeverPlayed({ name, game }: { name: string; game: string }) {
  const { t } = useTranslation();
  return <p className="text-mc-1 text-mc-yellow">{t("game.neverPlayed", { name, game })}</p>;
}

/** The filter box matched nothing, so the lists below it are empty. */
export function NoStatMatches({ query }: { query: string }) {
  const { t } = useTranslation();
  return <p className="text-mc-1.5 text-mc-gray text-center">{t("game.noMatches", { query: query.trim() })}</p>;
}

/** The game-wide cells in one row, then the card's selections (kit, class) as `Label: value` lines. */
function overviewSection(cells: Stat[]): StatSection {
  const inline = cells.filter((cell) => cell.inline);
  const table = cells.filter((cell) => !cell.inline);
  return { title: null, rows: [table, inline].filter((row) => row.length > 0) };
}

/** The card's title: the game, the word after it ("Stats") and the mode as the card names it. */
export function headingText(page: Pick<GamePage, "game" | "heading">, word: (key: string) => string): string {
  const { name } = page.game;
  const { word: key, mode } = page.heading;
  return `§l${name}${key ? ` §f${word(key)}` : ""}${mode ? ` §r(${mode}§r)` : ""}`;
}

/** The nametag, linking back to the player page, over the card's title. */
export function GameHeader({ page, className }: { page: GamePage; className?: string }) {
  const { t } = useTranslation();

  return (
    <Box className={cn("content:flex content:h-full content:items-center content:gap-4", className)}>
      <SkinBust uuid={page.uuid} className="h-24 w-16 shrink-0 sm:h-40 sm:w-28" />
      <h1 className="flex min-w-0 grow flex-col gap-2">
        {/* A long rank and name wraps onto a second line beside a phone's bust rather than being cut off. */}
        <Link to="/{-$locale}/player/$name" params={{ name: page.username }} className="wrap-break-word text-mc-2 hover:underline">
          <MinecraftText>{page.displayName}</MinecraftText>
        </Link>
        <MinecraftText className="text-mc-1.5">{headingText(page, (key) => t(key))}</MinecraftText>
      </h1>
    </Box>
  );
}

/**
 * The card's description: the level (linked to the leaderboard of what it ranks), the bar from this level to the
 * next, and the progress, under the card's own words for the level and for what the bar counts.
 */
export function LevelPanel({ level, username, className }: { level: Level; username: string; className?: string }) {
  const { t } = useTranslation();
  const n = useNumberFormat();
  const { current, max, percent } = level.progression;
  const { colours } = level;
  const label = t(`default:${level.label}`);
  const value = <MinecraftText>{level.current}</MinecraftText>;

  // Every line centred, a wrapped one too (a long title, its bar and the next one on a phone).
  return (
    <Box className={cn("content:flex content:h-full content:flex-col content:items-center content:justify-center content:gap-3 content:text-center", className)}>
      {/* Within the panel: a long level (The Pit past its last prestige) breaks rather than widening the page. */}
      <dl className="max-w-full">
        <StatCell
          label={label}
          value={level.leaderboard ? <LeaderboardLink field={level.leaderboard} username={username} stat={label}>{value}</LeaderboardLink> : value}
          color={leadingColourClass(level.current)}
          className="relative wrap-break-word"
        />
      </dl>
      {max !== undefined && (
        <>
          <div aria-hidden>
            <MinecraftText className="text-mc-1.5">{`${level.natural} ${minigameXpBar(percent)} ${level.next}`}</MinecraftText>
          </div>
          <span className="sr-only">
            <MinecraftText>{t("game.levelBar", { current: level.natural, next: level.next })}</MinecraftText>
          </span>
        </>
      )}
      <dl>
        <InlineStat
          label={t(`default:${level.progress}`)}
          value={max === undefined ?
            <span className={cn("font-bold", colourClass(colours?.maxed ?? "§b"))}>{t(`game.${level.maxedWord ?? "maxed"}`)}</span> :
            (
              <>
                <span className={colourClass(colours?.current ?? "§b")}>{n(current)}</span>
                {colours ? <span className={colourClass(colours.slash)}>/</span> : "/"}
                <span className={colourClass(colours?.max ?? "§a")}>{n(max)}</span>
              </>
            )}
        />
      </dl>
    </Box>
  );
}

/** A section's heading: the site's or the card's word for it, or the card's own Minecraft-formatted heading. */
function SectionTitle({ section }: { section: StatSection }) {
  const { t } = useTranslation();
  if (section.name) return <MinecraftText>{section.name}</MinecraftText>;
  if (section.title === null) return null;
  const { className, style } = colourOf(section.colour ?? "§f");
  return <span className={className} style={style}>{t(section.title, { ns: LABEL_NAMESPACES })}</span>;
}

/** A heading over one of a panel's rows, between rules. */
const ROW_HEADING =
  "flex items-center gap-3 text-mc-1 text-mc-gray before:h-0.5 before:grow before:bg-white/10 after:h-0.5 after:grow after:bg-white/10";

/**
 * A panel of stats in the card's rows, under the section's heading when it has one. A list (maps, challenges) is
 * name and value lines in columns instead, and a long one starts folded behind its heading and count. A list the
 * page's filter searches keeps the lines whose name matches, and opens while it filters.
 */
export function StatPanel({
  section,
  username,
  headline = false,
  filter,
  className,
}: {
  section: StatSection;
  username: string;
  /** The page's first table, whose rows of three keep three columns on a phone, as on the card. */
  headline?: boolean;
  /** The page's filter, for a list it searches. */
  filter?: string;
  className?: string;
}) {
  const { t } = useTranslation();
  const n = useNumberFormat();
  const labelText = useLabelText();
  const heading = section.title === null && !section.name ?
    undefined :
    <h2 className="text-mc-1.5 font-bold"><SectionTitle section={section} /></h2>;

  if (section.list) {
    const all = section.rows.flat();
    const filtering = filter !== undefined && filter.trim() !== "";
    const matches = wordMatcher(filter ?? "");
    const shown = (cells: Stat[]) => (filtering ? cells.filter((cell) => matches(labelText(cell))) : cells);
    const cells = shown(all);
    const lines = (cells: Stat[]) => (
      <dl className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cells.map((cell) => <ListStat key={cell.key} cell={cell} username={username} plain={section.plain} ticks={section.ticks} />)}
      </dl>
    );
    const { rowNames } = section;
    // Under the card's own headings (Dropper's difficulties), a row at a time; one the filter empties goes with its heading.
    const list = rowNames ?
      (
        <div className="flex flex-col gap-4">
          {section.rows.map((row, index) => {
            const kept = shown(row);
            return kept.length > 0 && (
              <div key={index} className="flex flex-col gap-2">
                <h3 className={ROW_HEADING}><MinecraftText>{rowNames[index]}</MinecraftText></h3>
                {lines(kept)}
              </div>
            );
          })}
        </div>
      ) :
      lines(cells);

    if (!section.collapsed) return <Box className={className} title={heading}>{list}</Box>;

    return (
      <Box className={className}>
        <details open={filtering} className="group">
          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 outline-none focus-visible:outline-2 focus-visible:outline-white/60 [&::-webkit-details-marker]:hidden">
            <Chevron className="size-6 shrink-0 text-mc-gray transition-transform group-open:rotate-90" />
            <h2 className="text-mc-1.5 font-bold"><SectionTitle section={section} /></h2>
            <span className="text-mc-1.5 text-mc-gray">
              ({filtering ? t("filter.count", { shown: n(cells.length), total: n(all.length) }) : n(all.length)})
            </span>
          </summary>
          <div className="pt-3">{list}</div>
        </details>
      </Box>
    );
  }

  return (
    <Box className={className} title={heading}>
      <div className="flex flex-col gap-4">
        {section.rows.map((row, index) => {
          const cells = row.every((cell) => cell.inline) ?
            (
              <dl key={index} className="flex flex-col gap-2">
                {row.map((cell) => <SelectionStat key={cell.key} cell={cell} />)}
              </dl>
            ) :
            (
              <dl key={index} className={cn("grid gap-x-2 gap-y-4", columnsOf(sectionColumns(section.rows), headline))}>
                {row.map((cell) => <GameStat key={cell.key} cell={cell} username={username} />)}
              </dl>
            );
          const title = section.rowTitles?.[index];

          // A row under a heading (Final, Normal) whose cells drop the word it says; rules either side show it spans the
          // row, not the middle cell.
          return title ?
            (
              <div key={index} className="flex flex-col gap-2">
                <h3 className={ROW_HEADING}>{t(title)}</h3>
                {cells}
              </div>
            ) :
            cells;
        })}
      </div>
    </Box>
  );
}

/** A stat's heading: the card's own name for it (in its colours, else the stat's), or the bot's word for it. */
function useStatLabel(cell: Stat): { text: string; node: ReactNode } {
  const text = useLabelText()(cell);
  return { text, node: cell.name === undefined ? text : <MinecraftText>{`${cell.colour}${cell.name}`}</MinecraftText> };
}

const plainName = (name: string) => name.replaceAll(/§#[\dA-Fa-f]{6}|§./g, "");

/** A stat's heading as plain text, for its link and the filter: the card's own name, or the label's words. */
function useLabelText(): (cell: Stat) => string {
  const { t } = useTranslation();
  return (cell) => (cell.name === undefined ? t(cell.label, { ns: LABEL_NAMESPACES, ...cell.params }) : plainName(cell.name));
}

/** A stat's value as the card prints it: a number in the locale's format (with its cap or unit), or the API's text. */
function useStatValue(cell: Stat): ReactNode {
  const n = useNumberFormat(cell.trim);
  if (cell.hidden) return <Hidden />;
  // Text the API formatted takes the stat's colour, unless it brings its own (a level, a §7 N/A).
  const value = typeof cell.value === "number" ?
    `${n(cell.value)}${cell.suffix ?? ""}` :
    <MinecraftText>{`${cell.colour}${cell.value}`}</MinecraftText>;

  if (cell.of === undefined) return value;

  return (
    <>
      {value}
      <span className="text-mc-1 text-mc-gray">/{n(cell.of)}</span>
    </>
  );
}

/**
 * One stat as the card draws it, in its colour, with the bot's label. A capped stat shows its cap after it (`12/25`) in
 * §7 like the card, at the label's size so the pair fits a phone's cell.
 */
function GameStat({ cell, username }: { cell: Stat; username: string }) {
  const { t } = useTranslation();
  const label = useStatLabel(cell);
  const value = useStatValue(cell);
  const { className, style } = colourOf(cell.colour);

  return (
    <StatCell
      // The short label shows under the row's heading; the link keeps the whole name.
      label={cell.short ? t(cell.short, { ns: LABEL_NAMESPACES }) : label.node}
      value={cell.leaderboard ? <LeaderboardLink field={cell.leaderboard} username={username} stat={label.text}>{value}</LeaderboardLink> : value}
      color={className}
      style={style}
      className="relative"
    />
  );
}

/**
 * A name and its value on one line, as the card's lists draw them: the name on the left, bold unless the list keeps the
 * card's own formatting, and the value on the right, or a tick or a cross in a list of things done or not.
 */
function ListStat({ cell, username, plain = false, ticks = false }: { cell: Stat; username: string; plain?: boolean; ticks?: boolean }) {
  const label = useStatLabel(cell);
  const count = useStatValue(cell);
  const value = ticks ? <Tick done={Number(cell.value) > 0} /> : count;
  const { className, style } = colourOf(cell.colour);

  return (
    <div className={cn("relative flex min-h-11 min-w-0 items-center gap-2 py-1 text-mc-1", className)} style={style}>
      {cell.icon && hasGameIcon(cell.icon) && <span aria-hidden className="size-8 shrink-0"><GameIcon game={cell.icon} /></span>}
      <dt className={cn("min-w-0 grow truncate", !plain && "font-bold")}>{label.node}</dt>
      <dd className="shrink-0">
        {cell.leaderboard ? <LeaderboardLink field={cell.leaderboard} username={username} stat={label.text}>{value}</LeaderboardLink> : value}
      </dd>
    </div>
  );
}

/** The card's tick or cross, in the stat's colour, with its words for screen readers. */
function Tick({ done }: { done: boolean }) {
  const { t } = useTranslation();
  const Icon = done ? Check : Cross;

  return (
    <>
      <Icon className="block size-6" />
      <span className="sr-only">{t(done ? "game.done" : "game.notDone")}</span>
    </>
  );
}

/** A selection the card shows (a kit, a trail) as `§7Label: value`, never a link. */
function SelectionStat({ cell }: { cell: Stat }) {
  const label = useStatLabel(cell);
  const value = useStatValue(cell);
  const { className, style } = colourOf(cell.colour);
  return <InlineStat label={label.text} value={value} color={className} style={style} />;
}

/** The mark's words in `site.json`: "most played", or "most wins" where the game counts wins alone. */
const markWords = (counted: NonNullable<GamePage["modes"][number]["mostPlayed"]>) =>
  counted === "wins" ? "game.mostWins" : "game.mostPlayed";

/** Each switcher's words in `site.json`: its nav's label and its select's. */
const SWITCHER_WORDS = {
  mode: { nav: "game.modes", select: "game.mode" },
  submode: { nav: "game.submodes", select: "game.submode" },
  period: { nav: "game.periods", select: "game.period" },
} as const;

/**
 * The mode switcher, or the submode or period one: tabs, as joined segments on phones and links from `md` up, or a
 * native select, by how many there are (`PHONE_TABS`, `DESKTOP_TABS`). Both keep the scroll position, and every target
 * is 44 px tall. The player's kit or class is marked, and so is the mode they've played most: in a select's options by its words, on a tab by a
 * gold square, with the words for screen readers and what counted on hover, and a line under the tabs saying what the
 * square means. The words say "most wins" where the game counts wins alone.
 */
export function ModeSwitcher({ page, kind = "mode" }: { page: GamePage; kind?: keyof typeof SWITCHER_WORDS }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const router = useRouter();
  const id = useId();
  const periods = (page.periods ?? []).map((key) => ({ key, name: t(`game.periodNames.${key}`) }));
  const options: GamePage["modes"] = { mode: page.modes, submode: page.submodes, period: periods }[kind];
  const current = { mode: page.mode, submode: page.submode, period: page.period ?? null }[kind];
  const mode = modeSearch(page, page.mode);
  const submode = submodeSearch(page, page.submode);
  const period = periodSearch(page, page.period);
  // A new mode starts on its first submode, in the period shown.
  const search = (key: string) => ({
    mode: kind === "mode" ? modeSearch(page, key) : mode,
    submode: kind === "submode" ? submodeSearch(page, key) : kind === "mode" ? undefined : submode,
    period: kind === "period" ? periodSearch(page, key) : period,
  });
  const name = (option: (typeof options)[number]) => (option.selected ? t("game.selected", { name: option.name }) : option.name);
  const phoneTabs = options.length <= PHONE_TABS;
  const desktopTabs = options.length <= DESKTOP_TABS;
  const marked = options.find((option) => option.mostPlayed)?.mostPlayed;
  // One select stays mounted, so a pick keeps its focus: it shows the pick while that page loads, then whatever page is
  // current (the pick's, or one Back went to).
  const [pick, setPick] = useState(current);
  const [shown, setShown] = useState(current);
  if (shown !== current) {
    setShown(current);
    setPick(current);
  }
  const to = (key: string) => ({
    to: "/{-$locale}/player/$name/$game" as const,
    params: { name: page.username, game: page.game.key },
    search: search(key),
  });
  // The picker stays open a moment, so the likely picks load meanwhile: the mode played most, and the first.
  const preload = () => {
    for (const option of new Set([options.find((option) => option.mostPlayed), options[0]])) {
      if (option && option.key !== current) void router.preloadRoute(to(option.key));
    }
  };

  return (
    <nav
      aria-label={t(SWITCHER_WORDS[kind].nav)}
      // Beside the Games button: a select takes what the button leaves, and so do a phone's tabs.
      className={kind === "mode" ? cn(phoneTabs ? "min-w-0 grow basis-0" : "min-w-0 grow basis-48", desktopTabs && "md:basis-full") : undefined}
    >
      {!phoneTabs && (
        // A form, so the select works without the page's scripts: its button, shown only then, sends the pick with the
        // rest of the page's search it keeps (a submode's mode, the period), which the route reads. With them, a pick
        // navigates in place.
        <form method="get" className={cn("flex items-center gap-3", desktopTabs && "md:hidden")}>
          {Object.entries(search(current ?? "")).map(([key, value]) =>
            key !== kind && value !== undefined && <input key={key} type="hidden" name={key} value={value} />)}
          <label htmlFor={id} className="shrink-0 text-mc-1 text-mc-gray">{t(SWITCHER_WORDS[kind].select)}</label>
          <div className="relative min-w-0 grow md:max-w-sm">
            <select
              id={id}
              name={kind}
              value={pick ?? undefined}
              onFocus={preload}
              onPointerDown={preload}
              onChange={(event) => {
                setPick(event.target.value);
                void navigate({ ...to(event.target.value), resetScroll: false });
              }}
              className="h-11 w-full min-w-0 appearance-none truncate bg-blackify-800 ps-3 pe-10 text-mc-1.5 text-white -outline-offset-2 focus-visible:outline-2 focus-visible:outline-white/60"
            >
              {options.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.mostPlayed ?
                    t(`${markWords(option.mostPlayed)}.${option.selected ? "optionSelected" : "option"}`, { name: option.name }) :
                    name(option)}
                </option>
              ))}
            </select>
            <Chevron className="pointer-events-none absolute end-2 top-1/2 size-6 -translate-y-1/2 rotate-90 text-mc-gray" />
          </div>
          <noscript>
            <button
              type="submit"
              className="h-11 shrink-0 bg-blackify-800 px-3 text-mc-1.5 text-white -outline-offset-2 hover:bg-blackify-700 focus-visible:outline-2 focus-visible:outline-white/60"
            >
              {t("game.go")}
            </button>
          </noscript>
        </form>
      )}
      {desktopTabs && (
        <ul
          className={cn(
            "md:flex md:flex-wrap md:gap-x-1 md:gap-y-2",
            // Segments share a phone's width equally; a long name wraps inside its own.
            phoneTabs ? "grid auto-cols-fr grid-flow-col gap-x-1" : "hidden"
          )}
        >
          {options.map((option) => (
            <li key={option.key} className="min-w-0">
              <Link
                {...to(option.key)}
                resetScroll={false}
                activeOptions={{ exact: true, includeSearch: true }}
                title={option.mostPlayed && t(`${markWords(option.mostPlayed)}.${option.mostPlayed}`)}
                // A column, so the box grows and segments in one row are the same height when a name wraps.
                className="group flex h-full flex-col outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
              >
                <Box className="grow text-mc-white/60 group-hover:text-mc-white group-aria-[current=page]:font-bold group-aria-[current=page]:text-mc-white content:flex content:min-h-11 content:items-center content:justify-center content:gap-2 content:px-2 content:py-1 content:text-center content:text-mc-1 content:text-balance md:content:justify-start md:content:px-3 md:content:py-0 md:content:text-start">
                  {option.mostPlayed && <span aria-hidden className="size-2 shrink-0 bg-mc-gold forced-color-adjust-none" />}
                  <span className="min-w-0 wrap-break-word">{name(option)}</span>
                  {option.mostPlayed && <span className="sr-only"> {t(`${markWords(option.mostPlayed)}.mark`)}</span>}
                </Box>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {/* What the gold square means, wherever the tabs show it; a select's option says it in words. Each marked tab
          has the words for screen readers. */}
      {marked && desktopTabs && (
        <p aria-hidden className={cn("mt-2 flex items-center gap-2 text-mc-1 text-mc-gray", !phoneTabs && "hidden md:flex")}>
          <span className="size-2 shrink-0 bg-mc-gold forced-color-adjust-none" />
          {t(`${markWords(marked)}.line`)}
        </p>
      )}
    </nav>
  );
}

/**
 * The dates a period's counts cover, as the card's header prints them (`MM/dd/yyyy ➡ MM/dd/yyyy`): from the period's
 * start to the fetch, in New York time, where the periods reset, on both server and browser so the HTML hydrates.
 */
function PeriodDates({ start, end }: NonNullable<GamePage["window"]>) {
  const { t, i18n } = useTranslation();
  const format = new Intl.DateTimeFormat(i18n.language, { month: "2-digit", day: "2-digit", year: "numeric", timeZone: "America/New_York" });
  return <p className="text-mc-1 text-mc-gray">{t("game.window", { start: format.format(start), end: format.format(end) })}</p>;
}

/** From `md` up, the game nav lists up to this many pages as links; past it, the Games button, as on phones. */
const DESKTOP_GAMES = 10;

type NavGame = GamePage["games"][number];

/** A game's icon, its name, and words for screen readers when the player has never played it. */
function GameName({ game }: { game: NavGame }) {
  const { t } = useTranslation();

  return (
    <>
      {game.id && hasGameIcon(game.id) && <span aria-hidden className="size-6 shrink-0"><GameIcon game={game.id} /></span>}
      <MinecraftText className="min-w-0">{game.name}</MinecraftText>
      {!game.played && <span className="sr-only"> {t("game.unplayed")}</span>}
    </>
  );
}

/**
 * The player's other game pages, in the game registry's order. On phones, and from `md` up past `DESKTOP_GAMES`, a
 * Games button opens a grid of them over the page; up to it, a link each from `md` up. The button is a `<details>`, so
 * it opens before the page hydrates; after, Escape, a pick, a tap outside or tabbing out closes it. The current game is
 * marked, and a game the player has never played is dimmed and says so. The grid takes the width of the nearest
 * positioned ancestor, the row the nav shares with the mode select.
 */
export function GameNav({ page, open, className }: { page: GamePage; open?: boolean; className?: string }) {
  const { t } = useTranslation();
  const details = useRef<HTMLDetailsElement>(null);
  const links = page.games.length <= DESKTOP_GAMES;
  const close = () => {
    if (details.current) details.current.open = false;
  };

  useEffect(() => {
    const element = details.current;
    if (!element) return;

    const outside = (event: PointerEvent) => {
      if (element.open && !element.contains(event.target as Node)) element.open = false;
    };
    // Back to the button, so the keyboard carries on from where the grid opened.
    const escape = (event: KeyboardEvent) => {
      if (!element.open || event.key !== "Escape") return;
      element.open = false;
      element.querySelector("summary")?.focus();
    };
    // Tabbing out closes it, so it never lies over the element with focus. Focus going nowhere (a click on the page) is
    // the pointerdown's to judge, so a click on the grid's padding leaves it open.
    const blur = (event: FocusEvent) => {
      if (element.open && event.relatedTarget instanceof Node && !element.contains(event.relatedTarget)) element.open = false;
    };

    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    element.addEventListener("focusout", blur);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
      element.removeEventListener("focusout", blur);
    };
  }, []);

  const current = (game: NavGame) => (game.key === page.game.key ? "page" : undefined);

  return (
    <nav aria-label={t("game.games")} className={cn(links && "md:basis-full", className)}>
      <details ref={details} open={open} className={cn("group/games w-fit", links && "md:hidden")}>
        <summary className="flex h-11 cursor-pointer list-none items-center gap-2 bg-blackify-800 ps-3 pe-2 text-mc-1.5 text-white -outline-offset-2 select-none focus-visible:outline-2 focus-visible:outline-white/60 [&::-webkit-details-marker]:hidden">
          {/* A square on phones, so it fits beside the mode tabs. */}
          <span className="max-md:sr-only">{t("game.games")}</span>
          <Menu className="size-6 text-mc-gray md:hidden" />
          <Chevron className="size-6 rotate-90 text-mc-gray group-open/games:-rotate-90 max-md:hidden" />
        </summary>
        {/* Opaque, as the selects are, since it lies over the stats; the shadow is the panels'. */}
        <div className="absolute inset-x-0 top-full z-10 mt-2 bg-blackify-800 p-2 shadow-[4px_4px_0_rgb(0_0_0/0.84)]">
          <ul className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {page.games.map((game) => (
              <li key={game.key}>
                <Link
                  to="/{-$locale}/player/$name/$game"
                  params={{ name: page.username, game: game.key }}
                  aria-current={current(game)}
                  onClick={close}
                  className={cn(
                    "flex min-h-11 items-center gap-2 px-2 text-mc-1 outline-none hover:bg-white/10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white/60 aria-[current=page]:bg-white/15 aria-[current=page]:font-bold",
                    !game.played && "opacity-50"
                  )}
                >
                  <GameName game={game} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </details>
      {links && (
        <ul className="hidden flex-wrap gap-x-1 gap-y-2 md:flex">
          {page.games.map((game) => (
            <li key={game.key}>
              <Link
                to="/{-$locale}/player/$name/$game"
                params={{ name: page.username, game: game.key }}
                aria-current={current(game)}
                className="group block outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
              >
                <Box
                  className={cn(
                    "group-hover:brightness-125 content:flex content:min-h-11 content:items-center content:gap-2 content:px-3 content:py-0 content:text-mc-1 group-aria-[current=page]:font-bold",
                    !game.played && "opacity-50"
                  )}
                >
                  <GameName game={game} />
                </Box>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
