/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { SEMANTIC_COLORS } from "./theme.js";
import type { Spacing } from "@statsify/rendering";

export type BadgeVariant = "solid" | "outline" | "soft";
export type BadgeSize = "sm" | "md" | "lg";
export type BadgeStatus = "positive" | "negative" | "neutral" | "warning";
export type BadgeShape = "pill" | "tag";

export interface BadgeProps {
  children: string;
  color?: JSX.IntrinsicElements["box"]["color"];
  outline?: JSX.IntrinsicElements["box"]["outline"];
  variant?: BadgeVariant;
  size?: BadgeSize;
  status?: BadgeStatus;
  shape?: BadgeShape;
  icon?: string;
}

const STATUS_HEX: Record<BadgeStatus, string> = {
  positive: SEMANTIC_COLORS.positive,
  negative: SEMANTIC_COLORS.negative,
  neutral: SEMANTIC_COLORS.neutral,
  warning: SEMANTIC_COLORS.warning,
};

const PADDING: Record<BadgeSize, Spacing> = {
  sm: { top: 2, bottom: 2, left: 5, right: 5 },
  md: { top: 3, bottom: 3, left: 8, right: 8 },
  lg: { top: 4, bottom: 4, left: 12, right: 12 },
};

const TEXT_SIZE: Record<BadgeSize, number> = {
  sm: 1.25,
  md: 1.5,
  lg: 1.75,
};

const RADIUS: Record<BadgeShape, number> = {
  pill: 8,
  tag: 3,
};

export const Badge = ({
  children,
  color,
  outline,
  variant = "solid",
  size = "md",
  status,
  shape = "tag",
  icon,
}: BadgeProps) => {
  const statusHex = status ? STATUS_HEX[status] : undefined;
  const radius = RADIUS[shape];

  let resolvedColor = color;
  let resolvedOutline = outline;

  if (statusHex) {
    if (variant === "solid") {
      resolvedColor = resolvedColor ?? `${statusHex}cc`;
    } else if (variant === "soft") {
      resolvedColor = resolvedColor ?? `${statusHex}33`;
    } else {
      resolvedColor = resolvedColor ?? "rgba(255,255,255,0.06)";
      resolvedOutline = resolvedOutline ?? (statusHex as JSX.IntrinsicElements["box"]["outline"]);
    }
  } else if (variant === "outline") {
    resolvedColor = resolvedColor ?? "rgba(255, 255, 255, 0.06)";
    resolvedOutline = resolvedOutline ?? ("rgba(255,255,255,0.35)" as JSX.IntrinsicElements["box"]["outline"]);
  } else if (variant === "soft") {
    resolvedColor = resolvedColor ?? "rgba(255, 255, 255, 0.08)";
  } else {
    resolvedColor = resolvedColor ?? "rgba(255, 255, 255, 0.14)";
  }

  return (
    <box
      padding={PADDING[size]}
      margin={{ top: 2, bottom: 2, left: 4, right: 4 }}
      border={{ topLeft: radius, topRight: radius, bottomLeft: radius, bottomRight: radius }}
      color={resolvedColor}
      outline={resolvedOutline}
      outlineSize={2}
      shadowDistance={2}
      shadowOpacity={0.45}
    >
      <div direction="row">
        {icon ?
          (
            <text margin={{ top: 0, bottom: 0, left: 0, right: 4 }} size={TEXT_SIZE[size]}>
              {icon}
            </text>
          ) :
          <></>}
        <text margin={0} size={TEXT_SIZE[size]}>{children}</text>
      </div>
    </box>
  );
};
