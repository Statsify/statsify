/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { LocalizeFunction } from '@statsify/discord';
import type { Progression } from '@statsify/schemas';

const xpBar = (percentage: number): string => {
  const max = 10;
  const count = Math.ceil(max * percentage);

  return `§r§8[§b${'■'.repeat(count)}§7${'■'.repeat(max - count)}§8]`;
};

export const formatProgression = (
  t: LocalizeFunction,
  progression: Progression,
  currentLevel: string,
  nextLevel: string,
  showProgress = true
) => {
  if (progression.max) {
    let output = '§^2^';

    if (showProgress)
      output += `§7Progress: §b${t(progression.current)}§7/§a${t(progression.max)}\n`;

    output += `${currentLevel} ${xpBar(progression.percent)} ${nextLevel}`;
    return output;
  }

  return `§^2^§b§lMAXED`;
};
