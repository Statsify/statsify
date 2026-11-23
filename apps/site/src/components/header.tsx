/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Link, useLocation, useMatch } from "@tanstack/react-router";
import { Logo, Wordmark } from "~/components/icons/logo";
import { Search } from "~/components/search";
import { SearchIcon } from "~/components/icons/search";
import { cn } from "~/lib/util";
import { flushSync } from "react-dom";
import { isSupportedLocale } from "~/i18n/locales";
import { useCallback, useState } from "react";
import { useOutisdeClick } from "~/hooks/use-outside-click";
import { useTranslation } from "react-i18next";

const PAGES = [
  { key: "players", to: "/{-$locale}/player" },
  { key: "leaderboards", to: "/{-$locale}/leaderboards" },
  { key: "bingo", to: "/{-$locale}/bingo" },
] as const;

// Vanity paths are answered by the server with a 301 to another site, so they are plain anchors rather than router
// links, and they open in a new tab.
const LINKS = [
  { key: "premium", href: "/premium" },
  { key: "discord", href: "/discord" },
  { key: "bot", href: "/invite" },
] as const;

const NAV_LINK = "flex min-h-11 min-w-11 items-center justify-center opacity-80 transition-opacity hover:opacity-100 hover:underline";

/**
 * Every page carries a compact search in the header except those with a search of their own: Players, and Bingo with
 * a player's board, whose search opens another board.
 */
const OWN_SEARCH = /^\/player\/?$|^\/bingo\/?$|^\/player\/[^/]+\/bingo\/?$/;

function pathWithoutLocale(pathname: string) {
  const [, first = "", ...rest] = pathname.split("/");
  return isSupportedLocale(first) ? `/${rest.join("/")}` : pathname;
}

export function Header() {
  const { t } = useTranslation();
  const pathname = useLocation({ select: (location) => location.pathname });
  const showSearch = !OWN_SEARCH.test(pathWithoutLocale(pathname));
  // On a game page a picked name opens the same game, mode and period, to compare; the profile is a tap away from there.
  const gameTarget = useMatch({
    from: "/{-$locale}/player/$name/$game",
    shouldThrow: false,
    select: (match) => ({ game: match.params.game, search: match.search }),
  });
  // On a game page's phone layout the search is a button in the logo row, so the stats start higher; it opens the box
  // in the search's row, focused, until a tap elsewhere or the next page.
  const compact = gameTarget !== undefined;
  const [searchedOn, setSearchedOn] = useState<string>();
  const searching = searchedOn === pathname;
  const hide = useCallback(() => setSearchedOn(undefined), []);
  const searchRow = useOutisdeClick<HTMLDivElement>(hide);

  const openSearch = () => {
    // Shown and focused in the tap itself, so a phone opens its keyboard.
    flushSync(() => setSearchedOn(pathname));
    searchRow.current?.querySelector("input")?.focus();
  };

  return (
    <header className="text-mc-white flex justify-center px-4 py-4 md:px-8">
      <div className="w-container flex flex-wrap items-center gap-x-4 gap-y-2 lg:gap-x-8">
        <Link to="/{-$locale}" aria-label="Statsify" className="flex min-h-11 min-w-11 items-center gap-3">
          <Logo className="size-8 shrink-0" />
          <Wordmark className="hidden text-mc-1.5 sm:block md:hidden xl:block" />
        </Link>
        {/* Below md the pages get a row of their own under the logo; from md they sit beside it. */}
        <nav aria-label={t("nav.label")} className="order-last basis-full md:order-none md:basis-auto">
          <ul className="flex items-center gap-4 text-mc-1.5 sm:gap-6">
            {PAGES.map(({ key, to }) => (
              <li key={key}>
                <Link to={to} className={cn(NAV_LINK, "data-[status=active]:font-bold data-[status=active]:underline data-[status=active]:opacity-100")}>
                  {t(`nav.${key}`)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        {showSearch && (
          // Below lg the search has the last row to itself.
          <div
            ref={searchRow}
            className={cn(
              "order-last basis-full lg:order-none lg:max-w-96 lg:min-w-0 lg:flex-1",
              compact && !searching && "max-md:hidden"
            )}
          >
            <Search compact shortcut target={gameTarget} />
          </div>
        )}
        <nav aria-label={t("nav.external")} className="ms-auto">
          <ul className="flex items-center gap-4 text-mc-1.5 sm:gap-6">
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
        {showSearch && compact && (
          <button
            type="button"
            aria-label={t("search.label")}
            aria-expanded={searching}
            onClick={openSearch}
            className="flex size-11 shrink-0 items-center justify-center bg-blackify-800 text-mc-gray hover:text-white focus-visible:focus-ring-inset md:hidden"
          >
            <SearchIcon className="size-5" />
          </button>
        )}
      </div>
    </header>
  );
}
