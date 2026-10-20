/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Background } from "~/components/ui/background";
import { cn } from "~/lib/util";
import type { ComponentProps, ReactNode } from "react";

export function BaseSection({ children, background, className }: Pick<ComponentProps<typeof Background>, "background"> & { children: ReactNode; className?: string }) {
  // `minmax(0, 1fr)`: the column never grows past the viewport for no-wrap content. Sections are 64 px apart
  // on phones and 128 px on desktop.
  return (
    <section className="w-full relative grid grid-cols-[minmax(0,1fr)]">
      <Background className="w-full h-full" background={background} />
      <div
        className="absolute w-full h-full -z-10"
        style={{
          background: "linear-gradient(0deg, var(--color-blackify-950) 50px, transparent 50%, var(--color-blackify-950) calc(100% - 50px))",
        }}
      />
      <div className="flex justify-center w-container px-4 md:px-8">
        <div className={cn("w-full flex gap-8 py-8 lg:py-16", className)}>
          {children}
        </div>
      </div>
    </section>
  );
}
