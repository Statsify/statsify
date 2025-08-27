/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Background } from "~/components/ui/background";
import { cn } from "~/lib/util";
import type { ComponentProps, ReactNode } from "react";

export function BaseSection({ children, background, className }: Pick<ComponentProps<typeof Background>, "background"> & { children: ReactNode; className?: string }) {
  return (
    <section className="w-full relative grid grid-rows-[50px_8fr_50px]">
      <Background className="w-full h-full" background={background} />
      <div
        className="absolute w-full h-full -z-10"
        style={{
          background: "linear-gradient(0deg, var(--color-blackify-950) 50px, transparent 50%, var(--color-blackify-950) calc(100% - 50px))",
        }}
      />
      <div className="min-h-1" />
      <div className="flex justify-center w-container">
        <div className={cn("w-full flex gap-8 py-24", className)}>
          {children}
        </div>
      </div>
      <div className="min-h-1" />
    </section>
  );
}
