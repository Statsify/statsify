/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import styles from "./button.module.css";
import { Slot, SlotProps, Slottable } from "@radix-ui/react-slot";
import { cn, splitSlotClasses } from "~/lib/util";

export function Button({
  children,
  className,
  asChild = false,
  ...props
}: SlotProps & { asChild?: boolean }) {
  const Component = asChild ? Slot : "button";
  const { container, defaultClass: content } = splitSlotClasses(["container"], className ?? "");

  return (
    <div
      className={cn("text-mc-white", container)}
      style={{ filter: `drop-shadow(8px 8px rgb(0 0 0 / 0.5))` }}
    >
      <Component
        {...props}
        className={cn("w-full relative flex justify-center items-center gap-1 text-mc-2 select-none", styles.button, content)}
      >
        <div className={`absolute top-0 left-0 w-full ${styles.topShadow}`} />
        <div className={`absolute inset-0 ${styles.buttonOverlay}`} />
        <Slottable>{children}</Slottable>
        <div className={`absolute bottom-0 left-0 w-full ${styles.bottomShadow}`} />
      </Component>
    </div>
  );
}
