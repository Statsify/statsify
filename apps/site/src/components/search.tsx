/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

/* eslint-disable jsx-a11y/no-redundant-roles, jsx-a11y/prefer-tag-over-role -- the APG combobox: the input needs
   role="combobox", and the suggestions are a styled listbox of links, which <datalist> can't be. */

import { Link, useNavigate } from "@tanstack/react-router";
import { SearchIcon } from "~/components/icons/search";
import { cn } from "~/lib/util";
import { orpc } from "~/lib/orpc";
import { useDebounce } from "~/hooks/use-debounce";
import { useOutisdeClick } from "~/hooks/use-outside-click";
import { useQuery } from "@tanstack/react-query";
import { useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const SEARCH_DEBOUNCE_MS = 300;
const SEARCH_CACHE_TIME_MS = 5 * 60 * 1000;

/** Where a submitted name goes: the player page, its Bingo boards, or the `/player?q=` result cards. */
export type SearchTarget = "player" | "bingo" | "results";

// Rows are at least 44 px tall, an easy tap target; `item` must match `itemHeight` for the keyboard scrolling. The
// sheet is 300 px tall from `sm`, and a row shorter on phones, so the on-screen keyboard doesn't cover its last name.
const SIZES = {
  regular: { itemHeight: 56, item: "h-14 px-4", bar: "h-16 px-4 gap-4", icon: "size-8", text: "text-mc-2", sheet: "max-h-61 sm:max-h-75" },
  compact: { itemHeight: 44, item: "h-11 px-3", bar: "h-11 px-3 gap-3", icon: "size-5", text: "text-mc-1.5", sheet: "max-h-64 sm:max-h-75" },
} as const;

function usePlayerSuggestions(input: string, focused: boolean) {
  const debouncedInput = useDebounce(input, SEARCH_DEBOUNCE_MS);

  // Through the edge-cached `/api/rpc` proxy; the API answers from RediSearch alone
  return useQuery(
    orpc.search.suggest.queryOptions({
      input: { query: debouncedInput },
      // A pasted UUID is longer than any name, and the API refuses it.
      enabled: focused && debouncedInput.trim().length <= 16,
      retry: false,
      gcTime: SEARCH_CACHE_TIME_MS,
    })
  );
}

function useSearchNavigation(target: SearchTarget) {
  const navigate = useNavigate();

  return (name: string) => {
    switch (target) {
      case "bingo":
        return navigate({ to: "/{-$locale}/player/$name/bingo", params: { name } });
      case "results":
        return navigate({ to: "/{-$locale}/player", search: { q: name } });
      case "player":
        return navigate({ to: "/{-$locale}/player/$name", params: { name } });
    }
  };
}

export function Search({
  className,
  defaultValue = "",
  disabled,
  target = "player",
  compact = false,
  placeholder,
  onSelect,
}: {
  className?: string;
  defaultValue?: string;
  disabled?: boolean;
  target?: SearchTarget;
  compact?: boolean;
  placeholder?: string;
  /** Handles a submitted or picked name instead of navigating to `target`. */
  onSelect?: (name: string) => unknown;
}) {
  const { t } = useTranslation();
  const size = SIZES[compact ? "compact" : "regular"];
  const [input, setInput] = useState(defaultValue);
  const [query, setQuery] = useState(defaultValue);
  const [focused, setFocused] = useState(false);
  const suggestions = usePlayerSuggestions(query, focused);
  const [selected, setSelected] = useState<number | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigateTo = useSearchNavigation(target);
  const go = onSelect ?? navigateTo;
  const listId = useId();
  const optionId = (index: number) => `${listId}-${index}`;
  const count = suggestions.data?.length ?? 0;

  const ref = useOutisdeClick<HTMLFormElement>(() => {
    setFocused(false);
    setSelected(undefined);
  });

  function onSelectionChange(selected: number) {
    setSelected(selected);
    if (suggestions.data) setInput(suggestions.data[selected]);

    const visible = containerRef.current?.clientHeight ?? 0;
    const maxScroll = (suggestions.data?.length ?? 0) * size.itemHeight - visible;
    const halfVisible = Math.floor(visible / 2);
    let scrollTop = selected * size.itemHeight - halfVisible + size.itemHeight / 2;
    scrollTop = Math.max(0, Math.min(scrollTop, maxScroll));

    containerRef.current?.scrollTo({
      top: scrollTop,
      behavior: "instant",
    });
  }

  return (
    <form
      ref={ref}
      className={cn("relative", className)}
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        // Only spaces is nothing to search for.
        const query = String(formData.get("search") ?? "").trim();
        if (!query) return;
        void go(query);
      }}
    >
      {/* A square, solid input; the focus outline sits inside its edge. */}
      <div className={cn("flex items-center bg-blackify-800 -outline-offset-2 focus-within:outline-2 focus-within:outline-white/60", size.bar)}>
        <SearchIcon className={cn("shrink-0 text-mc-gray", size.icon)} />
        <input
          name="search"
          placeholder={placeholder ?? t("search.placeholder")}
          // A placeholder too long for a phone ends in an ellipsis rather than mid-letter.
          className={cn("placeholder:text-mc-gray text-white outline-none h-full w-full min-w-0 text-ellipsis selection:bg-white/50", size.text)}
          value={input}
          onChange={(event) => {
            setQuery(event.target.value);
            setInput(event.target.value);
          }}
          // Enter submits the form natively; the arrows move through the suggestions when there are any.
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setSelected(undefined);
              return;
            }

            if (count === 0) return;

            if (event.key === "ArrowDown") {
              event.preventDefault();
              onSelectionChange(((selected ?? -1) + 1) % count);
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              onSelectionChange(selected ? selected - 1 : count - 1);
            }
          }}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={focused && count > 0}
          aria-controls={listId}
          aria-activedescendant={selected === undefined ? undefined : optionId(selected)}
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          enterKeyHint="search"
          disabled={disabled}
          onFocus={() => setFocused(true)}
          aria-label={t("search.label")}
        />
      </div>
      <div
        ref={containerRef}
        id={listId}
        role="listbox"
        aria-label={t("search.label")}
        hidden={!focused || (!suggestions.isPending && count === 0)}
        className={cn("absolute z-100 w-full overflow-auto bg-blackify-800 shadow-[4px_4px_0_rgb(0_0_0_/_0.5)]", size.sheet)}
      >
        {focused && suggestions.isPending && (
          <>
            <SearchPlayerSkeleton compact={compact} />
            <SearchPlayerSkeleton compact={compact} />
            <SearchPlayerSkeleton compact={compact} />
          </>
        )}
        {suggestions.data?.map((suggestion, index) => (
          <SearchPlayer
            key={suggestion}
            id={optionId(index)}
            player={suggestion}
            selected={selected === index}
            target={target}
            compact={compact}
            onSelect={onSelect}
          />
        ))}
      </div>
    </form>
  );
}

function SearchPlayer({
  id,
  player,
  selected = false,
  target,
  compact,
  onSelect,
}: {
  id: string;
  player: string;
  selected?: boolean;
  target: SearchTarget;
  compact: boolean;
  onSelect?: (name: string) => unknown;
}) {
  const size = SIZES[compact ? "compact" : "regular"];
  const className = cn(
    "relative flex items-center gap-4 w-full hover:bg-white/10 active:bg-white/5 aria-selected:bg-white/10 aria-selected:before:content-[''] aria-selected:before:absolute aria-selected:before:bg-blueify-500 aria-selected:before:h-full aria-selected:before:w-1 aria-selected:before:left-0",
    size.item
  );
  const text = cn("text-white selection:bg-white/50", size.text);

  // With a handler the suggestion is handed over like a submitted name (the leaderboard `around` box).
  if (onSelect) {
    return (
      <button id={id} type="button" role="option" onClick={() => void onSelect(player)} aria-selected={selected} className={className}>
        <p className={text}>{player}</p>
      </button>
    );
  }

  // Otherwise suggestions open the page they name; only the submitted text goes to the result cards.
  if (target === "bingo") {
    return (
      <Link id={id} role="option" to="/{-$locale}/player/$name/bingo" params={{ name: player }} aria-selected={selected} className={className}>
        <p className={text}>{player}</p>
      </Link>
    );
  }

  return (
    <Link id={id} role="option" to="/{-$locale}/player/$name" params={{ name: player }} aria-selected={selected} className={className}>
      <p className={text}>{player}</p>
    </Link>
  );
}

function SearchPlayerSkeleton({ compact }: { compact: boolean }) {
  return (
    <div className={cn("relative flex items-center gap-4 w-full", compact ? "p-3" : "p-4")}>
      <div className={cn("bg-gray-200/40 animate-pulse w-1/3 selection:bg-white/50", compact ? "h-[14px]" : "h-[19px]")} />
    </div>
  );
}
