/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { AccountLink } from "~/components/account-link";
import { Link, useMatch, useRouterState } from "@tanstack/react-router";
import { Logo, Wordmark } from "~/components/icons/logo";
import { Search } from "~/components/search";
import { SearchIcon } from "~/components/icons/search";
import { cn } from "~/lib/util";
import { flushSync } from "react-dom";
import { isSupportedLocale } from "~/i18n/locales";
import { useCallback, useRef, useState } from "react";
import { useOutsideClick } from "~/hooks/use-outside-click";
import { useTranslation } from "react-i18next";

const PAGES = [
  { key: "players", to: "/{-$locale}/player" },
  { key: "leaderboards", to: "/{-$locale}/leaderboards" },
  { key: "bingo", to: "/{-$locale}/bingo" },
  { key: "guilds", to: "/{-$locale}/guild" },
] as const;

// Vanity paths are answered by the server with a 301 to another site, so they are plain anchors rather than router
// links, and they open in a new tab.
const LINKS = [
  { key: "premium", href: "/premium" },
  { key: "discord", href: "/discord" },
  { key: "bot", href: "/invite" },
] as const;

// Smaller under 360 px, where the pages' row and the logo's row with the search button don't fit 288 px at full size.
// The 44 px tap width is an overlay, not `min-w-11`, so a short name like "Bot" still ends on the frame line.
const NAV_LINK = "relative flex min-h-11 items-center text-mc-1.5 max-[22.5rem]:text-mc-1 opacity-80 transition-opacity hover:opacity-100 hover:underline after:absolute after:inset-y-0 after:left-1/2 after:w-full after:min-w-11 after:-translate-x-1/2";

/**
 * Every page carries a compact search in the header except those with a search of their own: Players, Guilds, and Bingo
 * with a player's board, whose search opens another board.
 */
const OWN_SEARCH = /^\/player\/?$|^\/guild\/?$|^\/bingo\/?$|^\/player\/[^/]+\/bingo\/?$/;

/** A player's board sits under Players' path but belongs to Bingo in the nav. */
const BINGO_BOARD = /^\/player\/[^/]+\/bingo\/?$/;

function pathWithoutLocale(pathname: string) {
  const [, first = "", ...rest] = pathname.split("/");
  return isSupportedLocale(first) ? `/${rest.join("/")}` : pathname;
}

export function Header() {
  const { t } = useTranslation();
  // The page on screen, not the one loading, so the header's search and the page's own never show at once.
  const pathname = useRouterState({ select: ({ matches, location }) => matches.at(-1)?.pathname ?? location.pathname });
  const path = pathWithoutLocale(pathname);
  const showSearch = !OWN_SEARCH.test(path);
  const bingoBoard = BINGO_BOARD.test(path);
  // On a game page a picked name opens the same game, mode and period, to compare; the profile is a tap away from there.
  const gameTarget = useMatch({
    from: "/{-$locale}/player/$name/$game",
    shouldThrow: false,
    select: (match) => ({ game: match.params.game, search: match.search }),
  });
  // On phones the search is a button at the logo row's end, so the page starts higher; it opens the box in the search's
  // row, focused, until a tap elsewhere, the button again or the next page.
  const [searchedOn, setSearchedOn] = useState<string>();
  const searching = searchedOn === pathname;
  const searchButton = useRef<HTMLButtonElement>(null);
  const hide = useCallback((event: PointerEvent) => {
    if (!searchButton.current?.contains(event.target as Node)) setSearchedOn(undefined);
  }, []);
  const searchRow = useOutsideClick<HTMLDivElement>(hide);

  const toggleSearch = () => {
    if (searching) {
      setSearchedOn(undefined);
      return;
    }
    // Shown and focused in the tap itself, so a phone opens its keyboard.
    flushSync(() => setSearchedOn(pathname));
    searchRow.current?.querySelector("input")?.focus();
  };

  return (
    <header className="text-mc-white flex justify-center bg-blackify-950 px-4 py-4 md:px-8">
      <div className="w-container flex flex-wrap items-center gap-x-4 gap-y-2 lg:gap-x-8">
        <Link to="/{-$locale}" aria-label="Statsify" className="flex min-h-11 min-w-11 items-center gap-3">
          <Logo className="size-8 shrink-0" />
          <Wordmark className="hidden text-mc-1.5 sm:block md:hidden xl:block" />
        </Link>
        {/* Below md the pages get a row of their own under the logo; from md they sit beside it. */}
        <nav aria-label={t("nav.label")} className="order-last basis-full md:order-none md:basis-auto">
          <ul className="flex items-center gap-4 sm:gap-6">
            {PAGES.map(({ key, to }) => (
              <li key={key}>
                <Link
                  to={to}
                  activeOptions={{ exact: key === "players" && bingoBoard }}
                  data-status={key === "bingo" && bingoBoard ? "active" : undefined}
                  aria-current={key === "bingo" && bingoBoard ? "page" : undefined}
                  className={cn(NAV_LINK, "data-[status=active]:font-bold data-[status=active]:underline data-[status=active]:opacity-100")}
                >
                  {/* Each name holds its bold width, so the links after it don't move when it becomes the page's. */}
                  <span className="grid justify-items-start">
                    <span className="col-start-1 row-start-1">{t(`nav.${key}`)}</span>
                    <span aria-hidden className="invisible col-start-1 row-start-1 font-bold">{t(`nav.${key}`)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        {showSearch && (
          // Below lg the search has the last row to itself, and on phones the account link beside it.
          <div
            ref={searchRow}
            className={cn(
              "order-last flex basis-full items-center gap-4 lg:order-none lg:max-w-96 lg:min-w-0 lg:flex-1",
              !searching && "max-md:hidden"
            )}
          >
            <Search compact shortcut recent target={gameTarget} className="min-w-0 flex-1" />
            <AccountLink className={cn(NAV_LINK, "md:hidden")} />
          </div>
        )}
        <nav aria-label={t("nav.external")} className="ms-auto">
          <ul className="flex items-center gap-4 sm:gap-6">
            {LINKS.map(({ key, href }) => (
              <li key={key}>
                <a href={href} target="_blank" rel="noreferrer" className={NAV_LINK}>
                  {t(`nav.${key}`)}
                  <span className="sr-only"> {t("nav.newTab")}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
        {/* A phone's logo row has the search button and no room for it, so there it sits in the opened search row. */}
        <AccountLink className={cn(NAV_LINK, showSearch && "max-md:hidden")} />
        {/* Not held unseen on pages with a search of their own: the account link takes its place there, and a phone's
            logo row has no room for both. */}
        {showSearch && (
          <button
            ref={searchButton}
            type="button"
            aria-label={t("search.label")}
            aria-expanded={searching}
            onClick={toggleSearch}
            className="flex size-11 shrink-0 items-center justify-center bg-blackify-800 text-mc-gray hover:text-white focus-visible:focus-ring-inset md:hidden"
          >
            <SearchIcon className="size-5" />
          </button>
        )}
      </div>
    </header>
  );
}
