/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

"use client";

import { Children, ReactNode, useRef, useState } from "react";
import { easeInOut, motion, useAnimate } from "motion/react";

const Y_DISTANCE = 40;
const SCALE_FACTOR = 0.05;

export function CardStack({ children }: { children: ReactNode }) {
  const [scope, animate] = useAnimate();
  const hiddenRef = useRef<HTMLDivElement>(null);
  const childrenRef = useRef<HTMLDivElement[]>([]);
  const [start, setStart] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const childrenArray = Children.toArray(children);

  async function onClick() {
    if (isAnimating || !childrenRef.current || !hiddenRef.current) return;

    setIsAnimating(true);

    await animate(hiddenRef.current, { opacity: 1 }, { duration: 0 });

    const newStart = (start + 1) % childrenArray.length;

    const controls = [];

    controls.push(animate(
      childrenRef.current[start],
      { scale: 1 + SCALE_FACTOR, y: -Y_DISTANCE, zIndex: childrenArray.length + 1 },
      { ease: easeInOut }
    ));

    for (let i = 0; i < childrenArray.length - 1; i++) {
      const index = (i + newStart) % childrenArray.length;

      controls.push(animate(
        childrenRef.current[index],
        { scale: 1 - (i * SCALE_FACTOR), y: i * Y_DISTANCE, zIndex: childrenArray.length - i },
        { ease: easeInOut }
      ));
    }

    await Promise.all(controls);

    await animate(
      childrenRef.current[start],
      { opacity: 0 }
    );

    await animate([
      [
        childrenRef.current[start],
        { scale: 1 - (SCALE_FACTOR * (childrenArray.length - 1)), y: (childrenArray.length - 1) * Y_DISTANCE, zIndex: 1 },
        { duration: 0 },
      ],
      [childrenRef.current[start], { opacity: 1 }, { duration: 0 }],
      [hiddenRef.current, { opacity: 0 }, { duration: 0 }],
    ]);

    setStart(newStart);
    setIsAnimating(false);
  }

  return (
    <motion.div className="relative grid place-items-center bg-green-200 w-full h-fit" ref={scope} onClick={onClick}>
      <motion.div
        ref={hiddenRef}
        initial={{
          zIndex: 0,
          opacity: 0,
          y: (childrenArray.length - 1) * Y_DISTANCE,
          scale: 1 - (childrenArray.length - 1) * SCALE_FACTOR,
        }}
        className="absolute flex items-stretch *:grow w-[1000px] h-[500px]"
      >
        {childrenArray[start]}
      </motion.div>
      {childrenArray.map((child, i) => (
        <motion.div
          key={`#${i}`}
          ref={(ref) => { childrenRef.current[i] = ref!; }}
          initial={{ scale: 1 - (i * SCALE_FACTOR), y: i * Y_DISTANCE, zIndex: childrenArray.length - i }}
          className="absolute flex items-stretch *:grow w-[1000px] h-[500px]"
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
