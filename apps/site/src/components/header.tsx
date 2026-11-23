/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Link } from "@tanstack/react-router";
import { Logo, Wordmark } from "~/components/icons/logo";
import { useTranslation } from "react-i18next";

// Vanity paths are answered by the server with a 301, so they are plain anchors, not router links.
const NAV = [
  { key: "premium", href: "/premium" },
  { key: "discord", href: "/discord" },
  { key: "bot", href: "/invite" },
] as const;

export function Header() {
  const { t } = useTranslation();

  return (
    <header className="text-mc-white flex justify-center px-4 py-4 md:px-8">
      <div className="w-container flex items-center justify-between gap-4">
        <Link to="/{-$locale}" aria-label="Statsify" className="flex items-center gap-3">
          <Logo className="size-8 shrink-0" />
          <Wordmark className="hidden text-mc-1.5 sm:block" />
        </Link>
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
