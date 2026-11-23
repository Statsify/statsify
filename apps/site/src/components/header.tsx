/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Link, useLocation } from "@tanstack/react-router";
import { Logo, Wordmark } from "~/components/icons/logo";
import { Search } from "~/components/search";
import { isSupportedLocale } from "~/i18n/locales";
import { useTranslation } from "react-i18next";

// Vanity paths are answered by the server with a 301, so they are plain anchors, not router links.
const NAV = [
  { key: "premium", href: "/premium" },
  { key: "discord", href: "/discord" },
  { key: "bot", href: "/invite" },
] as const;

/** Inner pages carry a compact search in the header; the search pages have their own. */
const SEARCH_PAGES = /^\/player\/[^/]+$/;

function pathWithoutLocale(pathname: string) {
  const [, first = "", ...rest] = pathname.split("/");
  return isSupportedLocale(first) ? `/${rest.join("/")}` : pathname;
}

export function Header() {
  const { t } = useTranslation();
  const pathname = useLocation({ select: (location) => location.pathname });
  const showSearch = SEARCH_PAGES.test(pathWithoutLocale(pathname));

  return (
    <header className="text-mc-white flex justify-center px-4 py-4 md:px-8">
      <div className="w-container flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <Link to="/{-$locale}" aria-label="Statsify" className="flex items-center gap-3">
          <Logo className="size-8 shrink-0" />
          <Wordmark className="hidden text-mc-1.5 sm:block" />
        </Link>
        {showSearch && (
          // On phones the search drops below the logo row.
          <Search compact className="order-last basis-full md:order-none md:basis-auto md:w-80 lg:w-96" />
        )}
        <nav aria-label={t("nav.label")}>
          <ul className="flex items-center gap-4 text-mc-1.5 sm:gap-6">
            {NAV.map(({ key, href }) => (
              <li key={key}>
                <a href={href} className="opacity-80 transition-opacity hover:opacity-100 hover:underline">
                  {t(`nav.${key}`)}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
