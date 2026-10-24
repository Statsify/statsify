/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Link } from "@tanstack/react-router";
import { cn } from "~/lib/util";
import { useTranslation } from "react-i18next";
import type { CSSProperties, ReactNode } from "react";

/**
 * For a link that makes a whole stat (or panel) clickable: it stretches over its nearest `relative` ancestor, which
 * lightens on hover and shows the keyboard focus. The text keeps its colour and gets no underline.
 */
export const STAT_LINK =
  "outline-none after:absolute after:-inset-1 hover:after:bg-white/10 focus-visible:after:outline-2 focus-visible:after:outline-white/60";

/** A stat the player hides in Hypixel's API settings. */
export function Hidden() {
  const { t } = useTranslation();
  return <span className="text-mc-gray">{t("default:stats.hidden")}</span>;
}

/**
 * A card table cell (`Table.td`): a Minecraft 16 title over a Minecraft 32 value, both in the stat's colour and centred
 * (the number is the hero). A long title wraps to two lines; the value keeps to the bottom of the cell, so the values
 * in a row line up whatever their titles do. Renders a `<div>` holding a `<dt>` and a `<dd>`, so a list of cells goes
 * inside a `<dl>`.
 */
export function StatCell({
  label,
  value,
  color = "text-mc-white",
  style,
  className,
}: {
  label: ReactNode;
  value: ReactNode;
  color?: string;
  /** For a colour with no theme class (a card's `§#rrggbb`). */
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col items-center justify-end gap-1 text-center", color, className)} style={style}>
      <dt className="line-clamp-2 max-w-full text-mc-1 text-balance wrap-break-word">{label}</dt>
      <dd className="max-w-full text-mc-2">{value}</dd>
    </div>
  );
}

/** An inline row like the card's `§7Label: §3value`: one size, a §7 label and the value in its colour. */
export function InlineStat({
  label,
  value,
  color = "text-mc-white",
  style,
  className,
}: {
  label: string;
  value: ReactNode;
  color?: string;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 items-baseline gap-1 text-mc-1", className)}>
      <dt className="shrink-0 text-mc-gray after:content-[':']">{label}</dt>
      <dd className={cn("min-w-0 truncate", color)} style={style}>{value}</dd>
    </div>
  );
}

/**
 * The stat's leaderboard, opened at the player's row. The link covers the whole (`relative`) stat cell; its name says
 * where it goes.
 */
export function LeaderboardLink({
  field,
  username,
  stat,
  children,
}: {
  field: string;
  username: string;
  stat: string;
  children: ReactNode;
}) {
  const { t } = useTranslation();

  return (
    <Link to="/{-$locale}/leaderboards/$field" params={{ field }} search={{ around: username }} className={STAT_LINK}>
      {children}
      <span className="sr-only"> {t("game.leaderboard", { stat })}</span>
    </Link>
  );
}
