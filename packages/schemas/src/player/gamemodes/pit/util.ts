/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { romanNumeral } from "@statsify/util";

const XP_MAP = [15, 30, 50, 75, 125, 300, 600, 800, 900, 1000, 1200, 1500];

const PRESTIGES = [
  100, 110, 120, 130, 140, 150, 175, 200, 250, 300, 400, 500, 600, 700, 800, 900, 1000,
  1200, 1400, 1600, 1800, 2000, 2400, 2800, 3200, 3600, 4000, 4500, 5000, 7500, 10_000,
  10_100, 10_100, 10_100, 10_100, 10_100, 20_000, 30_000, 40_000, 50_000, 75_000, 100_000,
  125_000, 150_000, 175_000, 200_000, 300_000, 500_000, 1_000_000, 5_000_000, 10_000_000,
];

const PRESTIGE_XP_REQUIREMENTS = [
  65_950, 138_510, 217_680, 303_430, 395_760, 494_700, 610_140, 742_040, 906_930,
  1_104_780, 1_368_580, 1_698_330, 2_094_030, 2_555_680, 3_083_280, 3_676_830, 4_336_330,
  5_127_730, 6_051_030, 7_106_230, 8_293_330, 9_612_330, 11_195_130, 13_041_730,
  15_152_130, 17_526_330, 20_164_330, 23_132_080, 26_429_580, 31_375_830, 37_970_830,
  44_631_780, 51_292_730, 57_953_680, 64_614_630, 71_275_580, 84_465_580, 104_250_580,
  130_630_580, 163_605_580, 213_068_080, 279_018_080, 361_455_580, 460_380_580,
  575_793_080, 707_693_080, 905_543_080, 1_235_293_080, 1_894_793_080, 5_192_293_080,
  11_787_293_080,
];

const PRESTIGE_COLORS = ["7", "9", "e", "6", "c", "5", "d", "f", "b", "1", "0", "3", "4"];

const LEVEL_COLORS = [
  "7",
  "9",
  "3",
  "2",
  "a",
  "e",
  "l§6",
  "l§c",
  "l§4",
  "l§5",
  "l§d",
  "l§f",
  "l§b",
];

export type Bounty = {
  amount: number;
  remainingTicks: number;
  issuer: string;
  timestamp: number;
};

export const getPrestige = (xp: number) => {
  for (let i = 0; i < 50; i++) {
    if (xp <= PRESTIGE_XP_REQUIREMENTS[i]) {
      return i;
    }
  }

  return PRESTIGE_XP_REQUIREMENTS[1];
};

export const getPrestigeReq = (prestige: number) =>
  prestige > -1 ? PRESTIGE_XP_REQUIREMENTS[prestige] : 0;

export const getLevel = (pres: number, xp: number) => {
  let level = 120;

  for (let xpRemaining = PRESTIGE_XP_REQUIREMENTS[pres]; xpRemaining > xp; ) {
    level -= 1;
    xpRemaining -= Math.ceil((XP_MAP[Math.floor(level / 10)] * PRESTIGES[pres]) / 100);
  }

  return level ?? 0;
};

export const getLevelColor = (level: number) =>
  LEVEL_COLORS[Math.floor(level / 10)] ?? "7";

export const getPrestigeColor = (prestige: number) => {
  switch (prestige) {
    case 0:
      return PRESTIGE_COLORS[0];
    case 48:
      return PRESTIGE_COLORS[12];
    default:
      return PRESTIGE_COLORS[Math.floor((prestige + 5) / 5)];
  }
};

export const getBounty = (bounties: Bounty[]) =>
  bounties ? bounties.reduce((p, c) => p + c.amount, 0) : 0;

export const getLevelFormatted = (level: number, prestige: number) => {
  const presColor = getPrestigeColor(prestige);
  const levelColor = getLevelColor(level);

  return `§${presColor}[${
    prestige > 0 ? `§e${romanNumeral(prestige)}§${presColor}-` : ""
  }§${levelColor}${level}§r§${presColor}]`;
};
