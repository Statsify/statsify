/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Button } from "~/components/ui/button";
import { useEffect, useRef } from "react";
import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { Search } from "~/components/search";
import { useNumberFormat } from "~/i18n/use-number-format";
import { useTranslation } from "react-i18next";
import type { AroundMiss } from "./leaderboard-data";
import type { ReactNode } from "react";
import type { LeaderboardPage } from "@statsify/contract";

// The table's rows from `md` up (`LeaderboardCards`): one 48 px row per player, with the column labels once in a
// Minecraft 16 §7 header. A row's position, head and name share one element across their three columns, and its
// values another; a row's stripe or highlight is on both.
export const HEADER = "flex h-10 items-center border-b-2 border-black/30 bg-blackify-800 px-2 text-mc-1 text-mc-gray md:text-mc-1.5";
export const PLAYER = "sticky col-span-3 grid grid-cols-subgrid";
export const VALUES = "col-span-(--columns) grid grid-cols-subgrid";
// Layers (gradients) over the panel.
export const STRIPE = "bg-linear-to-r from-black/15 to-black/15";
// The bot's highlighted row is a white 0.35 panel (`leaderboard.profile.tsx`). Forced colours drop backgrounds, so
// there it's a border.
export const HIGHLIGHT = "bg-linear-to-r from-white/35 to-white/35 forced-colors:border-y-2 forced-colors:border-[color:Highlight]";

/** A row's name: a link to the player's page for the board's game and mode where there is one, else to the profile. */
export function PlayerLink({ page, name, className, children }: { page: LeaderboardPage; name: string; className?: string; children: ReactNode }) {
  const target = page.gamePage;
  if (!target) return <Link to="/{-$locale}/player/$name" params={{ name }} className={className}>{children}</Link>;

  return (
    <Link
      to="/{-$locale}/player/$name/$game"
      params={{ name, game: target.game }}
      search={{ mode: target.mode, submode: target.submode }}
      className={className}
    >
      {children}
    </Link>
  );
}

/**
 * A ref for the highlighted (`around`) row, which is brought into view, centred, when the page lands. After a client
 * navigation the router scrolls the window to the top once the new page is on screen, so the row is centred again
 * then; a page Back or Forward put back where it was left stays there.
 */
export function useHighlightScroll<T extends HTMLElement>(page: LeaderboardPage) {
  const ref = useRef<T>(null);
  const router = useRouter();

  useEffect(() => {
    const row = ref.current;
    if (!row) return;

    const scroll = () => row.scrollIntoView({ block: "center", inline: "nearest" });
    scroll();
    const unsubscribe = router.subscribe("onRendered", () => {
      unsubscribe();
      if (scrollY === 0) scroll();
    });
    return unsubscribe;
  }, [page, router]);

  return ref;
}

/** Previous and next page links around the page count; the links drop `around`. */
export function PageNav({ field, page, pages }: { field: string; page: number; pages: number }) {
  const { t } = useTranslation();
  const n = useNumberFormat();

  const pageLink = (target: number, label: string, disabled: boolean) => (
    <Button asChild size="small" className="min-w-32 sm:min-w-40">
      <Link
        to="/{-$locale}/leaderboards/$field"
        params={{ field }}
        // URLs count pages from 1, as the page count does; the first page has no `?page=`.
        search={{ page: target > 0 ? target + 1 : undefined }}
        preload={false}
        disabled={disabled}
        aria-disabled={disabled}
      >
        {label}
      </Link>
    </Button>
  );

  return (
    // Phones put the page count above the two buttons, so nothing wraps or overflows.
    <nav className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2" aria-label={t("leaderboards.title")}>
      {pageLink(page - 1, t("leaderboards.previous"), page <= 0)}
      <p className="order-first basis-full text-mc-1 whitespace-nowrap text-center sm:order-none sm:basis-auto sm:text-mc-1.5">{t("leaderboards.page", { page: n(page + 1), pages: n(Math.max(pages, 1)) })}</p>
      {pageLink(page + 1, t("leaderboards.next"), page + 1 >= pages)}
    </nav>
  );
}

/** The `around=<name>` entry: the shared search box, submitting into this leaderboard's query string. */
export function FindPlayer({ field, miss }: { field: string; miss?: AroundMiss }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex w-full max-w-200 flex-col gap-2 self-center">
      <Search
        compact
        className="w-full"
        placeholder={t("leaderboards.find")}
        onSelect={(name) => navigate({ to: "/{-$locale}/leaderboards/$field", params: { field }, search: { around: name } })}
      />
      {miss && <p className="text-mc-1 text-mc-yellow text-center">{t(`leaderboards.${miss.kind}`, { name: miss.name })}</p>}
    </div>
  );
}
