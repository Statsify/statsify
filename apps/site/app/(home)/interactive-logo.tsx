/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

"use client";

import * as motion from "motion/react-client";
import { AnimatedNumber } from "~/components/animations/number";
import { Logo } from "~/components/icons/logo";
import { ReactNode, useEffect, useState } from "react";
import { SpotlightBox } from "~/components/ui/spotlight-box";
import { cn } from "~/lib/util";

function Draggable({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("absolute", className)}>
      <motion.div drag dragSnapToOrigin dragConstraints={{ top: 1, bottom: 1, left: 1, right: 1 }}>
        {children}
      </motion.div>
    </div>
  );
}

function SpotlightTableData({ title, value, className = "" }: { title: string; value: number; className?: string }) {
  return (
    <SpotlightBox
      className={`content:p-4 content:flex content:flex-col content:items-center content:gap-2 ${className}`}
    >
      <p className="text-mc-1.75 md:text-mc-2 mx-3">{title}</p>
      <p className="text-mc-3 md:text-mc-4 mx-5">
        <AnimatedNumber value={value} />
      </p>
    </SpotlightBox>
  );
}

export function InteractiveLogo() {
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
    <div className="relative scale-79 lg:scale-90 xl:scale-100 transition-transform">
      <Draggable className="translate-x-[-30px] translate-y-[5px] lg:translate-y-[-20px] -z-5">
        <SpotlightTableData title="Wins" value={wins} className="text-mc-green" />
      </Draggable>
      <Draggable className="translate-x-[230px] translate-y-[150px] lg:translate-x-[320px] lg:translate-y-[190px]">
        <SpotlightTableData title="Losses" value={losses} className="text-mc-red" />
      </Draggable>
      <Draggable className="translate-y-[230px] translate-x-[-60px] lg:translate-y-[320px]">
        <SpotlightTableData title="WLR" value={wlr} className="text-mc-gold" />
      </Draggable>
      <Logo className="size-80 lg:size-100" />
    </div>
  );
}
