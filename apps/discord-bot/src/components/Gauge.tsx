/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

export interface GaugeProps {
  value: number;
  min?: number;
  max?: number;
  fillColor?: JSX.IntrinsicElements["arc"]["fillColor"];
  trackColor?: JSX.IntrinsicElements["arc"]["trackColor"];
  label?: string;
  sublabel?: string;
  size?: number;
}

export const Gauge = ({
  value,
  min = 0,
  max = 100,
  fillColor = "#9ca3af",
  trackColor = "rgba(255,255,255,0.12)",
  label,
  sublabel,
  size = 80,
}: GaugeProps) => (
  <div direction="column" location="center">
    <arc
      value={value}
      min={min}
      max={max}
      fillColor={fillColor}
      trackColor={trackColor}
      startAngle={-Math.PI * 0.75}
      endAngle={Math.PI * 0.75}
      trackWidth={8}
      fillWidth={8}
      width={size}
      height={size}
      centerLabel={label}
      centerLabelColor="#ffffff"
      centerLabelSize={Math.round(size * 0.16)}
    />
    {sublabel ?
      <text margin={{ top: 2, bottom: 0, left: 4, right: 4 }} size={1.5}>{`§7${sublabel}`}</text> :
      <></>}
  </div>
);
