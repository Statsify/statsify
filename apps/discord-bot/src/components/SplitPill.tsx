/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

export interface StatColumn {
  title: string;
  color: string;
  value: number;
  lowerIsBetter?: boolean;
  comparable?: boolean;
}

export interface SplitPillProps {
  title: string;
  leftValue: number;
  rightValue: number;
  leftFormatted: string;
  rightFormatted: string;
  deltaFormatted: string;
  lowerIsBetter?: boolean;
}

export const SplitPill = ({
  title,
  leftValue,
  rightValue,
  leftFormatted,
  rightFormatted,
  deltaFormatted,
  lowerIsBetter = false,
}: SplitPillProps) => {
  const isEqual = leftValue === rightValue;
  const leftWins = lowerIsBetter ? leftValue < rightValue : leftValue > rightValue;
  const leftColor = isEqual ? "§f" : (leftWins ? "§a" : "§c");
  const rightColor = isEqual ? "§f" : (leftWins ? "§c" : "§a");

  let leftDelta: string;
  let rightDelta: string;

  if (isEqual) {
    leftDelta = `§7${deltaFormatted}`;
    rightDelta = `§7${deltaFormatted}`;
  } else if (leftWins) {
    leftDelta = `§a▲ ${deltaFormatted}`;
    rightDelta = `§c▼ ${deltaFormatted}`;
  } else {
    leftDelta = `§c▼ ${deltaFormatted}`;
    rightDelta = `§a▲ ${deltaFormatted}`;
  }

  return (
    <box direction="column" location="center" width="100%">
      <text margin={{ top: 8, bottom: 4, left: 6, right: 6 }}>{`§7${title}`}</text>
      <div width="100%" direction="row">
        <div width="1/2" location="center">
          <text margin={{ top: 0, bottom: 4, left: 10, right: 10 }}>{`§^4^${leftColor}${leftFormatted}`}</text>
        </div>
        <div width="1/2" location="center">
          <text margin={{ top: 0, bottom: 4, left: 10, right: 10 }}>{`§^4^${rightColor}${rightFormatted}`}</text>
        </div>
      </div>
      <div width="100%" direction="row">
        <div width="1/2" location="center">
          <text margin={{ bottom: 8 }}>{leftDelta}</text>
        </div>
        <div width="1/2" location="center">
          <text margin={{ bottom: 8 }}>{rightDelta}</text>
        </div>
      </div>
    </box>
  );
};
