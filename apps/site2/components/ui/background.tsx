/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

"use client";

import Arcade from "~/public/backgrounds/arcade.png";
import BedWars from "~/public/backgrounds/bedwars.png";
import Bingo from "~/public/backgrounds/bingo.png";
import Duels from "~/public/backgrounds/duels.png";
import General from "~/public/backgrounds/general.png";
import Guilds from "~/public/backgrounds/guilds.png";
import Leaderboards from "~/public/backgrounds/leaderboards.png";
import SkyWars from "~/public/backgrounds/skywars.png";
import WoolGames from "~/public/backgrounds/woolgames.png";

import Image from "next/image";
import { animate, motion, useMotionValue } from "motion/react";
import { cn } from "~/lib/util";
import { useEffect, useRef } from "react";

const Backgrounds = {
  general: General,
  guilds: Guilds,
  bingo: Bingo,
  bedwars: BedWars,
  skywars: SkyWars,
  duels: Duels,
  arcade: Arcade,
  leaderboards: Leaderboards,
  woolgames: WoolGames,
};

export function Background({
  background,
  className,
  mask,
}: {
  background: keyof typeof Backgrounds;
  className?: string;
  mask?: string;
}) {
  const oldBackground = useRef<keyof typeof Backgrounds | undefined>(undefined);
  const opacity = useMotionValue(0);

  useEffect(() => {
    opacity.jump(1);
    oldBackground.current = background;
    const controls = animate(opacity, 0, { duration: 0.4 });
    return () => controls.stop();
  }, [background]);

  return (
    <div className={cn("absolute w-full pointer-events-none -z-50", className)}>
      <Image
        src={Backgrounds[background]}
        alt=""
        fill={true}
        className="object-cover object-top brightness-85"
        style={{ mask }}
      />
      {/* Crossfade between oldBackground and currentBackground */}
      {oldBackground.current && oldBackground.current != background && (
        <motion.div style={{ opacity }}>
          <Image
            src={Backgrounds[oldBackground.current]}
            alt=""
            fill={true}
            className="object-cover object-top brightness-85"
            style={{ mask }}
          />
        </motion.div>
      )}
      <div className="relative w-full h-full" />
    </div>
  );
}
