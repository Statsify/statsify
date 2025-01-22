/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

"use client";

import * as motion from "motion/react-client";
import { AnimatedNumber } from "~/components/ui/animated-number";
import { Background } from "~/components/ui/background";
import { Logo } from "~/components/icons/logo";
import { ReactNode, useEffect, useState } from "react";
import { SearchIcon } from "~/components/icons/search";
import { SpotlightBox } from "~/components/ui/spotlight-box";
import { cn } from "~/lib/util";

export default function Home() {
  return (
    <div>
      <Background />
      <div className="w-4/5 max-w-[1800px] mx-auto flex flex-col-reverse lg:flex-row text-center gap-10 lg:text-start lg:justify-between items-center text-mc-white h-[76dvh]">
        <div className="flex flex-col gap-6 md:max-w-[500px] xl:max-w-[600px]">
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
      <div className="bg-red-200 w-100 h-1000"></div>
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

function Draggable({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("absolute", className)}>
      <motion.div
        drag
        dragSnapToOrigin
        dragConstraints={{ left: 100, right: 100 }}
      >
        {children}
      </motion.div>
    </div>
  );
}

function SpotlightTableData({ title, value, className }: { title: string; value: number; className?: string }) {
  return (
    <SpotlightBox contentClass={cn("p-4 flex flex-col items-center gap-2", className)}>
      <p className="text-mc-2 mx-3">{title}</p>
      <p className="text-mc-4 mx-5"><AnimatedNumber value={value} /></p>
    </SpotlightBox>
  );
}

function InteractiveLogo() {
  const MAX = 9999;
  const MIN = 1000;

  const [wins, setWins] = useState(3259);
  const [losses, setLosses] = useState(1637);

  useEffect(() => {
    const interval = setInterval(() => {
      setWins(Math.floor(Math.random() * (MAX - MIN)) + MIN);
      setLosses(Math.floor(Math.random() * (MAX - MIN)) + MIN);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const wlr = wins / losses;

  return (
    <div className="relative lg:ml-22 lg:mr-39 scale-80 lg:scale-90 xl:scale-100 transition-transform">
      <Draggable className="translate-[-50px]">
        <SpotlightTableData title="Wins" value={wins} className="text-mc-green" />
      </Draggable>
      <Draggable className="translate-x-[290px] translate-y-[150px]">
        <SpotlightTableData title="Losses" value={losses} className="text-mc-red" />
      </Draggable>
      <Draggable className="translate-x-[-90px] translate-y-[260px]">
        <SpotlightTableData title="WLR" value={wlr} className="text-mc-gold" />
      </Draggable>
      <Logo className="size-80 pointer-events-none" />
    </div>
  );
}
