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
import { useState, useTransition } from "react";

export function Search({ className, defaultValue }: { className?: string; defaultValue?: string }) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [focused, setFocused] = useState(false);

  // TODO: add debounce + ratelimit ?
  function onInputChange(query: string) {
    if (query.length > 16) {
      setSuggestions([]);
      return;
    }

    startTransition(async () => {
      const suggestions = await getPlayerSuggestions(query);
      startTransition(() => setSuggestions(suggestions));
    });
  }

  return (
    <form
      className={cn("relative", className)}
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const query = formData.get("search");
        if (!query) return;
        redirect(`/players/${query}`);
      }}
    >
      <div className="h-16 flex items-center px-4 gap-4 bg-white/30 border-4 border-white/40 backdrop-blur-sm">
        <SearchIcon className="size-8 text-white drop-shadow-mc-2" />
        <input
          name="search"
          placeholder="Search a player"
          className="text-mc-2 placeholder-mc-darkgray text-white outline-none h-full w-full selection:bg-white/50"
          onChange={(event) => onInputChange(event.target.value)}
          spellCheck={false}
          defaultValue={defaultValue}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
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
            {!isPending && suggestions.length && suggestions.map((suggestion) => (
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
    <button type="submit" className="flex items-center gap-4 w-full p-2 hover:bg-white/20 active:bg-white/10">
      {/* <div className="w-8 h-8 bg-red-300 drop-shadow-mc-2" /> */}
      <p className="text-mc-2 text-white selection:bg-white/50">
        {player}
      </p>
    </button>
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

