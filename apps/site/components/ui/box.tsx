/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { cn } from "~/lib/util";
import type { ComponentProps, JSX } from "react";

type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> & U[keyof U];

export type BoxBorderRadius =
  | Partial<{ topLeft: number; topRight: number; bottomLeft: number; bottomRight: number }>
  | AtLeastOne<{ top: number; bottom: number }>
  | AtLeastOne<{ left: number; right: number }>
  | number;

const DEFAULT_BORDER_RADIUS = 8;

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

const boxVariants = {
  default: {
    background: "linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, rgba(0, 0, 0, 0.50) 100%), rgba(0, 0, 0, 0.50)",
    shadow: "bg-black/42",
  },
  red: {
    background:
      "radial-gradient(circle at 50% -10%, rgba(0, 0, 0, 0.06) 40%, hsla(0, 100%, 30%, 0.5) 110%), rgba(0, 0, 0, 0.50)",
    shadow: "bg-[#0a0000]/42",
  },
  green: {
    background:
      "radial-gradient(circle at 50% -10%, rgba(0, 0, 0, 0.06) 40%, hsla(120, 100%, 30%, 0.4) 110%), rgba(0, 0, 0, 0.50)",
    shadow: "bg-[#000a00]/42",
  },
  pink: {
    background:
      "radial-gradient(circle at 50% -10%, rgba(0, 0, 0, 0.06) 40%, hsla(311, 100%, 50%, 0.4) 110%), rgba(0, 0, 0, 0.50)",
    shadow: "bg-[#000a00]/42",
  },
};

type BoxOnlyProps = {
  borderRadius?: BoxBorderRadius;
  shadow?: number;
  variant?: keyof typeof boxVariants;
};

type BoxProps<T extends (keyof JSX.IntrinsicElements) = "div"> = BoxOnlyProps & { as?: T } & Omit<ComponentProps<T>, keyof BoxOnlyProps>;

export function Box<T extends (keyof JSX.IntrinsicElements) = "div">({
  borderRadius: partialBorderRadius = {},
  shadow = 8,
  className,
  variant = "default",
  as,
  style,
  children,
  ...props
}: BoxProps<T>) {
  const borderRadius = toBorderRadius(partialBorderRadius);
  const Component = as ?? "div";

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
      className={cn("relative text-mc-white me-2 mb-2 content:p-4 content:text-mc-2 content:h-full", className)}
      {...props}
    >
      <div
        className={`absolute w-full h-full ${boxVariants[variant].shadow}`}
        style={{ transform: `translate(${shadow}px, ${shadow}px)`, clipPath: shadowPath }}
      />
      <div
        data-slot="content"
        style={{
          ...style,
          background: boxVariants[variant].background,
          backgroundBlendMode: "overlay, normal",
          clipPath: contentPath,
        }}
      >{children}
      </div>
    </Component>
  );
}

export function polygon(...points: (`${string} ${string}` | false)[]) {
  return `polygon(${points.filter(Boolean).join(", ")})`;
}
