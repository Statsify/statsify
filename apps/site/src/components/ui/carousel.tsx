/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { AnimatePresence, type Variants, motion, useInView, useReducedMotion } from "motion/react";
import { Box } from "./box";
import { Chevron } from "~/components/icons/chevron";
import { Children, ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "~/lib/util";
import { useTranslation } from "react-i18next";

const variants: Variants = {
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
      opacity: { type: "tween", ease: "linear", duration: 0.5 },
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
        type: "tween",
        ease: "linear",
        duration: 0.5,
        delay: 0.2,
      },
    },
  }),
};

export function Carousel({ children, className }: { children: ReactNode; className?: string }) {
  const [[page, direction], setPage] = useState([0, 1]);
  const cards = Children.toArray(children) as ReactNode[];

  const cardIndex = (((page % cards.length) + cards.length) % cards.length);

  function paginate(newDirection: number) {
    setPage(([page]) => [page + newDirection, newDirection]);
  }

  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  // With reduced motion there's no autoplay: the first card waits for the arrows. Otherwise it holds while
  // the carousel is off-screen, in a hidden tab, or under the pointer or focus, so a card can be read.
  useEffect(() => {
    if (reduceMotion !== false || !inView || hovered || focused) return;
    const interval = setInterval(() => {
      if (!document.hidden) paginate(1);
    }, 7500);
    return () => clearInterval(interval);
  }, [reduceMotion, inView, hovered, focused]);

  return (
    <div
      ref={ref}
      className="flex flex-col gap-10"
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => setFocused(event.currentTarget.contains(event.relatedTarget))}
    >
      <div className="flex items-center text-white gap-4 lg:gap-8">
        {/* The button wraps the panel: a button inside it would lose the bevelled corners to the panel's clip, and
            one that shrinks on press would lose a click that ends past its new edge. */}
        <button aria-label={t("carousel.previous")} type="button" className="group z-10 hidden lg:block" onClick={() => paginate(-1)}>
          <Box className="group-active:scale-[0.8] transition-transform content:backdrop-blur-2xl">
            <Chevron className="rotate-180" />
          </Box>
        </button>
        <div className="relative flex overflow-visible cursor-grab active:cursor-grabbing">
          <div className="grid grid-areas-stack">{cards.map((card, index) => <div key={index} className="grid-area-stack invisible">{card}</div>)}</div>
          <div className="absolute w-full h-full">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={`${page}-${direction}`}
                initial="enter"
                animate="center"
                exit="exit"
                variants={variants}
                custom={direction}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={(_, dragInfo) => {
                  const offset = dragInfo.offset.x;
                  const swipeThreshold = 50;

                  if (offset > swipeThreshold) {
                    paginate(1);
                  } else if (offset < -swipeThreshold) {
                    paginate(-1);
                  }
                }}
                className={cn("w-fit absolute top-1/2 -translate-y-1/2 left-0 right-0 mx-auto select-none", className)}
              >
                {cards[cardIndex] as ReactNode}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        <button aria-label={t("carousel.next")} type="button" className="group z-10 hidden lg:block" onClick={() => paginate(1)}>
          <Box className="group-active:scale-[0.8] transition-transform content:backdrop-blur-2xl">
            <Chevron />
          </Box>
        </button>
      </div>
      {/* 44 px targets around 16 px squares. Plain buttons, not tabs: there are no panels to own. */}
      <div className="flex items-center justify-center gap-1">
        {cards.map((_, index) => (
          <button
            type="button"
            aria-label={t("carousel.goTo", { n: index + 1 })}
            aria-current={cardIndex === index}
            key={index}
            onClick={() => setPage([index, index > cardIndex ? 1 : -1])}
            className="group flex size-11 items-center justify-center"
          >
            <span className="size-4 bg-black/40 transition-colors group-aria-[current=true]:size-6 group-aria-[current=true]:bg-black/70" />
          </button>
        ))}
      </div>
    </div>
  );
}

