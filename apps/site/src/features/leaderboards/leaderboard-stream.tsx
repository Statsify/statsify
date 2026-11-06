/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Button } from "~/components/ui/button";
import { type Direction, useLeaderboardStream } from "./use-leaderboard-stream";
import { FindPlayer, PageNav } from "./leaderboard-table";
import { LeaderboardBoxes } from "./leaderboard-boxes";
import { Link, useHydrated } from "@tanstack/react-router";
import { type MouseEvent, useMemo } from "react";
import { useNumberFormat } from "~/i18n/use-number-format";
import { useTranslation } from "react-i18next";
import type { LeaderboardView } from "./leaderboard-data";

const TEXT_BUTTON = "inline-flex min-h-11 items-center text-mc-1.5 text-mc-yellow underline underline-offset-2";

const plainClick = (event: MouseEvent) => event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

export function LeaderboardStream({ view }: { view: LeaderboardView }) {
  const { t } = useTranslation();
  const n = useNumberFormat();
  const hydrated = useHydrated();
  const stream = useLeaderboardStream(view);
  const { chunks, first, last, pages, errors } = stream;
  const board = chunks[0].page;
  const pageChunks = useMemo(() => chunks.map((chunk) => chunk.page), [chunks]);

  const pageLink = (page: number) => ({
    to: "/{-$locale}/leaderboards/$field" as const,
    params: { field: board.field },
    search: { page: page > 0 ? page + 1 : undefined },
  });

  const edge = (direction: Direction) => {
    const target = direction === "next" ? last + 1 : first - 1;

    if (stream.capped) {
      return (
        <Button asChild size="small" className="min-w-40">
          <Link {...pageLink(target)}>{t("leaderboards.stream.continue", { page: n(target + 1) })}</Link>
        </Button>
      );
    }

    const error = errors[direction];
    if (error) {
      return (
        <>
          <p className="text-mc-1.5 text-mc-yellow text-center">{t(`leaderboards.stream.${error.kind}`, { page: n(target + 1) })}</p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {error.kind !== "gone" && (
              <Button asChild size="small" className="min-w-40">
                <button type="button" disabled={error.waiting} onClick={() => void stream.load(direction)}>
                  {t("leaderboards.stream.retry")}
                </button>
              </Button>
            )}
            <Link {...pageLink(target)} className={TEXT_BUTTON}>{t("leaderboards.stream.open", { page: n(target + 1) })}</Link>
          </div>
        </>
      );
    }

    const loading = stream.loading === direction;
    return (
      <Button asChild size="small" className="min-w-40">
        <Link
          {...pageLink(target)}
          preload={false}
          aria-disabled={stream.loading !== undefined || undefined}
          onClick={(event) => {
            if (!plainClick(event)) return;
            event.preventDefault();
            void stream.load(direction);
          }}
        >
          {loading ? t("leaderboards.loading") : t(direction === "next" ? "leaderboards.stream.more" : "leaderboards.stream.previous")}
        </Link>
      </Button>
    );
  };

  const browsing = stream.hasNext || stream.hasPrevious || chunks.length > 1;

  return (
    <>
      <FindPlayer field={board.field} pages={pages} miss={stream.seed.miss} />
      <div ref={stream.rootRef} tabIndex={-1} className="relative flex flex-col gap-4 focus-ring-none">
        {hydrated && stream.hasNext && (
          <button
            type="button"
            onClick={() => {
              stream.setPaused(true);
              document.querySelector("footer")?.querySelector<HTMLElement>("a, button")?.focus();
            }}
            className="sr-only bg-blackify-800 text-mc-1.5 text-mc-white focus:not-sr-only focus:absolute focus:start-0 focus:top-0 focus:z-10 focus:px-4 focus:py-3"
          >
            {t("leaderboards.stream.skip")}
          </button>
        )}
        {stream.hasPrevious && <div data-stream-edge className="flex flex-col items-center gap-2">{edge("previous")}</div>}
        <LeaderboardBoxes page={board} chunks={pageChunks} busy={stream.loading !== undefined} />
        {stream.reserve > 0 && (
          // A new room for each page, so its "Loading..." starts below the rows rather than moving there.
          <div key={last} data-reserve aria-hidden style={{ height: stream.reserve }}>
            <p className="text-mc-1.5 text-mc-gray text-center">{t("leaderboards.loading")}</p>
          </div>
        )}
        <div ref={stream.bottomRef} data-stream-edge className="flex flex-col gap-4">
          {(stream.hasNext || (hydrated && browsing)) && (
            <div className="flex flex-col items-center gap-2">
              {stream.hasNext && edge("next")}
              {hydrated && stream.auto && !errors.next && !errors.previous && (
                <button type="button" onClick={() => stream.setPaused(!stream.paused)} className={TEXT_BUTTON}>
                  {t(stream.paused ? "leaderboards.stream.resume" : "leaderboards.stream.pause")}
                </button>
              )}
              {hydrated && browsing && <p className="text-mc-1 text-mc-gray text-center">{t("leaderboards.stream.notice")}</p>}
            </div>
          )}
          <PageNav field={board.field} page={first} last={last} pages={pages} />
        </div>
        <output aria-atomic className="sr-only">{stream.status}</output>
      </div>
    </>
  );
}
