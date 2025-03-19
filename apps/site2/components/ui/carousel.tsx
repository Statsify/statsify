/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

"use client";

import { AnimatePresence, motion } from "motion/react";
import { Box } from "./box";
import { Chevron } from "~/components/icons/chevron";
import { Children, ReactNode, useState } from "react";
import { cn } from "~/lib/util";

const variants = {
  enter: (direction: number) => ({
    x: direction * -550,
    rotateZ: direction * -15,
    opacity: 0,
  }),
  center: {
    x: 0,
    rotateZ: 0,
    opacity: 1,
    transition: {
      type: "spring",
      mass: 0.7,
      damping: 5.5,
      stiffness: 70,
      restDelta: 0.01,
      opacity: { type: "linear", duration: 0.5 },
    },
  },
  exit: (direction: number) => ({
    x: direction * 550,
    rotateZ: direction * 15,
    opacity: 0,
    transition: {
      type: "spring",
      mass: 0.7,
      damping: 5.5,
      stiffness: 70,
      restDelta: 0.01,
      delay: 0.1,
      opacity: {
        type: "linear",
        duration: 0.5,
        delay: 0.2,
      },
    },
  }),
};

export function Carousel({ children, className }: { children: ReactNode;className?: string }) {
  const [[page, direction], setPage] = useState([0, 1]);
  const cards = Children.toArray(children) as ReactNode[];

  const cardIndex = (((page % cards.length) + cards.length) % cards.length);

  function paginate(newDirection: number) {
    setPage([page + newDirection, newDirection]);
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center text-white gap-4 lg:gap-8">
        <button aria-label="Previous Card" type="button" className="hidden lg:block z-10 h-fit active:scale-[0.8] transition-transform" onClick={() => paginate(-1)}>
          <Box contentClass="backdrop-blur-2xl">
            <Chevron className="rotate-180" />
          </Box>
        </button>
        <div className={cn("relative flex overflow-visible", "cursor-pointer")}>
          <div className="grid grid-areas-stack">{cards.map((card, index) => <div key={index} className="grid-area-stack invisible">{card}</div>)}</div>
          <div className="absolute w-full h-full">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={page}
                initial="enter"
                animate="center"
                exit="exit"
                variants={variants}
                custom={direction}
                className={cn("w-fit absolute top-1/2 -translate-y-1/2 left-0 right-0 mx-auto select-none", className)}
              >
                {cards[cardIndex] as ReactNode}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        <button aria-label="Next Card" type="button" className="hidden lg:block z-10 h-fit active:scale-[0.8] transition-transform" onClick={() => paginate(1)}>
          <Box contentClass="backdrop-blur-2xl">
            <Chevron />
          </Box>
        </button>
      </div>
      <div className="flex items-center justify-center gap-6">
        {cards.map((_, index) => (
          <button
            aria-selected={cardIndex === index}
            key={index}
            onClick={() => setPage([index, index > cardIndex ? 1 : -1])}
            className="bg-black/40 w-4 h-4 aria-selected:bg-black/70 aria-selected:scale-[1.5] transition-all"
          />
        ))}
      </div>
    </div>
  );
}

