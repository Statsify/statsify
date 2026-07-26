/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

export interface LeaderboardRowProps {
  rank: number;
  name: string;
  value: string | number;
  accentColor?: string;
  width?: JSX.Measurement;
}

const rankColor = (rank: number): string => {
  if (rank === 1) return "§#ffd700";
  if (rank === 2) return "§#c0c0c0";
  if (rank === 3) return "§#cd7f32";
  return "§7";
};

const accentMc = (color: string) =>
  color.startsWith("#") ? `§#${color.slice(1)}` : color;

export const LeaderboardRow = ({
  rank,
  name,
  value,
  accentColor = "#9ca3af",
  width = "100%",
}: LeaderboardRowProps) => (
  <box
    width={width}
    direction="row"
    padding={{ top: 4, bottom: 4, left: 8, right: 8 }}
    margin={{ top: 2, bottom: 2, left: 4, right: 4 }}
  >
    <div width={28}>
      <text margin={0} size={1.75}>{`${rankColor(rank)}#${rank}`}</text>
    </div>
    <text margin={{ top: 0, bottom: 0, left: 6, right: 6 }} size={1.75}>{`§f${name}`}</text>
    <div width="remaining" />
    <text margin={0} size={1.75}>
      {`${accentMc(accentColor)}${typeof value === "number" ? value.toLocaleString() : value}`}
    </text>
  </box>
);
