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
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { ActionResult } from "./player-actions";

const META = "font-sans text-16 font-medium text-mc-gray";

type RefreshState =
  | { status: "idle" }
  | { status: "pending" }
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
 * `refresh` runs the page's refresh action and applies its data itself; the bar shows the outcome.
 */
export function RefreshBar({
  updatedAt,
  expiresAt,
  refresh,
  className,
}: {
  updatedAt: number;
  expiresAt: number;
  refresh: () => Promise<ActionResult<unknown>>;
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

    let result: ActionResult<unknown>;

    try {
      result = await refresh();
    } catch {
      // A 500, a Cloudflare 429 or a dropped connection: say so and let the visitor try again.
      setState({ status: "error" });
      return;
    }

    if (result.ok) {
      setState({ status: "idle" });
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

  // Phones: the time over a full-width button; wider screens: one row.
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <p className={META}>{now === undefined ? " " : t("player.updated", { time: relativeTime(updatedAt, now, i18n.language) })}</p>
        <Button asChild variant="primary" size="small" className="w-full sm:w-auto sm:min-w-48">
          <button type="button" disabled={disabled} onClick={() => void run()}>
            {label}
          </button>
        </Button>
      </div>
      <output className="block font-sans text-16 font-medium text-mc-red empty:hidden">{message}</output>
    </div>
  );
}
