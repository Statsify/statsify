/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

export interface VersusStatRow {
  label: string;
  leftValue: number | string;
  rightValue: number | string;
  higherIsBetter?: boolean;
  format?: (v: number) => string;
}

export interface VersusPlayer {
  name: string;
  stats: VersusStatRow[];
}

export interface VersusPanelProps {
  left: VersusPlayer;
  right: VersusPlayer;
  width?: JSX.Measurement;
}

const compareValues = (
  left: number | string,
  right: number | string,
  higherIsBetter = true
): "left" | "right" | "tie" => {
  if (typeof left !== "number" || typeof right !== "number") return "tie";
  if (left === right) return "tie";
  return (left > right) === higherIsBetter ? "left" : "right";
};

const formatVal = (v: number | string, format?: (n: number) => string) =>
  typeof v === "number" ?
    (format ? format(v) : v.toLocaleString(undefined, { maximumFractionDigits: 2 })) :
    v;

const StatRow = ({ row, rightRow }: { row: VersusStatRow; rightRow: VersusStatRow | undefined }) => {
  const rightValue = rightRow?.rightValue ?? row.rightValue;
  const winner = compareValues(row.leftValue, rightValue, row.higherIsBetter);
  const leftColor = winner === "left" ? "§a" : (winner === "right" ? "§c" : "§7");
  const rightColor = winner === "right" ? "§a" : (winner === "left" ? "§c" : "§7");

  return (
    <box
      width="100%"
      direction="row"
      padding={{ top: 4, bottom: 4, left: 8, right: 8 }}
      margin={{ top: 2, bottom: 2, left: 4, right: 4 }}
    >
      <div width="1/3">
        <text margin={0} size={1.75}>
          {`${leftColor}${formatVal(row.leftValue, row.format)}`}
        </text>
      </div>
      <div width="1/3" location="center">
        <text margin={0} size={1.5}>{`§7${row.label}`}</text>
      </div>
      <div width="1/3">
        <div width="remaining" />
        <text margin={0} size={1.75}>
          {`${rightColor}${formatVal(rightValue, row.format)}`}
        </text>
      </div>
    </box>
  );
};

export const VersusPanel = ({
  left,
  right,
  width = "100%",
}: VersusPanelProps) => {
  const header = (
    <div width="100%" direction="row" margin={{ top: 0, bottom: 4, left: 0, right: 0 }}>
      <div width="1/2">
        <text margin={{ top: 0, bottom: 0, left: 8, right: 4 }} size={2}>{left.name}</text>
      </div>
      <div width="1/2">
        <div width="remaining" />
        <text margin={{ top: 0, bottom: 0, left: 4, right: 8 }} size={2}>{right.name}</text>
      </div>
    </div>
  );

  const rows = left.stats.map((row) => (
    <StatRow row={row} rightRow={right.stats.find((r) => r.label === row.label)} />
  ));

  return (
    <div width={width} direction="column">
      {[header, ...rows]}
    </div>
  );
};
