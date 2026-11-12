/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { cn } from "~/lib/util";
import type { ReactNode } from "react";

/**
 * A card table cell (`Table.td`): a Minecraft 16 title over a Minecraft 32 value, both in the stat's color and centered
 * (the number is the hero). A long title wraps to two lines; the value keeps to the bottom of the cell, so the values
 * in a row line up whatever their titles do. Renders a `<div>` holding a `<dt>` and a `<dd>`, so a list of cells goes
 * inside a `<dl>`.
 */
export function StatCell({
  label,
  value,
  color = "text-mc-white",
  className,
}: {
  label: string;
  value: ReactNode;
  color?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col items-center justify-end gap-1 text-center", color, className)}>
      <dt className="line-clamp-2 max-w-full text-mc-1 text-balance wrap-break-word">{label}</dt>
      <dd className="max-w-full text-mc-2">{value}</dd>
    </div>
  );
}

/** An inline row like the card's `§7Label: §3value`: one size, a §7 label and the value in its color. */
export function InlineStat({
  label,
  value,
  color = "text-mc-white",
  className,
}: {
  label: string;
  value: ReactNode;
  color?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 items-baseline gap-1 text-mc-1", className)}>
      <dt className="shrink-0 text-mc-gray after:content-[':']">{label}</dt>
      <dd className={cn("min-w-0 truncate", color)}>{value}</dd>
    </div>
  );
}
