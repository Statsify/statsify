/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { PageBackground, backgroundFor } from "~/components/ui/background";
import { BOX_GAP, Box } from "~/components/ui/box";
import { Command } from "~/components/ui/command";
import { FilterBox, wordMatcher } from "~/components/filter-box";
import { Fragment, type ReactNode, type Ref, useEffect, useId, useRef, useState } from "react";
import { GameNav } from "./game-nav";
import { Hint, PointerText, Spoken } from "~/components/ui/hint";
import { InlineStat, LeaderboardLink, StatCell, StatNumber, useStatName } from "~/components/ui/stat";
import { Link } from "@tanstack/react-router";
import { MinecraftText, colourClass, leadingColourClass, nameColour, plainText } from "~/components/ui/minecraft-text";
import { MiniHeader } from "~/features/player/mini-header";
import { ModeSwitcher } from "./mode-switcher";
import { PanelToggle, SharePanel } from "~/features/player/share-panel";
import { RefreshBar } from "~/features/player/refresh-bar";
import { SkinBust } from "~/components/ui/skin";
import { StatPanel, useLabelText } from "./stat-panel";
import { cn } from "~/lib/util";
import { gamePageQuery, headingText, modeSearch, periodSearch, submodeSearch } from "./game-data";
import { imageSize, pageCard } from "@statsify/profiles/protocol";
import { minigameXpBar } from "~/components/ui/progression";
import { orpc } from "~/lib/orpc";
import { refreshGame } from "~/features/player/player-actions";
import { addRecentPlayer } from "~/features/player/recent";
import { useNumberFormat } from "~/i18n/use-number-format";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { GamePage, StatCell as Stat, StatSection } from "@statsify/contract";

type Level = NonNullable<GamePage["level"]>;

const cellsOf = (sections: StatSection[]) => sections.flatMap(({ rows }) => rows.flat());

/** The card's side-by-side boxes, in as many equal columns from `lg` up; four go two by two, as the card draws them. */
const BOX_COLUMNS = ["", "", "lg:grid-cols-snap-2", "lg:grid-cols-snap-3", "lg:grid-cols-snap-2"];

/**
 * A player's page for one game, in the order of the bot's card: nametag and title, level and progress, the stats for
 * the whole game, then one mode's stats under the mode switcher (and the submode's, where a mode has them). Every stat
 * opens its leaderboard at the player. Phones stack the panels; from `md` up the nametag sits beside the level, and
 * from `lg` up the card's boxes sit side by side, and the headline table beside the mode's other tables. Lists (maps, challenges) take
 * the full width below, and one filter box above the first long one searches them all.
 */
export function GameView({ page }: { page: GamePage }) {
  const { t } = useTranslation();
  const n = useNumberFormat();
  const queryClient = useQueryClient();
  const nametag = useRef<HTMLDivElement>(null);
  const shareId = useId();
  const [sharing, setSharing] = useState(false);
  const [filter, setFilter] = useState("");

  useEffect(
    () => addRecentPlayer({ uuid: page.uuid, name: page.username, colour: nameColour(page.displayName) }),
    [page.uuid, page.username, page.displayName]
  );

  const mode = modeSearch(page, page.mode);
  const submode = submodeSearch(page, page.submode);
  const period = periodSearch(page, page.period);
  // The card the page unfurls with, as its route's head picks it.
  const card = new URLSearchParams({ game: page.game.key, ...(mode && { mode }), ...(submode && { submode }), ...(period && { period }), v: String(page.updatedAt) });
  const cardSize = imageSize(pageCard(page), "og");
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
    <div key="boxes" className={cn("grid grid-cols-1", BOX_GAP, BOX_COLUMNS[Math.min(boxes.length, BOX_COLUMNS.length - 1)])}>
      {boxes.map((section, index) => (
        <StatPanel key={section.title ?? section.name ?? index} section={section} username={page.username} />
      ))}
    </div>
  );

  const headlinePanels = headline && (
    <div key="headline" className={cn("grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_round(down,40%,8px)] lg:items-start", BOX_GAP)}>
      <StatPanel section={headline} username={page.username} headline className={cn(tables.length === 0 && "lg:col-span-2")} />
      {tables.length > 0 && (
        <div className={cn("flex flex-col", BOX_GAP)}>
          {tables.map((section, index) => (
            <StatPanel key={section.title ?? section.name ?? index} section={section} username={page.username} />
          ))}
        </div>
      )}
    </div>
  );

  // Everything cached for this player predates the refresh: it reloads the next time it's shown.
  const refresh = async (deadline: AbortSignal, auto: boolean) => {
    const result = await refreshGame({ data: { uuid: page.uuid, game: page.game.key, mode, submode, period, auto }, signal: deadline });

    if (result.ok) {
      await queryClient.invalidateQueries({ queryKey: orpc.player.key({ input: { uuid: page.uuid } }), refetchType: "none" });
      queryClient.setQueryData(gamePageQuery(page.uuid, page.game.key, mode, submode, period).queryKey, result.data);
    }

    return result;
  };

  const shareToggle = (
    <PanelToggle open={sharing} controls={shareId} onToggle={() => setSharing(!sharing)}>
      {t("player.share.open")}
    </PanelToggle>
  );

  return (
    <div className="relative grow">
      <PageBackground background={backgroundFor(page.game.key)} viewport mask="linear-gradient(rgb(255 255 255) 30%, rgb(0 0 0 / 0) 95%)" />
      <MiniHeader watch={nametag} uuid={page.uuid} name={page.displayName} game={`${page.game.name}${page.heading.mode ? ` §r(${page.heading.mode}§r)` : ""}`} />
      <div className="w-container flex flex-col gap-4 px-4 py-6 text-mc-white md:px-8">
        {/* From `md` the nametag is as wide as its content (up to half the row) and the level sits beside it, the
            overview under both; from `lg` the overview goes under the level. An overview with no level sits beside the
            nametag at its own height, and a nametag with neither (Parkour) is as wide as its content. */}
        <div className={cn("grid grid-cols-1 md:grid-cols-[fit-content(50%)_minmax(0,1fr)]", BOX_GAP)}>
          <GameHeader
            ref={nametag}
            page={page}
            actions={shareToggle}
            refresh={<RefreshBar updatedAt={page.updatedAt} expiresAt={page.expiresAt} refresh={refresh} auto beside={shareToggle} />}
            className={cn(page.level && page.overview.length > 0 && "lg:row-span-2", !page.level && page.overview.length === 0 && "md:col-span-2 md:w-fit")}
          />
          {page.level && <LevelPanel level={page.level} username={page.username} />}
          {page.overview.length > 0 && (
            <StatPanel
              section={overviewSection(page.overview)}
              username={page.username}
              className={page.level ? "md:col-span-2 lg:col-span-1" : "md:self-center"}
            />
          )}
          <RefreshBar
            updatedAt={page.updatedAt}
            expiresAt={page.expiresAt}
            refresh={refresh}
            auto
            row
            className="max-md:hidden md:col-span-2 md:mt-2"
          />
        </div>
        {sharing && (
          <SharePanel
            id={shareId}
            name={page.username}
            card={{ src: `/og/${page.uuid}.png?${card}`, ...cardSize }}
            file={`${[page.username, page.game.key, mode, submode, period].filter(Boolean).join("-")}.png`}
          />
        )}
        {/* The Games button and the mode select share a row (on phones, so the tables start nearer the top); the open
            Games grid lies over the page below it. On phones the tabs share it too; from `md` links and tabs take rows
            of their own. */}
        <div className="relative flex flex-wrap items-start gap-x-2 gap-y-4 empty:hidden">
          {page.games.length > 1 && <GameNav games={page.games} username={page.username} current={page.game.key} className="shrink-0" />}
          {page.modes.length > 1 && <ModeSwitcher page={page} />}
        </div>
        {page.submodes.length > 1 && <ModeSwitcher page={page} kind="submode" />}
        {(page.periods?.length ?? 0) > 1 && <ModeSwitcher page={page} kind="period" />}
        {page.window && <PeriodDates {...page.window} />}
        {page.games.find(({ key }) => key === page.game.key)?.played === false && (
          <NeverPlayed name={page.username} game={plainText(page.game.name)} />
        )}
        <p className="text-mc-1 text-mc-gray">
          <PointerText mouse={t("game.hint", { name: page.username })} touch={t("game.hintTouch", { name: page.username })} />{" "}
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

/** The nametag, linking back to the player page, over the card's title. */
export function GameHeader({
  page,
  actions,
  refresh,
  className,
  ref,
}: {
  page: GamePage;
  /** Buttons under the title that open panels under the header. */
  actions?: ReactNode;
  /** The refresh bar, in place of `actions` on phones (it carries them), so the tables start higher. */
  refresh?: ReactNode;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}) {
  const { t } = useTranslation();

  return (
    <Box ref={ref} className={cn("content:flex content:h-full content:items-center content:gap-4", className)}>
      <SkinBust uuid={page.uuid} className="h-24 w-16 shrink-0 sm:h-40 sm:w-28" />
      <div className="flex min-w-0 grow flex-col">
        <h1 className="flex flex-col gap-2">
          {/* A long rank and name wraps onto a second line beside a phone's bust rather than being cut off. */}
          <Link to="/{-$locale}/player/$name" params={{ name: page.username }} className="wrap-break-word text-mc-2 hover:underline">
            <MinecraftText>{page.displayName}</MinecraftText>
          </Link>
          {/* Read as text, the two lines would otherwise run together ("anrieBedWars Stats"). */}
          <span className="sr-only"> · </span>
          <MinecraftText className="text-mc-1.5">{headingText(page, (key) => t(key))}</MinecraftText>
        </h1>
        {actions && <div className={cn("flex flex-wrap gap-x-4", refresh !== undefined && "max-md:hidden")}>{actions}</div>}
        {refresh !== undefined && <div className="mt-2 md:hidden">{refresh}</div>}
      </div>
    </Box>
  );
}

/**
 * The card's description: the level (linked to the leaderboard of what it ranks), the bar from this level to the
 * next, and the progress, under the card's own words for the level and for what the bar counts.
 */
export function LevelPanel({ level, username }: { level: Level; username: string }) {
  const { t } = useTranslation();
  const statName = useStatName();
  const { current, max, percent } = level.progression;
  const { colours } = level;
  const label = t(`default:${level.label}`);
  const full = statName(level.label);
  const value = <MinecraftText>{level.current}</MinecraftText>;

  // Every line centred, a wrapped one too (a long title, its bar and the next one on a phone).
  return (
    <Box className="content:flex content:h-full content:flex-col content:items-center content:justify-center content:gap-3 content:text-center">
      {/* Within the panel: a long level (The Pit past its last prestige) breaks rather than widening the page. */}
      <dl className="max-w-full">
        <StatCell
          label={level.leaderboard ? <Spoken full={full}>{label}</Spoken> : <Hint full={full}>{label}</Hint>}
          value={level.leaderboard ?
            <LeaderboardLink field={level.leaderboard} username={username} stat={full ?? label} hint={full}>{value}</LeaderboardLink> :
            value}
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
          label={<Hint full={statName(level.progress)}>{t(`default:${level.progress}`)}</Hint>}
          value={max === undefined ?
            <span className={cn("font-bold", colourClass(colours?.maxed ?? "§b"))}>{t(`game.${level.maxedWord ?? "maxed"}`)}</span> :
            (
              <>
                <span className={colourClass(colours?.current ?? "§b")}><StatNumber value={current} /></span>
                {colours ? <span className={colourClass(colours.slash)}>/</span> : "/"}
                <span className={colourClass(colours?.max ?? "§a")}><StatNumber value={max} /></span>
              </>
            )}
        />
      </dl>
    </Box>
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
