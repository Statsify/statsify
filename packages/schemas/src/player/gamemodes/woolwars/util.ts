/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { findScore } from '@statsify/util';

//TODO(jacobk999): Figure out how leveling works after 100

export const getExpReq = (level: number) => {
  const progress = level % 100;
  if (progress > 4) return 5000;

  const levels = [0, 1000, 2000, 3000, 4000];

  return levels[progress];
};

export const getLevel = (exp = 0): number => {
  const prestiges = Math.floor(exp / 490000);
  let level = prestiges * 100;
  let remainingExp = exp - prestiges * 490000;

  for (let i = 0; i < 5; ++i) {
    const expForNextLevel = getExpReq(i);
    if (remainingExp < expForNextLevel) break;
    level++;
    remainingExp -= expForNextLevel;
  }

  return Math.floor(level + remainingExp / getExpReq(level + 1));
};

const applyFormat = ({ format }: { format: string[] }, n: number) => {
  if (format.length == 2) {
    return `${format[0]}${n}${format[1]}`;
  }

  const nums = n
    .toString()
    .split('')
    .map((v, i) => (v = `${format[i] ?? ''}${v}`))
    .join();

  return `${nums}${format[format.length - 1]}`;
};

export const getFormattedLevel = (star: number): string => {
  star = Math.floor(star);

  const prestigeColors: { req: number; format: string[] }[] = [
    { req: 0, format: ['§7[', '✫]'] },
    { req: 100, format: ['§f[', '✫]'] },
  ];

  return applyFormat(findScore(prestigeColors, star), star);
};
