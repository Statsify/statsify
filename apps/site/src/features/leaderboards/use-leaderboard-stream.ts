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
import { getRouteApi, useRouter } from "@tanstack/react-router";
import { useEffect, useEffectEvent, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useNumberFormat } from "~/i18n/use-number-format";
import { useTranslation } from "react-i18next";

const AUTO_PAGES = 3;

const MAX_PAGES = 10;

/** How long Retry waits after the API says it's busy (429, 503): the proxy's own `Retry-After`. */
const BUSY_MS = 30_000;

const READING_LINE = 1 / 3;

const URL_DELAY_MS = 250;

const SCROLL_KEYS = new Set(["PageDown", " ", "ArrowDown"]);

const SCROLLING_MS = 1000;

/** A page heading's height: its link's `min-h-11`. */
const HEADING_PX = 44;

const route = getRouteApi("/{-$locale}/leaderboards/$field");

const SHOWN_KEY = "statsify:shown-streams";

/** Streams this tab has shown, across reloads: opening one again (Back, Forward, a reload) never scrolls to the highlight. */
function shownStreams(add?: string): string[] {
  try {
    const shown: string[] = JSON.parse(sessionStorage.getItem(SHOWN_KEY) ?? "[]");
    if (add && !shown.includes(add)) sessionStorage.setItem(SHOWN_KEY, JSON.stringify([...shown, add]));
    return shown;
  } catch {
    return [];
  }
}

export type Direction = "next" | "previous";

interface StreamError {
  kind: "failed" | "busy" | "gone";
  waiting?: boolean;
}

/** The rows of the layout the window shows: both are mounted, and CSS hides one. */
const visibleTable = (root: HTMLElement | null) =>
  [...(root?.querySelectorAll<HTMLElement>("[data-layout]") ?? [])].find((table) => table.getClientRects().length > 0);

function rowInView(root: HTMLElement | null): { uuid: string; top: number } | undefined {
  for (const row of visibleTable(root)?.querySelectorAll<HTMLElement>("[data-row]") ?? []) {
    const { top } = row.getBoundingClientRect();
    if (top >= 0) return { uuid: row.dataset.row!, top };
  }
  return undefined;
}

const gap = (element: Element) => Number.parseFloat(getComputedStyle(element).rowGap) || 0;

/**
 * The room the next page takes in the visible layout: the last page's, plus a page heading when that's the seed,
 * which has none. Held below the board while the page is on its way, so its rows land without moving the controls.
 */
function nextHeight(root: HTMLElement | null): number {
  const chunk = [...(visibleTable(root)?.querySelectorAll<HTMLElement>("[data-page]") ?? [])].at(-1);
  if (!root || !chunk?.parentElement) return 0;
  const heading = chunk.querySelector("[role=row][aria-label]") ? 0 : HEADING_PX + gap(chunk);
  return Math.max(0, chunk.getBoundingClientRect().height + gap(chunk.parentElement) + heading - gap(root));
}

function errorKind(error: unknown): StreamError["kind"] {
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
  const search = route.useSearch();
  const field = view.page.field;

  // The history entry changes before the route's data does, so it's read when the data changes.
  // eslint-disable-next-line react/exhaustive-deps -- `view` stands for the entry its data came with
  const entry = useMemo(() => streamOf(router.history.location.state, field, search), [view]);
  // A visit whose pages are gone starts again from its URL, whose page may not be the one it opened.
  // eslint-disable-next-line react/exhaustive-deps -- decided once per stream, before the query below creates it
  const opened = useMemo(() => (queryClient.getQueryData(streamKey(field, entry.key)) ? {} : { around: search.around, position: search.position }), [entry.key]);
  const stream = useMemo(() => ({ ...entry, ...opened }), [entry, opened]);
  const queryKey = streamKey(field, stream.key);
  const returning = useMemo(() => shownStreams().includes(stream.key), [stream.key]);
  useEffect(() => {
    shownStreams(stream.key);
  }, [stream.key]);

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
    // Loaded pages stay as they were: refetching an infinite query fetches every page again, one after another.
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: false,
    retryOnMount: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const chunks = query.data.pages;
  const first = chunks[0].page.page;
  const last = chunks.at(-1)!.page.page;
  const seed = chunks.find((chunk) => chunk.seed) ?? chunks[0];
  const capped = chunks.length >= MAX_PAGES;
  const hasNext = query.hasNextPage;
  const hasPrevious = query.hasPreviousPage;
  const auto = hasNext && !capped && last - seed.page.page < AUTO_PAGES;

  const [loading, setLoading] = useState<Direction>();
  const [reserve, setReserve] = useState<{ height: number; loaded: number; next?: boolean }>();
  const [outran, setOutran] = useState(0);
  const [intoRoom, setIntoRoom] = useState(0);
  const [errors, setErrors] = useState<Partial<Record<Direction, StreamError>>>({});
  const [paused, setPaused] = useState(false);
  const [status, setStatus] = useState("");

  const [currentStreamKey, setCurrentStreamKey] = useState(stream.key);
  if (currentStreamKey !== stream.key) {
    setCurrentStreamKey(stream.key);
    setErrors({});
    setPaused(false);
    setStatus("");
  }

  const rootRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pending = useRef(false);
  const pendingByScroll = useRef(false);
  const holding = useRef(false);
  const near = useRef(false);
  // Where the window was when the last page landed: loading again by itself needs the reader to scroll on from it.
  const baseline = useRef(Infinity);
  const anchor = useRef<{ uuid: string; top: number }>(undefined);
  const refocus = useRef(false);
  // How the reader last moved, and when. End (or ⌘↓) heads for the footer: nothing loads by itself, or lands, until
  // they move some other way. Scrolling onto the controls (a wheel, swipe or scroll key) means they got there before
  // the page.
  const input = useRef<{ kind: "end" | "scroll" | "touch"; at: number }>(undefined);
  const touchY = useRef<number>(undefined);
  const moved = (kind?: "end" | "scroll" | "touch") => {
    input.current = kind && { kind, at: performance.now() };
  };
  // A swipe's fling outlasts its touch events; a wheel's momentum and a held key keep sending theirs.
  const scrolling = () => input.current?.kind === "touch" || (input.current?.kind === "scroll" && performance.now() - input.current.at < SCROLLING_MS);

  // Starting a page once the controls below the board are on screen would push them and the footer out of view.
  const atControls = () => (bottomRef.current?.getBoundingClientRect().top ?? Infinity) < innerHeight;

  async function load(direction: Direction, byScroll = false) {
    if (pending.current || capped || (direction === "next" ? !hasNext : !hasPrevious)) return;
    if (errors[direction]?.kind === "gone" || errors[direction]?.waiting) return;
    const target = direction === "next" ? last + 1 : first - 1;
    const loaded = chunks.length;
    pending.current = true;
    pendingByScroll.current = byScroll;
    const active = document.activeElement;
    refocus.current = !!active && active !== document.body && !!rootRef.current?.contains(active);
    if (direction === "previous") anchor.current = rowInView(rootRef.current);
    setLoading(direction);
    if (byScroll) setReserve({ height: nextHeight(rootRef.current), loaded });
    setErrors((errors) => ({ ...errors, [direction]: undefined }));
    // Cleared first, so the same words twice in a row are still announced.
    setStatus("");

    const result = direction === "next" ? await query.fetchNextPage({ cancelRefetch: false }) : await query.fetchPreviousPage({ cancelRefetch: false });

    const held = holding.current;
    const landed = !result.isError && (result.data?.pages.length ?? 0) > loaded;
    pending.current = false;
    pendingByScroll.current = false;
    holding.current = false;
    baseline.current = scrollY;
    setLoading(undefined);
    setReserve(held && landed ? (reserve) => reserve && { height: reserve.height, loaded: reserve.loaded + 1 } : undefined);
    if (result.isError) {
      const kind = errorKind(result.error);
      const failed: StreamError = { kind, waiting: kind === "busy" };
      anchor.current = undefined;
      setErrors((errors) => ({ ...errors, [direction]: failed }));
      setStatus(t(`leaderboards.stream.${kind}`, { page: n(target + 1) }));
      if (failed.waiting) {
        setTimeout(() => setErrors((errors) => (errors[direction] === failed ? { ...errors, [direction]: { kind } } : errors)), BUSY_MS);
      }
      return;
    }

    const pages = result.data?.pages ?? [];
    // Cancelled by End: the page is left to Load More.
    if (pages.length === loaded) return;
    const added = (direction === "next" ? pages.at(-1) : pages[0])?.page.rows.length ?? 0;
    const ended = direction === "next" ? !result.hasNextPage : !result.hasPreviousPage;
    const said = added === 1 ? t("leaderboards.stream.loadedOne") : t("leaderboards.stream.loaded", { players: n(added) });
    setStatus(`${said}${ended ? ` ${t("leaderboards.stream.end")}` : ""}`);
    if (held) setIntoRoom((count) => count + 1);
    else if (byScroll && atControls()) setOutran((count) => count + 1);
  }

  // A reader heading for the controls faster than the page comes gets the next page's room too, held while the
  // controls are still below the window, so neither page moves them when it lands.
  const holdNext = useEffectEvent(() => {
    // Measured from the controls once the first room is drawn: before that they're a page higher.
    if (!pendingByScroll.current || holding.current || !reserve || paused || !scrolling()) return;
    if (last + 2 >= chunks.at(-1)!.page.pages || last + 2 - seed.page.page > AUTO_PAGES || chunks.length + 2 > MAX_PAGES) return;
    const top = bottomRef.current?.getBoundingClientRect().top ?? Infinity;
    if (top < innerHeight || top > 2 * innerHeight) return;
    holding.current = true;
    setReserve((reserve) => reserve && { ...reserve, next: true });
  });

  const mayLoadByItself = () =>
    auto && !paused && input.current?.kind !== "end" && !errors.next && !errors.previous && !pending.current && !document.activeElement?.closest("[data-stream-edge], footer");

  const loadIntoRoom = useEffectEvent(() => {
    if (mayLoadByItself()) void load("next", true);
    else setReserve(undefined);
  });

  useEffect(() => {
    if (intoRoom) loadIntoRoom();
  }, [intoRoom]);

  // Auto-loading waits for the reader: near the end and scrolled on since the last page landed, or scrolling on the
  // controls, which they reached before the page did. Not after a jump there (End, the scrollbar), and not on the
  // controls or the footer by keyboard, so the footer can be reached.
  const loadByScroll = useEffectEvent(() => {
    if (!mayLoadByItself()) return;
    if (atControls() ? !scrolling() : !near.current || scrollY <= baseline.current) return;
    if (document.visibilityState !== "visible") return;
    void load("next", true);
  });

  useEffect(() => {
    if (outran) loadByScroll();
  }, [outran]);

  // The URL names the page being read, replacing the entry, one navigation at a time and the latest page only.
  const shown = useRef(view.page.page);
  const wanted = useRef<number>(undefined);
  const navigating = useRef(false);
  const replaceEntry = useEffectEvent((next: typeof search) => {
    navigating.current = true;
    void navigate({
      to: ".",
      search: next,
      replace: true,
      resetScroll: false,
      hashScrollIntoView: false,
      state: (state) => ({ ...state, leaderboardStream: stream }),
    }).finally(() => {
      navigating.current = false;
      follow();
    });
  });
  const follow = useEffectEvent(() => {
    const target = wanted.current;
    if (navigating.current || target === undefined || target === shown.current) return;
    const selected = target === seed.page.page && (stream.around !== undefined || stream.position !== undefined);
    const page = target > 0 ? target + 1 : undefined;
    // An `around` that found no one fell back to `?page=`, which its URL keeps so it opens the same page again.
    const fallback = seed.miss?.kind === "unknown" || seed.miss?.kind === "unranked";
    shown.current = target;
    replaceEntry(selected ? { around: stream.around, position: stream.position, page: fallback ? page : undefined } : { page });
  });

  // A stream reopened from its URL drops the selectors its entry kept, so the entry drops them too: a warm Back would
  // read them back.
  useEffect(() => {
    if (stream.around !== entry.around || stream.position !== entry.position) replaceEntry(search);
    // eslint-disable-next-line react/exhaustive-deps -- once per stream, as `opened` is decided
  }, [stream.key]);

  const onKey = useEffectEvent((event: KeyboardEvent) => {
    if (event.key === "End" || ((event.metaKey || event.ctrlKey) && event.key === "ArrowDown")) {
      moved("end");
      if (pendingByScroll.current) void queryClient.cancelQueries({ queryKey });
      return;
    }
    moved(SCROLL_KEYS.has(event.key) && !event.shiftKey ? "scroll" : undefined);
    // At the bottom of the page a scroll key, wheel or swipe scrolls nothing, so it asks here.
    loadByScroll();
  });

  const onWheel = useEffectEvent((event: WheelEvent) => {
    moved(event.deltaY > 0 ? "scroll" : undefined);
    loadByScroll();
  });

  const onTouch = useEffectEvent((event: TouchEvent) => {
    const y = event.touches[0]?.clientY;
    if (event.type === "touchstart" || y === undefined || touchY.current === undefined) {
      touchY.current = y;
      return;
    }
    if (y === touchY.current) return;
    moved(y < touchY.current ? "touch" : undefined);
    touchY.current = y;
    loadByScroll();
  });

  const read = useEffectEvent(() => {
    const line = innerHeight * READING_LINE;
    let page = first;
    for (const chunk of visibleTable(rootRef.current)?.querySelectorAll<HTMLElement>("[data-page]") ?? []) {
      if (chunk.getBoundingClientRect().top <= line) page = Number(chunk.dataset.page);
    }
    wanted.current = page;
  });

  useEffect(() => {
    shown.current = view.page.page;
    wanted.current = undefined;
  }, [stream.key, view.page.page]);

  useEffect(() => {
    let frame = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (anchor.current) anchor.current = rowInView(rootRef.current);
        read();
        holdNext();
        loadByScroll();
        clearTimeout(timer);
        timer = setTimeout(follow, URL_DELAY_MS);
      });
    };
    // The window's place once the page (and Back's restored scroll) is drawn is where reading starts.
    const rebase = () => {
      baseline.current = scrollY;
    };
    const start = requestAnimationFrame(rebase);
    const unsubscribe = router.subscribe("onRendered", rebase);
    addEventListener("scroll", onScroll, { passive: true });
    const keydown = (event: KeyboardEvent) => onKey(event);
    const wheel = (event: WheelEvent) => onWheel(event);
    const touch = (event: TouchEvent) => onTouch(event);
    addEventListener("keydown", keydown);
    addEventListener("wheel", wheel, { passive: true });
    addEventListener("touchstart", touch, { passive: true });
    addEventListener("touchmove", touch, { passive: true });

    // A window's height ahead, so the next page is there before the reader is. In pixels: a percentage margin is of
    // the window's width.
    let observer: IntersectionObserver | undefined;
    let height = 0;
    const observe = () => {
      const bottom = bottomRef.current;
      if (!bottom || typeof IntersectionObserver !== "function" || innerHeight === height) return;
      height = innerHeight;
      observer?.disconnect();
      observer = new IntersectionObserver(
        ([entry]) => {
          near.current = entry.isIntersecting;
          loadByScroll();
        },
        { rootMargin: `0px 0px ${height}px 0px` }
      );
      observer.observe(bottom);
    };
    observe();
    addEventListener("resize", observe);

    return () => {
      cancelAnimationFrame(start);
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      unsubscribe();
      removeEventListener("scroll", onScroll);
      removeEventListener("keydown", keydown);
      removeEventListener("wheel", wheel);
      removeEventListener("touchstart", touch);
      removeEventListener("touchmove", touch);
      removeEventListener("resize", observe);
      observer?.disconnect();
    };
  }, [router, stream.key]);

  // A page loaded above keeps the row being read where it was, after whatever the browser's scroll anchoring did.
  useLayoutEffect(() => {
    const saved = anchor.current;
    anchor.current = undefined;
    const row = saved && visibleTable(rootRef.current)?.querySelector(`[data-row="${saved.uuid}"]`);
    if (!saved || !row) return;
    const shift = row.getBoundingClientRect().top - saved.top;
    if (Math.abs(shift) >= 1) scrollBy({ top: shift, behavior: "instant" });
  }, [first]);

  // A control that went with the page it loaded (the last page above, the end below) leaves focus on the stream.
  useLayoutEffect(() => {
    if (!refocus.current || loading) return;
    refocus.current = false;
    if (document.activeElement === document.body) rootRef.current?.focus({ preventScroll: true });
  }, [first, last, loading]);

  // An `around` or `position` row is centred once, when its stream starts; not on Back, and not as pages load.
  useEffect(() => {
    if (returning) return;
    const highlighted = visibleTable(rootRef.current)?.querySelector<HTMLElement>("[aria-current] [data-row], [data-row][aria-current]");
    if (!highlighted) return;

    const scroll = () => highlighted.scrollIntoView({ block: "center", inline: "nearest" });
    scroll();
    // After a client navigation the router scrolls to the top once the page is on screen, so centre it again then.
    const unsubscribe = router.subscribe("onRendered", () => {
      unsubscribe();
      if (scrollY === 0) scroll();
    });
    return unsubscribe;
  }, [returning, router, stream.key]);

  return {
    chunks,
    seed,
    first,
    last,
    pages: chunks.at(-1)!.page.pages,
    hasNext,
    hasPrevious,
    capped,
    auto,
    // Down a page in the render that brings one.
    reserve: reserve ? reserve.height * Math.max(0, (reserve.next ? 2 : 1) - (chunks.length - reserve.loaded)) : 0,
    loading,
    errors,
    paused,
    status,
    rootRef,
    bottomRef,
    load,
    setPaused,
  };
}
