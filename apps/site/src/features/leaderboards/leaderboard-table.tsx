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
import { useNumberFormat } from "~/i18n/use-number-format";
import { useTranslation } from "react-i18next";
import type { AroundMiss } from "./leaderboard-data";
import type { CSSProperties } from "react";
import type { LeaderboardPage } from "@statsify/contract";

// Column headers and the phone-size value labels are Mona Sans; positions, names and values stay Minecraft.
const HEADER = "hidden md:block px-2 pb-2 text-center font-sans text-20 font-semibold text-mc-gray";
const CELL = "flex items-center px-2 py-1.5 min-h-12";
const STRIPE = "bg-black/15";
const HIGHLIGHT = "bg-mc-gold/20";

/**
 * The 25 rows of one page: position, head, name and the leaderboard's value columns. On phones the
 * values drop under the name with their labels; from `md` up they are columns. Each position cell
 * carries the row's UUID as its id, so `#<uuid>` links land on the row.
 */
export function LeaderboardTable({ page }: { page: LeaderboardPage }) {
  const { t } = useTranslation();
  const n = useNumberFormat();

  const highlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    highlightRef.current?.scrollIntoView({ block: "center" });
  }, [page]);

  if (page.rows.length === 0) {
    return <p className="text-20 font-medium text-mc-gray text-center">{t("leaderboards.empty")}</p>;
  }

  const format = (value: string | number) => (typeof value === "number" ? n(value) : value);

  return (
    <Box>
      <div
        className="grid grid-cols-[max-content_max-content_minmax(0,1fr)] md:grid-cols-[max-content_max-content_minmax(0,1fr)_repeat(var(--columns),max-content)]"
        style={{ "--columns": page.fields.length } as CSSProperties}
      >
        <div className={HEADER}>{t("leaderboards.position")}</div>
        <div className={cn(HEADER, "col-span-2 text-start")}>{t("leaderboards.player")}</div>
        {page.fields.map((field) => (
          <div key={field} className={HEADER}>
            {field}
          </div>
        ))}
        {page.rows.map((row, index) => {
          const tone = row.highlight ? HIGHLIGHT : index % 2 === 1 ? STRIPE : "";

          return (
            <Fragment key={row.uuid}>
              <div
                id={row.uuid}
                ref={row.highlight ? highlightRef : undefined}
                className={cn(CELL, tone, "justify-end text-mc-1 md:text-mc-1.5 text-mc-gray")}
              >
                #{n(row.position)}
              </div>
              <div className={cn(CELL, tone, "justify-center")}>
                <SkinHead uuid={row.uuid} size={24} />
              </div>
              <div className={cn(CELL, tone, "min-w-0")}>
                {/* `MinecraftText` puts its class on every segment, so the truncation lives on the link. */}
                <Link to="/{-$locale}/player/$name" params={{ name: row.uuid }} className="block min-w-0 truncate hover:underline">
                  <MinecraftText className={cn("text-mc-1 md:text-mc-1.5", row.highlight && "font-bold")}>
                    {row.name}
                  </MinecraftText>
                </Link>
              </div>
              {row.values.map((value, column) => (
                <div
                  key={page.fields[column]}
                  className={cn(CELL, tone, "col-span-full justify-between gap-4 pl-14 md:col-span-1 md:justify-center md:pl-2")}
                >
                  <span className="font-sans text-16 font-medium text-mc-gray md:hidden">{page.fields[column]}</span>
                  <span className="text-mc-1 md:text-mc-1.5">{format(value)}</span>
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
    <Button asChild className={cn("w-40", disabled && "opacity-50")}>
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
    <nav className="flex items-center justify-between gap-4" aria-label={t("leaderboards.title")}>
      {pageLink(page - 1, t("leaderboards.previous"), page <= 0)}
      <p className="text-20 font-medium text-center">{t("leaderboards.page", { page: n(page + 1), pages: n(Math.max(pages, 1)) })}</p>
      {pageLink(page + 1, t("leaderboards.next"), page + 1 >= pages)}
    </nav>
  );
}

/** The `around=<name>` entry: the shared search box, submitting into this leaderboard's query string. */
export function FindPlayer({ field, miss }: { field: string; miss?: AroundMiss }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-2">
      <Search
        compact
        className="w-full"
        placeholder={t("leaderboards.find")}
        onSelect={(name) => navigate({ to: "/{-$locale}/leaderboards/$field", params: { field }, search: { around: name } })}
      />
      {miss && <p className="text-16 font-medium text-mc-yellow text-center">{t(`leaderboards.${miss.kind}`, { name: miss.name })}</p>}
    </div>
  );
}
