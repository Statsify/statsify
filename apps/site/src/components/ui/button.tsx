/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import styles from "./button.module.css";
import { Slot, SlotProps, Slottable } from "@radix-ui/react-slot";
import { cn } from "~/lib/util";

// The fills: green for a screen's one primary action, §8 for everything else.
// Callers can still pass their own fill (`content:bg-…`), like the home page's Discord button.
const VARIANTS = {
  primary: "content:bg-green-500",
  secondary: "content:bg-mc-dark-gray",
} as const;

const SIZES = {
  regular: { root: styles.root, text: "text-mc-2" },
  small: { root: cn(styles.root, styles.small), text: "text-mc-1.5" },
} as const;

export function Button({
  children,
  className,
  asChild = false,
  variant = "secondary",
  size = "regular",
  ...props
}: SlotProps & { asChild?: boolean; variant?: keyof typeof VARIANTS; size?: keyof typeof SIZES }) {
  const Component = asChild ? Slot : "button";
  const { root, text } = SIZES[size];

  return (
    // The wrapper holds the hard shadow and the focus ring, both outside the button's bevel clip. The shadow is its
    // own element rather than a drop-shadow filter, which also copied the label 8 px down as a ghost.
    <div
      className={cn(
        "relative text-mc-white has-focus-visible:focus-ring",
        root,
        VARIANTS[variant],
        className
      )}
    >
      <div aria-hidden className={`absolute inset-0 ${styles.shadow}`} />
      <Component
        {...props}
        data-slot="content"
        className={cn(
          "w-full min-h-11 relative flex justify-center items-center gap-1 whitespace-nowrap select-none focus-ring-none",
          text,
          styles.button
        )}
      >
        <div className={`absolute top-0 left-0 w-full ${styles.topShadow}`} />
        <div className={`absolute inset-0 ${styles.buttonOverlay}`} />
        {/* The label on its own, so it's drawn crisp (`mc-crisp`) without the bevel's shading around it. */}
        <Slottable child={children}>{(label) => <span className="mc-crisp flex items-center gap-1">{label}</span>}</Slottable>
        <div className={`absolute bottom-0 left-0 w-full ${styles.bottomShadow}`} />
      </Component>
    </div>
  );
}
