/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Progression } from "#progression";
import { findScore } from "@statsify/util";

const XP_TO_NEXT_LEVEL = [
  0, 10, 25, 50, 75, 100, 250, 500, 750, 1000, 1250, 1500, 1750, 2000, 2500, 3000, 3500, 4000, 4500,
];

const TOTAL_XP = XP_TO_NEXT_LEVEL
  .map((_, index) => XP_TO_NEXT_LEVEL
    .slice(0, index + 1)
    .reduce((acc, xp) => acc + xp, 0)
  );

// After this XP the level requirement will always be CONSTANT_XP_TO_NEXT_LEVEL
const CONSTANT_LEVELING_XP = XP_TO_NEXT_LEVEL.reduce((acc, xp) => acc + xp, 0);
const CONSTANT_XP_TO_NEXT_LEVEL = 5000;
const LEVEL_MAX = 500;

export const getLevel = (xp: number): number => {
  if (xp >= CONSTANT_LEVELING_XP) {
    const level = Math.floor((xp - CONSTANT_LEVELING_XP) / CONSTANT_XP_TO_NEXT_LEVEL) +
      // Add on the levels from the variable xp level requirements
      XP_TO_NEXT_LEVEL.length;

    return Math.min(level, LEVEL_MAX);
  }

  const level = TOTAL_XP.findIndex((x) => x > xp);
  return level;
};

export const getLevelProgress = (xp: number, level: number): Progression => {
  let current = xp;

  if (xp >= CONSTANT_LEVELING_XP) {
    current -= CONSTANT_LEVELING_XP;
    current %= CONSTANT_XP_TO_NEXT_LEVEL;

    return new Progression(
      current,
      // 0 indicates that the level is maxed out
      level >= LEVEL_MAX ? 0 : CONSTANT_XP_TO_NEXT_LEVEL
    );
  }

  for (const element of XP_TO_NEXT_LEVEL) {
    if (current < element) break;
    current -= element;
  }

  return new Progression(
    current,
    XP_TO_NEXT_LEVEL[TOTAL_XP.findIndex((x) => x > xp)]
  );
};

const EMBLEM_MAP = {
  default: "✯",
  carrots_for_eyes: "^_^",
  formerly_known: "@_@",
  reflex_angle_eyebrows: "δvδ",
  two_tired: "zz_zz",
  slime: "■·■",
  same_great_taste: "ಠ_ಠ",
  misaligned: "o...0",
  converge_on_tongue: ">u<",
  no_evil: "v-v",
  three_fourths_jam: "༼つ◕_◕༽つ",
  alpha: "α",
  omega: "Ω",
  rich: "$",
  podium: "π",
  fallen_crest: "☬",
  null_icon: "∅",
  sigma: "Σ",
  delta: "δ",
  florin: "ƒ",
};

type Scheme = (level: number, emblem?: string) => string;

const SCHEME_MAP = {
  "stone_prestige": (n, m = "") => `§7[${n}${m}]`,
  "iron_prestige": (n, m = "") => `§f[${n}${m}]`,
  "gold_prestige": (n, m = "") => `§6[${n}${m}]`,
  "diamond_prestige": (n, m = "") => `§b[${n}${m}]`,
  "ruby_prestige": (n, m = "") => `§c[${n}${m}]`,
  "crystal_prestige": (n, m = "") => `§d[${n}${m}]`,
  "amethyst_prestige": (n, m = "") => `§5[${n}${m}]`,
  "opal_prestige": (n, m = "") => `§9[${n}${m}]`,
  "topaz_prestige": (n, m = "") => `§e[${n}${m}]`,
  "jade_prestige": (n, m = "") => `§a[${n}${m}]`,
  "mythic_i_prestige": formatDigitColorLevel(["§c", "§6", "§e", "§a", "§b", "§d"]),
  "bloody_prestige": (n, m = "") => `§4[§c${n}${m}§4]`,
  "cobalt_prestige": (n, m = "") => `§1[${n}${m}]`,
  "content_prestige": (n, m = "") => `§c[§f${n}${m}§c]`,
  "crimson_prestige": (n, m = "") => `§4[${n}${m}]`,
  "firefly_prestige": (n, m = "") => `§6[§e${n}${m}§6]`,
  "emerald_prestige": (n, m = "") => `§2[${n}${m}]`,
  "abyss_prestige": (n, m = "") => `§1[§9${n}${m}§1]`,
  "sapphire_prestige": (n, m = "") => `§3[${n}${m}]`,
  "emergency_prestige": (n, m = "") => `§4[§e${n}${m}§4]`,
  "mythic_ii_prestige": formatDigitColorLevel(["§6", "§e", "§a", "§b", "§d", "§c"]),
  "mulberry_prestige": (n, m = "") => `§5[§d${n}${m}§5]`,
  "slate_prestige": (n, m = "") => `§8[${n}${m}]`,
  "blood_god_prestige": (n, m = "") => `§d[§b${n}${m}]§d`,
  "midnight_prestige": (n, m = "") => `§0[${n}${m}]`,
  "sun_prestige": formatDigitColorLevel(["§c", "§6", "§e", "§e", "§6", "§c"]),
  "bulb_prestige": formatDigitColorLevel(["§0", "§e", "§6", "§6", "§e", "§0"]),
  "twilight_prestige": (n, m = "") => `§1[§3${n}${m}§1]`,
  "natural_prestige": formatDigitColorLevel(["§a", "§2", "§a", "§e", "§a", "§2"]),
  "icile_prestige": (n, m = "") => `§9[§b${n}${m}§9]`,
  "mythic_iii_prestige": formatDigitColorLevel(["§e", "§a", "§b", "§d", "§c", "§6"]),
  "graphite_prestige": (n, m = "") => `§8[§7${n}${m}§8]`,
  "punk_prestige": (n, m = "") => `§d[§a${n}${m}§d]`,
  "meltdown_prestige": (n, m = "") => `§e[§c${n}${m}§e]`,
  "iridescent_prestige": formatDigitColorLevel(["§b", "§a", "§b", "§d", "§a", "§a"]),
  "marigold_prestige": formatDigitColorLevel(["§f", "§f", "§e", "§e", "§6", "§6"]),
  "beach_prestige": formatDigitColorLevel(["§9", "§3", "§b", "§f", "§e", "§e"]),
  "spark_prestige": formatDigitColorLevel(["§e", "§e", "§f", "§f", "§8", "§8"]),
  "target_prestige": formatDigitColorLevel(["§c", "§f", "§c", "§c", "§f", "§c"]),
  "limelight_prestige": (n, m = "") => `§2[§a${n}${m}§2]`,
  "mythic_iv_prestige": formatDigitColorLevel(["§a", "§b", "§d", "§c", "§6", "§e"]),
  "cerulean_prestige": (n, m = "") => `§3[§b${n}${m}§3]`,
  "magical_prestige": formatDigitColorLevel(["§0", "§5", "§8", "§8", "§5", "§0"]),
  "luminous_prestige": formatDigitColorLevel(["§6", "§6", "§f", "§f", "§b", "§3"]),
  "synthesis_prestige": formatDigitColorLevel(["§a", "§2", "§a", "§e", "§f", "§f"]),
  "burn_prestige": formatDigitColorLevel(["§4", "§4", "§c", "§6", "§e", "§f"]),
  "dramatic_prestige": formatDigitColorLevel(["§9", "§b", "§3", "§d", "§5", "§4"]),
  "radiant_prestige": formatDigitColorLevel(["§0", "§8", "§7", "§f", "§7", "§8"]),
  "tidal_prestige": formatDigitColorLevel(["§1", "§1", "§9", "§3", "§b", "§f"]),
  "firework_prestige": formatDigitColorLevel(["§9", "§b", "§f", "§f", "§c", "§4"]),
  "mythic_v_prestige": formatDigitColorLevel(["§b", "§d", "§c", "§6", "§e", "§a"]),

  "ancient": (n, m = "") => `§7[§8${n}${m}§7]`,
  "the_new_default": (n, m = "") => `§6[§7${n}§6${m}]`,
  "the_new_new_default": (n, m = "") => `§b[§7${n}§b${m}]`,
  "launch": (n, m = "") => `§6[${n}§8${m}]`,
  "jersey": (n, m = "") => `§f[${n}§c${m}§f]`,
  "spotlight": (n, m = "") => `§0[§f${n}${m}§0]`,
  "earth": (n, m = "") => `§4[${n}§a${m}§4]`,
  "glint": (n, m = "") => `§d[${n}§b${m}§d]`,
  "strength": (n, m = "") => `§c[§d${n}${m}§c]`,
  "adrenaline": (n, m = "") => `§c[§a${n}${m}§c]`,
  "pumpkin": (n, m = "") => `§4[§6${n}${m}§4]`,
  "seashell": (n, m = "") => `§e[${n}§c${m}§e]`,
  "obsidian": (n, m = "") => `§8[${n}§5${m}§8 ]`,
  "support": (n, m = "") => `§f[§c${n}${m}§f]`,
  "mahogany": (n, m = "") => `§e[§6${n}${m}§e]`,
  "spell": formatDigitColorLevel(["§d", "§d", "§d", "§e", "§e", "§e"]),
  "pillar": (n, m = "") => `§f[§6${n}${m}§f]`,
  "agile": (n, m = "") => `§a[§f${n}${m}§a]`,
  "bone": (n, m = "") => `§f[§7${n}§f${m}]`,
  "slimy": (n, m = "") => `§a[§2${n}${m}§a]`,
  "holiday": (n, m = "") => `§4[§a${n}${m}§4]`,
  "iconic": (n, m = "") => `§0[${n}§f${m}§0]`,
  // TODO: Figure out name: Level-conic?
  "level-conic?": (n, m = "") => `§0[§f${n}§0${m}]`,
  "safari": formatDigitColorLevel(["§2", "§2", "§2", "§6", "§6", "§6"]),
  "gummy_worm": formatDigitColorLevel(["§c", "§c", "§c", "§b", "§b", "§b"]),
  "timetravel": formatDigitColorLevel(["§7", "§0", "§0", "§7", "§7", "§7"]),
  "horned": (n, m = "") => `§c[§8${n}${m}§c]`,
  "sandy": formatDigitColorLevel(["§6", "§e", "§f", "§e", "§6", "§e"]),
  "brutus": formatDigitColorLevel(["§9", "§9", "§8", "§8", "§f", "§f"]),
  "coinsmith": formatDigitColorLevel(["§e", "§8", "§8", "§8", "§6", "§e"]),
  "soulsmith": formatDigitColorLevel(["§7", "§b", "§b", "§f", "§f", "§f"]),
  "grand_slam": (n, m = "") => `§2[§a${n}§f${m}§2]`,
  "fleet": formatDigitColorLevel(["§0", "§c", "§e", "§a", "§a", "§0"]),
  "vengeance": (n, m = "") => `§0[§8${n}§e${m}§0]`,
  "dry": (n, m = "") => `§e[§f${n}§6${m}§e]`,
  "prickly": (n, m = "") => `§e[§a${n}§f${m}§e]`,
  "cast_iron": formatDigitColorLevel(["§7", "§7", "§8", "§8", "§3", "§3"]),
  "explosive": formatDigitColorLevel(["§c", "§c", "§e", "§e", "§6", "§6"]),
  "verdant": formatDigitColorLevel(["§2", "§a", "§a", "§e", "§6", "§e"]),
  "enchantment": formatDigitColorLevel(["§f", "§d", "§5", "§5", "§d", "§f"]),
  "void": (n, m = "") => `§8[§5${n}§d${m}§8]`,
  "fragile": (n, m = "") => `§0[§3${n}§a${m}§0]`,
  "mite": formatDigitColorLevel(["§3", "§2", "§8", "§2", "§a", "§3"]),
  "shulker": (n, m = "") => `§5[§e${n}§f${m}§5]`,
  "redstone": (n, m = "") => `§0[§c${n}§4${m}§0]`,
  "technical": formatDigitColorLevel(["§c", "§c", "§7", "§7", "§8", "§8"]),
  "melon": formatDigitColorLevel(["§a", "§2", "§a", "§2", "§e", "§a"]),
  "driftwood": formatDigitColorLevel(["§3", "§3", "§e", "§e", "§4", "§4"]),
  "river": (n, m = "") => `§2[§9${n}§a${m}§2]`,
  "mangrove": formatDigitColorLevel(["§4", "§4", "§c", "§c", "§2", "§2"]),
  "jeremiah": (n, m = "") => `§3[§6${n}§e${m}§3]`,
  "poppy": formatDigitColorLevel(["§c", "§4", "§0", "§0", "§4", "§c"]),
  "creeper": formatDigitColorLevel(["§f", "§f", "§a", "§a", "§2", "§2"]),
  "camo": formatDigitColorLevel(["§8", "§8", "§2", "§2", "§a", "§a"]),
  "first_aid": (n, m = "") => `§4[§f${n}§c${m}§4]`,
  "penguin": (n, m = "") => `§8[§9${n}§e${m}§8]`,
  "nether": formatDigitColorLevel(["§7", "§7", "§3", "§3", "§c", "§c"]),
  "wilderness": formatDigitColorLevel(["§2", "§2", "§3", "§3", "§6", "§6"]),
  "one_stone": formatDigitColorLevel(["§7", "§7", "§2", "§2", "§8", "§8"]),
  "circus": formatDigitColorLevel(["§c", "§c", "§6", "§6", "§2", "§2"]),
  "veracious": (n, m = "") => `§5[§f${n}§6${m}§5]`,
  "valiant": (n, m = "") => `§c[§f${n}§a${m}§c]`,
  "venerable": (n, m = "") => `§9[§f${n}§e${m}§9]`,
  "portal": formatDigitColorLevel(["§a", "§a", "§d", "§d", "§c", "§c"]),
  "sorcratic": (n, m = "") => `§8[§f${n}§e${m}§8]`,
  "parallel_dimension": formatDigitColorLevel(["§9", "§9", "§8", "§8", "§d", "§d"]),
  "tomb": formatDigitColorLevel(["§6", "§9", "§6", "§9", "§e", "§e"]),
  "irigation": formatDigitColorLevel(["§b", "§b", "§a", "§6", "§e", "§e"]),
  "snout": formatDigitColorLevel(["§5", "§0", "§d", "§d", "§0", "§5"]),
  "potato": formatDigitColorLevel(["§e", "§d", "§d", "§c", "§c", "§8"]),
  "royal": formatDigitColorLevel(["§9", "§9", "§6", "§6", "§c", "§c"]),
  "bubblegum": formatDigitColorLevel(["§5", "§d", "§d", "§f", "§f", "§d"]),
  "insane": (n, m = "") => `§7[§f${n}§6${m}§7]`,
  "smoke": formatDigitColorLevel(["§0", "§0", "§8", "§8", "§f", "§f"]),
  "scarlet": formatDigitColorLevel(["§8", "§8", "§4", "§4", "§c", "§c"]),
  "afterburn": formatDigitColorLevel(["§b", "§b", "§6", "§8", "§8", "§7"]),
  "normal": (n, m = "") => `§8[§7${n}§6${m}§8]`,
  "salmon": formatDigitColorLevel(["§c", "§c", "§3", "§3", "§2", "§2"]),
  "lucky": (n, m = "") => `§0[§2${n}§6${m}§0]`,
  "likeable": formatDigitColorLevel(["§4", "§4", "§c", "§c", "§f", "§f"]),
  "lunar": formatDigitColorLevel(["§f", "§f", "§f", "§7", "§8", "§8"]),
  "hypixel": (n, m = "") => `§4[§6${n}§e${m}§4]`,
  "sky": formatDigitColorLevel(["§e", "§e", "§b", "§b", "§f", "§f"]),
  "frosty": (n, m = "") => `§8[§f${n}§7${m}§8]`,
  "treasure": formatDigitColorLevel(["§6", "§6", "§f", "§f", "§e", "§e"]),
  "gemstone": formatDigitColorLevel(["§4", "§c", "§f", "§f", "§c", "§4"]),
  "dark_magic": formatDigitColorLevel(["§4", "§4", "§5", "§5", "§c", "§c"]),
  "reflections": formatDigitColorLevel(["§1", "§0", "§0", "§d", "§d", "§5"]),
  "brewery": (n, m = "") => `§5[§c${n}§d${m}§5]`,
  "leo": formatDigitColorLevel(["§e", "§e", "§e", "§6", "§4", "§4"]),
  "zebra": formatDigitColorLevel(["§7", "§8", "§7", "§8", "§f", "§8"]),
  "emit": formatDigitColorLevel(["§5", "§d", "§f", "§f", "§d", "§5"]),
  "smoldering": (n, m = "") => `§0[§4${n}§c${m}§0]`,
  "stormy": formatDigitColorLevel(["§e", "§e", "§f", "§f", "§7", "§7"]),
  "borealis": formatDigitColorLevel(["§d", "§d", "§b", "§b", "§a", "§a"]),
  "devil": formatDigitColorLevel(["§0", "§8", "§8", "§4", "§4", "§c"]),
  "demigod": formatDigitColorLevel(["§8", "§6", "§e", "§7", "§8", "§8"], "curly"),
  "laurel": formatDigitColorLevel(["§2", "§2", "§6", "§6", "§f", "§f"]),
  "uplifting": formatDigitColorLevel(["§8", "§8", "§7", "§7", "§e", "§e"]),
  "the_world_moves_on": formatDigitColorLevel(["§8", "§8", "§6", "§6", "§c", "§c"]),
  "swine": formatDigitColorLevel(["§5", "§5", "§d", "§d", "§f", "§f"]),
  "beagle": (n, m = "") => `§f[§7${n}§f${m}]`,
  "the_prestige_prestige": formatDigitColorLevel(["§7", "§f", "§6", "§b", "§c", "§d"]),
  "opalsmith": formatDigitColorLevel(["§9", "§9", "§b", "§3", "§d", "§5"]),
  "scurvy": formatDigitColorLevel(["§9", "§3", "§b", "§f", "§a", "§2"]),
  // TODO how is this named: Fool's Mythic
  "fool's_mythic": formatDigitColorLevel(["§4", "§c", "§6", "§2", "§9", "§5"]),
  "eponymous": formatDigitColorLevel(["§3", "§3", "§2", "§a", "§e", "§6"]),
  "bandage": formatDigitColorLevel(["§0", "§8", "§7", "§f", "§c", "§4"]),
  "clown": formatDigitColorLevel(["§2", "§c", "§f", "§f", "§c", "§4"]),
  "tropical": formatDigitColorLevel(["§e", "§9", "§6", "§3", "§c", "§1"]),
  "sugar_crash": formatDigitColorLevel(["§f", "§e", "§c", "§d", "§b", "§f"]),
  "ultraviolence": formatDigitColorLevel(["§2", "§a", "§f", "§f", "§d", "§5"]),
} satisfies Record<string, Scheme>;

const PRESTIGE_SCHEMES: { req: number;scheme: keyof typeof SCHEME_MAP }[] = [
  { req: 0, scheme: "stone_prestige" },
  { req: 10, scheme: "iron_prestige" },
  { req: 20, scheme: "gold_prestige" },
  { req: 30, scheme: "diamond_prestige" },
  { req: 40, scheme: "ruby_prestige" },
  { req: 50, scheme: "crystal_prestige" },
  { req: 60, scheme: "amethyst_prestige" },
  { req: 70, scheme: "opal_prestige" },
  { req: 80, scheme: "topaz_prestige" },
  { req: 90, scheme: "jade_prestige" },
  { req: 100, scheme: "mythic_i_prestige" },
  { req: 110, scheme: "bloody_prestige" },
  { req: 120, scheme: "cobalt_prestige" },
  { req: 130, scheme: "content_prestige" },
  { req: 140, scheme: "crimson_prestige" },
  { req: 150, scheme: "firefly_prestige" },
  { req: 160, scheme: "emerald_prestige" },
  { req: 170, scheme: "abyss_prestige" },
  { req: 180, scheme: "sapphire_prestige" },
  { req: 190, scheme: "emergency_prestige" },
  { req: 200, scheme: "mythic_ii_prestige" },
  { req: 210, scheme: "mulberry_prestige" },
  { req: 220, scheme: "slate_prestige" },
  { req: 230, scheme: "blood_god_prestige" },
  { req: 240, scheme: "midnight_prestige" },
  { req: 250, scheme: "sun_prestige" },
  { req: 260, scheme: "bulb_prestige" },
  { req: 270, scheme: "twilight_prestige" },
  { req: 280, scheme: "natural_prestige" },
  { req: 290, scheme: "icile_prestige" },
  { req: 300, scheme: "mythic_iii_prestige" },
  { req: 310, scheme: "graphite_prestige" },
  { req: 320, scheme: "punk_prestige" },
  { req: 330, scheme: "meltdown_prestige" },
  { req: 340, scheme: "iridescent_prestige" },
  { req: 350, scheme: "marigold_prestige" },
  { req: 360, scheme: "beach_prestige" },
  { req: 370, scheme: "spark_prestige" },
  { req: 380, scheme: "target_prestige" },
  { req: 390, scheme: "limelight_prestige" },
  { req: 400, scheme: "mythic_iv_prestige" },
  { req: 410, scheme: "cerulean_prestige" },
  { req: 420, scheme: "magical_prestige" },
  { req: 430, scheme: "luminous_prestige" },
  { req: 440, scheme: "synthesis_prestige" },
  { req: 450, scheme: "burn_prestige" },
  { req: 460, scheme: "dramatic_prestige" },
  { req: 470, scheme: "radiant_prestige" },
  { req: 480, scheme: "tidal_prestige" },
  { req: 490, scheme: "firework_prestige" },
  { req: 500, scheme: "mythic_v_prestige" },
];

function formatDigitColorLevel(
  colors: [string, string, string, string, string, string],
  bracketKind: "square" | "curly" = "square"
): (level: number, emblem?: string) => string {
  const leftBracket = bracketKind === "square" ? "[" : "{";
  const rightBracket = bracketKind === "square" ? "]" : "}";

  return (level: number, emblem?: string) => {
    const formattedEmblem = emblem ? `${colors.at(-2)}${emblem}` : "";
    const formattedLevel = [...`${level}`]
      .reverse()
      .map((digit, index) => `${colors[3 - index]}${digit}`)
      .reverse()
      .join("");

    return `${colors[0]}${leftBracket}${formattedLevel}${formattedEmblem}${colors.at(-1)}${rightBracket}`;
  };
}

const PRESTIGE_EMBLEMS: { req: number; emblem: keyof typeof EMBLEM_MAP }[] = [
  { req: 0, emblem: "default" },
  { req: 50, emblem: "carrots_for_eyes" },
  { req: 100, emblem: "formerly_known" },
  { req: 150, emblem: "reflex_angle_eyebrows" },
  { req: 200, emblem: "two_tired" },
  { req: 250, emblem: "slime" },
  { req: 300, emblem: "same_great_taste" },
  { req: 350, emblem: "misaligned" },
  { req: 400, emblem: "converge_on_tongue" },
  { req: 450, emblem: "no_evil" },
  { req: 500, emblem: "three_fourths_jam" },
];

export const getIntendedLevelFormatted = (level: number) => {
  level = Math.floor(level);

  const { emblem: emblemKey } = findScore(PRESTIGE_EMBLEMS, level);
  const { scheme: schemeKey } = findScore(PRESTIGE_SCHEMES, level);

  const emblem = EMBLEM_MAP[emblemKey];
  const scheme = SCHEME_MAP[schemeKey];

  return scheme(level, emblem);
};

export function getFormattedLevel(
  level: number,
  selectedScheme: string | undefined,
  selectedEmblem: string | undefined
) {
  selectedScheme = selectedScheme?.replace("scheme_", "");
  selectedEmblem = selectedEmblem?.replace("emblem_", "");

  let schemeKey: keyof typeof SCHEME_MAP;
  let emblemKey: keyof typeof EMBLEM_MAP | undefined = undefined;

  if (selectedScheme) {
    if (selectedScheme in SCHEME_MAP) {
      schemeKey = selectedScheme as keyof typeof SCHEME_MAP;
    } else {
      console.error(`Missing SkyWars Scheme Key ${selectedScheme}`);
      schemeKey = findScore(PRESTIGE_SCHEMES, level).scheme;
    }
  } else {
    schemeKey = findScore(PRESTIGE_SCHEMES, level).scheme;
  }

  if (selectedEmblem) {
    if (selectedEmblem in EMBLEM_MAP) {
      emblemKey = selectedEmblem as keyof typeof EMBLEM_MAP;
    } else {
      console.error(`Missing SkyWars Emblem Key ${selectedEmblem}`);
      emblemKey = findScore(PRESTIGE_EMBLEMS, level).emblem;
    }
  } else {
    emblemKey = "default";
  }

  const emblem = emblemKey ? EMBLEM_MAP[emblemKey] : undefined;
  const scheme = SCHEME_MAP[schemeKey];

  return scheme(level, emblem);
}

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
