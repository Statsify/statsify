/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { arrayGroup } from "@statsify/util";
import type { LocalizeFunction } from "@statsify/discord";
import type { PowerStat } from "@statsify/skyblock";

const MAX_STATS_PER_LINE = 3; // more is wider than the card

export interface StatLinesProps {
  label: string;
  stats: PowerStat[];
  t: LocalizeFunction;
}

export const StatLines = ({ label, stats, t }: StatLinesProps) => {
  const lineCount = Math.ceil(stats.length / MAX_STATS_PER_LINE);
  const lines = arrayGroup(
    stats.map(({ name, color, value }) => `${color}${value < 0 ? "" : "+"}${t(value)} ${name}`),
    Math.ceil(stats.length / lineCount)
  );

  return (
    <box width="100%" direction="column">
      {lines.map((line, index) => (
        <text>{`${index === 0 ? `§7${label}: ` : ""}${line.join(" ")}`}</text>
      ))}
    </box>
  );
};
