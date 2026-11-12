/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BOX_GAP, Box, CELL, HEADING_BOX } from "~/components/ui/box";
import { Background } from "~/components/ui/background";
import { cn } from "~/lib/util";
import type { ReactNode } from "react";

/** An error page's heading and its explanation, each in its own box, 4 px apart, as the bot's cards draw a title box. */
export function ErrorText({ heading, children }: { heading: ReactNode; children: ReactNode }) {
  return (
    <div className={cn("flex w-full max-w-160 flex-col", BOX_GAP)}>
      <Box className={HEADING_BOX}>{heading}</Box>
      <Box className={cn(CELL, "content:py-3")}>{children}</Box>
    </div>
  );
}

export function Error({ children, className }: { className?: string; children: ReactNode }) {
  return (
    <div className="relative grow">
      <Background
        background="general"
        priority
        className="h-full"
        mask="linear-gradient(rgb(255 255 255) 20%, rgb(0 0 0 / 0) 95%)"
      />
      <div className="absolute w-full h-full bg-red-700 mix-blend-color  -z-10" />
      <div className="absolute w-full h-full bg-black/80 -z-10" />
      <div
        className="absolute w-full h-full -z-10"
        style={{ background: "linear-gradient(transparent 20%, var(--color-blackify-950) 95%)" }}
      />
      <div className={cn("w-container h-full min-h-150 flex flex-col items-center justify-center gap-6 px-4 py-8 text-center z-10", className)}>
        {children}
      </div>
    </div>
  );
}
