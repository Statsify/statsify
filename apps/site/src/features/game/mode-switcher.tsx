/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Box, CELL } from "~/components/ui/box";
import { Chevron } from "~/components/icons/chevron";
import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { cn } from "~/lib/util";
import { GameNav } from "./game-nav";
import { type GameScope, gameLink, modeSearch, pageSearch, periodSearch, submodeSearch } from "./game-data";
import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import type { GamePage } from "@statsify/contract";

/**
 * The mode switcher goes by how many modes there are, not the screen's width, so the server's render and the hydrated
 * page agree. Up to `PHONE_TABS` it's tabs at every width; past that, a select below `md`. Up to `DESKTOP_TABS` it's
 * links from `md` up; past that, the select at every width.
 */
const PHONE_TABS = 4;
const DESKTOP_TABS = 10;

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
export function ModeSwitcher({ page, scope, kind = "mode" }: { page: GamePage; scope: GameScope; kind?: keyof typeof SWITCHER_WORDS }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const router = useRouter();
  const id = useId();
  const periods = (page.periods ?? []).map((key) => ({ key, name: t(`game.periodNames.${key}`) }));
  const options: GamePage["modes"] = { mode: page.modes, submode: page.submodes, period: periods }[kind];
  const current = { mode: page.mode, submode: page.submode, period: page.period ?? null }[kind];
  const { mode, submode, period } = pageSearch(page);
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
  const to = (key: string) => ({ ...gameLink(scope, page.game.key), search: search(key) });
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
              className="h-11 w-full min-w-0 appearance-none truncate bg-blackify-800 ps-3 pe-10 text-mc-1.5 text-white focus-visible:focus-ring-inset"
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
              className="h-11 shrink-0 bg-blackify-800 px-3 text-mc-1.5 text-white hover:bg-blackify-700 focus-visible:focus-ring-inset"
            >
              {t("game.go")}
            </button>
          </noscript>
        </form>
      )}
      {desktopTabs && (
        <ul
          className={cn(
            "flex-wrap gap-1 md:gap-y-2",
            // On phones a tab that doesn't fit beside the others moves to the next row whole, and each row's tabs grow
            // to fill it; a name only wraps between words, when its tab is wider than a row.
            phoneTabs ? "flex" : "hidden md:flex"
          )}
        >
          {options.map((option) => (
            <li key={option.key} className="grow md:grow-0">
              <Link
                {...to(option.key)}
                resetScroll={false}
                activeOptions={{ exact: true, includeSearch: true }}
                title={option.mostPlayed && t(`${markWords(option.mostPlayed)}.${option.mostPlayed}`)}
                // A column, so the box grows and segments in one row are the same height when a name wraps.
                className="group flex h-full flex-col"
              >
                <Box
                  className={cn(
                    CELL,
                    "grow text-mc-white/60 group-hover:text-mc-white group-aria-[current=page]:font-bold group-aria-[current=page]:text-mc-white content:gap-2 content:px-2 content:text-center content:text-mc-1 content:text-balance md:content:justify-start md:content:px-3 md:content:py-0 md:content:text-start"
                  )}
                >
                  {option.mostPlayed && <span aria-hidden className="size-2 shrink-0 bg-mc-gold forced-color-adjust-none" />}
                  <span>{name(option)}</span>
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
 * A game page's Games button and switchers. The Games button and the mode select share a row (on phones, so the tables
 * start nearer the top); the open Games grid lies over the page below it. On phones the tabs share it too; from `md`
 * links and tabs take rows of their own.
 */
export function GameSwitchers({ page, scope }: { page: GamePage; scope: GameScope }) {
  return (
    <>
      <div className="relative flex flex-wrap items-start gap-x-2 gap-y-4 empty:hidden">
        {page.games.length > 1 && <GameNav games={page.games} scope={scope} current={page.game.key} className="shrink-0" />}
        {page.modes.length > 1 && <ModeSwitcher page={page} scope={scope} />}
      </div>
      {page.submodes.length > 1 && <ModeSwitcher page={page} scope={scope} kind="submode" />}
      {(page.periods?.length ?? 0) > 1 && <ModeSwitcher page={page} scope={scope} kind="period" />}
    </>
  );
}
