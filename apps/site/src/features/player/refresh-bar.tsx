/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Button } from "~/components/ui/button";
import { cn } from "~/lib/util";
import { formatCountdown } from "~/i18n/format";
import { type ReactNode, useEffect, useState } from "react";
import { type ActionResult, BROWSER_TIMEOUT_MS } from "./player-actions";
import { useTranslation } from "react-i18next";

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
 * `refresh` runs the page's refresh action with the bar's deadline and applies its data itself; the bar shows the
 * outcome.
 */
export function RefreshBar({
  updatedAt,
  expiresAt,
  refresh,
  row = false,
  beside,
  className,
}: {
  updatedAt: number;
  expiresAt: number;
  refresh: (deadline: AbortSignal) => Promise<ActionResult<unknown>>;
  /** One row on phones too, the time beside a smaller button: a game page, whose tables should start near the top. */
  row?: boolean;
  /**
   * Controls that share the button's row, under the time: a game page's nametag on phones puts the bar there, with
   * its Share toggle, so the tables start higher.
   */
  beside?: ReactNode;
  className?: string;
}) {
  const { t, i18n } = useTranslation();
  const now = useNow();
  const [state, setState] = useState<RefreshState>({ status: "idle" });

  const lockedUntil = state.status === "limited" ? state.until : expiresAt;
  const remaining = now === undefined ? undefined : Math.max(0, Math.ceil((lockedUntil - now) / 1000));
  const disabled = state.status === "pending" || remaining === undefined || remaining > 0;

  async function run() {
    setState({ status: "pending" });

    const deadline = AbortSignal.timeout(BROWSER_TIMEOUT_MS);
    let result: ActionResult<unknown>;

    try {
      result = await refresh(deadline);
    } catch {
      // A 500, a Cloudflare 429 or a dropped connection: say so and let the visitor try again. A hung one reads as
      // Hypixel not answering, as when the server's own deadline runs out.
      setState({ status: deadline.aborted ? "unavailable" : "error" });
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
  else if (state.status === "error") message = t("player.refreshError");

  // A minimum width, so the countdown's changing digits don't move the button; beside other controls it's at the end
  // of the row, where they don't move either.
  // `aria-disabled`, not `disabled`, so the button keeps focus while it refreshes and counts down.
  const button = (
    <Button
      asChild
      variant="primary"
      size="small"
      className={cn("w-full sm:w-auto sm:min-w-48", row && "w-auto min-w-36 shrink-0", beside !== undefined && "w-auto shrink-0 sm:min-w-0")}
    >
      <button type="button" aria-disabled={disabled} onClick={() => {
          if (!disabled) void run();
        }}
      >
        {label}
      </button>
    </Button>
  );

  // Phones: the time over a full-width button, unless `row`; wider screens: one row. Beside other controls, the time
  // over them and the button.
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div
        className={cn(
          "flex flex-col gap-2",
          beside === undefined && "sm:flex-row sm:items-center sm:justify-between sm:gap-4",
          row && "flex-row items-center justify-between gap-4"
        )}
      >
        <p className={cn(META, "min-w-0")}>{now === undefined ? " " : t("player.updated", { time: relativeTime(updatedAt, now, i18n.language) })}</p>
        {beside === undefined ? button : <div className="flex items-center justify-between gap-3">{beside}{button}</div>}
      </div>
      <output className="block text-mc-1 text-mc-red empty:hidden">{message}</output>
      <output className="sr-only">
        {state.status === "pending" && t("player.refreshing")}
        {state.status === "done" && t("player.updated", { time: relativeTime(updatedAt, updatedAt, i18n.language) })}
      </output>
    </div>
  );
}
