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
import { ColumnLabel, PlayerLink, Position, Value } from "./leaderboard-table";
import { MinecraftText, plainText } from "~/components/ui/minecraft-text";
import { Link } from "@tanstack/react-router";
import { SkinHead } from "~/components/ui/skin";
import { cn } from "~/lib/util";
import { rememberPlayer } from "~/features/player/resolve";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { useNumberFormat } from "~/i18n/use-number-format";
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
 * be both. It also keeps the rows' players, so opening one is a single request. `chunks` are the pages a stream has
 * loaded, each its own group of rows under its page's heading.
 */
export function LeaderboardBoxes({ page, chunks: loaded, busy }: { page: LeaderboardPage; chunks?: LeaderboardPage[]; busy?: boolean }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const remembered = useRef(new WeakSet<LeaderboardPage>());
  const chunks = useMemo(() => loaded ?? [page], [loaded, page]);

  useEffect(() => {
    for (const chunk of chunks) {
      if (remembered.current.has(chunk)) continue;
      remembered.current.add(chunk);
      for (const row of chunk.rows) rememberPlayer(queryClient, row);
    }
  }, [chunks, queryClient]);

  if (chunks.every((chunk) => chunk.rows.length === 0)) {
    return <p className="text-mc-1.5 text-mc-gray text-center">{t("leaderboards.empty")}</p>;
  }

  return (
    <section aria-label={plainText(page.formatted)} aria-busy={busy || undefined}>
      <BoxTable page={page} chunks={chunks} />
      <PhoneRows page={page} chunks={chunks} />
    </section>
  );
}

/** Whether a `sticky top-0` element is stuck to the top of the window: it then sits less than wholly inside it. */
function useStuck<T extends Element>() {
  const ref = useRef<T>(null);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setStuck(entry.intersectionRatio < 1 && entry.boundingClientRect.top < 1),
      { rootMargin: "-1px 0px 0px 0px", threshold: 1 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, stuck] as const;
}

/**
 * From `md` up: a header row of boxes (position, player, the board's columns), then one row per player: position,
 * head, name and each value. The header row stays at the window's top while the table scrolls under it, on the page's
 * colour then, since its boxes are see-through; the colour reaches over the gap under it.
 */
function BoxTable({ page, chunks }: { page: LeaderboardPage; chunks: LeaderboardPage[] }) {
  const { t } = useTranslation();
  const [header, stuck] = useStuck<HTMLDivElement>();

  return (
    <div
      role="table"
      data-layout
      aria-label={plainText(page.formatted)}
      className={cn("grid grid-cols-[max-content_max-content_minmax(0,1fr)_repeat(var(--columns),max-content)] max-md:hidden", BOX_GAP)}
      style={{ "--columns": page.columns.length } as CSSProperties}
    >
      <div
        ref={header}
        role="row"
        data-stuck={stuck || undefined}
        className={cn("sticky top-0 z-10 col-span-full -mb-1 grid grid-cols-subgrid pb-1 data-stuck:bg-blackify-950", BOX_GAP)}
      >
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
      {chunks.map((chunk, index) => <BoxChunk key={chunk.page} page={chunk} heading={index > 0} />)}
    </div>
  );
}

/** A page's rows in the table, on the table's columns (a subgrid), under its heading. */
const BoxChunk = memo(function BoxChunk({ page, heading }: { page: LeaderboardPage; heading: boolean }) {
  return (
    <div role="rowgroup" data-page={page.page} className={cn("col-span-full grid grid-cols-subgrid", BOX_GAP)}>
      {heading && <ChunkHeading page={page} />}
      {page.rows.map((row) => {
        const variant = row.highlight ? "highlight" : "default";
        const tone = row.highlight && TONE;

        return (
          <div key={row.uuid} role="row" aria-current={row.highlight || undefined} className="contents">
            <Box role="cell" data-row={row.uuid} variant={variant} className={cn(CELL, tone)}>
              <span className={TEXT}>
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
});

/** The line above each loaded page but the first, which links to that page on its own. */
function ChunkHeading({ page }: { page: LeaderboardPage }) {
  const { t } = useTranslation();
  const n = useNumberFormat();
  const label = t("leaderboards.page", { page: n(page.page + 1), pages: n(page.pages) });

  return (
    <div role="row" aria-label={label} className="col-span-full flex justify-center">
      <div role="cell">
        <h2 className="text-mc-1.5 text-mc-gray">
          <Link
            to="/{-$locale}/leaderboards/$field"
            params={{ field: page.field }}
            search={{ page: page.page + 1 }}
            preload={false}
            className="inline-flex min-h-11 items-center hover:text-mc-white hover:underline"
          >
            {label}
          </Link>
        </h2>
      </div>
    </div>
  );
}

/**
 * Below `md`: a row's position, head and name in a box across the page, which links to the player, and its stats in
 * boxes under it, each label over its value, three across for three and otherwise two. A board with one stat keeps it
 * beside the name, so each row is one line. A long name wraps rather than being cut. The home page's preview uses it too.
 */
export function PhoneRows({ page, chunks }: { page: LeaderboardPage; chunks?: LeaderboardPage[] }) {
  return (
    <div role="table" data-layout aria-label={plainText(page.formatted)} className="flex flex-col gap-2 md:hidden">
      {(chunks ?? [page]).map((chunk, index) => <PhoneChunk key={chunk.page} page={chunk} heading={index > 0} />)}
    </div>
  );
}

const PhoneChunk = memo(function PhoneChunk({ page, heading }: { page: LeaderboardPage; heading: boolean }) {
  const single = page.columns.length === 1;

  return (
    <div role="rowgroup" data-page={page.page} className="flex flex-col gap-2">
      {heading && <ChunkHeading page={page} />}
      {page.rows.map((row) => {
        const variant = row.highlight ? "highlight" : "default";
        const tone = row.highlight && TONE;

        return (
          <div
            key={row.uuid}
            id={row.uuid}
            data-row={row.uuid}
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
});
