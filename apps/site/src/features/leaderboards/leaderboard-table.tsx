/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Box } from "~/components/ui/box";
import { Button } from "~/components/ui/button";
import { Fragment, useEffect, useRef } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { MinecraftText } from "~/components/ui/minecraft-text";
import { Search } from "~/components/search";
import { SkinHead } from "~/components/ui/skin";
import { cn } from "~/lib/util";
import { formatPosition } from "@statsify/profiles/format-position";
import { useNumberFormat } from "~/i18n/use-number-format";
import { useTranslation } from "react-i18next";
import type { AroundMiss } from "./leaderboard-data";
import type { CSSProperties } from "react";
import type { LeaderboardPage } from "@statsify/contract";

// One 48 px row per player at every width, with the column labels once in a Minecraft 16 §7 header.
// Phones show the leaderboard's own value; the extra columns join from `md` up.
const HEADER = "flex items-end px-2 pb-2 text-mc-1 text-mc-gray";
const CELL = "flex h-12 items-center px-2";
const EXTRA = "hidden md:flex";
const STRIPE = "bg-black/15";
// The bot's highlighted row is a white 0.35 panel (`leaderboard.profile.tsx`).
const HIGHLIGHT = "bg-white/35";

/**
 * The 25 rows of one page: position, head, name and the leaderboard's value columns. Each position cell carries the
 * row's UUID as its id, so `#<uuid>` links land on the row.
 */
export function LeaderboardTable({ page }: { page: LeaderboardPage }) {
  const { t } = useTranslation();
  const n = useNumberFormat();

  const highlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    highlightRef.current?.scrollIntoView({ block: "center" });
  }, [page]);

  if (page.rows.length === 0) {
    return <p className="text-mc-1.5 text-mc-gray text-center">{t("leaderboards.empty")}</p>;
  }

  const format = (value: string | number) => (typeof value === "number" ? n(value) : value);

  return (
    <Box>
      <div
        className="grid grid-cols-[max-content_max-content_minmax(0,1fr)_max-content] md:grid-cols-[max-content_max-content_minmax(0,1fr)_repeat(var(--columns),max-content)]"
        style={{ "--columns": page.fields.length } as CSSProperties}
      >
        <div className={cn(HEADER, "justify-end")}>{t("leaderboards.position")}</div>
        <div className={cn(HEADER, "col-span-2")}>{t("leaderboards.player")}</div>
        {page.fields.map((field, column) => (
          <div key={field} className={cn(HEADER, "justify-end", column > 0 && EXTRA)}>
            {field}
          </div>
        ))}
        {page.rows.map((row, index) => {
          const tone = row.highlight ? HIGHLIGHT : index % 2 === 1 ? STRIPE : "";

          return (
            <Fragment key={row.uuid}>
              <div id={row.uuid} ref={row.highlight ? highlightRef : undefined} className={cn(CELL, tone, "justify-end")}>
                <MinecraftText className="text-mc-1.5 md:text-mc-2">{formatPosition(row.position, n)}</MinecraftText>
              </div>
              <div className={cn(CELL, tone, "justify-center")}>
                <SkinHead uuid={row.uuid} size={24} />
              </div>
              <div className={cn(CELL, tone, "min-w-0")}>
                {/* `MinecraftText` puts its class on every segment, so the truncation lives on the link. */}
                <Link
                  to="/{-$locale}/player/$name"
                  params={{ name: row.username }}
                  className="flex min-h-11 min-w-0 items-center hover:underline"
                >
                  <span className="min-w-0 truncate">
                    <MinecraftText className="text-mc-1.5 md:text-mc-2">{row.name}</MinecraftText>
                  </span>
                </Link>
              </div>
              {row.values.map((value, column) => (
                <div key={page.fields[column]} className={cn(CELL, tone, "justify-end text-mc-1.5 md:text-mc-2", column > 0 && EXTRA)}>
                  {format(value)}
                </div>
              ))}
            </Fragment>
          );
        })}
      </div>
    </Box>
  );
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
