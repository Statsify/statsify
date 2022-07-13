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

const xpBar: ProgressFunction = (percentage) => {
  const max = 10;
  const count = Math.ceil(max * percentage);

  return `§r§8[§b${"■".repeat(count)}§7${"■".repeat(max - count)}§8]`;
};

export const lineXpBar =
  (color: string): ProgressFunction =>
  (percentage: number) => {
    const max = 40;
    const count = Math.ceil(max * percentage);
    return `§8[${color}${"|".repeat(count)}§7${"|".repeat(max - count)}§8]§r`;
  };

export interface FormatProgressionOptions {
  t: LocalizeFunction;
  progression: Progression;
  currentLevel: string;
  nextLevel: string;
  showProgress?: boolean;
  showLevel?: boolean;
  renderXp?: ProgressFunction;
}

export const formatProgression = ({
  t,
  progression,
  currentLevel,
  nextLevel,
  showLevel = true,
  showProgress = true,
  renderXp = xpBar,
}: FormatProgressionOptions) => {
  if (progression.max) {
    let output = "§^2^";

    if (showProgress)
      output += `§7Progress: §b${t(progression.current)}§7/§a${t(progression.max)}`;

    if (showProgress && showLevel) output += "\n";

    if (showLevel)
      output += `${currentLevel} ${renderXp(progression.percent)} ${nextLevel}`;

    return output;
  }

  let output = "§^2^";

  if (showLevel) output += `§l${currentLevel} `;
  output += "§r§8(§b§lMAXED§r§8)";

  return output;
};
