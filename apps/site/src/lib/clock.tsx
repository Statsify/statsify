/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { formatCountdown, relativeTime } from "~/i18n/format";
import { useHydrated } from "@tanstack/react-router";

/** Stands in for a template's `{{time}}`, so the clock script can put the browser's time there. */
export const TIME_SLOT = "\u0000";

/** A refresh bar's "Updated …" and button, or an online status's " · 5m ago" (the element is its gray span). */
type ClockArgs =
  | { updatedAt: number; lockedUntil: number; locale: string; updated: string; refresh: string; refreshIn: string }
  | { updatedAt: number; expiresAt: number; locale: string };

/**
 * Before first paint, `__clock(element, args)` writes the time text cached HTML can't know from the browser's clock.
 * It inlines the formatters React renders with once mounted, so the two can't drift.
 */
export const CLOCK_SCRIPT = `window.__clock = (element, args) => {
  const now = Date.now();
  const relativeTime = ${relativeTime};
  const formatCountdown = ${formatCountdown};

  if (!("lockedUntil" in args)) {
    element.textContent = now < args.expiresAt ? "" : " · " + relativeTime(args.updatedAt, now, args.locale, { style: "narrow" });
    return;
  }

  const remaining = Math.max(0, Math.ceil((args.lockedUntil - now) / 1000));
  const fill = (template, time) => template.replace(${JSON.stringify(TIME_SLOT)}, time);
  element.querySelector("[data-clock=updated]").textContent = fill(args.updated, relativeTime(args.updatedAt, now, args.locale));
  const refresh = element.querySelector("[data-clock=refresh]");
  // Only the label's own text: the button's shadows are elements beside it.
  for (const node of refresh.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) node.data = remaining ? fill(args.refreshIn, formatCountdown(remaining)) : args.refresh;
  }
  refresh.setAttribute("aria-disabled", String(remaining > 0));
};`;

/**
 * Fills the element just before it as the HTML is parsed. What it writes stays through hydration
 * (`suppressHydrationWarning` on what it fills); rendered only then, since a script React adds later never runs.
 */
export function ClockScript({ args }: { args: ClockArgs }) {
  const hydrated = useHydrated();
  if (hydrated) return null;
  const call = `__clock(document.currentScript.previousElementSibling,${JSON.stringify(args).replaceAll("<", "\\u003c")})`;
  return <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: call }} />;
}
