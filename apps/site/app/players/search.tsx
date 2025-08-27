/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

"use client";

import Link, { type LinkProps } from "next/link";
import type { Route } from "next";
import { useEffect, useRef, useState, useTransition } from "react";
import { SearchIcon } from "~/components/icons/search";
import { cn } from "~/lib/util";
import { getPlayerSuggestions } from "~/app/api";
import { motion } from "motion/react";
import { redirect } from "next/navigation";
import { useDebounce } from "~/hooks/use-debounce";
import { useOutisdeClick } from "~/hooks/use-outside-click";

const SEARCH_DEBOUNCE_MS = 300;
const SEARCH_ITEM_HEIGHT = 51;
const SEARCH_MAX_HEIGHT = 300;

function usePlayerSuggestions(input: string) {
  const query = useDebounce(input, SEARCH_DEBOUNCE_MS);
  const requestId = useRef(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  function onSuggestionsChange(suggestions: string[], currentRequestId: number) {
    if (currentRequestId !== requestId.current) return;
    setSuggestions(suggestions);
  }

  useEffect(() => {
    const currentRequestId = ++requestId.current;

    if (!query || query.length > 16) {
      setSuggestions([]);
      return;
    }

    startTransition(async () => {
      try {
        const suggestions = await getPlayerSuggestions(query);
        startTransition(() => onSuggestionsChange(suggestions, currentRequestId));
      } catch {
        startTransition(() => onSuggestionsChange([], currentRequestId));
      }
    });
  }, [query, requestId]);

  return { isPending, suggestions };
}

const playerUrl = (tag: string): Route => `/players/${tag}/general/bingo`;

export function Search({
  className,
  defaultValue = "",
  disabled,
}: {
  className?: string;
  defaultValue?: string;
  disabled?: boolean;
}) {
  const [input, setInput] = useState(defaultValue);
  const [query, setQuery] = useState(defaultValue);
  const { suggestions, isPending } = usePlayerSuggestions(query ?? "");
  const [focused, setFocused] = useState(false);
  const [selected, setSelected] = useState<number | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  const ref = useOutisdeClick<HTMLFormElement>(() => {
    setFocused(false);
    setSelected(undefined);
  });

  function onSelectionChange(selected: number) {
    setSelected(selected);
    setInput(suggestions[selected]);

    const maxScroll = suggestions.length * SEARCH_ITEM_HEIGHT - SEARCH_MAX_HEIGHT;
    const halfVisible = Math.floor(SEARCH_MAX_HEIGHT / 2);
    let scrollTop = selected * SEARCH_ITEM_HEIGHT - halfVisible + SEARCH_ITEM_HEIGHT / 2;
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
        const query = formData.get("search");
        if (!query || typeof query !== "string") return;
        redirect(playerUrl(query));
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          ref.current?.requestSubmit();
        }

        if (isPending) return;

        switch (event.key) {
          case "Escape":
            setSelected(undefined);
            break;

          case "ArrowDown": {
            const newSelected = ((selected ?? -1) + 1) % suggestions.length;
            onSelectionChange(newSelected);
            break;
          }

          case "ArrowUp": {
            const newSelected = selected ? selected - 1 : suggestions.length - 1;
            onSelectionChange(newSelected);
            break;
          }
        }
      }}
    >
      <div className="h-16 flex items-center px-4 gap-4 bg-gradient-to-r from-white/20 to-white/40 outline-white/0 outline-4 transition-all duration-150 focus-within:outline-white/50 -outline-offset-4 backdrop-blur-sm">
        <SearchIcon className="size-8 text-white drop-shadow-mc-2" />
        <input
          name="search"
          placeholder="Search a player"
          className="text-mc-2 placeholder-mc-darkgray text-white outline-none h-full w-full selection:bg-white/50"
          value={input}
          onChange={(event) => {
            setQuery(event.target.value);
            setInput(event.target.value);
          }}
          spellCheck={false}
          autoComplete="off"
          disabled={disabled}
          onFocus={() => setFocused(true)}
        />
      </div>
      <motion.div
        ref={containerRef}
        className="w-full overflow-auto absolute bg-white/25 backdrop-blur-2xl z-100"
        animate={{
          height: +focused * Math.min(
            SEARCH_MAX_HEIGHT,
            isPending ? 3 * SEARCH_ITEM_HEIGHT : suggestions.length * SEARCH_ITEM_HEIGHT
          ),
        }}
      >
        {focused && isPending && (
          <>
            <SearchPlayerSkeleton />
            <SearchPlayerSkeleton />
            <SearchPlayerSkeleton />
          </>
        )}
        {
          focused &&
          !isPending &&
          suggestions.length &&
          suggestions.map((suggestion, index) => (
            <div
              key={suggestion}
              className="w-full flex flex-col items-center p-2"
            >
              <SearchPlayer
                player={suggestion}
                selected={selected === index}
              />
            </div>
          ))
        }
      </motion.div>
    </form>
  );
}

function SearchPlayer<RouteType,>({ player, selected = false, ...props }: Omit<LinkProps<RouteType>, "href" | "aria-selected" | "className" | "children"> & { player: string; selected?: boolean }) {
  return (
    <Link<RouteType>
      {...props}
      href={playerUrl(player)}
      aria-selected={selected}
      className="relative flex items-center gap-4 w-full p-2 hover:bg-white/20 active:bg-white/10 aria-selected:bg-white/20 aria-selected:before:content-[''] aria-selected:before:absolute aria-selected:before:bg-blueify-500 aria-selected:before:h-full aria-selected:before:w-0.5 aria-selected:before:left-0"
    >
      {/* <div className="w-8 h-8 bg-red-300 drop-shadow-mc-2" /> */}
      <p className="text-mc-2 text-white selection:bg-white/50">{player}</p>
    </Link>
  );
}

function SearchPlayerSkeleton() {
  return (
    <div className="relative flex items-center gap-4 w-full p-4">
      {/* <div className="w-8 h-8 bg-gray-200/40  animate-pulse drop-shadow-mc-2" /> */}
      <div className="text-mc-2 bg-gray-200/40 animate-pulse w-1/3 h-[19px] selection:bg-white/50" />
    </div>
  );
}
