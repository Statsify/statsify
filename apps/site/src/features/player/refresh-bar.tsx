/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ClockScript, TIME_SLOT } from "~/lib/clock";
import { Hint, useHint } from "~/components/ui/hint";
import { RefreshIcon } from "~/components/icons/refresh";
import { Turnstile } from "~/components/turnstile";
import { cn } from "~/lib/util";
import { formatCountdown, fullDate, relativeTime } from "~/i18n/format";
import { useEffect, useEffectEvent, useState } from "react";
import { type ActionResult, BROWSER_TIMEOUT_MS } from "./player-actions";
import { getRouteApi, useHydrated, useRouterState } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

const localeRoute = getRouteApi("/{-$locale}");

const META = "text-mc-1 text-mc-gray";

/** How old a save is before its page updates it by itself once it opens. */
const AUTO_UPDATE_AGE_MS = 15 * 60_000;

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

/**
 * Ticks once a second. `undefined` on the server and while the page hydrates, so the first render matches the HTML,
 * whose time text `ClockScript` writes; a component mounted after that (a client navigation) starts on the clock.
 */
export function useNow(): number | undefined {
  const hydrated = useHydrated();
  const [now, setNow] = useState(() => (hydrated ? Date.now() : undefined));

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return now;
}

/**
 * "Updated N minutes ago" and a small refresh button after it, for a player's card beside its other actions: the
 * button names itself in a tooltip and counts down until `expiresAt`. A failure, and the Turnstile widget a click shows
 * first, sit on a line of their own, so the bar's parent wraps (`flex-wrap`). `refresh` runs the page's refresh action
 * with the bar's deadline and, for a click, the visitor's Turnstile token, and applies its data itself; the bar shows
 * the outcome. Each refresh spends the site's shared Hypixel budget; the automatic update needs no token, as the API
 * caps those sooner.
 */
export function RefreshBar({
  updatedAt,
  expiresAt,
  refresh,
  auto = false,
  className,
}: {
  updatedAt: number;
  expiresAt: number;
  refresh: (deadline: AbortSignal, auto: boolean, token: string | undefined) => Promise<ActionResult<unknown>>;
  /**
   * Once the page opens, update a save older than 15 minutes (past its cooldown when the search opened the page) by
   * itself, once per page view. It fails quietly: a refusal counts down without the message, and anything else leaves
   * the button as it was.
   */
  auto?: boolean;
  className?: string;
}) {
  const { t, i18n } = useTranslation();
  const { turnstileSiteKey } = localeRoute.useLoaderData();
  const now = useNow();
  const [state, setState] = useState<RefreshState>({ status: "idle" });
  const [verifying, setVerifying] = useState(false);
  const [widgetFailed, setWidgetFailed] = useState(false);
  // The location once its page has rendered: during a navigation `location` is already the next page's.
  // eslint-disable-next-line no-underscore-dangle -- the history entry's key, under TanStack's name
  const view = useRouterState({ select: ({ resolvedLocation }) => resolvedLocation?.state.__TSR_key });
  const searchedAt = useRouterState({ select: ({ resolvedLocation }) => resolvedLocation?.state.searchedAt });

  const lockedUntil = state.status === "limited" ? state.until : expiresAt;
  const remaining = now === undefined ? undefined : Math.max(0, Math.ceil((lockedUntil - now) / 1000));
  // A widget whose script didn't load stays broken until the page reloads, so the button does too.
  const disabled = verifying || widgetFailed || state.status === "pending" || remaining === undefined || remaining > 0;

  async function run(auto: boolean, token?: string) {
    setVerifying(false);
    setState({ status: "pending", auto });

    const deadline = AbortSignal.timeout(BROWSER_TIMEOUT_MS);
    let result: ActionResult<unknown>;

    try {
      result = await refresh(deadline, auto, token);
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
    const age = searchedAt !== undefined && searchedAt > performance.timeOrigin ? 0 : AUTO_UPDATE_AGE_MS;
    if (state.status === "pending" || now < lockedUntil || now - updatedAt < age) return;
    if (navigator.webdriver || BOT_AGENT.test(navigator.userAgent)) return;
    void run(true);
  });

  // After mount only, so never on the server.
  useEffect(() => {
    if (!auto || !view || autoViews.has(view)) return;
    autoViews.add(view);
    // eslint-disable-next-line react/set-state-in-effect -- starting the update is the effect's outside work
    autoUpdate();
  }, [auto, view]);

  let label = t("player.refresh");
  if (state.status === "pending") label = t("player.refreshing");
  else if (remaining) label = t("player.refreshIn", { time: formatCountdown(remaining) });
  const { props: hint, tooltip } = useHint(label);

  let message: string | undefined;
  if (widgetFailed) message = t("player.notFound.verifyFailed");
  else if (state.status === "limited" && !state.auto && remaining) message = t("player.refreshLimited");
  else if (state.status === "unavailable") message = t("player.refreshFailed");
  else if (state.status === "error") message = t("player.refreshError");

  // `aria-disabled`, not `disabled`, so the button keeps focus while it refreshes and counts down. Its tap area reaches
  // past its 32 px box to 44 px.
  return (
    <>
      <div className={cn("flex items-center gap-2", className)}>
        <p data-clock="updated" className={cn(META, "min-w-0")} suppressHydrationWarning>
          {state.status === "pending" ? label : now === undefined ? " " : <UpdatedAt updatedAt={updatedAt} now={now} />}
        </p>
        <button
          type="button"
          data-clock="refresh"
          aria-label={label}
          aria-disabled={disabled}
          suppressHydrationWarning
          {...hint}
          onClick={() => {
            if (disabled) return;
            if (turnstileSiteKey) setVerifying(true);
            else void run(false);
          }}
          className="relative flex h-8 min-w-8 shrink-0 items-center justify-center gap-1 bg-blackify-800 px-2 text-mc-1 text-mc-green after:absolute after:-inset-1.5 hover:bg-blackify-700 focus-visible:focus-ring-inset aria-disabled:text-mc-gray aria-disabled:hover:bg-blackify-800"
        >
          <RefreshIcon className="size-4 shrink-0" />
          <span data-clock="countdown" className="empty:hidden" suppressHydrationWarning>
            {state.status !== "pending" && remaining ? formatCountdown(remaining) : ""}
          </span>
        </button>
        {tooltip}
      </div>
      {verifying && (
        <Turnstile
          siteKey={turnstileSiteKey}
          onToken={(token) => {
            if (token) return void run(false, token);
            // The widget failed or its token expired: the button comes back for another try.
            setVerifying(false);
            setState({ status: "error" });
          }}
          onLoadError={() => setWidgetFailed(true)}
          // The bar sits in the profile card, narrower than the flexible widget's 300 px.
          size="compact"
          className="flex basis-full justify-center"
        />
      )}
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
