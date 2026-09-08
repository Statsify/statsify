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
  inverseGood?: boolean;
  invertColor?: boolean;
  neutralZone?: number;
  sparkline?: number[];
}

export const StatDelta = ({
  value,
  format = (v) => v.toLocaleString(undefined, { maximumFractionDigits: 2 }),
  inverseGood = false,
  invertColor,
  neutralZone,
  sparkline,
}: StatDeltaProps) => {
  const effectiveInverse = inverseGood || invertColor || false;
  const rounded = Math.round(value * 100) / 100;
  const absRounded = Math.abs(rounded);
  const isNeutral = neutralZone !== undefined && absRounded <= neutralZone;
  const isPositive = !isNeutral && rounded > 0;
  const isNegative = !isNeutral && rounded < 0;
  const isGood = isPositive !== effectiveInverse;
  const color = isPositive || isNegative ? (isGood ? "§a" : "§c") : "§7";
  const sign = isPositive ? "+" : "";

  return (
    <div direction="row">
      {sparkline && sparkline.length > 1 ?
        (
          <sparkbar
            data={sparkline}
            width={sparkline.length * 5}
            height={20}
            color="rgba(255,255,255,0.3)"
            highlightLast
            highlightColor={isPositive || isNegative ? (isGood ? "#4ade80" : "#f87171") : "#9ca3af"}
            margin={{ top: 0, bottom: 0, left: 0, right: 4 }}
          />
        ) :
        <></>}
      <Badge color={isPositive || isNegative ? "rgba(255, 255, 255, 0.12)" : "rgba(255, 255, 255, 0.08)"}>
        {`${color}${sign}${format(rounded)}`}
      </Badge>
    </div>
  );
};
