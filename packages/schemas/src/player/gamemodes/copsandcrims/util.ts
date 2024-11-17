/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { findScore, minecraftColors } from "@statsify/util";
import { rainbow } from "#prefixes";

const MAX_LEVEL = 50;
const INDIVIDUAL_LEVEL_REQUIREMENTS = [
  25, 50, 100, 150, 200, 250, 300, 350, 400, 500, 600, 700, 800, 900, 1000, 1250, 1500, 1750, 2000, 2200, 2400, 2600,
  2800, 3000,
];

export const LEVEL_REQUIREMENTS: { req: number }[] = [];

let sum = 0;
for (let level = 0; level < MAX_LEVEL; level++) {
  LEVEL_REQUIREMENTS.push({ req: sum });
  const requirement = INDIVIDUAL_LEVEL_REQUIREMENTS[Math.min(level, INDIVIDUAL_LEVEL_REQUIREMENTS.length - 1)];
  sum += requirement;
}

const PRESTIGE_SCHEME = [
  { req: 0, scheme: "gray" },
  { req: 20, scheme: "dark_green" },
  { req: 25, scheme: "dark_aqua" },
  { req: 30, scheme: "dark_blue" },
  { req: 35, scheme: "dark_purple" },
  { req: 40, scheme: "dark_red" },
  { req: 45, scheme: "black" },
  { req: 50, scheme: "chroma" },
];

const PRESTIGE_EMBLEMS = [
  { req: 0, emblem: "rookie" },
  { req: 1, emblem: "crims" },
  { req: 1, emblem: "cops" },
  { req: 2, emblem: "grenade" },
  { req: 3, emblem: "firebomb" },
  { req: 4, emblem: "hp" },
  { req: 7, emblem: "cargo" },
  { req: 8, emblem: "headshot" },
  { req: 9, emblem: "c4" },
  { req: 12, emblem: "fire" },
  { req: 13, emblem: "landing_pad" },
  { req: 14, emblem: "double_star" },
  { req: 17, emblem: "wire_cutters" },
  { req: 19, emblem: "peace" },
  { req: 22, emblem: "airstrike" },
  { req: 24, emblem: "shield" },
  { req: 27, emblem: "bullet" },
  { req: 29, emblem: "raining_bullets" },
  { req: 32, emblem: "radar" },
  { req: 34, emblem: "triple_star" },
  { req: 37, emblem: "smoke" },
  { req: 39, emblem: "flare" },
  { req: 42, emblem: "death" },
  { req: 44, emblem: "lightning" },
  { req: 47, emblem: "king" },
  { req: 49, emblem: "#1" },
  { req: 50, emblem: "rage" },
];

const DEFAULT_SCHEME = "gray";
const COLOR_SCHEMES = Object.fromEntries(minecraftColors.map((color) => [color.id.toLowerCase(), (level: number, emblem: string) => `${color.code}[${level}${emblem}]`]));
const SCHEME_MAP: Record<string, (level: number, emblem: string) => string> = {
  ...COLOR_SCHEMES,
  chroma: (level, emblem) => rainbow(`[${level}${emblem}]`),
};

const DEFAULT_EMBLEM = "rookie";
const EMBLEM_MAP: Record<string, string> = {
  "rookie": "▶",
  "incomplete": "鉴",
  "frown": "☹",
  "gem": "♦",
  "decoy": "鉺",
  "complete": "鉵",
  "spaceship": "⥈",
  "target": "⦾",
  "biohazard": "☣",
  "infinite": "∞",
  "lucky": "☘",
  "warning": "⚠",
  "trident": "♆",
  "star": "✰",
  "right_angle": "⧉",
  "balance": "☯",
  "ballista": "⚜",
  "broken_bones": "鉱鉲",
  "budding": "✿",
  "cheeky": "ツ",
  "ghoul": "ௐ",
  "phone": "✆",
  "surrender": "⚑",
  "serious": "ಠ_ಠ",
  "helmet": "鉽",
  "armor": "鉼",
  "knife": "鉯",
  "smg": "鉢",
  "pistol": "鉠",
  "bullpup": "銒銓",
  "scoped_rifle": "銖銗",
  "auto_shotgun": "銚銛",
  "handgun": "銞",
  "sniper": "鉪鉫",
  "magnum": "鉡",
  "carbine": "鉦鉧",
  "rifle": "鉨鉩",
  "shotgun": "鉤鉥",
  "crims": "銑",
  "cops": "銐",
  "grenade": "鉬",
  "firebomb": "鉹",
  "hp": "銀",
  "cargo": "⧈",
  "headshot": "鉰",
  "c4": "鉶",
  "fire": "鉳",
  "landing_pad": "✥",
  "double_star": "⁑",
  "wire_cutters": "鉻",
  "peace": "✌",
  "airstrike": "✈",
  "shield": "❂",
  "bullet": "✏",
  "raining_bullets": "☂",
  "radar": "鉭",
  "triple_star": "⁂",
  "smoke": "鉸",
  "flare": "҉",
  "death": "☠",
  "lightning": "⚡",
  "king": "♔",
  "#1": "❶",
  "rage": "(╯°□°)╯",
};

// The "intended" formatted level is the level formatted with the highest prestige emblem/scheme equipped
export function getIntendedLevelFormatted(level: number) {
  const { scheme } = findScore(PRESTIGE_SCHEME, level);
  const { emblem } = findScore(PRESTIGE_EMBLEMS, level);
  return SCHEME_MAP[scheme](level, EMBLEM_MAP[emblem]);
}

export function getFormattedLevel(
  level: number,
  selectedScheme: string | undefined,
  selectedEmblem: string | undefined
) {
  selectedScheme ??= DEFAULT_SCHEME;
  selectedEmblem ??= DEFAULT_EMBLEM;
  // add a default in case hypixel adds a new scheme or emblem that isn't added to the schema yet
  const schemeFormatter = SCHEME_MAP[selectedScheme.replace("scheme_", "")] ?? SCHEME_MAP[DEFAULT_SCHEME];
  const emblem = EMBLEM_MAP[selectedEmblem.replace("emblem_", "")] ?? EMBLEM_MAP[DEFAULT_EMBLEM];
  return schemeFormatter(level, emblem);
}
