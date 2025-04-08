/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { findScore } from "@statsify/util";

const XP_TO_NEXT_LEVEL = [0, 10, 25, 50, 75, 100, 250, 500, 750, 1000, 1250, 1500, 1750, 2000, 2500, 3000, 3500, 4000, 4500];

const TOTAL_XP = XP_TO_NEXT_LEVEL
  .map((_, index) => XP_TO_NEXT_LEVEL
    .slice(0, index + 1)
    .reduce((acc, xp) => acc + xp, 0)
  );

const CONSTANT_LEVELING_XP = XP_TO_NEXT_LEVEL.reduce((acc, xp) => acc + xp, 0);
const CONSTANT_XP_TO_NEXT_LEVEL = 5000;

export const getLevel = (xp: number): number => {
  if (xp >= CONSTANT_LEVELING_XP) {
    return Math.floor((xp - CONSTANT_LEVELING_XP) / CONSTANT_XP_TO_NEXT_LEVEL) + XP_TO_NEXT_LEVEL.length;
  }

  const level = TOTAL_XP.findIndex((x) => x > xp);
  return level;
};

export const getLevelProgress = (xp: number): { current: number; total: number } => {
  let current = xp;

  if (xp >= CONSTANT_LEVELING_XP) {
    current -= CONSTANT_LEVELING_XP;

    return {
      current: current % CONSTANT_XP_TO_NEXT_LEVEL,
      total: CONSTANT_XP_TO_NEXT_LEVEL,
    };
  }

  for (const element of XP_TO_NEXT_LEVEL) {
    if (current < element) break;
    current -= element;
  }

  return {
    current,
    total: XP_TO_NEXT_LEVEL[TOTAL_XP.findIndex((x) => x > xp)],
  };
};

interface Prestige {
  req: number;
  fn: (level: number, emblem?: string) => string;
}

const PRESTIGE_SCHEMES: Prestige[] = [
  { req: 0, fn: (n, m = "") => `§7[${n}${m}]` },
  { req: 10, fn: (n, m = "") => `§f[${n}${m}]` },
  { req: 20, fn: (n, m = "") => `§6[${n}${m}]` },
  { req: 30, fn: (n, m = "") => `§b[${n}${m}]` },
  { req: 40, fn: (n, m = "") => `§c[${n}${m}]` },
  { req: 50, fn: (n, m = "") => `§d[${n}${m}]` },
  { req: 60, fn: (n, m = "") => `§5[${n}${m}]` },
  { req: 70, fn: (n, m = "") => `§9[${n}${m}]` },
  { req: 80, fn: (n, m = "") => `§e[${n}${m}]` },
  { req: 90, fn: (n, m = "") => `§a[${n}${m}]` },
  { req: 100, fn: formatDigitColorLevel(["§c", "§6", "§e", "§a", "§b", "§d"]) },
  { req: 110, fn: (n, m = "") => `§4[§c${n}${m}§4]` },
  { req: 120, fn: (n, m = "") => `§1[${n}${m}]` },
  { req: 130, fn: (n, m = "") => `§c[§f${n}${m}§c]` },
  { req: 140, fn: (n, m = "") => `§4[${n}${m}]` },
  { req: 150, fn: (n, m = "") => `§6[§e${n}${m}§6]` },
  { req: 160, fn: (n, m = "") => `§2[${n}${m}]` },
  { req: 170, fn: (n, m = "") => `§1[§9${n}${m}§1]` },
  { req: 180, fn: (n, m = "") => `§3[${n}${m}]` },
  { req: 190, fn: (n, m = "") => `§4[§e${n}${m}§4]` },
  { req: 200, fn: formatDigitColorLevel(["§6", "§e", "§a", "§b", "§d", "§c"]) },
  { req: 210, fn: (n, m = "") => `§5[§d${n}${m}§5]` },
  { req: 220, fn: (n, m = "") => `§8[${n}${m}]` },
  { req: 230, fn: (n, m = "") => `§d[§b${n}${m}]§d` },
  { req: 240, fn: (n, m = "") => `§0[${n}${m}]` },
  { req: 250, fn: formatDigitColorLevel(["§c", "§6", "§e", "§e", "§6", "§c"]) },
  { req: 260, fn: formatDigitColorLevel(["§0", "§e", "§6", "§6", "§e", "§0"]) },
  { req: 270, fn: (n, m = "") => `§1[§3${n}${m}§1]` },
  { req: 280, fn: formatDigitColorLevel(["§a", "§2", "§a", "§e", "§a", "§2"]) },
  { req: 290, fn: (n, m = "") => `§9[§b${n}${m}§9]` },
  { req: 300, fn: formatDigitColorLevel(["§e", "§a", "§b", "§d", "§c", "§6"]) },
  { req: 310, fn: (n, m = "") => `§8[§7${n}${m}§8]` },
  { req: 320, fn: (n, m = "") => `§d[§a${n}${m}§d]` },
  { req: 330, fn: (n, m = "") => `§e[§c${n}${m}§e]` },
  { req: 340, fn: formatDigitColorLevel(["§b", "§a", "§b", "§d", "§a", "§a"]) },
  { req: 350, fn: formatDigitColorLevel(["§f", "§f", "§e", "§e", "§6", "§6"]) },
  { req: 360, fn: formatDigitColorLevel(["§9", "§3", "§b", "§f", "§e", "§e"]) },
  { req: 370, fn: formatDigitColorLevel(["§e", "§e", "§f", "§f", "§8", "§8"]) },
  { req: 380, fn: formatDigitColorLevel(["§c", "§f", "§c", "§c", "§f", "§c"]) },
  { req: 390, fn: (n, m = "") => `§2[§a${n}${m}§2]` },
  { req: 400, fn: formatDigitColorLevel(["§a", "§b", "§d", "§c", "§6", "§e"]) },
  { req: 410, fn: (n, m = "") => `§3[§b${n}${m}§3]` },
  { req: 420, fn: formatDigitColorLevel(["§0", "§5", "§8", "§8", "§5", "§0"]) },
  { req: 430, fn: formatDigitColorLevel(["§6", "§6", "§f", "§f", "§b", "§3"]) },
  { req: 440, fn: formatDigitColorLevel(["§a", "§2", "§a", "§e", "§f", "§f"]) },
  { req: 450, fn: formatDigitColorLevel(["§4", "§4", "§c", "§6", "§e", "§f"]) },
  { req: 460, fn: formatDigitColorLevel(["§9", "§b", "§3", "§d", "§5", "§4"]) },
  { req: 470, fn: formatDigitColorLevel(["§0", "§8", "§7", "§f", "§7", "§8"]) },
  { req: 480, fn: formatDigitColorLevel(["§1", "§1", "§9", "§3", "§b", "§f"]) },
  { req: 490, fn: formatDigitColorLevel(["§9", "§b", "§f", "§f", "§c", "§4"]) },
  { req: 500, fn: formatDigitColorLevel(["§b", "§d", "§c", "§6", "§e", "§a"]) },
];

function formatDigitColorLevel(
  colors: [string, string, string, string, string, string]
): (level: number, emblem?: string) => string {
  return (level: number, emblem?: string) => {
    const formattedEmblem = emblem ? `${colors.at(-2)}${emblem}` : "";
    const formattedLevel = [...`${level}`]
      .reverse()
      .map((digit, index) => `${colors[3 - index]}${digit}`)
      .reverse()
      .join("");

    return `${colors[0]}[${formattedLevel}${formattedEmblem}${colors.at(-1)}]`;
  };
}

const PRESTIGE_EMBLEMS = [
  { req: 0, emblem: "✯" },
  { req: 50, emblem: "^_^" },
  { req: 100, emblem: "@_@" },
  { req: 150, emblem: "δvδ" },
  { req: 200, emblem: "zz_zz" },
  { req: 250, emblem: "■·■" },
  { req: 300, emblem: "ಠ_ಠ" },
  { req: 350, emblem: "o...0" },
  { req: 400, emblem: ">u<" },
  { req: 450, emblem: "v-v" },
  { req: 500, emblem: "༼つ◕_◕༽つ" },
];

export const getIntendedLevelFormatted = (level: number) => {
  level = Math.floor(level);
  const { emblem } = findScore(PRESTIGE_EMBLEMS, level);
  const { fn } = findScore(PRESTIGE_SCHEMES, level);
  return fn(level, emblem);
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
