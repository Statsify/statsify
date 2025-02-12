/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Background } from "~/components/ui/background";
import { InteractiveLogo } from "./interactive-logo";
import { SearchIcon } from "~/components/icons/search";
import { PlayerSection } from "./sections/player-section";
import { cn } from "~/lib/util";

export default async function Home() {
  const response = await fetch(`https://api.statsify.net/player?key=${process.env.API_KEY}&player=amony`);
  const { player } = await response.json();

  return (
    <div>
      <Background
      background="background"
        className="h-[80dvh]"
        mask="linear-gradient(rgb(255 255 255) 20%, rgb(0 0 0 / 0) 95%)"
      />
      <div className="w-4/5 max-w-[1800px] mx-auto flex flex-col-reverse lg:flex-row text-center gap-4 lg:gap-10 lg:text-start lg:justify-between items-center text-mc-white h-[76dvh]">
        <div className="flex flex-col gap-10 lg:gap-6 md:max-w-[500px] xl:max-w-[600px]">
          <div className="flex flex-col gap-3">
            <p className="text-mc-8 xl:text-mc-10 font-bold"><span className="text-[#D0EEFC]">S</span><span className="text-[#8EC3E7]">t</span><span className="text-[#4C97D2]">a</span><span className="text-[#418DCC]">t</span><span className="text-[#3784C5]">s</span><span className="text-[#2C7ABF]">i</span><span className="text-[#2171B8]">f</span><span className="text-[#1668B1]">y</span></p>
            <p className="text-mc-3">Statsify is the most advanced bot in 2025</p>
          </div>
          <div className="flex flex-col xl:flex-row gap-4 w-full">
            <Search className="grow" />
            <DiscordInvite />
          </div>
        </div>
        <InteractiveLogo />
      </div>
      <PlayerSection player={player}/>
      <div className="h-1000 w-10" />
    </div>
  );
}

function Search({ className }: { className?: string }) {
  return (
    <div className={cn("h-16 flex items-center px-4 gap-4 bg-white/30 border-4 border-white/40 backdrop-blur-sm", className)}>
      <SearchIcon className="size-8 text-white drop-shadow-mc-2" />
      <input placeholder="Search your stats" className="text-mc-2 placeholder-mc-darkgray text-white outline-none h-full w-full selection:bg-white/50" spellCheck={false} />
    </div>
  );
}

function DiscordInvite() {
  return (
    <button className="text-nowrap h-16 bg-[#5865F2] border-4 border-[color-mix(in_srgb,_#5865F2_50%,_rgb(0_0_0)_15%)] text-mc-2 text-white outline-none px-4">Try on Discord</button>
  );
}
