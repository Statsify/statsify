/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { animate, motion, useMotionValue } from "motion/react";
import { cn } from "~/lib/util";
import { useEffect, useRef } from "react";

// The nine public backgrounds in `public/backgrounds/`; the private blurred set never ships. They are
// pre-blurred WebP (about 18 KB each), so no backdrop filter runs on top of them.
const BACKGROUNDS = ["general", "guilds", "bingo", "bedwars", "skywars", "duels", "arcade", "uhc", "woolgames"] as const;

export type BackgroundName = (typeof BACKGROUNDS)[number];

const src = (background: BackgroundName) => `/backgrounds/${background}.webp`;

export function Background({
  background,
  className,
  mask,
  priority = false,
}: {
  background: BackgroundName;
  className?: string;
  mask?: string;
  /** The page's first background: fetched early. Every other one waits until it nears the viewport. */
  priority?: boolean;
}) {
  const oldBackground = useRef<BackgroundName | undefined>(undefined);
  const opacity = useMotionValue(0);

  useEffect(() => {
    opacity.jump(1);
    oldBackground.current = background;
    const controls = animate(opacity, 0, { duration: 0.4 });
    return () => controls.stop();
  }, [background, opacity]);

  return (
    <div className={cn("absolute w-full pointer-events-none -z-50", className)}>
      <img
        src={src(background)}
        alt=""
        fetchPriority={priority ? "high" : undefined}
        loading={priority ? undefined : "lazy"}
        decoding="async"
        className="absolute inset-0 size-full object-cover object-top"
        style={{ mask }}
      />
      {/* Crossfade between oldBackground and currentBackground */}
      {oldBackground.current && oldBackground.current !== background && (
        <motion.div style={{ opacity }}>
          <img
            src={src(oldBackground.current)}
            alt=""
            className="absolute inset-0 size-full object-cover object-top"
            style={{ mask }}
          />
        </motion.div>
      )}
    </div>
  );
}
