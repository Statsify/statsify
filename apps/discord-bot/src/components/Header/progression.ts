/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { LocalizeFunction } from "@statsify/discord";
import type { Progression } from "@statsify/schemas";

export type ProgressFunction = (pecentage: number) => string;

/**
 * The number of filled segments out of `max`. Percentages outside 0 to 1 are clamped,
 * and values that aren't finite (NaN, Infinity) give an empty bar.
 */
const filledSegments = (max: number, percentage: number) => {
  if (!Number.isFinite(percentage)) return 0;
  return Math.ceil(max * Math.min(Math.max(percentage, 0), 1));
};

const xpBar: ProgressFunction = (percentage) => {
  const max = 10;
  const count = filledSegments(max, percentage);

  return `§r§8[§b${"■".repeat(count)}§7${"■".repeat(max - count)}§8]`;
};

export const lineXpBar =
  (color: string): ProgressFunction =>
    (percentage: number) => {
      const max = 40;
      const count = filledSegments(max, percentage);
      return `§8[${color}${"|".repeat(count)}§7${"|".repeat(max - count)}§8]§r`;
    };

interface BaseFormatProgressionOptions {
  t: LocalizeFunction;
  progression: Progression;
  currentLevel: string;
  nextLevel: string;
  showLevel?: boolean;
  renderXp?: ProgressFunction;
}

interface LabeledFormatProgressionOptions extends BaseFormatProgressionOptions {
  label: string;
  showProgress?: true;
}

interface UnlabeledFormatProgressionOptions extends BaseFormatProgressionOptions {
  label?: never;
  showProgress: false;
}

export type FormatProgressionOptions =
  | LabeledFormatProgressionOptions |
  UnlabeledFormatProgressionOptions;

export const formatProgression = ({
  t,
  label,
  progression,
  currentLevel,
  nextLevel,
  showLevel = true,
  showProgress = true,
  renderXp = xpBar,
}: FormatProgressionOptions) => {
  let output = "§^2^";

  if (!progression.max) {
    if (showProgress) output += `§7${label}: `;
    output += "§r§b§lMAXED§r";
    return output;
  }

  if (showProgress)
    output += `§7${label}: §b${t(progression.current)}§7/§a${t(progression.max)}`;

  if (showProgress && showLevel) output += "\n";

  if (showLevel)
    output += `${currentLevel} ${renderXp(progression.percent)} ${nextLevel}`;

  return output;
};
