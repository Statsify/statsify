/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { cn } from "~/lib/util";
import { panel } from "@statsify/tokens";
import type { ComponentProps, ElementType, JSX, ReactNode } from "react";

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

// The card look from `@statsify/tokens`: the renderer's overlay gradient on the panel colour and a
// shadow at the card's opacity. The tinted variants keep their radial gradients.
const boxVariants = {
  default: {
    background: `linear-gradient(180deg, ${panel.overlay.from} 0%, ${panel.overlay.to} 100%), ${panel.background}`,
    shadow: `rgb(0 0 0 / ${panel.shadowOpacity})`,
  },
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
};

type BoxOnlyProps = {
  borderRadius?: BoxBorderRadius;
  shadow?: number;
  variant?: keyof typeof boxVariants;
  /** A panel header rendered above the content, like the title boxes on the bot's cards. */
  title?: ReactNode;
};

export type BoxProps<T extends keyof JSX.IntrinsicElements = "div"> = BoxOnlyProps & { as?: T } & Omit<
  ComponentProps<T>,
  keyof BoxOnlyProps
>;

const DEFAULT_BORDER_RADIUS_PROP: BoxBorderRadius = {};

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

  const shadowPath = polygon(
    ...(borderRadius.bottomRight === 0 ?
      [] :
      ([
        `calc(100% - ${borderRadius.bottomRight + shadow}px) calc(100% - ${borderRadius.bottomRight + shadow}px)`,
        `calc(100% - ${shadow}px) calc(100% - ${borderRadius.bottomRight + shadow}px)`,
        `calc(100% - ${shadow}px) calc(100% - ${shadow}px)`,
        `calc(100% - ${borderRadius.bottomRight + shadow}px) calc(100% - ${shadow}px)`,
        `calc(100% - ${borderRadius.bottomRight + shadow}px) calc(100% - ${borderRadius.bottomRight + shadow}px)`,
      ] as const)),

    `${borderRadius.bottomLeft}px calc(100% - ${shadow}px)`,
    `${borderRadius.bottomLeft}px 100%`,
    `calc(100% - ${borderRadius.bottomRight || shadow}px) 100%`,
    `calc(100% - ${borderRadius.bottomRight || shadow}px) calc(100% - ${shadow}px)`,
    `${borderRadius.bottomLeft}px calc(100% - ${shadow}px)`,

    borderRadius.bottomRight !== 0 &&
    `calc(100% - ${borderRadius.bottomRight + shadow}px) calc(100% - ${borderRadius.bottomRight + shadow}px)`,

    `calc(100% - ${shadow}px) ${borderRadius.topRight}px`,
    `100% ${borderRadius.topRight}px`,
    `100% calc(100% - ${borderRadius.bottomRight}px)`,
    `calc(100% - ${shadow}px) calc(100% - ${borderRadius.bottomRight}px)`,
    `calc(100% - ${shadow}px) ${borderRadius.topRight}px`,

    borderRadius.bottomRight === 0 ?
      `${borderRadius.bottomLeft}px calc(100% - ${shadow}px)` :
      `calc(100% - ${borderRadius.bottomRight + shadow}px) calc(100% - ${borderRadius.bottomRight + shadow}px)`
  );

  const contentPath = polygon(
    `${borderRadius.topLeft}px 0`,
    `calc(100% - ${borderRadius.topRight}px) 0`,
    `calc(100% - ${borderRadius.topRight}px) ${borderRadius.topRight}px`,
    `100% ${borderRadius.topRight}px`,
    `100% calc(100% - ${borderRadius.bottomRight}px)`,
    `calc(100% - ${borderRadius.bottomRight}px) calc(100% - ${borderRadius.bottomRight}px)`,
    `calc(100% - ${borderRadius.bottomRight}px) 100%`,
    `${borderRadius.bottomLeft}px 100%`,
    `${borderRadius.bottomLeft}px calc(100% - ${borderRadius.bottomLeft}px)`,
    `0 calc(100% - ${borderRadius.bottomLeft}px)`,
    `0px ${borderRadius.topLeft}px`,
    `${borderRadius.topLeft}px ${borderRadius.topLeft}px`
  );

  return (
    <Component
      className={cn(
        "relative text-mc-white me-1 mb-1 content:p-4 content:text-mc-2 content:h-full content:animate-loading-gradient",
        className
      )}
      {...(props as object)}
    >
      <div
        className="absolute w-full h-full"
        style={{
          backgroundColor: boxVariants[variant].shadow,
          transform: `translate(${shadow}px, ${shadow}px)`,
          clipPath: shadowPath,
        }}
      />
      <div
        data-slot="content"
        style={{
          ...style,
          background: boxVariants[variant].background,
          backgroundBlendMode: "overlay, normal",
          clipPath: contentPath,
        }}
      >
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

export function polygon(...points: (`${string} ${string}` | false)[]) {
  return `polygon(${points.filter(Boolean).join(", ")})`;
}
