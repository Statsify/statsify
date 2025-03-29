/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BoxProps, polygon, toBorderRadius } from "~/components/ui/box";
import { cn } from "~/lib/util";

export function Button({
  borderRadius: partialBorderRadius = {},
  shadow = 8,
  contentClass: contentClassName,
  containerClass: containerClassName,
  style,
  ...props
}: BoxProps) {
  const borderRadius = toBorderRadius(partialBorderRadius);

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
    <button
      {...props}
      className={cn("p-4 text-mc-2 h-full", contentClassName)}
      style={{
        ...style,
        background: "linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, rgba(0, 0, 0, 0.06) 100%), rgba(255, 0, 0, 1)",
        backgroundBlendMode: "overlay, normal",
        clipPath: contentPath,
      }}
    />
  );
}
