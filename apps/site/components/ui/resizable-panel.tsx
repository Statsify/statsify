/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

"use client";

import { type ComponentProps, ReactNode, useRef } from "react";
import { cn } from "~/lib/util";
import { motion } from "motion/react";
import { useMeasure } from "~/hooks/use-measure";

export function ResizablePanel({
  children,
  containerClass,
  ...rest
}: {
  children: ReactNode;
  containerClass: string;
} & ComponentProps<"div">) {
  const ref = useRef(null);
  const size = useMeasure(ref);

  return (
    <motion.div
      animate={{ height: size.height }}
      transition={{ type: "spring", bounce: 0, duration: 0.8 }}
      className={cn("overflow-hidden relative", containerClass)}
    >
      <div ref={ref}>
        <div {...rest}>{children}</div>
      </div>
    </motion.div>
  );
}
