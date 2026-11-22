/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type InfiniteData, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { type LeaderboardView, type StreamChunk, fetchStreamPage, streamKey, streamOf } from "./leaderboard-data";
import { ORPCError } from "@orpc/client";
import { getRouteApi, useElementScrollRestoration, useRouter } from "@tanstack/react-router";
import { useEffect, useEffectEvent, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useNumberFormat } from "~/i18n/use-number-format";
import { useTranslation } from "react-i18next";

const AUTO_PAGES = 3;

const MAX_PAGES = 10;

const READING_LINE = 1 / 3;

const URL_DELAY_MS = 250;

const route = getRouteApi("/{-$locale}/leaderboards/$field");

export type Direction = "next" | "previous";

export type StreamError = "failed" | "busy" | "gone";

/** The rows of the layout the window shows: both are mounted, and CSS hides one. */
const visibleTable = (root: HTMLElement | null) =>
  [...(root?.querySelectorAll<HTMLElement>("[data-layout]") ?? [])].find((table) => table.getClientRects().length > 0);

function errorKind(error: unknown): StreamError {
  const status = error instanceof ORPCError ? error.status : undefined;
  if (status === 400 || status === 404) return "gone";
  return status === 429 || status === 503 ? "busy" : "failed";
}

export function useLeaderboardStream(view: LeaderboardView) {
  const { t } = useTranslation();
  const n = useNumberFormat();
  const router = useRouter();
  const navigate = route.useNavigate();
  const queryClient = useQueryClient();
  const restored = useElementScrollRestoration({ getElement: () => window });
  const field = view.page.field;

  // The history entry changes before the route's data does, so it's read when the data changes.
  // eslint-disable-next-line react/exhaustive-deps -- `view` stands for the entry its data came with
  const stream = useMemo(() => streamOf(router.history.location.state, field), [view]);
  const queryKey = streamKey(field, stream.key);

  const query = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam, signal }): Promise<StreamChunk> => {
      const fetched = await fetchStreamPage(field, pageParam, signal);
      const shown = new Set(
        queryClient.getQueryData<InfiniteData<StreamChunk, number>>(queryKey)?.pages.flatMap((chunk) => chunk.page.rows.map((row) => row.uuid))
      );
      return { page: { ...fetched, rows: fetched.rows.filter((row) => !shown.has(row.uuid)) }, sent: fetched.rows.length };
    },
    initialPageParam: view.page.page,
    initialData: () => ({ pages: [{ page: view.page, sent: view.page.rows.length, miss: view.miss, seed: true }], pageParams: [view.page.page] }),
    getNextPageParam: ({ page, sent }) => (sent > 0 && page.page + 1 < page.pages ? page.page + 1 : undefined),
    getPreviousPageParam: ({ page, sent }) => (sent > 0 && page.page > 0 ? page.page - 1 : undefined),
    // Loaded pages stay as they were: refetching an infinite query fetches every page again, one after another. Not
    // `Infinity`, which a failed page makes stale.
    staleTime: "static",
    gcTime: 5 * 60_000,
    retry: false,
  });

  const chunks = query.data.pages;
  const first = chunks[0].page.page;
  const last = chunks.at(-1)!.page.page;
  const seed = chunks.find((chunk) => chunk.seed) ?? chunks[0];
  const capped = chunks.length >= MAX_PAGES;
  const { hasNextPage: hasNext, hasPreviousPage: hasPrevious, isFetching } = query;
  const auto = hasNext && !capped && last - seed.page.page < AUTO_PAGES;
  const failed = !isFetching && query.error ? errorKind(query.error) : undefined;
  const loading: Direction | undefined = query.isFetchingNextPage ? "next" : query.isFetchingPreviousPage ? "previous" : undefined;

  const [status, setStatus] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const refocus = useRef(false);
  // Loading by itself needs the reader to scroll down from where the window was when a page landed or the router put it.
  const settledAt = useRef(0);
  const reading = useRef(view.page.page);

  useEffect(() => {
    reading.current = view.page.page;
  }, [view.page.page]);

  async function load(direction: Direction) {
    if (isFetching || capped || !(direction === "next" ? hasNext : hasPrevious)) return;
    const target = direction === "next" ? last + 1 : first - 1;
    refocus.current = !!rootRef.current?.contains(document.activeElement);
    // Cleared first, so the same words twice in a row are still announced.
    setStatus("");

    // `cancelRefetch: false` joins a fetch already on its way rather than starting another.
    const result = direction === "next" ? await query.fetchNextPage({ cancelRefetch: false }) : await query.fetchPreviousPage({ cancelRefetch: false });
    settledAt.current = scrollY;
    if (result.isError) {
      setStatus(t(`leaderboards.stream.${errorKind(result.error)}`, { page: n(target + 1) }));
      return;
    }

    const pages = result.data?.pages ?? [];
    const added = (direction === "next" ? pages.at(-1) : pages[0])?.page.rows.length ?? 0;
    const ended = direction === "next" ? !result.hasNextPage : !result.hasPreviousPage;
    const said = added === 1 ? t("leaderboards.stream.loadedOne") : t("leaderboards.stream.loaded", { players: n(added) });
    setStatus(`${said}${ended ? ` ${t("leaderboards.stream.end")}` : ""}`);
  }

  // A window's height ahead, so the next page is there before the reader is. Not with keyboard focus on the controls
  // below the board or the footer, so the footer can be reached.
  const loadNear = useEffectEvent(() => {
    if (!auto || isFetching || query.isError || scrollY <= settledAt.current) return;
    if ((bottomRef.current?.getBoundingClientRect().top ?? Infinity) > 2 * innerHeight) return;
    if (document.activeElement?.closest("[data-stream-edge], footer")) return;
    void load("next");
  });

  // The URL names the page being read, replacing the entry, so a reload opens it and Back finds the stream.
  const follow = useEffectEvent(() => {
    // During a navigation elsewhere, a replace would land on the page being opened instead.
    if (router.state.status === "pending") return;
    const line = innerHeight * READING_LINE;
    let page = first;
    for (const chunk of visibleTable(rootRef.current)?.querySelectorAll<HTMLElement>("[data-page]") ?? []) {
      if (chunk.getBoundingClientRect().top <= line) page = Number(chunk.dataset.page);
    }
    if (page === reading.current) return;
    reading.current = page;
    void navigate({
      to: ".",
      search: { page: page > 0 ? page + 1 : undefined },
      replace: true,
      resetScroll: false,
      state: (state) => ({ ...state, leaderboardStream: stream }),
    });
  });

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onScroll = () => {
      loadNear();
      clearTimeout(timer);
      timer = setTimeout(follow, URL_DELAY_MS);
    };
    settledAt.current = scrollY;
    const unsubscribe = router.subscribe("onRendered", () => {
      settledAt.current = scrollY;
    });
    addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      unsubscribe();
      removeEventListener("scroll", onScroll);
    };
  }, [router]);

  // A control that went with the page it loaded (the end, the last page above, a failed load) leaves focus on the stream.
  useLayoutEffect(() => {
    if (!refocus.current || isFetching) return;
    refocus.current = false;
    if (document.activeElement === document.body) rootRef.current?.focus({ preventScroll: true });
  }, [isFetching]);

  // An `around` or `position` row is centered once, when its stream opens; not where the router puts back the reader.
  const center = useEffectEvent(() => {
    const highlighted = !restored && visibleTable(rootRef.current)?.querySelector<HTMLElement>("[aria-current] [data-row], [data-row][aria-current]");
    if (!highlighted) return;
    const scroll = () => {
      highlighted.scrollIntoView({ block: "center", inline: "nearest" });
      settledAt.current = scrollY;
    };
    scroll();
    // After a client navigation the router scrolls to the top once the page is on screen, so center it again then.
    const unsubscribe = router.subscribe("onRendered", () => {
      unsubscribe();
      if (scrollY === 0) scroll();
    });
    return unsubscribe;
  });

  useEffect(() => center(), [stream.key]);

  return {
    chunks,
    seed,
    first,
    last,
    pages: chunks.at(-1)!.page.pages,
    hasNext,
    hasPrevious,
    capped,
    loading,
    errors: { next: query.isFetchNextPageError ? failed : undefined, previous: query.isFetchPreviousPageError ? failed : undefined },
    status,
    rootRef,
    bottomRef,
    load,
  };
}
