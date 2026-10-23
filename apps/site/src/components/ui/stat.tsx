/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Hint, useHint } from "./hint";
import { Link } from "@tanstack/react-router";
import { cn } from "~/lib/util";
import { useExactNumber, useNumberFormat } from "~/i18n/use-number-format";
import { useTranslation } from "react-i18next";
import type { CSSProperties, ReactNode } from "react";

/**
 * A stat label's full name where the label shortens one (FKDR, Final Kill/Death Ratio): the glossary's `name` for the
 * label's key in `default.json`, which every page loads.
 */
export function useStatName(): (label: string) => string | undefined {
  const { t, i18n } = useTranslation();

  return (label) => {
    const key = `default:glossary.${label.slice(label.lastIndexOf(".") + 1)}.name`;
    return i18n.exists(key) ? t(key) : undefined;
  };
}

/** A number in the bot's format, with the exact number where that shortens it (`Hint`). */
export function StatNumber({ value }: { value: number }) {
  const n = useNumberFormat();
  const exact = useExactNumber();
  return <Hint full={exact(value)}>{n(value)}</Hint>;
}

/**
 * For a link that makes a whole stat (or panel) clickable: it stretches over its nearest `relative` ancestor, and 6 px
 * past its top and bottom so a stat cell is a 44 px target, which lightens on hover and while pressed and shows the
 * keyboard focus. The text keeps its colour and gets no underline.
 */
export const STAT_LINK =
  "focus-ring-none after:absolute after:-inset-x-1 after:-inset-y-1.5 hover:after:bg-white/10 active:after:bg-white/10 focus-visible:after:focus-ring";

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
  label: ReactNode;
  value: ReactNode;
  color?: string;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 items-baseline gap-1 text-mc-1", className)}>
      <dt className="shrink-0 text-mc-gray after:content-[':']">{label}</dt>
      {/* Room inside the clip for a Hint's focus ring and its hard shadow (6 px). */}
      <dd className={cn("-m-1.5 min-w-0 truncate p-1.5", color)} style={style}>{value}</dd>
    </div>
  );
}

/** What a stat link shows on hover and keyboard focus: the label's full name and the exact number, where shortened. */
export const linkHint = (full?: string, exact?: string) => [full, exact].filter(Boolean).join(": ") || undefined;

/**
 * The stat's leaderboard, opened at the player's row. The link covers the whole (`relative`) stat cell; its name says
 * where it goes. A tap follows it, so what the cell shortens (`hint`) shows on hover and keyboard focus instead.
 */
export function LeaderboardLink({
  field,
  username,
  stat,
  hint,
  children,
}: {
  field: string;
  username: string;
  stat: string;
  hint?: string;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  // Over the whole cell the link covers, not just its text.
  const { props, tooltip } = useHint(hint, (link) => link.closest(".relative") ?? link);

  return (
    <>
      <Link to="/{-$locale}/leaderboards/$field" params={{ field }} search={{ around: username }} className={STAT_LINK} {...props}>
        {children}
        <span className="sr-only"> {t("game.leaderboard", { stat })}</span>
      </Link>
      {tooltip}
    </>
  );
}
