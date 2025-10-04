/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { findScore } from "@statsify/util";

export const getExpReq = (level: number) => {
  const progress = level % 100;
  if (progress > 3) return 5000;

  const levels: Record<number, number> = {
    0: 500,
    1: 1000,
    2: 2000,
    3: 3500,
  };

  return levels[progress];
};

export const getLevel = (exp = 0): number => {
  const prestiges = Math.floor(exp / 487_000);
  let level = prestiges * 100;
  let remainingExp = exp - prestiges * 487_000;

  for (let i = 0; i < 4; ++i) {
    const expForNextLevel = getExpReq(i);
    if (remainingExp < expForNextLevel) break;
    level++;
    remainingExp -= expForNextLevel;
  }

  return level + remainingExp / getExpReq(level + 1);
};

const PRESTIGE_COLORS: { req: number; fn: (n: number) => string }[] = [
  { req: 0, fn: (n) => `§7[${n}✫]` },
  { req: 100, fn: (n) => `§f[${n}✫]` },
  { req: 200, fn: (n) => `§6[${n}✫]` },
  { req: 300, fn: (n) => `§b[${n}✫]` },
  { req: 400, fn: (n) => `§2[${n}✫]` },
  { req: 500, fn: (n) => `§3[${n}✫]` },
  { req: 600, fn: (n) => `§4[${n}✫]` },
  { req: 700, fn: (n) => `§d[${n}✫]` },
  { req: 800, fn: (n) => `§9[${n}✫]` },
  { req: 900, fn: (n) => `§5[${n}✫]` },
  {
    req: 1000,
    fn: (n) => {
      const nums = [...n.toString()];
      return `§c[§6${nums[0]}§e${nums[1]}§a${nums[2]}§b${nums[3]}§d✫§5]`;
    },
  },
  { req: 1100, fn: (n) => `§7[§f${n}§7✪]` },
  { req: 1200, fn: (n) => `§7[§e${n}§6✪§7]` },
  { req: 1300, fn: (n) => `§7[§b${n}§3✪§7]` },
  { req: 1400, fn: (n) => `§7[§a${n}§2✪§7]` },
  { req: 1500, fn: (n) => `§7[§3${n}§9✪§7]` },
  { req: 1600, fn: (n) => `§7[§c${n}§4✪§7]` },
  { req: 1700, fn: (n) => `§7[§d${n}§5✪§7]` },
  { req: 1800, fn: (n) => `§7[§9${n}§1✪§7]` },
  { req: 1900, fn: (n) => `§7[§5${n}§8✪§7]` },
  {
    req: 2000,
    fn: (n) => {
      const nums = [...n.toString()];
      return `§8[§7${nums[0]}§f${nums[1]}${nums[2]}§7${nums[3]}✪§8]`;
    },
  },
  {
    req: 2100,
    fn: (n) => {
      const nums = [...n.toString()];
      return `§f[${nums[0]}§e${nums[1]}${nums[2]}§6${nums[3]}§l⚝§r§6]`;
    },
  },
  {
    req: 2200,
    fn: (n) => {
      const nums = [...n.toString()];
      return `§6[${nums[0]}§f${nums[1]}${nums[2]}§b${nums[3]}§3§l⚝§r§3]`;
    },
  },
  {
    req: 2300,
    fn: (n) => {
      const nums = [...n.toString()];
      return `§5[${nums[0]}§d${nums[1]}${nums[2]}§6${nums[3]}§e§l⚝§r§e]`;
    },
  },
  {
    req: 2400,
    fn: (n) => {
      const nums = [...n.toString()];
      return `§b[${nums[0]}§f${nums[1]}${nums[2]}§7${nums[3]}§l⚝§r§8]`;
    },
  },
  {
    req: 2500,
    fn: (n) => {
      const nums = [...n.toString()];
      return `§f[${nums[0]}§a${nums[1]}${nums[2]}§2${nums[3]}§l⚝§r§2]`;
    },
  },
  {
    req: 2600,
    fn: (n) => {
      const nums = [...n.toString()];
      return `§4[${nums[0]}§c${nums[1]}${nums[2]}§d${nums[3]}§l⚝§r§d]`;
    },
  },
  {
    req: 2700,
    fn: (n) => {
      const nums = [...n.toString()];
      return `§e[${nums[0]}§f${nums[1]}${nums[2]}§8${nums[3]}§l⚝§r§8]`;
    },
  },
  {
    req: 2800,
    fn: (n) => {
      const nums = [...n.toString()];
      return `§a[${nums[0]}§2${nums[1]}${nums[2]}§6${nums[3]}§l⚝§r§e]`;
    },
  },
  {
    req: 2900,
    fn: (n) => {
      const nums = [...n.toString()];
      return `§b[${nums[0]}§3${nums[1]}${nums[2]}§9${nums[3]}§l⚝§r§1]`;
    },
  },
  {
    req: 3000,
    fn: (n) => {
      const nums = [...n.toString()];
      return `§e[${nums[0]}§6${nums[1]}${nums[2]}§c${nums[3]}§l⚝§r§4]`;
    },
  },
  {
    req: 3100,
    fn: (n) => {
      const nums = [...n.toString()];
      return `§9[${nums[0]}§3${nums[1]}${nums[2]}§6${nums[3]}§l✥§r§e]`;
    },
  },
  {
    req: 3200,
    fn: (n) => {
      const nums = [...n.toString()];
      return `§c[§4${nums[0]}§7${nums[1]}${nums[2]}§4${nums[3]}§c§l✥§r§c]`;
    },
  },
  {
    req: 3300,
    fn: (n) => {
      const nums = [...n.toString()];
      return `§9[${nums[0]}${nums[1]}§d${nums[2]}§c${nums[3]}§l✥§r§4]`;
    },
  },
  {
    req: 3400,
    fn: (n) => {
      const nums = [...n.toString()];
      return `§2[§a${nums[0]}§d${nums[1]}${nums[2]}§5${nums[3]}§l✥§r§2]`;
    },
  },
  {
    req: 3500,
    fn: (n) => {
      const nums = [...n.toString()];
      return `§c[${nums[0]}§4${nums[1]}${nums[2]}§2${nums[3]}§a§l✥§r§a]`;
    },
  },
  {
    req: 3600,
    fn: (n) => {
      const nums = [...n.toString()];
      return `§a[${nums[0]}${nums[1]}§b${nums[2]}§9${nums[3]}§l✥§r§1]`;
    },
  },
  {
    req: 3700,
    fn: (n) => {
      const nums = [...n.toString()];
      return `§4[${nums[0]}§c${nums[1]}${nums[2]}§b${nums[3]}§3§l✥§r§3]`;
    },
  },
  {
    req: 3800,
    fn: (n) => {
      const nums = [...n.toString()];
      return `§1[${nums[0]}§9${nums[1]}§5${nums[2]}${nums[3]}§d§l✥§r§1]`;
    },
  },
  {
    req: 3900,
    fn: (n) => {
      const nums = [...n.toString()];
      return `§c[${nums[0]}§a${nums[1]}${nums[2]}§3${nums[3]}§9§l✥§r§9]`;
    },
  },
  {
    req: 4000,
    fn: (n) => {
      const nums = [...n.toString()];
      return `§5[${nums[0]}§c${nums[1]}${nums[2]}§6${nums[3]}§l✥§r§e]`;
    },
  },
  {
    req: 4100,
    fn: (n) => {
      const nums = [...n.toString()];
      return `§e[${nums[0]}§6${nums[1]}§c${nums[2]}§d${nums[3]}§l✥§r§5]`;
    },
  },
  {
    req: 4200,
    fn: (n) => {
      const nums = [...n.toString()];
      return `§1[§9${nums[0]}§3${nums[1]}§b${nums[2]}§f${nums[3]}§7§l✥§r§7]`;
    },
  },
  {
    req: 4300,
    fn: (n) => {
      const nums = [...n.toString()];
      return `§0[§5${nums[0]}§8${nums[1]}${nums[2]}§5${nums[3]}§l✥§r§0]`;
    },
  },
  {
    req: 4400,
    fn: (n) => {
      const nums = [...n.toString()];
      return `§2[${nums[0]}§a${nums[1]}§e${nums[2]}§6${nums[3]}§5§l✥§r§d]`;
    },
  },
  {
    req: 4500,
    fn: (n) => {
      const nums = [...n.toString()];
      return `§f[${nums[0]}§b${nums[1]}${nums[2]}§2${nums[3]}§l✥§r§2]`;
    },
  },
  {
    req: 4600,
    fn: (n) => {
      const nums = [...n.toString()];
      return `§2[§b${nums[0]}§e${nums[1]}${nums[2]}§6${nums[3]}§d§l✥§r§5]`;
    },
  },
  {
    req: 4700,
    fn: (n) => {
      const nums = [...n.toString()];
      return `§f[§4${nums[0]}§c${nums[1]}${nums[2]}§9${nums[3]}§1§l✥§r§9]`;
    },
  },
  {
    req: 4800,
    fn: (n) => {
      const nums = [...n.toString()];
      return `§5[${nums[0]}§c${nums[1]}§6${nums[2]}§e${nums[3]}§b§l✥§r§3]`;
    },
  },
  {
    req: 4900,
    fn: (n) => {
      const nums = [...n.toString()];
      return `§2[§a${nums[0]}§f${nums[1]}${nums[2]}§a${nums[3]}§l✥§r§2]`;
    },
  },
  {
    req: 5000,
    fn: (n) => {
      const nums = [...n.toString()];
      return `§4[${nums[0]}§5${nums[1]}§9${nums[2]}${nums[3]}§1§l✥§r§0]`;
    },
  },
];

export const getFormattedLevel = (star: number): string => {
  star = Math.floor(star);
  return findScore(PRESTIGE_COLORS, star).fn(star);
};
