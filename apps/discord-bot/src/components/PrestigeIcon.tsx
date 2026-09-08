/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

export interface PrestigeIconThreshold {
  min: number;
  color: string;
  label?: string;
}

export interface PrestigeIconProps {
  value: number;
  thresholds: PrestigeIconThreshold[];
  size?: number;
  showLabel?: boolean;
}

const DEFAULT_COLOR = "#9ca3af";

export const PrestigeIcon = ({
  value,
  thresholds,
  size = 32,
  showLabel = true,
}: PrestigeIconProps) => {
  const sorted = [...thresholds].sort((a, b) => b.min - a.min);
  const match = sorted.find((t) => value >= t.min);
  const color = match?.color ?? DEFAULT_COLOR;
  const label = match?.label ?? String(value);

  return (
    <box
      direction="column"
      padding={{ top: 4, bottom: 4, left: 8, right: 8 }}
      margin={{ top: 2, bottom: 2, left: 4, right: 4 }}
      border={{ topLeft: 4, topRight: 4, bottomLeft: 4, bottomRight: 4 }}
      color={`${color}33`}
      shadowDistance={2}
      shadowOpacity={0.4}
    >
      <arc
        value={value}
        min={0}
        max={Math.max(...thresholds.map((t) => t.min))}
        fillColor={color}
        trackColor={`${color}33`}
        width={size}
        height={size}
        trackWidth={5}
        fillWidth={5}
        centerLabel={showLabel ? label : undefined}
        centerLabelColor={color}
        centerLabelSize={Math.max(8, Math.round(size * 0.22))}
      />
    </box>
  );
};
