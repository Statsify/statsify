/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

/* eslint-disable jsx-a11y/prefer-tag-over-role -- the leaderboard is a CSS grid with rows of `display: contents` from
   `md` up, which `<table>` elements can't be without losing their table semantics in some browsers. */

import { Box } from "~/components/ui/box";
import { ColumnLabel, HEADER, HIGHLIGHT, PLAYER, PlayerLink, Position, STRIPE, VALUES, Value, useHighlightScroll } from "./leaderboard-table";
import { MinecraftText } from "~/components/ui/minecraft-text";
import { SkinHead } from "~/components/ui/skin";
import { cn } from "~/lib/util";
import { rememberPlayer } from "~/features/player/resolve";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { CSSProperties } from "react";
import type { LeaderboardPage } from "@statsify/contract";

const CELL = "md:flex md:h-12 md:items-center md:px-2";

/**
 * The 25 rows of one page in one markup: a table from `md` up, where each card is `display: contents`, and a card per
 * player below it, its stats in equal columns. Each position cell's id is the row's UUID, so `#<uuid>` lands on it.
 */
export function LeaderboardCards({ page }: { page: LeaderboardPage }) {
  const { t } = useTranslation();

  const highlightRef = useHighlightScroll<HTMLDivElement>(page);
  const queryClient = useQueryClient();

  // The rows' players, so opening one is a single request.
  useEffect(() => {
    for (const row of page.rows) rememberPlayer(queryClient, row);
  }, [page, queryClient]);

  if (page.rows.length === 0) {
    return <p className="text-mc-1.5 text-mc-gray text-center">{t("leaderboards.empty")}</p>;
  }

  return (
    <Box>
      <section aria-label={page.name}>
        {/* A table to screen readers. The head is decoration, so a row's cells line up with the header's. */}
        <div
          role="table"
          aria-label={page.name}
          className="flex flex-col md:grid md:grid-cols-[max-content_max-content_minmax(0,1fr)_repeat(var(--columns),max-content)]"
          style={{ "--columns": page.columns.length } as CSSProperties}
        >
          <div role="row" className="contents">
            <div role="none" className={cn(PLAYER, "top-0 z-20 bg-blackify-800 max-md:hidden")}>
              <div role="columnheader" className={cn(HEADER, "justify-end")}>{t("leaderboards.position")}</div>
              <div role="columnheader" className={cn(HEADER, "col-span-2")}>{t("leaderboards.player")}</div>
            </div>
            {page.columns.map((column) => (
              <div key={column.field} role="columnheader" className={cn(HEADER, "sticky top-0 z-10 justify-end max-md:hidden")}>
                <ColumnLabel column={column} />
              </div>
            ))}
          </div>
          {page.rows.map((row, index) => {
            const tone = row.highlight ? HIGHLIGHT : index % 2 === 1 ? STRIPE : "";

            return (
              // The line height is fixed rather than `normal`, so a level symbol drawn from a fallback font doesn't make
              // its card taller.
              <div
                key={row.uuid}
                role="row"
                aria-current={row.highlight || undefined}
                className={cn(
                  "relative grid grid-cols-[repeat(var(--columns),minmax(0,1fr))] gap-x-2 p-2 max-md:text-mc-1 max-md:leading-[0.625] md:contents",
                  tone
                )}
              >
                <div role="none" className={cn(PLAYER, tone, "z-10 max-md:contents")}>
                  {/* One line that wraps below `md`; from `md` up its cells are the player half's three columns. */}
                  <div role="none" className="col-span-full mb-1 max-md:[overflow-wrap:anywhere] md:contents">
                    <div
                      id={row.uuid}
                      ref={row.highlight ? highlightRef : undefined}
                      role="cell"
                      className={cn(CELL, "inline scroll-mt-10 md:justify-end")}
                    >
                      <Position position={row.position} className="text-mc-1 md:text-mc-1.5 lg:text-mc-2" />
                    </div>{" "}
                    <div role="none" className={cn(CELL, "hidden md:justify-center")}>
                      <SkinHead uuid={row.uuid} size={24} />
                    </div>
                    <div role="rowheader" className={cn(CELL, "inline md:col-start-3 md:min-w-0 md:contain-inline-size")}>
                      {/* Below `md` the link's `::after` covers the card, so the whole card opens the player. */}
                      <PlayerLink
                        page={page}
                        name={row.username}
                        className="hover:underline after:absolute after:inset-0 active:after:bg-white/10 md:flex md:min-h-11 md:min-w-0 md:items-center md:after:hidden md:active:bg-white/10"
                      >
                        <span className="md:min-w-0 md:truncate">
                          <MinecraftText className="text-mc-1 md:text-mc-1.5 lg:text-mc-2">{row.name}</MinecraftText>
                        </span>
                      </PlayerLink>
                    </div>
                  </div>
                </div>
                <div role="none" className={cn(VALUES, tone, "max-md:contents")}>
                  {row.values.map((value, column) => (
                    <div
                      key={page.columns[column].field}
                      role="cell"
                      className={cn(
                        CELL,
                        "max-md:row-span-2 max-md:grid max-md:min-w-0 max-md:grid-rows-subgrid max-md:[overflow-wrap:anywhere] md:justify-end md:text-mc-1.5 lg:text-mc-2"
                      )}
                    >
                      <span className="self-end text-mc-gray md:hidden">
                        <ColumnLabel column={page.columns[column]} />
                      </span>
                      <span><Value value={value} /></span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </Box>
  );
}
