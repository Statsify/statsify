/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { DeferredGradient, useGradient } from "@statsify/rendering";

export interface BarChartItem {
  label: string;
  value: number;
  color?: JSX.IntrinsicElements["box"]["color"];
  formattedValue?: string;
  threshold?: number;
  thresholdColor?: JSX.IntrinsicElements["box"]["color"];
}

export type BarChartOrientation = "vertical" | "horizontal";

export interface BarChartProps {
  items: BarChartItem[];
  width?: JSX.Measurement;
  max?: number;
  sort?: boolean;
  showValues?: boolean;
  orientation?: BarChartOrientation;
  goal?: number;
  gradientFill?: boolean;
}

const resolveBarColor = (
  item: BarChartItem,
  gradientFill: boolean
): JSX.IntrinsicElements["box"]["color"] | DeferredGradient => {
  const base = item.threshold !== undefined && item.value >= item.threshold ?
    (item.thresholdColor ?? "#4ade80") :
    (item.color ?? "#9ca3af");

  if (!gradientFill || typeof base !== "string") return base;

  return useGradient("horizontal", [0, base], [1, `${base}88`]);
};

export const BarChart = ({
  items,
  width = "100%",
  max,
  sort = true,
  showValues = true,
  orientation = "vertical",
  goal,
  gradientFill = false,
}: BarChartProps) => {
  const sortedItems = sort ? [...items].sort((a, b) => b.value - a.value) : items;
  const maximum = max ?? Math.max(1, ...sortedItems.map((item) => item.value));

  if (orientation === "horizontal") {
    return (
      <div width={width} direction="column">
        {sortedItems.map((item) => {
          const percentage = item.value > 0 ?
            Math.max(2, Math.min(100, Math.round((item.value / maximum) * 100))) :
            0;
          const barColor = resolveBarColor(item, gradientFill);

          return (
            <div
              width="100%"
              padding={{ top: 4, bottom: 4, left: 8, right: 8 }}
              margin={{ top: 2, bottom: 2, left: 4, right: 4 }}
            >
              <box
                width={64}
                direction="row"
                padding={0}
                shadowDistance={0}
                color="rgba(0,0,0,0)"
              >
                <text margin={0} size={1.75}>{`§7${item.label}`}</text>
              </box>
              <box
                width="remaining"
                height={12}
                margin={{ top: 0, bottom: 0, left: 4, right: 0 }}
                padding={0}
                color="rgba(255, 255, 255, 0.12)"
                shadowDistance={0}
              >
                <box
                  width={`${percentage}%`}
                  height="100%"
                  margin={0}
                  padding={0}
                  color={barColor as JSX.IntrinsicElements["box"]["color"]}
                  shadowDistance={0}
                />
                {goal === undefined ?
                  <></> :
                  (
                    <box
                      width={2}
                      height="100%"
                      margin={0}
                      padding={0}
                      color="rgba(255,255,255,0.6)"
                      shadowDistance={0}
                    />
                  )}
              </box>
              {showValues ?
                (
                  <text margin={{ top: 0, bottom: 0, left: 6, right: 0 }} size={1.75}>
                    {item.formattedValue ?? item.value.toLocaleString()}
                  </text>
                ) :
                <></>}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div width={width} direction="column">
      {sortedItems.map((item) => {
        const percentage = item.value > 0 ?
          Math.max(2, Math.min(100, Math.round((item.value / maximum) * 100))) :
          0;
        const barColor = resolveBarColor(item, gradientFill);

        return (
          <box
            width="100%"
            direction="column"
            padding={{ top: 5, bottom: 5, left: 8, right: 8 }}
            margin={{ top: 2, bottom: 2, left: 4, right: 4 }}
          >
            <div width="100%">
              <text margin={{ top: 0, bottom: 3, left: 0, right: 4 }} size={1.75}>
                {`§7${item.label}`}
              </text>
              <div width="remaining" />
              {showValues ?
                (
                  <text margin={{ top: 0, bottom: 3, left: 4, right: 0 }} size={1.75}>
                    {item.formattedValue ?? item.value.toLocaleString()}
                  </text>
                ) :
                <></>}
            </div>
            <box
              width="100%"
              height={10}
              margin={0}
              padding={0}
              color="rgba(255, 255, 255, 0.12)"
              shadowDistance={0}
            >
              <box
                width={`${percentage}%`}
                height="100%"
                margin={0}
                padding={0}
                color={barColor as JSX.IntrinsicElements["box"]["color"]}
                shadowDistance={0}
                border={{ topLeft: 0, topRight: 3, bottomLeft: 0, bottomRight: 3 }}
              />
              {goal === undefined ?
                <></> :
                (
                  <box
                    width={2}
                    height="100%"
                    margin={0}
                    padding={0}
                    color="rgba(255,255,255,0.6)"
                    shadowDistance={0}
                  />
                )}
            </box>
          </box>
        );
      })}
    </div>
  );
};
