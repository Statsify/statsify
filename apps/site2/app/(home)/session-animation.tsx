/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

"use client";

import { Chevron } from "~/components/icons/chevron";
import { WoolWarsPreview } from "./previews/woolwars";
import { motion, useAnimate, useInView } from "motion/react";
import { useEffect, useRef } from "react";

export function SessionAnimation() {
  const [scope, animate] = useAnimate();
  const typingRefs = useRef<HTMLDivElement[]>([]);
  const inView = useInView(scope);

  const text = "/session bedwars";
  const splitText = [...text];

  useEffect(() => {
    async function enter() {
      for (let i = 0; i < splitText.length; i++)
        await animate(typingRefs.current[i], { y: 0, opacity: 1 }, { duration: 0.05 });

      await animate("#search", { opacity: 0 }, { duration: 0.2, delay: 0.4 });
      await animate("#profile", { opacity: 1, y: 0, filter: "blur(0px)" }, { duration: 0.2 });
    }

    enter();
  }, []);

  return (
    <div ref={scope} className="relative">
      <div id="search" style={{ opacity: 1 }} className="absolute w-full h-16 flex items-center px-4 gap-4 bg-white/30 border-4 border-white/40 backdrop-blur-sm">
        <div className="w-full text-mc-2 placeholder-mc-darkgray text-white outline-none h-full selection:bg-white/50 flex items-center justify-between">
          <div className="flex justify-center">
            {splitText.map((current, i) => (
              <motion.div
                key={i}
                ref={(el) => typingRefs.current[i] = el!}
                style={{ y: 10, opacity: 0 }}
                className="whitespace-pre"
              >
                {current}
              </motion.div>
            ))}
          </div>
          <Chevron />
        </div>
      </div>
      <motion.div id="profile" style={{ opacity: 0, y: 20, filter: "blur(5px)" }}>
        <WoolWarsPreview />
      </motion.div>
    </div>
  );
}
