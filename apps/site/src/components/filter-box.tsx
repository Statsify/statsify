/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { SearchIcon } from "~/components/icons/search";
import { cn } from "~/lib/util";

/** Whether a text has every word of the query, any case; an empty query matches everything. */
export function wordMatcher(query: string): (text: string) => boolean {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return (text) => {
    const lower = text.toLowerCase();
    return words.every((word) => lower.includes(word));
  };
}

/**
 * A filter over a long grid in place (leaderboards, maps): the player search's square, solid input, with how
 * many entries are left at its end while it filters. The count is announced as it changes.
 */
export function FilterBox({
  value,
  onChange,
  label,
  count,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  /** "3 of 44", shown while the box filters. */
  count?: string;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "flex h-11 w-full items-center gap-3 bg-blackify-800 px-3 -outline-offset-2 focus-within:outline-2 focus-within:outline-white/60",
        className
      )}
    >
      <SearchIcon className="size-5 shrink-0 text-mc-gray" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={label}
        aria-label={label}
        className="h-full w-full min-w-0 bg-transparent text-mc-1.5 text-white text-ellipsis outline-none placeholder:text-mc-gray selection:bg-white/50"
      />
      <span aria-live="polite" className="shrink-0 text-mc-1 text-mc-gray">{value.trim() ? count : undefined}</span>
    </label>
  );
}
