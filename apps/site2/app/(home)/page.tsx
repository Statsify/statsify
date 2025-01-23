/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Background } from "~/components/ui/background";
import { BedWarsPreview } from "./previews/bedwars";
import { Box } from "~/components/ui/box";
import { InteractiveLogo } from "./interactive-logo";
import { PlayerProvider } from "../players/[slug]/context";
import { SearchIcon } from "~/components/icons/search";
import { cn } from "~/lib/util";

export default async function Home() {
  const response = await fetch(`https://api.statsify.net/player?key=${process.env.API_KEY}&player=j4cobi`);
  const { player } = await response.json();

  return (
    <div>
      <Background
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
      <div className="flex flex-col items-center">
        <section className="w-4/5 max-w-[1800px] relative flex flex-col lg:flex-row lg:justify-around lg:items-center gap-4">
          <Background className="w-screen h-full" />
          <div
            className="absolute w-screen h-full -z-10"
            style={{
              background: "linear-gradient(0deg, rgba(17,17,17,1) 10%, rgba(17,17,17,0) 50%, rgba(17,17,17,1) 90%)",
            }}
          />
          <div className="flex flex-col gap-4 max-w-150 text-mc-white text-center lg:text-start ">
            <h1 className="text-mc-7 font-bold">Players</h1>
            <p className="text-mc-2">Beautiful visuals are provided by Statsify for every game on Hypixel. Simply input /bedwars into Discord to see your BedWars stats or those of your friends. To see further games, type / followed by the name of the game. To quickly search for yourself, you may link your Minecraft account to your Discord with /verify</p>
          </div>
          <div
            className="relative flex flex-col justify-center items-center gap-8 p-8 before:bg-gradient-to-b before:from-white/20 before:to-white/50 before:mix-blend-overlay before:w-full before:h-[80%] before:content-[''] before:absolute before:-z-20 after:mix-blend-overlay after:w-full after:h-[80%] after:content-[''] after:absolute after:shadow-[0_0_10px_white,0_0_30px_10px_white] after:shadow-white after:-z-20 py-36"
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Box borderRadius={{ bottom: 0 }} contentClass="font-bold">BedWars</Box>
              <Box borderRadius={{ bottom: 0 }}>SkyWars</Box>
              <Box borderRadius={{ bottom: 0 }}>Duels</Box>
              <Box borderRadius={{ bottom: 0 }}>Arcade</Box>
            </div>
            <PlayerProvider player={player}>
              <BedWarsPreview />
            </PlayerProvider>
          </div>
        </section>
        <div className="h-1000 w-10" />
      </div>
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
