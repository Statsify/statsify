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
      <motion.div
        drag
        dragSnapToOrigin
        dragConstraints={{ top: 1, bottom: 1, left: 1, right: 1 }}
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
    <div className="relative lg:ml-22 lg:mr-39 scale-79 lg:scale-90 xl:scale-100 transition-transform">
      <Draggable className="translate-x-[-50px] translate-y-[5px] lg:translate-y-[-50px] -z-5">
        <SpotlightTableData title="Wins" value={wins} className="text-mc-green" />
      </Draggable>
      <Draggable className="translate-x-[280px] translate-y-[150px]">
        <SpotlightTableData title="Losses" value={losses} className="text-mc-red" />
      </Draggable>
      <Draggable className="translate-x-[-90px] translate-y-[260px] ">
        <SpotlightTableData title="WLR" value={wlr} className="text-mc-gold" />
      </Draggable>
      <Logo className="size-80" />
    </div>
  );
}
