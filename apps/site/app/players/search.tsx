/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

"use client";

import { AnimatePresence, motion } from "motion/react";
import { ResizablePanel } from "~/components/ui/resizable-panel";
import { SearchIcon } from "~/components/icons/search";
import { cn } from "~/lib/util";
import { getPlayerSuggestions } from "~/app/api";
import { redirect } from "next/navigation";
import { useState, useEffect, useRef, useTransition, type TransitionStartFunction } from "react";
import Link from "next/link";
import { useDebounce } from "~/hooks/use-debounce";
import { useOutisdeClick } from "~/hooks/use-outside-click";

const SEARCH_DEBOUNCE_MS = 300;

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
      } catch (error) {
        startTransition(() => onSuggestionsChange([], currentRequestId));
      }
    });
  }, [query, requestId]);

  return { isPending, suggestions };
}

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
  const { suggestions, isPending } = usePlayerSuggestions(input ?? "");
  const [focused, setFocused] = useState(false);
  const ref = useOutisdeClick<HTMLFormElement>(() => setFocused(false));

  return (
    <form
      ref={ref}
      method="POST"
      className={cn("relative", className)}
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const query = formData.get("search");
        if (!query) return;
        console.log(query);
        redirect(`/players/${query}`);
      }}
    >
      <div className="h-16 flex items-center px-4 gap-4 bg-white/30 border-4 border-white/40 backdrop-blur-sm">
        <SearchIcon className="size-8 text-white drop-shadow-mc-2" />
        <input
          name="search"
          placeholder="Search a player"
          className="text-mc-2 placeholder-mc-darkgray text-white outline-none h-full w-full selection:bg-white/50"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          spellCheck={false}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              ref.current?.requestSubmit();
            }
          }}
        />
      </div>
      <ResizablePanel containerClass="w-full absolute max-h-[300px] bg-white/25 backdrop-blur-2xl z-100">
        {focused && (
          <AnimatePresence>
            {isPending && (
              <>
                <SearchPlayerSkeleton />
                <SearchPlayerSkeleton />
                <SearchPlayerSkeleton />
              </>
            )}
            {!isPending &&
              suggestions.length &&
              suggestions.map((suggestion) => (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                  key={suggestion}
                  className="w-full flex flex-col items-center p-2"
                >
                  <SearchPlayer player={suggestion} />
                </motion.div>
              ))}
          </AnimatePresence>
        )}
      </ResizablePanel>
    </form>
  );
}

function SearchPlayer({ player }: { player: string }) {
  return (
    <Link
      href={`/players/${player}/general/bingo`}
      className="flex items-center gap-4 w-full p-2 hover:bg-white/20 active:bg-white/10"
    >
      {/* <div className="w-8 h-8 bg-red-300 drop-shadow-mc-2" /> */}
      <p className="text-mc-2 text-white selection:bg-white/50">{player}</p>
    </Link>
  );
}

function SearchPlayerSkeleton() {
  return (
    <div className="flex items-center gap-4 w-full p-4">
      {/* <div className="w-8 h-8 bg-gray-200/40  animate-pulse drop-shadow-mc-2" /> */}
      <div className="text-mc-2 bg-gray-200/40 animate-pulse w-1/3 h-5 selection:bg-white/50" />
    </div>
  );
}
