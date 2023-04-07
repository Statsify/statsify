/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Color } from "../../../color";

export const getLevel = (xp: number): number => {
  const totalXp = [0, 2, 7, 15, 25, 50, 100, 200, 350, 600, 1000, 1500];
  if (xp >= 15_000) return Math.floor((xp - 15_000) / 10_000 + 12);

  const level = totalXp.findIndex((x) => x * 10 - xp > 0);
  return level;
};

export const getLevelProgress = (xp: number): { current: number; total: number } => {
  const totalXp = [0, 2, 7, 15, 25, 50, 100, 200, 350, 600, 1000, 1500];
  const xpToNextLvl = [0, 2, 5, 8, 10, 25, 50, 100, 150, 250, 400, 500]; // * 10
  let currentLevelXp = xp;

  if (xp >= 15_000) {
    currentLevelXp -= 15_000;
    if (currentLevelXp === 0)
      return {
        current: 0,
        total: 10_000,
      };
    if (currentLevelXp > 10_000) {
      do {
        currentLevelXp -= 10_000;
      } while (currentLevelXp >= 10_000);
    }

    return {
      current: currentLevelXp,
      total: 10_000,
    };
  }

  const totalXptoNextLevel = xpToNextLvl[totalXp.findIndex((x) => x * 10 - xp > 0)] * 10;

  for (const element of xpToNextLvl) {
    if (currentLevelXp - element * 10 < 0) break;
    currentLevelXp -= element * 10;
  }

  return {
    current: currentLevelXp,
    total: totalXptoNextLevel,
  };
};

export const getFormattedLevel = (level: number, star: string) => {
  level = Math.floor(level);
  const prestigeColors = [
    { req: 0, fn: (n: number, m: string) => `§7[${n}${m}]` },
    { req: 5, fn: (n: number, m: string) => `§f[${n}${m}]` },
    { req: 10, fn: (n: number, m: string) => `§6[${n}${m}]` },
    { req: 15, fn: (n: number, m: string) => `§b[${n}${m}]` },
    { req: 20, fn: (n: number, m: string) => `§2[${n}${m}]` },
    { req: 25, fn: (n: number, m: string) => `§3[${n}${m}]` },
    { req: 30, fn: (n: number, m: string) => `§4[${n}${m}]` },
    { req: 35, fn: (n: number, m: string) => `§d[${n}${m}]` },
    { req: 40, fn: (n: number, m: string) => `§9[${n}${m}]` },
    { req: 45, fn: (n: number, m: string) => `§5[${n}${m}]` },
    {
      req: 50,
      fn: (n: number, m: string) => {
        const nums = [...n.toString()];
        if (m.length > 1) {
          const stars = [...m.toString()];
          return `§c[§6${nums[0]}§e${nums[1]}§a${stars[0]}§b${stars[1]}§d${stars[2]}§5]`;
        } else {
          return `§c[§6${nums[0]}§e${nums[1]}§a${m}§b]`;
        }
      },
    },
    {
      req: 55,
      fn: (n: number, m: string) => `§7[§f${n}${m}§7]`,
    },
    {
      req: 60,
      fn: (n: number, m: string) => `§4[§c${n}${m}§4]`,
    },
    {
      req: 65,
      fn: (n: number, m: string) => `§c[§f${n}${m}§c]`,
    },

    {
      req: 70,
      fn: (n: number, m: string) => `§e[§6${n}${m}§e]`,
    },

    {
      req: 75,
      fn: (n: number, m: string) => `§f[§9${n}${m}§f]`,
    },

    {
      req: 80,
      fn: (n: number, m: string) => `§f[§b${n}${m}§f]`,
    },

    {
      req: 85,
      fn: (n: number, m: string) => `§f[§3${n}${m}§f]`,
    },

    {
      req: 90,
      fn: (n: number, m: string) => `§a[§3${n}${m}§a]`,
    },

    {
      req: 95,
      fn: (n: number, m: string) => `§c[§e${n}${m}§c]`,
    },

    {
      req: 100,
      fn: (n: number, m: string) => `§9[§1${n}${m}§9]`,
    },

    {
      req: 105,
      fn: (n: number, m: string) => `§6[§c${n}${m}§6]`,
    },

    {
      req: 110,
      fn: (n: number, m: string) => `§1[§b${n}${m}§1]`,
    },

    {
      req: 115,
      fn: (n: number, m: string) => `§8[§7${n}${m}§8]`,
    },
    {
      req: 120,
      fn: (n: number, m: string) => `§d[§5${n}${m}§d]`,
    },

    {
      req: 125,
      fn: (n: number, m: string) => `§f[§e${n}${m}§f]`,
    },

    {
      req: 130,
      fn: (n: number, m: string) => `§c[§e${n}${m}§c]`,
    },
    {
      req: 135,
      fn: (n: number, m: string) => `§6[§c${n}${m}§6]`,
    },
    {
      req: 140,
      fn: (n: number, m: string) => `§a[§c${n}${m}§a]`,
    },

    {
      req: 145,
      fn: (n: number, m: string) => `§a[§b${n}${m}§a]`,
    },
    {
      req: 150,
      fn: (n: number, m: string) => {
        const nums = [...n.toString()];
        if (m.length > 1) {
          const stars = [...m.toString()];
          return `§c[§l§6${nums[0]}§e${nums[1]}§a${nums[2]}§b${stars[0]}§d${stars[1]}§5${stars[2]}§r§c]`;
        } else {
          return `§c[§l§6${nums[0]}§e${nums[1]}§a${nums[2]}§b${m}§r§d]`;
        }
      },
    },
  ];

  const index = prestigeColors.findIndex(
    ({ req }, index, arr) =>
      level >= req && ((arr[index + 1] && level < arr[index + 1].req) || !arr[index + 1])
  );
  return prestigeColors[index == -1 ? 0 : index].fn(level, star);
};

export const getPresColor = (star: number): Color => {
  const colors = [
    { level: 0, color: new Color("GRAY") },
    { level: 5, color: new Color("WHITE") },
    { level: 10, color: new Color("GOLD") },
    { level: 15, color: new Color("AQUA") },
    { level: 20, color: new Color("DARK_GREEN") },
    { level: 25, color: new Color("DARK_AQUA") },
    { level: 30, color: new Color("DARK_RED") },
    { level: 35, color: new Color("LIGHT_PURPLE") },
    { level: 40, color: new Color("BLUE") },
    { level: 45, color: new Color("DARK_PURPLE") },
    { level: 50, color: new Color("RED") },
  ];

  const index = colors.findIndex(
    ({ level }, index, arr) =>
      star >= level &&
      ((arr[index + 1] && star < arr[index + 1].level) || !arr[index + 1])
  );

  return colors[index == -1 ? 0 : index].color;
};

const MYTHICAL_KIT = "kit_mythical_";
const TEAMS = "team_";
const SOLO = "solo_";

const removeAllBeforePrefix = (str: string, prefix: string) => {
  const lastIndex = str.lastIndexOf(prefix);
  if (lastIndex === -1) return str;
  return str.slice(Math.max(0, lastIndex + prefix.length));
};

export const parseKit = (kit = "default") => {
  const parsedSolo = removeAllBeforePrefix(kit, SOLO);
  const parsedTeam = removeAllBeforePrefix(parsedSolo, TEAMS);
  return parsedTeam.replace(MYTHICAL_KIT, "").replaceAll("-", "_");
};
