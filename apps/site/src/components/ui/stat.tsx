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
 * A card table cell: a Minecraft 16 label in §f over a Minecraft 32 value in the stat's colour, centred like the
 * card's `Table.td` (the number is the hero). Renders a `<div>` holding a `<dt>` and a `<dd>`, so a list of cells goes
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
    <div className={cn("flex min-w-0 flex-col items-center gap-1 text-center", className)}>
      <dt className="max-w-full truncate text-mc-1 text-mc-white">{label}</dt>
      <dd className={cn("text-mc-2", color)}>{value}</dd>
    </div>
  );
}

/**
 * An inline row like the card's single-size `§7Label: §3value`: a label and a value, both Minecraft 16, on one line.
 */
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
    <div className={cn("flex min-w-0 items-baseline gap-2", className)}>
      <dt className="shrink-0 text-mc-1 text-mc-white">{label}</dt>
      <dd className={cn("min-w-0 truncate text-mc-1", color)}>{value}</dd>
    </div>
  );
}
