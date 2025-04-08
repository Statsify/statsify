/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { SearchIcon } from "~/components/icons/search";
import { Background } from "~/components/ui/background";
import { cn } from "~/lib/util";

export default function TestPage() {
  return (
      <div className="relative h-[100dvh]">
        <Background
          background="background"
          className="h-full"
          mask="linear-gradient(rgb(255 255 255) 20%, rgb(0 0 0 / 0) 95%)"
        />
        <div className="absolute h-[100dvh] w-full bg-[rgb(17_17_17_/0.7)] -z-10" />
        <div className="w-full h-full flex justify-center items-center flex-col gap-8">
          <div className="flex flex-col gap-2 items-center">
            <h1 className="text-mc-yellow text-mc-7 font-bold">Bingo Tracker</h1>
            <h2 className="text-mc-gold text-mc-3">12th Anniversary Bingo</h2>
          </div>
          <Search className="w-[80%]" />
        </div>
    </div>
  );
}

function Search({ className }: { className?: string }) {
  return (
    <div className={cn("h-16 flex items-center px-4 gap-4 bg-white/30 border-4 border-white/40 backdrop-blur-sm", className)}>
      <SearchIcon className="size-8 text-white drop-shadow-mc-2" />
      <input placeholder="Search a player" className="text-mc-2 placeholder-mc-darkgray text-white outline-none h-full w-full selection:bg-white/50" spellCheck={false} />
    </div>
  )};