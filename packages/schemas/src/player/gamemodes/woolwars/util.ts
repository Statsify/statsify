/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { findScore } from "@statsify/util";
import { rainbow } from "#prefixes";

export const getExpReq = (level: number) => {
  const progress = level % 100;
  if (progress > 4) return 5000;

  const levels = [level >= 100 ? 5000 : 0, 1000, 2000, 3000, 4000];

  return levels[progress];
};

export const getLevel = (exp = 0): number => {
  const prestiges = Math.floor(exp / 490_000);
  let level = prestiges * 100;
  let remainingExp = exp - prestiges * 490_000;

  for (let i = 0; i < 5; ++i) {
    const expForNextLevel = getExpReq(i);
    if (remainingExp < expForNextLevel) break;
    level++;
    remainingExp -= expForNextLevel;
  }

  return level + remainingExp / getExpReq(level + 1);
};

/*
  Hypixel uses names for symbols for the field wool_wars_prestige_icon
  Currently these are the symbols that are known
  CROWN: ♕
  STAR: ✫
  CROSS: ✙
  PLANE: ✈︎
  HEART: ❤️
*/

const PRESTIGE_COLORS: { req: number; format: (level: number) => string }[] = [
  { req: 0, format: l => `§7[${l}❤]` },
  { req: 100, format: l => `§f[${l}✙]` },
  { req: 200, format: l => `§c[${l}✫]` },
  { req: 300, format: l => `§6[${l}✈]` },
  { req: 400, format: l => `§e[${l}✠]` },
  { req: 500, format: l => `§a[${l}♕]` },
  { req: 600, format: l => `§3[${l}⚡]` },
  { req: 700, format: l => `§5[${l}☢]` },
  { req: 800, format: l => `§d[${l}☢]` },
  { req: 900, format: l => rainbow(`[${l}✏]`) },
  { req: 1000, format: l => `§0[§f${l}☯§0]` },
];

export const getFormattedLevel = (star: number): string => {
  star = Math.floor(star);

  const { format } = findScore(PRESTIGE_COLORS, star);

  return format(star);
};
