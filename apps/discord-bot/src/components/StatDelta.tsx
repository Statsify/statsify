/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Badge } from "./Badge.js";

export interface StatDeltaProps {
  value: number;
  format?: (value: number) => string;
  invertColor?: boolean;
}

export const StatDelta = ({
  value,
  format = (v) => v.toLocaleString(undefined, { maximumFractionDigits: 2 }),
  invertColor = false,
}: StatDeltaProps) => {
  const rounded = Math.round(value * 100) / 100;
  const isPositive = rounded > 0;
  const isNegative = rounded < 0;
  const isGood = isPositive !== invertColor;
  const color = isPositive || isNegative ? (isGood ? "§a" : "§c") : "§7";
  const sign = isPositive ? "+" : "";

  return (
    <Badge color={isPositive || isNegative ? "rgba(255, 255, 255, 0.12)" : "rgba(255, 255, 255, 0.08)"}>
      {`${color}${sign}${format(rounded)}`}
    </Badge>
  );
};
