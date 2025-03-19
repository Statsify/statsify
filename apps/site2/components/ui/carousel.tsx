/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

"use client";

import { AnimatePresence, motion } from "motion/react";
import { Children, ReactNode, useState } from "react";

export function Carousel({ children }: { children: ReactNode }) {
  const [card, setCard] = useState(0);
  const [animating, setAnimating] = useState(false);
  const cards = Children.toArray(children) as ReactNode[];

  return (
    <div
      className="relative flex overflow-visible"
      onClick={() => {
        if (animating) return;
        setCard((card) => (card + 1) % cards.length);
        setAnimating(true);
      }}
    >
      <div className="grid grid-areas-stack">{cards.map((card, index) => <div key={index} className="grid-area-stack invisible">{card}</div>)}</div>
      <div className="absolute w-full h-full">
        <AnimatePresence onExitComplete={() => setAnimating(false)} initial={false}>
          <motion.div
            key={card}
            initial={{ x: -500, rotateZ: -45, opacity: 0 }}
            animate={{ x: 0, rotateZ: 0, opacity: 1, transition: { duration: 0.35 } }}
            exit={{ x: 500, rotateZ: 45, opacity: 0, transition: { delay: 0.2, duration: 0.35 } }}
            className="w-fit absolute top-1/2 -translate-y-1/2 left-0 right-0 mx-auto select-none"
          >
            {cards[card] as ReactNode}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

