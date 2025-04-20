/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

"use client";

import { Children, ComponentPropsWithRef, type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { cn } from "~/lib/util";
import { motion, useMotionValue, useMotionValueEvent, useSpring } from "motion/react";

export function Ticker({ direction, children, className }: { direction: "positive" | "negative"; children: ReactNode; className: string }) {
  const items = Children.toArray(children);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  const [duplicates, setDuplicates] = useState(1);

  const dragFactor = 1.2;
  const defaultSpeed = direction === "positive" ? -0.8 : 0.8;
  const speed = useSpring(defaultSpeed);

  const y = useMotionValue(direction === "positive" ? 0 : -height);

  useEffect(() => {
    if (!ref.current) return;

    const heights = itemRefs.current.map((ref) => ref?.scrollHeight ?? 0);

    const resizeObserver = new ResizeObserver((entries) => {
      if (!ref.current) return;

      for (const entry of entries) {
        const index = itemRefs.current.indexOf(entry.target as HTMLDivElement);
        if (index === -1) continue;
        heights[index] = entry.contentRect.height;
      }

      const totalItemsHeight = heights.reduce((acc, height) => acc + height, 0);

      let gap = 0;

      if (items.length > 1) {
        const first = itemRefs.current[0];
        const second = itemRefs.current[1];
        if (first && second)
          gap = second.getBoundingClientRect().top - first.getBoundingClientRect().bottom;
      }

      const totalHeight = totalItemsHeight + (gap * items.length);
      console.log(`Total Height: ${totalHeight}`);
      const tickerHeight = ref.current.clientHeight;

      const duplicates = Math.max(Math.floor((2 * tickerHeight) / totalHeight), 1);

      setDuplicates(duplicates);
      setHeight(totalHeight);
    });

    const elements = itemRefs.current.filter((item) => item !== null);
    elements.forEach((element) => resizeObserver.observe(element));

    return () => elements.forEach((element) => resizeObserver.unobserve(element));
  }, [items.length]);

  useRequestAnimationFrame(() => {
    const yValue = y.get();
    y.set(yValue + speed.get());
  });

  useMotionValueEvent(y, "change", (value) => {
    if (value < -height) y.jump(0);
    if (value > 0) y.jump(-height);
  });

  return (
    <div
      style={{
        maskImage: "linear-gradient(rgb(0 0 0 / 0) 0%, rgb(255 255 255) 1%, rgb(255 255 255) 99%, rgb(0 0 0 / 0) 100%)",
        maskComposite: "exclude",
      }}
    >
      <motion.div
        style={{ y }}
        drag="y"
        dragConstraints={{ top: -Infinity, bottom: Infinity }}
        onDragStart={() => speed.set(0)}
        onDrag={(_, info) => speed.set(dragFactor * info.delta.y)}
        onDragEnd={() => speed.set(defaultSpeed)}
        dragElastic={0.000_001}
        className={cn("justify-between", className)}
        ref={ref}
      >
        {items.map((item, index) => (
          <TickerItem key={index} ref={(ref) => { itemRefs.current[index] = ref; }}>
            {item}
          </TickerItem>
        ))}
        {Array.from({ length: duplicates })
          .map((_, duplicateIndex) => items.map((item, index) => (
            <TickerItem key={index + (duplicateIndex * items.length)}>
              {item}
            </TickerItem>
          )))}
      </motion.div>
    </div>
  );
}

function TickerItem(props: ComponentPropsWithRef<"div">) {
  return (
    <div
      {...props}
      className="flex flex-col w-full items-stretch"
    />
  );
}

function useRequestAnimationFrame(callback: (time: number) => void) {
  const requestRef = useRef<number>(undefined);
  const previousTimeRef = useRef<number>(undefined);

  const animate = useCallback((time: number) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current;
      callback(deltaTime);
    }

    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }, [callback]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [animate]);
}
