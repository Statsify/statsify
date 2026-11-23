/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { AUTO_UPDATE_AGE_MS, type AutoUpdate } from "@statsify/contract/refresh";
import { ClockScript, TIME_SLOT } from "~/lib/clock";
import { Hint, useHint } from "~/components/ui/hint";
import { RefreshIcon } from "~/components/icons/refresh";
import { Turnstile } from "~/components/turnstile";
import { cn } from "~/lib/util";
import { formatCountdown, fullDate, relativeTime } from "~/i18n/format";
import {
  type ComponentProps,
  type Ref,
  type RefObject,
  useCallback,
  useEffect,
  useEffectEvent,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { type ActionResult, BROWSER_TIMEOUT_MS } from "./player-actions";
import { useRevealOnOpen } from "./share-panel";
import { getRouteApi, useRouterState } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

const localeRoute = getRouteApi("/{-$locale}");

const META = "text-mc-1 text-mc-gray";

/** Crawlers that run scripts would spend the Hypixel budget just by loading pages, so they never update by themselves. */
const BOT_AGENT = /bot|crawl|spider|slurp|headless|lighthouse|preview/i;

/** The page views (history entries) whose bar has decided on its automatic update, so it never runs twice. */
const autoViews = new Set<string>();

type RefreshState =
  | { status: "idle" }
  /** `auto`: the bar's own update once the page opened, which screen readers don't hear start. */
  | { status: "pending"; auto: boolean }
  /** The last refresh worked: said once to screen readers, otherwise the same as idle. */
  | { status: "done" }
  /** `auto`: an automatic update was refused, which counts down without the message. */
  | { status: "limited"; until: number; auto: boolean }
  /** Hypixel didn't answer in time; the page still shows the stored stats. */
  | { status: "unavailable" }
  | { status: "error" };

let clockNow: number | undefined;
let clockTimer: ReturnType<typeof setTimeout> | undefined;
/** Each `useNow` on the page, with the end of its countdown (0 for none). */
const clockListeners = new Map<() => void, number>();

function scheduleTick() {
  clearTimeout(clockTimer);
  const counting = [...clockListeners.values()].some((until) => until > Date.now());
  clockTimer = setTimeout(() => {
    clockNow = Date.now();
    for (const listener of clockListeners.keys()) listener();
    scheduleTick();
  }, counting ? 1000 : 60_000);
}

function subscribeClock(listener: () => void, until: number) {
  clockListeners.set(listener, until);
  clockNow ??= Date.now();
  scheduleTick();

  return () => {
    clockListeners.delete(listener);
    if (clockListeners.size > 0) return;
    clearTimeout(clockTimer);
    clockNow = undefined;
  };
}

/**
 * The page's one clock: each second while a caller's countdown to `countdownUntil` runs, else each minute. `undefined`
 * while hydrating, to match the HTML `ClockScript` writes; a later mount (a client navigation) starts on the clock.
 */
export function useNow(countdownUntil = 0): number | undefined {
  const subscribe = useCallback((listener: () => void) => subscribeClock(listener, countdownUntil), [countdownUntil]);
  return useSyncExternalStore(subscribe, () => (clockNow ??= Date.now()), () => undefined);
}

export interface RefreshOptions {
  updatedAt: number;
  expiresAt: number;
  refresh: (deadline: AbortSignal, auto: AutoUpdate | undefined, token: string | undefined) => Promise<ActionResult<unknown>>;
  /**
   * Once per page view, update a save older than 15 minutes (or past its cooldown, when the search opened the page) by
   * itself. It fails quietly: a refusal counts down without the message, and anything else leaves the button as it was.
   */
  auto?: boolean;
}

export type Refresh = ReturnType<typeof useRefresh>;

/**
 * A page's refresh, shared by `RefreshBar` and any `RefreshButton`: `refresh` runs the page's action with a Turnstile
 * token and applies its data. The automatic update's token comes from an invisible widget, so it never asks the visitor.
 */
export function useRefresh({ updatedAt, expiresAt, refresh, auto = false }: RefreshOptions) {
  const { turnstileSiteKey } = localeRoute.useLoaderData();
  const [state, setState] = useState<RefreshState>({ status: "idle" });
  const [verifying, setVerifying] = useState(false);
  const [autoVerifying, setAutoVerifying] = useState<AutoUpdate>();
  const [widgetFailed, setWidgetFailed] = useState(false);
  // The location once its page has rendered: during a navigation `location` is already the next page's.
  // eslint-disable-next-line no-underscore-dangle -- the history entry's key, under TanStack's name
  const view = useRouterState({ select: ({ resolvedLocation }) => resolvedLocation?.state.__TSR_key });
  const searchedAt = useRouterState({ select: ({ resolvedLocation }) => resolvedLocation?.state.searchedAt });

  const lockedUntil = state.status === "limited" ? state.until : expiresAt;
  // A widget whose script didn't load stays broken until the page reloads, so the button does too.
  const busy = verifying || widgetFailed || state.status === "pending";

  async function run(update: AutoUpdate | undefined, token?: string) {
    const auto = update !== undefined;
    setVerifying(false);
    setState({ status: "pending", auto });

    const deadline = AbortSignal.timeout(BROWSER_TIMEOUT_MS);
    let result: ActionResult<unknown>;

    try {
      result = await refresh(deadline, update, token);
    } catch {
      // A 500, a Cloudflare 429 or a dropped connection: say so and let the visitor try again. A hung one reads as
      // Hypixel not answering, as when the server's own deadline runs out.
      setState(auto ? { status: "idle" } : { status: deadline.aborted ? "unavailable" : "error" });
      return;
    }

    if (result.ok) {
      setState({ status: "done" });
      return;
    }

    if (result.code === "TOO_MANY_REQUESTS") {
      setState({ status: "limited", until: Date.now() + result.retryAfter * 1000, auto });
      return;
    }

    setState(auto ? { status: "idle" } : { status: result.code === "UNAVAILABLE" ? "unavailable" : "error" });
  }

  const autoUpdate = useEffectEvent(() => {
    const now = Date.now();
    // Opened from the search, any save past its cooldown updates, as for a bot command. A reload keeps history state,
    // so only a search made since this document loaded counts.
    const update: AutoUpdate = searchedAt !== undefined && searchedAt > performance.timeOrigin ? "searched" : "stale";
    const age = update === "searched" ? 0 : AUTO_UPDATE_AGE_MS;
    if (state.status === "pending" || now < lockedUntil || now - updatedAt < age) return;
    if (navigator.webdriver || BOT_AGENT.test(navigator.userAgent)) return;
    if (!turnstileSiteKey) return void run(update);
    setState({ status: "pending", auto: true });
    setAutoVerifying(update);
  });

  // After mount only, so never on the server.
  useEffect(() => {
    if (!auto || !view || autoViews.has(view)) return;
    autoViews.add(view);
    // eslint-disable-next-line react/set-state-in-effect -- starting the update is the effect's outside work
    autoUpdate();
  }, [auto, view]);

  return {
    updatedAt,
    lockedUntil,
    state,
    busy,
    widgetFailed,
    /** The Turnstile widget's props while a click waits on it. */
    verification: verifying ?
      {
        siteKey: turnstileSiteKey,
        onToken: (token: string | undefined) => {
          if (token) return void run(undefined, token);
          // The widget failed or its token expired: the button comes back for another try.
          setVerifying(false);
          setState({ status: "error" });
        },
        onLoadError: () => setWidgetFailed(true),
      } :
      undefined,
    /** The invisible widget's props while the automatic update waits on its token. */
    autoVerification: autoVerifying ?
      {
        siteKey: turnstileSiteKey,
        onToken: (token: string | undefined) => {
          setAutoVerifying(undefined);
          if (token) void run(autoVerifying, token);
          else setState({ status: "idle" });
        },
      } :
      undefined,
    start() {
      if (busy || Date.now() < lockedUntil) return;
      if (turnstileSiteKey) setVerifying(true);
      else void run(undefined);
    },
  };
}

/** The refresh's clock-driven text, in the components that show it, so the clock's tick re-renders them and not the page. */
function useRefreshClock({ lockedUntil, state, busy, widgetFailed }: Refresh) {
  const { t } = useTranslation();
  const now = useNow(lockedUntil);
  const remaining = now === undefined ? undefined : Math.max(0, Math.ceil((lockedUntil - now) / 1000));
  const disabled = busy || remaining === undefined || remaining > 0;

  let text = t("player.refresh");
  let label = text;
  if (state.status === "pending") {
    text = t("player.refreshing");
    label = text;
  } else if (remaining) {
    text = formatCountdown(remaining);
    label = t("player.refreshIn", { time: text });
  }

  let message: string | undefined;
  if (widgetFailed) message = t("player.notFound.verifyFailed");
  else if (state.status === "limited" && !state.auto && remaining) message = t("player.refreshLimited");
  else if (state.status === "unavailable") message = t("player.refreshFailed");
  else if (state.status === "error") message = t("player.refreshError");

  return { now, disabled, text, label, message };
}

/**
 * "Updated N minutes ago" and the Update stats button, for a player's card. A failure, and the Turnstile widget a click
 * shows first, take a line of their own, so the bar's parent wraps (`flex-wrap`).
 */
export function RefreshBar({ className, ...options }: RefreshOptions & { className?: string }) {
  const refresh = useRefresh(options);
  return <SharedRefreshBar refresh={refresh} className={className} />;
}

/** `RefreshBar` for a refresh a `RefreshButton` elsewhere on the page shares. */
export function SharedRefreshBar({ refresh, className }: { refresh: Refresh; className?: string }) {
  const { t, i18n } = useTranslation();
  const { updatedAt, lockedUntil, state, verification, autoVerification } = refresh;
  const { now, message } = useRefreshClock(refresh);
  const button = useRef<HTMLButtonElement>(null);

  return (
    <>
      <div className={cn("flex items-center gap-2", className)}>
        <p data-clock="updated" className={cn(META, "min-w-0")} suppressHydrationWarning>
          {now === undefined ? " " : <UpdatedAt updatedAt={updatedAt} now={now} />}
        </p>
        <RefreshButton ref={button} refresh={refresh} />
      </div>
      {verification && <Verification {...verification} button={button} />}
      {autoVerification && <Turnstile {...autoVerification} invisible className="absolute" />}
      <ClockScript
        args={{
          updatedAt,
          lockedUntil,
          locale: i18n.language,
          updated: t("player.updated", { time: TIME_SLOT }),
          refresh: t("player.refresh"),
          refreshIn: t("player.refreshIn", { time: TIME_SLOT }),
        }}
      />
      <output className="block basis-full text-mc-1 text-mc-red empty:hidden">{message}</output>
      <output className="sr-only">
        {state.status === "pending" && !state.auto && t("player.refreshing")}
        {state.status === "done" && t("player.updated", { time: relativeTime(updatedAt, updatedAt, i18n.language) })}
      </output>
    </>
  );
}

/**
 * Update stats, or the time until it can, with the full wording in a tooltip then. `aria-disabled`, not `disabled`, so
 * the button keeps focus while it refreshes and counts down. Its tap area reaches past its 32 px box to 44 px.
 */
export function RefreshButton({ refresh, className, ref }: { refresh: Refresh; className?: string; ref?: Ref<HTMLButtonElement> }) {
  const { text, label, disabled } = useRefreshClock(refresh);
  const { props: hint, tooltip } = useHint(text === label ? undefined : label);

  return (
    <>
      <button
        ref={ref}
        type="button"
        data-clock="refresh"
        aria-label={label}
        aria-disabled={disabled}
        suppressHydrationWarning
        {...hint}
        onClick={refresh.start}
        className={cn(
          "relative flex h-8 min-w-8 shrink-0 items-center justify-center gap-2 bg-blackify-800 px-2 text-mc-1 text-mc-green after:absolute after:-inset-1.5 hover:bg-blackify-700 focus-visible:focus-ring-inset aria-disabled:text-mc-gray aria-disabled:hover:bg-blackify-800",
          className
        )}
      >
        <RefreshIcon className="size-4 shrink-0" />
        <span data-clock="countdown" suppressHydrationWarning>{text}</span>
      </button>
      {tooltip}
    </>
  );
}

/**
 * The Turnstile widget, brought into view: a click in the pinned mini header shows it in the nametag, off screen. Focus
 * moves to the bar's own button, since the mini header hides once the nametag shows and would take its focus with it.
 */
function Verification({ button, ...props }: ComponentProps<typeof Turnstile> & { button: RefObject<HTMLButtonElement | null> }) {
  const id = useId();
  useEffect(() => {
    button.current?.focus({ preventScroll: true });
  }, [button]);
  useRevealOnOpen(id);

  // The bar sits in the profile card, narrower than the flexible widget's 300 px.
  return (
    <div id={id} className="flex basis-full justify-center">
      <Turnstile {...props} size="compact" />
    </div>
  );
}

/** The save's full date in the browser's own zone, short on phones. Only after mount: the server knows neither. */
export const savedDate = (updatedAt: number, locale: string) => fullDate(updatedAt, locale, matchMedia("(width < 48rem)").matches);

/**
 * "Updated 17 minutes ago", with the save's full date on hover, focus or tap. Not while hydrating, so the server's HTML
 * carries neither clock nor zone; `ClockScript` writes the text until then.
 */
export function UpdatedAt({ updatedAt, now }: { updatedAt: number; now: number }) {
  const { t, i18n } = useTranslation();
  const text = t("player.updated", { time: relativeTime(updatedAt, now, i18n.language) });
  const date = savedDate(updatedAt, i18n.language);

  return <Hint full={date} spoken={`${text}, ${date}`}>{text}</Hint>;
}
