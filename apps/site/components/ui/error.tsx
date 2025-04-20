/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Background } from "~/components/ui/background";
import { cn } from "~/lib/util";
import type { ReactNode } from "react";

export function Error({ children, className }: { className?: string;children: ReactNode }) {
  return (
    <div className="relative grow">
      <Background
        background="general"
        className="h-full"
        mask="linear-gradient(rgb(255 255 255) 20%, rgb(0 0 0 / 0) 95%)"
      />
      <div className="absolute w-full h-full bg-red-700 mix-blend-color  -z-10" />
      <div className="absolute w-full h-full bg-black/80 -z-10" />
      <div
        className="absolute w-full h-full -z-10"
        style={{ background: "linear-gradient(rgb(17 17 17 /0) 20%, rgb(17 17 17 /1) 95%)" }}
      />
      <div className={cn("w-container h-full min-h-150 flex flex-col items-center justify-center z-10", className)}>
        {children}
      </div>
    </div>
  );
}
