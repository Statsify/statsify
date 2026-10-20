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
import { InlineStat, STAT_LINK, StatCell } from "~/components/ui/stat";
import { Link, useNavigate } from "@tanstack/react-router";
import { MinecraftText, colourClass, leadingColourClass } from "~/components/ui/minecraft-text";
import { type ReactNode, useId } from "react";
import { RefreshBar } from "~/features/player/refresh-bar";
import { SkinBust } from "~/components/ui/skin";
import { cn } from "~/lib/util";
import { gamePageQuery, modeSearch } from "./game-data";
import { minigameXpBar } from "~/components/ui/progression";
import { orpc } from "~/lib/orpc";
import { refreshGame } from "~/features/player/player-actions";
import { useNumberFormat } from "~/i18n/use-number-format";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { GamePage, StatCell as Stat } from "@statsify/contract";

type Level = NonNullable<GamePage["level"]>;

/** On a phone an odd last cell spans its row, centred, rather than sitting alone in the first column. */
const ODD_LAST = "max-sm:[&>:last-child:nth-child(odd)]:col-span-2";

/** Cells a row by count: two on phones, up to four from `sm` up. */
const COLUMNS = [
  "grid-cols-1",
  "grid-cols-1",
  "grid-cols-2",
  `grid-cols-2 sm:grid-cols-3 ${ODD_LAST}`,
  `grid-cols-2 sm:grid-cols-4 ${ODD_LAST}`,
];

/**
 * A player's page for one game, in the order of the bot's card: nametag and title, level and progress, the stats for
 * the whole game, then one mode's stats under the mode switcher. Every stat opens its leaderboard at the player.
 * Phones stack the panels; from `lg` up the nametag sits beside the level, and the headline table beside the rest.
 */
export function GameView({ page }: { page: GamePage }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const mode = modeSearch(page, page.mode);
  const modeName = page.modes.find(({ key }) => key === page.mode)?.name;
  const [headline, ...sections] = page.sections;

  // Everything cached for this player predates the refresh: it reloads the next time it's shown.
  const refresh = async () => {
    const result = await refreshGame({ data: { uuid: page.uuid, game: page.game.key, mode } });

    if (result.ok) {
      await queryClient.invalidateQueries({ queryKey: orpc.player.key({ input: { uuid: page.uuid } }), refetchType: "none" });
      queryClient.setQueryData(gamePageQuery(page.uuid, page.game.key, mode).queryKey, result.data);
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
          <GameHeader page={page} modeName={modeName} className="lg:row-span-2" />
          {page.level && <LevelPanel level={page.level} username={page.username} />}
          {page.overview.length > 0 && <StatPanel cells={page.overview} username={page.username} />}
          <RefreshBar
            updatedAt={page.updatedAt}
            expiresAt={page.expiresAt}
            refresh={refresh}
            row
            className="mb-2 lg:col-span-2 lg:mt-2 lg:mb-0"
          />
        </div>
        <ModeSwitcher username={page.username} game={page.game.key} modes={page.modes} mode={page.mode} />
        <p className="text-mc-1 text-mc-gray">{t("game.hint", { name: page.username })}</p>
        {headline && (
          <div className="grid grid-cols-1 gap-2 lg:grid-cols-[3fr_2fr]">
            <StatPanel
              title={headline.title}
              cells={headline.cells}
              username={page.username}
              columns={headline.title === null ? "grid-cols-3" : undefined}
              className={cn(sections.length === 0 && "lg:col-span-2")}
            />
            {sections.length > 0 && (
              <div className="flex flex-col gap-2">
                {sections.map((section, index) => (
                  <StatPanel key={section.title ?? index} title={section.title} cells={section.cells} username={page.username} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/** The nametag, linking back to the player page, over the card's title: the game, "Stats" and the mode. */
export function GameHeader({ page, modeName, className }: { page: GamePage; modeName?: string; className?: string }) {
  const { t } = useTranslation();

  return (
    <Box className={cn("content:flex content:h-full content:items-center content:gap-4", className)}>
      <SkinBust uuid={page.uuid} className="h-24 w-16 shrink-0 sm:h-40 sm:w-28" />
      <h1 className="flex min-w-0 grow flex-col gap-2">
        {/* A long rank and name wraps onto a second line beside a phone's bust rather than being cut off. */}
        <Link to="/{-$locale}/player/$name" params={{ name: page.username }} className="wrap-break-word text-mc-2 hover:underline">
          <MinecraftText>{page.displayName}</MinecraftText>
        </Link>
        <MinecraftText className="text-mc-1.5">
          {`§l${page.game.name} §f${t("game.stats")}${modeName ? ` §r(${modeName})` : ""}`}
        </MinecraftText>
      </h1>
    </Box>
  );
}

/** The card's description: the level (linked to its leaderboard), the bar from this level to the next, and the EXP. */
export function LevelPanel({ level, username, className }: { level: Level; username: string; className?: string }) {
  const { t } = useTranslation();
  const n = useNumberFormat();
  const { current, max, percent } = level.progression;
  const label = t("default:stats.level");
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
          label={t("default:stats.progression.exp")}
          value={max === undefined ?
            <span className="font-bold text-mc-aqua">{t("game.maxed")}</span> :
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

/** A panel of stat cells, under a `game.sections.*` title when it has one. */
export function StatPanel({
  title = null,
  cells,
  username,
  columns = COLUMNS[Math.min(cells.length, 4)],
  className,
}: {
  title?: string | null;
  cells: Stat[];
  username: string;
  columns?: string;
  className?: string;
}) {
  const { t } = useTranslation();

  return (
    <Box className={className} title={title === null ? undefined : <h2 className="text-mc-1.5 font-bold">{t(title)}</h2>}>
      <dl className={cn("grid gap-x-2 gap-y-4", columns)}>
        {cells.map((cell) => (
          <GameStat key={cell.key} cell={cell} username={username} />
        ))}
      </dl>
    </Box>
  );
}

/**
 * One stat as the card draws it, in its colour, with the bot's label. A capped stat shows its cap after it (`12/25`) in
 * §7 like the card, at the label's size so the pair fits a phone's cell.
 */
function GameStat({ cell, username }: { cell: Stat; username: string }) {
  const { t } = useTranslation();
  const n = useNumberFormat();
  const label = t(`default:${cell.label}`);

  const value = typeof cell.value === "number" ? n(cell.value) : <MinecraftText>{cell.value}</MinecraftText>;
  const shown = cell.of === undefined ? value : (
    <>
      {value}
      <span className="text-mc-1 text-mc-gray">/{n(cell.of)}</span>
    </>
  );

  return (
    <StatCell
      label={label}
      value={cell.leaderboard ? <LeaderboardLink field={cell.leaderboard} username={username} stat={label}>{shown}</LeaderboardLink> : shown}
      color={colourClass(cell.colour)}
      className="relative"
    />
  );
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
 * The game's modes: every one as a link from `md` up, a native select on phones. The first mode's URL has no
 * `?mode=`. The page stays until the next mode has loaded, like any navigation.
 */
export function ModeSwitcher({
  username,
  game,
  modes,
  mode,
}: {
  username: string;
  game: string;
  modes: GamePage["modes"];
  mode: string;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const id = useId();
  const search = (key: string) => ({ mode: modeSearch({ modes }, key) });

  return (
    <nav aria-label={t("game.modes")}>
      <div className="flex items-center gap-3 md:hidden">
        <label htmlFor={id} className="shrink-0 text-mc-1 text-mc-gray">{t("game.mode")}</label>
        <div className="relative min-w-0 grow">
          {/* Uncontrolled, so the new choice shows while its page loads; a new mode remounts it. */}
          <select
            key={mode}
            id={id}
            defaultValue={mode}
            onChange={(event) =>
              void navigate({
                to: "/{-$locale}/player/$name/$game",
                params: { name: username, game },
                search: search(event.target.value),
              })}
            className="h-11 w-full min-w-0 appearance-none truncate bg-blackify-800 ps-3 pe-10 text-mc-1.5 text-white -outline-offset-2 focus-visible:outline-2 focus-visible:outline-white/60"
          >
            {modes.map(({ key, name }) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </select>
          <Chevron className="pointer-events-none absolute end-2 top-1/2 size-6 -translate-y-1/2 rotate-90 text-mc-gray" />
        </div>
      </div>
      <ul className="hidden flex-wrap gap-x-1 gap-y-2 md:flex">
        {modes.map(({ key, name }) => (
          <li key={key}>
            <Link
              to="/{-$locale}/player/$name/$game"
              params={{ name: username, game }}
              search={search(key)}
              aria-current={key === mode ? "page" : undefined}
              activeOptions={{ exact: true, includeSearch: true }}
              className="group block outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
            >
              <Box className="text-mc-white/60 group-hover:text-mc-white group-aria-[current=page]:font-bold group-aria-[current=page]:text-mc-white content:flex content:min-h-11 content:items-center content:px-3 content:py-0 content:text-mc-1">
                {name}
              </Box>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
