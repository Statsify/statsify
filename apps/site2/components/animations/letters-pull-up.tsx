/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

"use client";

import { cn } from "~/lib/util";
import { motion, useInView } from "motion/react";
import { useRef } from "react";

export function LettersPullUp({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}) {
  const splitText = [...children];

  const pullupVariant = {
    initial: { y: 10, opacity: 0 },
    animate: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: i * 0.05,
      },
    }),
  };

  const ref = useRef(null);
  const isInView = useInView(ref, { once: false });

  return (
    <div className="flex justify-center">
      {splitText.map((current, i) => (
        <motion.div
          key={i}
          ref={ref}
          variants={pullupVariant}
          initial="initial"
          animate={isInView ? "animate" : ""}
          custom={i}
          className={cn("whitespace-pre", className)}
        >
          {current}
        </motion.div>
      ))}
    </div>
  );
}
