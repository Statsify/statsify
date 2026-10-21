/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Background, backgroundFor } from "~/components/ui/background";
import { Box } from "~/components/ui/box";
import { Chevron } from "~/components/icons/chevron";
import { GameIcon, hasGameIcon } from "~/components/ui/game-icon";
import { InlineStat, STAT_LINK, StatCell } from "~/components/ui/stat";
import { Link, useNavigate } from "@tanstack/react-router";
import { MinecraftText, colourOf, leadingColourClass } from "~/components/ui/minecraft-text";
import { type ReactNode, useId } from "react";
import { RefreshBar } from "~/features/player/refresh-bar";
import { SkinBust } from "~/components/ui/skin";
import { cn } from "~/lib/util";
import { gamePageQuery, modeSearch, submodeSearch } from "./game-data";
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

/**
 * The mode switcher goes by how many modes there are, not the screen's width, so the server's render and the hydrated
 * page agree. Up to `PHONE_TABS` it's tabs at every width; past that, a select below `md`. Up to `DESKTOP_TABS` it's
 * links from `md` up; past that, the select at every width.
 */
const PHONE_TABS = 4;
const DESKTOP_TABS = 10;

/** The card's side-by-side boxes, in as many equal columns from `lg` up. */
const BOX_COLUMNS = ["", "", "lg:grid-cols-2", "lg:grid-cols-3", "lg:grid-cols-4"];

/**
 * A player's page for one game, in the order of the bot's card: nametag and title, level and progress, the stats for
 * the whole game, then one mode's stats under the mode switcher (and the submode's, where a mode has them). Every stat
 * opens its leaderboard at the player. Phones stack the panels; from `lg` up the nametag sits beside the level, the
 * card's boxes sit side by side, and the headline table beside the mode's other tables. Lists (maps, challenges) take
 * the full width below.
 */
export function GameView({ page }: { page: GamePage }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const mode = modeSearch(page, page.mode);
  const submode = submodeSearch(page, page.submode);
  const boxes = page.sections.filter(({ box }) => box);
  const lists = page.sections.filter(({ box, list }) => !box && list);
  // The first other table is the headline; the rest go beside it.
  const headline = page.sections.find(({ box, list }) => !box && !list);
  const tables = page.sections.filter((section) => section !== headline && !section.box && !section.list);

  // Everything cached for this player predates the refresh: it reloads the next time it's shown.
  const refresh = async () => {
    const result = await refreshGame({ data: { uuid: page.uuid, game: page.game.key, mode, submode } });

    if (result.ok) {
      await queryClient.invalidateQueries({ queryKey: orpc.player.key({ input: { uuid: page.uuid } }), refetchType: "none" });
      queryClient.setQueryData(gamePageQuery(page.uuid, page.game.key, mode, submode).queryKey, result.data);
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
        {page.modes.length > 1 && <ModeSwitcher page={page} />}
        {page.submodes.length > 1 && <ModeSwitcher page={page} submodes />}
        <p className="text-mc-1 text-mc-gray">{t("game.hint", { name: page.username })}</p>
        {boxes.length > 0 && (
          <div className={cn("grid grid-cols-1 gap-2", BOX_COLUMNS[Math.min(boxes.length, BOX_COLUMNS.length - 1)])}>
            {boxes.map((section, index) => (
              <StatPanel key={section.title ?? section.name ?? index} section={section} username={page.username} />
            ))}
          </div>
        )}
        {headline && (
          <div className="grid grid-cols-1 gap-2 lg:grid-cols-[3fr_2fr]">
            <StatPanel section={headline} username={page.username} headline className={cn(tables.length === 0 && "lg:col-span-2")} />
            {tables.length > 0 && (
              <div className="flex flex-col gap-2">
                {tables.map((section, index) => (
                  <StatPanel key={section.title ?? section.name ?? index} section={section} username={page.username} />
                ))}
              </div>
            )}
          </div>
        )}
        {lists.map((section, index) => (
          <StatPanel key={section.title ?? section.name ?? index} section={section} username={page.username} />
        ))}
      </div>
    </div>
  );
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
            <span className="font-bold text-mc-aqua">{t(`game.${level.maxedWord ?? "maxed"}`)}</span> :
            (
              <>
                <span className="text-mc-aqua">{n(current)}</span>/<span className="text-mc-green">{n(max)}</span>
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
  return section.title === null ? null : t(section.title, { ns: LABEL_NAMESPACES });
}

/**
 * A panel of stats in the card's rows, under the section's heading when it has one. A list (maps, challenges) is
 * name and value lines in columns instead, and a long one starts folded behind its heading and count.
 */
export function StatPanel({
  section,
  username,
  headline = false,
  className,
}: {
  section: StatSection;
  username: string;
  /** The page's first table, whose rows of three keep three columns on a phone, as on the card. */
  headline?: boolean;
  className?: string;
}) {
  const n = useNumberFormat();
  const heading = section.title === null && !section.name ?
    undefined :
    <h2 className="text-mc-1.5 font-bold"><SectionTitle section={section} /></h2>;

  if (section.list) {
    const cells = section.rows.flat();
    const list = (
      <dl className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cells.map((cell) => <ListStat key={cell.key} cell={cell} username={username} plain={section.plain} />)}
      </dl>
    );

    if (!section.collapsed) return <Box className={className} title={heading}>{list}</Box>;

    return (
      <Box className={className}>
        <details className="group">
          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 outline-none focus-visible:outline-2 focus-visible:outline-white/60 [&::-webkit-details-marker]:hidden">
            <Chevron className="size-6 shrink-0 text-mc-gray transition-transform group-open:rotate-90" />
            <h2 className="text-mc-1.5 font-bold"><SectionTitle section={section} /></h2>
            <span className="text-mc-1.5 text-mc-gray">({n(cells.length)})</span>
          </summary>
          <div className="pt-3">{list}</div>
        </details>
      </Box>
    );
  }

  return (
    <Box className={className} title={heading}>
      <div className="flex flex-col gap-4">
        {section.rows.map((row, index) =>
          row.every((cell) => cell.inline) ?
            (
              <dl key={index} className="flex flex-col gap-2">
                {row.map((cell) => <SelectionStat key={cell.key} cell={cell} />)}
              </dl>
            ) :
            (
              <dl key={index} className={cn("grid gap-x-2 gap-y-4", columnsOf(sectionColumns(section.rows), headline))}>
                {row.map((cell) => <GameStat key={cell.key} cell={cell} username={username} />)}
              </dl>
            ))}
      </div>
    </Box>
  );
}

/** A stat's heading: the card's own name for it (in its colours, else the stat's), or the bot's word for it. */
function useStatLabel(cell: Stat): { text: string; node: ReactNode } {
  const { t } = useTranslation();

  if (cell.name !== undefined) {
    return { text: plainName(cell.name), node: <MinecraftText>{`${cell.colour}${cell.name}`}</MinecraftText> };
  }

  const text = t(cell.label, { ns: LABEL_NAMESPACES, ...cell.params });
  return { text, node: text };
}

const plainName = (name: string) => name.replaceAll(/§#[\dA-Fa-f]{6}|§./g, "");

/** A stat's value as the card prints it: a number in the locale's format (with its cap or unit), or the API's text. */
function useStatValue(cell: Stat): ReactNode {
  const n = useNumberFormat();
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
  const label = useStatLabel(cell);
  const value = useStatValue(cell);
  const { className, style } = colourOf(cell.colour);

  return (
    <StatCell
      label={label.node}
      value={cell.leaderboard ? <LeaderboardLink field={cell.leaderboard} username={username} stat={label.text}>{value}</LeaderboardLink> : value}
      color={className}
      style={style}
      className="relative"
    />
  );
}

/**
 * A name and its value on one line, as the card's lists draw them: the name on the left, bold unless the list keeps the
 * card's own formatting, and the value on the right.
 */
function ListStat({ cell, username, plain = false }: { cell: Stat; username: string; plain?: boolean }) {
  const label = useStatLabel(cell);
  const value = useStatValue(cell);
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

/** A selection the card shows (a kit, a trail) as `§7Label: value`, never a link. */
function SelectionStat({ cell }: { cell: Stat }) {
  const label = useStatLabel(cell);
  const value = useStatValue(cell);
  const { className, style } = colourOf(cell.colour);
  return <InlineStat label={label.text} value={value} color={className} style={style} />;
}

/**
 * The stat's leaderboard, opened at the player's row. The link covers the whole (`relative`) stat cell; its name says
 * where it goes.
 */
export function LeaderboardLink({
  field,
  username,
  stat,
  children,
}: {
  field: string;
  username: string;
  stat: string;
  children: ReactNode;
}) {
  const { t } = useTranslation();

  return (
    <Link to="/{-$locale}/leaderboards/$field" params={{ field }} search={{ around: username }} className={STAT_LINK}>
      {children}
      <span className="sr-only"> {t("game.leaderboard", { stat })}</span>
    </Link>
  );
}

/**
 * The mode switcher, or the submode one: tabs, as joined segments on phones and links from `md` up, or a native select,
 * by how many there are (`PHONE_TABS`, `DESKTOP_TABS`). Both keep the scroll position, and every target is 44 px tall.
 * The player's kit is marked.
 */
export function ModeSwitcher({ page, submodes = false }: { page: GamePage; submodes?: boolean }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const id = useId();
  const options: { key: string; name: string; selected?: boolean }[] = submodes ? page.submodes : page.modes;
  const current = submodes ? page.submode : page.mode;
  const mode = modeSearch(page, page.mode);
  // A new mode starts on its first submode.
  const search = (key: string) =>
    submodes ? { mode, submode: submodeSearch(page, key) } : { mode: modeSearch(page, key), submode: undefined };
  const name = (option: (typeof options)[number]) => (option.selected ? t("game.selected", { name: option.name }) : option.name);
  const phoneTabs = options.length <= PHONE_TABS;
  const desktopTabs = options.length <= DESKTOP_TABS;

  return (
    <nav aria-label={t(submodes ? "game.submodes" : "game.modes")}>
      {!phoneTabs && (
        // A form, so the select works without the page's scripts: its button, shown only then, sends the pick as
        // `?mode=` (a submode's with its mode), which the route reads. With them, a pick navigates in place.
        <form method="get" className={cn("flex items-center gap-3", desktopTabs && "md:hidden")}>
          {submodes && mode !== undefined && <input type="hidden" name="mode" value={mode} />}
          <label htmlFor={id} className="shrink-0 text-mc-1 text-mc-gray">{t(submodes ? "game.submode" : "game.mode")}</label>
          <div className="relative min-w-0 grow md:max-w-sm">
            {/* Uncontrolled, so the new choice shows while its page loads; a new page remounts it. */}
            <select
              key={current}
              id={id}
              name={submodes ? "submode" : "mode"}
              defaultValue={current ?? undefined}
              onChange={(event) =>
                void navigate({
                  to: "/{-$locale}/player/$name/$game",
                  params: { name: page.username, game: page.game.key },
                  search: search(event.target.value),
                  resetScroll: false,
                })}
              className="h-11 w-full min-w-0 appearance-none truncate bg-blackify-800 ps-3 pe-10 text-mc-1.5 text-white -outline-offset-2 focus-visible:outline-2 focus-visible:outline-white/60"
            >
              {options.map((option) => (
                <option key={option.key} value={option.key}>{name(option)}</option>
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
                to="/{-$locale}/player/$name/$game"
                params={{ name: page.username, game: page.game.key }}
                search={search(option.key)}
                resetScroll={false}
                activeOptions={{ exact: true, includeSearch: true }}
                // A column, so the box grows and segments in one row are the same height when a name wraps.
                className="group flex h-full flex-col outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
              >
                <Box className="grow text-mc-white/60 group-hover:text-mc-white group-aria-[current=page]:font-bold group-aria-[current=page]:text-mc-white content:flex content:min-h-11 content:items-center content:justify-center content:gap-2 content:px-2 content:py-1 content:text-center content:text-mc-1 content:text-balance md:content:justify-start md:content:px-3 md:content:py-0 md:content:text-start">
                  <span className="min-w-0 wrap-break-word">{name(option)}</span>
                </Box>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
