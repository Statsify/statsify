/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import * as motion from "motion/react-client";
import { AnimatedNumber } from "~/components/animations/number";
import { Box } from "~/components/ui/box";
import { Logo } from "~/components/icons/logo";
import { ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "~/lib/util";
import { useInView, useReducedMotion } from "motion/react";
import { useTranslation } from "react-i18next";

/**
 * A box a mouse can tug, which springs back. Only a fine pointer drags it: dragging sets `touch-action: none`, so on a
 * touch screen a swipe that starts on a box wouldn't scroll the page. The server and touch screens get a plain box.
 */
function Draggable({ children, className }: { children: ReactNode; className?: string }) {
  const [canDrag, setCanDrag] = useState(false);

  useEffect(() => setCanDrag(matchMedia("(hover: hover) and (pointer: fine)").matches), []);

  return (
    <div className={cn("absolute", className)}>
      <motion.div drag={canDrag} dragSnapToOrigin dragConstraints={{ top: 1, bottom: 1, left: 1, right: 1 }}>
        {children}
      </motion.div>
    </div>
  );
}

function StatBox({ title, value, className = "" }: { title: string; value: number; className?: string }) {
  return (
    <Box className={`content:px-8 content:py-6 content:flex content:flex-col content:items-center content:gap-2 ${className}`}>
      <p className="text-mc-1.5 md:text-mc-2 mx-3">{title}</p>
      <p className="text-mc-3 md:text-mc-4 mx-5">
        <AnimatedNumber value={value} />
      </p>
    </Box>
  );
}

export function InteractiveLogo() {
  const MAX = 9999;
  const MIN = 1000;

  const [wins, setWins] = useState(3259);
  const [losses, setLosses] = useState(1637);
  const reduceMotion = useReducedMotion();
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);

  // With reduced motion the numbers hold still, and they wait while the logo is off-screen or the tab is hidden.
  useEffect(() => {
    if (reduceMotion !== false || !inView) return;

    const interval = setInterval(() => {
      if (document.hidden) return;
      setWins(Math.floor(Math.random() * (MAX - MIN)) + MIN);
      setLosses(Math.floor(Math.random() * (MAX - MIN)) + MIN);
    }, 2500);

    return () => clearInterval(interval);
  }, [reduceMotion, inView]);

  const wlr = wins / losses;

  return (
    // The end margin keeps the Losses box, which hangs off the logo's right edge, inside the page.
    <div ref={ref} className="relative scale-79 max-[359px]:scale-65 lg:scale-90 xl:scale-95 lg:me-28 2xl:me-16">
      <Draggable className="translate-x-[-30px] translate-y-[5px] lg:translate-y-[-20px] -z-5">
        <StatBox title={t("default:stats.wins")} value={wins} className="text-mc-green" />
      </Draggable>
      <Draggable className="translate-x-[190px] sm:translate-x-[230px] translate-y-[150px] lg:translate-x-[320px] lg:translate-y-[190px] 2xl:translate-x-[270px] 2xl:translate-y-[240px]">
        <StatBox title={t("default:stats.losses")} value={losses} className="text-mc-red" />
      </Draggable>
      <Draggable className="translate-y-[230px] translate-x-[-30px] sm:translate-x-[-60px] lg:translate-y-[320px]">
        <StatBox title="WLR" value={wlr} className="text-mc-gold" />
      </Draggable>
      <Logo className="size-80 lg:size-100" />
    </div>
  );
}
