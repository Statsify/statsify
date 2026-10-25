/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { cn } from "~/lib/util";
import { panel } from "@statsify/tokens";
import type { CSSProperties, ComponentProps, ElementType, JSX, ReactNode } from "react";

type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> & U[keyof U];

export type BoxBorderRadius =
  | Partial<{ topLeft: number; topRight: number; bottomLeft: number; bottomRight: number }> |
  AtLeastOne<{ top: number; bottom: number }> |
  AtLeastOne<{ left: number; right: number }> |
  number;

const DEFAULT_BORDER_RADIUS = panel.bevel;

export function toBorderRadius(borderRadius: BoxBorderRadius): {
  topLeft: number;
  topRight: number;
  bottomLeft: number;
  bottomRight: number;
} {
  if (typeof borderRadius === "number")
    return {
      topLeft: borderRadius,
      topRight: borderRadius,
      bottomLeft: borderRadius,
      bottomRight: borderRadius,
    };

  if ("top" in borderRadius || "bottom" in borderRadius) {
    return {
      topLeft: borderRadius.top ?? DEFAULT_BORDER_RADIUS,
      topRight: borderRadius.top ?? DEFAULT_BORDER_RADIUS,
      bottomLeft: borderRadius.bottom ?? DEFAULT_BORDER_RADIUS,
      bottomRight: borderRadius.bottom ?? DEFAULT_BORDER_RADIUS,
    };
  }

  if ("left" in borderRadius || "right" in borderRadius) {
    return {
      topLeft: borderRadius.left ?? DEFAULT_BORDER_RADIUS,
      topRight: borderRadius.right ?? DEFAULT_BORDER_RADIUS,
      bottomLeft: borderRadius.left ?? DEFAULT_BORDER_RADIUS,
      bottomRight: borderRadius.right ?? DEFAULT_BORDER_RADIUS,
    };
  }

  return {
    topLeft: borderRadius.topLeft ?? DEFAULT_BORDER_RADIUS,
    topRight: borderRadius.topRight ?? DEFAULT_BORDER_RADIUS,
    bottomLeft: borderRadius.bottomLeft ?? DEFAULT_BORDER_RADIUS,
    bottomRight: borderRadius.bottomRight ?? DEFAULT_BORDER_RADIUS,
  };
}

// The card look from `@statsify/tokens`: the panel colour, the renderer's overlay gradient and a shadow at the
// card's opacity, which the `box` utility (app.css) draws from tokens.css. The tinted variants keep their radial
// gradients and have no overlay.
const boxVariants = {
  red: {
    background: `radial-gradient(circle at 50% -10%, rgb(0 0 0 / 0.06) 40%, hsl(0 100% 30% / 0.5) 110%), ${panel.background}`,
    shadow: `rgb(10 0 0 / ${panel.shadowOpacity})`,
  },
  green: {
    background: `radial-gradient(circle at 50% -10%, rgb(0 0 0 / 0.06) 40%, hsl(120 100% 30% / 0.4) 110%), ${panel.background}`,
    shadow: `rgb(0 10 0 / ${panel.shadowOpacity})`,
  },
  pink: {
    background: `radial-gradient(circle at 50% -10%, rgb(0 0 0 / 0.06) 40%, hsl(311 100% 50% / 0.4) 110%), ${panel.background}`,
    shadow: `rgb(10 0 10 / ${panel.shadowOpacity})`,
  },
  // The bot's highlighted leaderboard row (`leaderboard.profile.tsx`): a white panel with a lighter shadow.
  highlight: {
    background: "rgb(255 255 255 / 0.35)",
    shadow: "rgb(0 0 0 / 0.3)",
  },
};

type BoxOnlyProps = {
  borderRadius?: BoxBorderRadius;
  shadow?: number;
  variant?: "default" | keyof typeof boxVariants;
  /** A panel header rendered above the content, like the title boxes on the bot's cards. */
  title?: ReactNode;
};

export type BoxProps<T extends keyof JSX.IntrinsicElements = "div"> = BoxOnlyProps & { as?: T } & Omit<
  ComponentProps<T>,
  keyof BoxOnlyProps
>;

const DEFAULT_BORDER_RADIUS_PROP: BoxBorderRadius = {};

const CORNER_VARS = {
  topLeft: "--box-tl",
  topRight: "--box-tr",
  bottomLeft: "--box-bl",
  bottomRight: "--box-br",
} as const;

export function Box<T extends keyof JSX.IntrinsicElements = "div">({
  borderRadius: partialBorderRadius = DEFAULT_BORDER_RADIUS_PROP,
  shadow = panel.shadow,
  className,
  variant = "default",
  title,
  as,
  style,
  children,
  ...props
}: BoxProps<T>) {
  const borderRadius = toBorderRadius(partialBorderRadius);
  const Component: ElementType = as ?? "div";

  // The `box` utility (app.css) draws the default card: its bevels, shadow and colours. A Box's style carries only
  // what differs from it, so most carry none.
  const vars: Record<string, string> = {};
  if (variant !== "default") {
    vars["--box-fill"] = boxVariants[variant].background;
    vars["--box-shadow"] = boxVariants[variant].shadow;
  }
  for (const [corner, name] of Object.entries(CORNER_VARS)) {
    const radius = borderRadius[corner as keyof typeof CORNER_VARS];
    if (radius !== DEFAULT_BORDER_RADIUS) vars[name] = `${radius}px`;
  }
  if (shadow !== panel.shadow) vars["--box-s"] = `${shadow}px`;

  return (
    <Component
      className={cn(
        "box relative text-mc-white me-1 mb-1 content:p-4 content:text-mc-2 content:h-full",
        className
      )}
      data-square-corner={borderRadius.bottomRight === 0 || undefined}
      style={vars as CSSProperties}
      {...(props as object)}
    >
      {/* The card lays its gradient over everything beneath the panel with `overlay` compositing (`Box.ts`
          renderOverlay), so the background brightens at the top and darkens at the bottom. A blend mode beside the
          content does the same (the fill's `::after`); inside the clipped content it could only see the panel colour. */}
      <div data-slot="fill" data-overlay={variant === "default" || variant === "highlight" || undefined} />
      <div data-slot="content" className="relative" style={style}>
        {title !== undefined && (
          <div data-slot="title" className="-mx-4 -mt-4 mb-3 border-b-2 border-black/30 bg-black/20 px-4 py-2 text-center">
            {title}
          </div>
        )}
        {children}
      </div>
    </Component>
  );
}
