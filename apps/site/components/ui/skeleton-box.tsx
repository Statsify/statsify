/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { cn } from "~/lib/util";
import type { JSX } from "react";
import { type BoxProps, Box } from "./box";

const skeletonBoxVariants = {};

const GRADIENT =
  "linear-gradient(110deg, transparent 15%, color-mix(in oklab, var(--color-blackify-700) 50%, transparent) 30%, color-mix(in oklab, var(--color-blackify-950) 50%, transparent) 60%, color-mix(in oklab, var(--color-blackify-950) 50%, transparent) 75%, color-mix(in oklab, var(--color-blackify-700) 50%, transparent) 90%, transparent 95%)";

export function SkeletonBox<T extends keyof JSX.IntrinsicElements = "div">({
  className,
  children,
  ...props
}: BoxProps<T>) {
  return (
    <Box className={`content:overflow-clip content:relative content:!bg-blackify-800/50`} {...props}>
      <div
        style={{ background: GRADIENT, animationDelay: "-1600ms" }}
        className="absolute inset-y-0 w-[300%] animate-gradient-loading-slide"
      />
      <div
        style={{ background: GRADIENT, animationDelay: "400ms" }}
        className="absolute inset-y-0 w-[300%] animate-gradient-loading-slide "
      />
      <div
        style={{ background: GRADIENT, animationDelay: "2400ms" }}
        className="absolute inset-y-0 w-[300%] animate-gradient-loading-slide "
      />
      <div data-slot="content" className={cn("invisible", className)}>
        {children}
      </div>
    </Box>
  );
}
