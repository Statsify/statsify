/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { StatDelta } from "./StatDelta.js";

export interface TrendProps {
  label: string;
  value: number;
  delta?: number;
  sparkline?: number[];
  format?: (v: number) => string;
  inverseGood?: boolean;
  accentColor?: string;
  width?: JSX.Measurement;
}

export const Trend = ({
  label,
  value,
  delta,
  sparkline,
  format,
  inverseGood,
  accentColor = "#9ca3af",
  width = "100%",
}: TrendProps) => {
  const displayValue = format ? format(value) : value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  const mcColor = accentColor.startsWith("#") ? `§#${accentColor.slice(1)}` : accentColor;

  return (
    <box
      width={width}
      direction="column"
      padding={{ top: 5, bottom: 5, left: 8, right: 8 }}
      margin={{ top: 2, bottom: 2, left: 4, right: 4 }}
    >
      <text margin={{ top: 0, bottom: 3, left: 0, right: 0 }} size={1.5}>{`§7${label}`}</text>
      <div width="100%" direction="row">
        <text margin={0} size={2}>{`${mcColor}${displayValue}`}</text>
        {delta === undefined ?
          (sparkline && sparkline.length > 1 ?
            (
              <sparkbar
                data={sparkline}
                width={sparkline.length * 6}
                height={24}
                color={accentColor}
                margin={{ top: 0, bottom: 0, left: 8, right: 0 }}
              />
            ) :
            <></>) :
          (
            <div margin={{ top: 0, bottom: 0, left: 6, right: 0 }}>
              <StatDelta
                value={delta}
                format={format}
                inverseGood={inverseGood}
                sparkline={sparkline}
              />
            </div>
          )}
      </div>
    </box>
  );
};
