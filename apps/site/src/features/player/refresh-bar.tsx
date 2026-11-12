/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Button } from "~/components/ui/button";
import { Turnstile } from "~/components/turnstile";
import { cn } from "~/lib/util";
import { formatCountdown } from "~/i18n/format";
import { getRouteApi } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { ActionResult } from "./player-actions";

const localeRoute = getRouteApi("/{-$locale}");

const META = "text-mc-1 text-mc-gray";

type RefreshState =
  | { status: "idle" }
  | { status: "pending" }
  /** The last refresh worked: said once to screen readers, otherwise the same as idle. */
  | { status: "done" }
  | { status: "limited"; until: number }
  /** Hypixel didn't answer in time; the page still shows the stored stats. */
  | { status: "unavailable" }
  | { status: "error" };

/** Ticks once a second after mount; `undefined` during SSR so the HTML never carries a clock value. */
function useNow(): number | undefined {
  const [now, setNow] = useState<number>();

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return now;
}

function relativeTime(then: number, now: number, locale: string): string {
  const format = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const seconds = Math.round((then - now) / 1000);
  const magnitude = Math.abs(seconds);

  if (magnitude < 60) return format.format(seconds, "second");
  if (magnitude < 3600) return format.format(Math.round(seconds / 60), "minute");
  if (magnitude < 86_400) return format.format(Math.round(seconds / 3600), "hour");
  return format.format(Math.round(seconds / 86_400), "day");
}

/**
 * "Updated N minutes ago" and the refresh button, disabled with a countdown until `expiresAt`.
 * `refresh` runs the page's refresh action with the visitor's Turnstile token and applies its data itself; the bar
 * shows the outcome. A click shows the Turnstile widget first, since each refresh spends the site's shared Hypixel budget.
 */
export function RefreshBar({
  updatedAt,
  expiresAt,
  refresh,
  row = false,
  className,
}: {
  updatedAt: number;
  expiresAt: number;
  refresh: (token: string | undefined) => Promise<ActionResult<unknown>>;
  /** One row on phones too, the time beside a smaller button: a game page, whose tables should start near the top. */
  row?: boolean;
  className?: string;
}) {
  const { t, i18n } = useTranslation();
  const { turnstileSiteKey } = localeRoute.useLoaderData();
  const now = useNow();
  const [state, setState] = useState<RefreshState>({ status: "idle" });
  const [verifying, setVerifying] = useState(false);

  const lockedUntil = state.status === "limited" ? state.until : expiresAt;
  const remaining = now === undefined ? undefined : Math.max(0, Math.ceil((lockedUntil - now) / 1000));
  const disabled = verifying || state.status === "pending" || remaining === undefined || remaining > 0;

  async function run(token?: string) {
    setVerifying(false);
    setState({ status: "pending" });

    let result: ActionResult<unknown>;

    try {
      result = await refresh(token);
    } catch {
      // A 500, a Cloudflare 429 or a dropped connection: say so and let the visitor try again.
      setState({ status: "error" });
      return;
    }

    if (result.ok) {
      setState({ status: "done" });
      return;
    }

    if (result.code === "TOO_MANY_REQUESTS") {
      setState({ status: "limited", until: Date.now() + result.retryAfter * 1000 });
      return;
    }

    setState({ status: result.code === "UNAVAILABLE" ? "unavailable" : "error" });
  }

  let label = t("player.refresh");
  if (state.status === "pending") label = t("player.refreshing");
  else if (remaining) label = t("player.refreshIn", { time: formatCountdown(remaining) });

  let message: string | undefined;
  if (state.status === "limited" && remaining) message = t("player.refreshLimited");
  else if (state.status === "unavailable") message = t("player.refreshFailed");
  else if (state.status === "error") message = t("error.description");

  // Phones: the time over a full-width button, unless `row`; wider screens: one row.
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div
        className={cn(
          "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4",
          row && "flex-row items-center justify-between gap-4"
        )}
      >
        <p className={cn(META, "min-w-0")}>{now === undefined ? " " : t("player.updated", { time: relativeTime(updatedAt, now, i18n.language) })}</p>
        {/* A minimum width, so the countdown's changing digits don't move the button. */}
        {/* `aria-disabled`, not `disabled`, so the button keeps focus while it refreshes and counts down. */}
        <Button asChild variant="primary" size="small" className={cn("w-full sm:w-auto sm:min-w-48", row && "w-auto min-w-36 shrink-0")}>
          <button type="button" aria-disabled={disabled} onClick={() => {
              if (disabled) return;
              if (turnstileSiteKey) setVerifying(true);
              else void run();
            }}
          >
            {label}
          </button>
        </Button>
      </div>
      {verifying && (
        <Turnstile
          siteKey={turnstileSiteKey}
          onToken={(token) => {
            if (token) return void run(token);
            // The widget failed or its token expired: the button comes back for another try.
            setVerifying(false);
            setState({ status: "error" });
          }}
          className="w-full"
        />
      )}
      <output className="block text-mc-1 text-mc-red empty:hidden">{message}</output>
      <output className="sr-only">
        {state.status === "pending" && t("player.refreshing")}
        {state.status === "done" && t("player.updated", { time: relativeTime(updatedAt, updatedAt, i18n.language) })}
      </output>
    </div>
  );
}
