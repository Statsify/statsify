/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

/* eslint-disable jsx-a11y/prefer-tag-over-role -- the leaderboard is a CSS grid with rows of `display: contents`, which
   `<table>` elements can't be without losing their table semantics in some browsers. */

import { BOX_GAP, Box, CELL, STAT_BOX } from "~/components/ui/box";
import { ColumnLabel, PlayerLink, Position, Value, useHighlightScroll } from "./leaderboard-table";
import { MinecraftText, plainText } from "~/components/ui/minecraft-text";
import { SkinHead } from "~/components/ui/skin";
import { cn } from "~/lib/util";
import { rememberPlayer } from "~/features/player/resolve";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { CSSProperties } from "react";
import type { LeaderboardPage } from "@statsify/contract";

const TEXT = "text-mc-1.5 lg:text-mc-2";

// Forced colours drop the boxes' fills, so there the highlighted row is outlined.
const TONE = "forced-colors:outline-2 forced-colors:outline-[color:Highlight]";

/**
 * The leaderboard as the bot draws it (`leaderboard.profile.tsx`): every cell is its own card Box on the page's
 * background, with no panel around them, and the highlighted (`around`) row's boxes white as on the bot. Both widths
 * are rendered and CSS shows one, so neither shifts when the page hydrates. Two markups rather than one: a row's name
 * is one box on a phone and three of the table's columns from `md`, and a Box draws its own fill, so one element can't
 * be both. It also keeps the rows' players, so opening one is a single request.
 */
export function LeaderboardBoxes({ page }: { page: LeaderboardPage }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  useEffect(() => {
    for (const row of page.rows) rememberPlayer(queryClient, row);
  }, [page, queryClient]);

  if (page.rows.length === 0) {
    return <p className="text-mc-1.5 text-mc-gray text-center">{t("leaderboards.empty")}</p>;
  }

  return (
    <section aria-label={plainText(page.formatted)}>
      <BoxTable page={page} />
      <PhoneRows page={page} />
    </section>
  );
}

/**
 * From `md` up: a header row of boxes (position, player, the board's columns), then one row per player: position,
 * head, name and each value.
 */
function BoxTable({ page }: { page: LeaderboardPage }) {
  const { t } = useTranslation();
  const highlightRef = useHighlightScroll<HTMLSpanElement>(page);

  return (
    <div
      role="table"
      aria-label={plainText(page.formatted)}
      className={cn("grid grid-cols-[max-content_max-content_minmax(0,1fr)_repeat(var(--columns),max-content)] max-md:hidden", BOX_GAP)}
      style={{ "--columns": page.columns.length } as CSSProperties}
    >
      <div role="row" className="contents">
        <Box role="columnheader" className={CELL}>
          <span className={cn(TEXT, "font-bold")}>{t("leaderboards.position")}</span>
        </Box>
        <Box role="columnheader" className={cn(CELL, "col-span-2")}>
          <span className={cn(TEXT, "font-bold")}>{t("leaderboards.player")}</span>
        </Box>
        {page.columns.map((column) => (
          <Box key={column.field} role="columnheader" className={CELL}>
            <span className={cn(TEXT, "font-bold")}><ColumnLabel column={column} /></span>
          </Box>
        ))}
      </div>
      {page.rows.map((row) => {
        const variant = row.highlight ? "highlight" : "default";
        const tone = row.highlight && TONE;

        return (
          <div key={row.uuid} role="row" aria-current={row.highlight || undefined} className="contents">
            <Box role="cell" variant={variant} className={cn(CELL, tone)}>
              <span ref={row.highlight ? highlightRef : undefined} className={TEXT}>
                <Position position={row.position} className={TEXT} />
              </span>
            </Box>
            <Box role="none" variant={variant} className={cn(CELL, "content:px-2", tone)}>
              <SkinHead uuid={row.uuid} size={24} className="lg:size-8" />
            </Box>
            <Box role="rowheader" variant={variant} className={cn("min-w-0 content:h-full content:p-0", tone)}>
              <PlayerLink
                page={page}
                name={row.username}
                // Its ring inside the edge: the box clips anything past it.
                className={cn(TEXT, "flex h-full min-h-11 min-w-0 items-center px-3 py-1 hover:underline active:bg-white/10 focus-visible:focus-ring-inset")}
              >
                <span className="min-w-0 truncate">
                  <MinecraftText className={TEXT}>{row.name}</MinecraftText>
                </span>
              </PlayerLink>
            </Box>
            {row.values.map((value, column) => (
              <Box key={page.columns[column].field} role="cell" variant={variant} className={cn(CELL, tone)}>
                <span className={TEXT}><Value value={value} /></span>
              </Box>
            ))}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Below `md`: a row's position, head and name in a box across the page, which links to the player, and its stats in
 * boxes under it, each label over its value, three across for three and otherwise two. A board with one stat keeps it
 * beside the name, so each row is one line. A long name wraps rather than being cut. The home page's preview uses it too.
 */
export function PhoneRows({ page }: { page: LeaderboardPage }) {
  const highlightRef = useHighlightScroll<HTMLDivElement>(page);
  const single = page.columns.length === 1;

  return (
    <div role="table" aria-label={plainText(page.formatted)} className="flex flex-col gap-2 md:hidden">
      {page.rows.map((row) => {
        const variant = row.highlight ? "highlight" : "default";
        const tone = row.highlight && TONE;

        return (
          <div
            key={row.uuid}
            id={row.uuid}
            ref={row.highlight ? highlightRef : undefined}
            role="row"
            aria-current={row.highlight || undefined}
            className={cn(
              "grid scroll-mt-10",
              BOX_GAP,
              single ? "grid-cols-[minmax(0,1fr)_auto]" : page.columns.length === 3 ? "grid-cols-3" : "grid-cols-2"
            )}
          >
            <Box role="none" variant={variant} className={cn(CELL, "content:gap-2 content:px-2", !single && "col-span-full", tone)}>
              <span role="cell" className="shrink-0">
                <Position position={row.position} className="text-mc-1.5" />
              </span>
              <SkinHead uuid={row.uuid} size={24} className="shrink-0" />
              <span role="rowheader" className="min-w-0 [overflow-wrap:anywhere]">
                {/* Its `::after` covers the box, so the whole box opens the player; its ring inside the edge. */}
                <PlayerLink
                  page={page}
                  name={row.username}
                  className="focus-ring-none hover:underline after:absolute after:inset-0 active:after:bg-white/10 focus-visible:after:focus-ring-inset"
                >
                  <MinecraftText className="text-mc-1.5">{row.name}</MinecraftText>
                </PlayerLink>
              </span>
            </Box>
            {row.values.map((value, column) => (
              <Box
                key={page.columns[column].field}
                role="cell"
                variant={variant}
                className={cn(STAT_BOX, "content:flex-col content:justify-end content:gap-1 content:text-center", tone)}
              >
                <span className="text-mc-gray"><ColumnLabel column={page.columns[column]} /></span>
                <span><Value value={value} /></span>
              </Box>
            ))}
          </div>
        );
      })}
    </div>
  );
}
