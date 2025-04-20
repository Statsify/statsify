/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

"use client";

import { Box } from "./box";
import { motion, useMotionTemplate, useMotionValue } from "motion/react";
import type { ComponentProps } from "react";

export function SpotlightBox({ className = "", onMouseMove, children, ...props }: ComponentProps<typeof Box<"div">>) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  return (
    <Box
      {...props}
      className={`group content:relative content:px-8 content:py-16 ${className}`}
      onMouseMove={(event) => {
        onMouseMove?.(event);
        const { top, left } = event.currentTarget.getBoundingClientRect();
        x.set(event.clientX - left);
        y.set(event.clientY - top);
      }}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`radial-gradient(200px circle at ${x}px ${y}px, color-mix(in srgb, currentColor 20%, transparent), transparent 80%)`,
        }}
      />
      {children}
    </Box>
  );
}
