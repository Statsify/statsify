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
  null: "∅",
  sigma: "Σ",
  delta: "δ",
  florin: "ƒ",
};

type Scheme = (level: number, bold: boolean, underline: boolean, strikethrough: boolean, emblem?: string,) => string;

const SCHEME_MAP = {
  "stone_prestige": createUniformScheme("§7"),
  "iron_prestige": createUniformScheme("§f"),
  "gold_prestige": createUniformScheme("§6"),
  "diamond_prestige": createUniformScheme("§b"),
  "ruby_prestige": createUniformScheme("§c"),
  "crystal_prestige": createUniformScheme("§d"),
  "amethyst_prestige": createUniformScheme("§5"),
  "opal_prestige": createUniformScheme("§9"),
  "topaz_prestige": createUniformScheme("§e"),
  "jade_prestige": createUniformScheme("§a"),
  "mythic_i_prestige": createMultiDigitColorScheme(["§c", "§6", "§e", "§a", "§b", "§d"]),
  "bloody_prestige": createUniformScheme("§4", "§c"),
  "cobalt_prestige": createUniformScheme("§1"),
  "content_prestige": createUniformScheme("§c", "§f"),
  "crimson_prestige": createUniformScheme("§4"),
  "firefly_prestige": createUniformScheme("§6", "§e"),
  "emerald_prestige": createUniformScheme("§2"),
  "abyss_prestige": createUniformScheme("§1", "§9"),
  "sapphire_prestige": createUniformScheme("§3"),
  "emergency_prestige": createUniformScheme("§4", "§e"),
  "mythic_ii_prestige": createMultiDigitColorScheme(["§6", "§e", "§a", "§b", "§d", "§c"]),
  "mulberry_prestige": createUniformScheme("§5", "§d"),
  "slate_prestige": createUniformScheme("§8"),
  "blood_god_prestige": createUniformScheme("§d", "§b"),
  "midnight_prestige": createUniformScheme("§0"),
  "sun_prestige": createMultiDigitColorScheme(["§c", "§6", "§e", "§e", "§6", "§c"]),
  "bulb_prestige": createMultiDigitColorScheme(["§0", "§e", "§6", "§6", "§e", "§0"]),
  "twilight_prestige": createUniformScheme("§1", "§3"),
  "natural_prestige": createMultiDigitColorScheme(["§a", "§2", "§a", "§e", "§a", "§2"]),
  "icile_prestige": createUniformScheme("§9", "§b"),
  "mythic_iii_prestige": createMultiDigitColorScheme(["§e", "§a", "§b", "§d", "§c", "§6"]),
  "graphite_prestige": createUniformScheme("§8", "§7"),
  "punk_prestige": createUniformScheme("§d", "§a"),
  "meltdown_prestige": createUniformScheme("§e", "§c"),
  "iridescent_prestige": createMultiDigitColorScheme(["§b", "§a", "§b", "§d", "§a", "§a"]),
  "marigold_prestige": createMultiDigitColorScheme(["§f", "§f", "§e", "§e", "§6", "§6"]),
  "beach_prestige": createMultiDigitColorScheme(["§9", "§3", "§b", "§f", "§e", "§e"]),
  "spark_prestige": createMultiDigitColorScheme(["§e", "§e", "§f", "§f", "§8", "§8"]),
  "target_prestige": createMultiDigitColorScheme(["§c", "§f", "§c", "§c", "§f", "§c"]),
  "limelight_prestige": createUniformScheme("§2", "§a"),
  "mythic_iv_prestige": createMultiDigitColorScheme(["§a", "§b", "§d", "§c", "§6", "§e"]),
  "cerulean_prestige": createUniformScheme("§3", "§b"),
  "magical_prestige": createMultiDigitColorScheme(["§0", "§5", "§8", "§8", "§5", "§0"]),
  "luminous_prestige": createMultiDigitColorScheme(["§6", "§6", "§f", "§f", "§b", "§3"]),
  "synthesis_prestige": createMultiDigitColorScheme(["§a", "§2", "§a", "§e", "§f", "§f"]),
  "burn_prestige": createMultiDigitColorScheme(["§4", "§4", "§c", "§6", "§e", "§f"]),
  "dramatic_prestige": createMultiDigitColorScheme(["§9", "§b", "§3", "§d", "§5", "§4"]),
  "radiant_prestige": createMultiDigitColorScheme(["§0", "§8", "§7", "§f", "§7", "§8"]),
  "tidal_prestige": createMultiDigitColorScheme(["§1", "§1", "§9", "§3", "§b", "§f"]),
  "firework_prestige": createMultiDigitColorScheme(["§9", "§b", "§f", "§f", "§c", "§4"]),
  "mythic_v_prestige": createMultiDigitColorScheme(["§b", "§d", "§c", "§6", "§e", "§a"]),

  "ancient": createUniformScheme("§7", "§8"),
  "the_new_default": createUniformScheme("§6", "§7", "§6"),
  "the_new_new_default": createUniformScheme("§b", "§7", "§b"),
  "launch": createUniformScheme("§6", "§6", "§8"),
  "jersey": createUniformScheme("§f", "§f", "§c"),
  "spotlight": createUniformScheme("§0", "§f"),
  "earth": createUniformScheme("§4", "§4", "§a"),
  "glint": createUniformScheme("§d", "§d", "§b"),
  "strength": createUniformScheme("§c", "§d"),
  "adrenaline": createUniformScheme("§c", "§a"),
  "pumpkin": createUniformScheme("§4", "§6"),
  "seashell": createUniformScheme("§e", "§e", "§c"),
  "obsidian": createUniformScheme("§8", "§8", "§5"),
  "support": createUniformScheme("§f", "§c"),
  "mahogany": createUniformScheme("§e", "§6"),
  "spell": createMultiDigitColorScheme(["§d", "§d", "§d", "§e", "§e", "§e"]),
  "pillar": createUniformScheme("§f", "§6"),
  "agile": createUniformScheme("§a", "§f"),
  "bone": createUniformScheme("§f", "§7", "§f"),
  "slimy": createUniformScheme("§a", "§2"),
  "holiday": createUniformScheme("§4", "§a"),
  "iconic": createUniformScheme("§0", "§0", "§f"),
  // TODO: Figure out name: Level-conic?
  "level-conic?": createUniformScheme("§0", "§f", "§0"),
  "safari": createMultiDigitColorScheme(["§2", "§2", "§2", "§6", "§6", "§6"]),
  "gummy_worm": createMultiDigitColorScheme(["§c", "§c", "§c", "§b", "§b", "§b"]),
  "timetravel": createMultiDigitColorScheme(["§7", "§0", "§0", "§7", "§7", "§7"]),
  "horned": createUniformScheme("§c", "§8"),
  "sandy": createMultiDigitColorScheme(["§6", "§e", "§f", "§e", "§6", "§e"]),
  "brutus": createMultiDigitColorScheme(["§9", "§9", "§8", "§8", "§f", "§f"]),
  "coinsmith": createMultiDigitColorScheme(["§e", "§8", "§8", "§8", "§6", "§e"]),
  "soulsmith": createMultiDigitColorScheme(["§7", "§b", "§b", "§f", "§f", "§f"]),
  "grand_slam": createUniformScheme("§2", "§a", "§f"),
  "fleet": createMultiDigitColorScheme(["§0", "§c", "§e", "§a", "§a", "§0"]),
  "vengeance": createUniformScheme("§0", "§8", "§e"),
  "dry": createUniformScheme("§e", "§f", "§6"),
  "prickly": createUniformScheme("§e", "§a", "§f"),
  "cast_iron": createMultiDigitColorScheme(["§7", "§7", "§8", "§8", "§3", "§3"]),
  "explosive": createMultiDigitColorScheme(["§c", "§c", "§e", "§e", "§6", "§6"]),
  "verdant": createMultiDigitColorScheme(["§2", "§a", "§a", "§e", "§6", "§e"]),
  "enchantment": createMultiDigitColorScheme(["§f", "§d", "§5", "§5", "§d", "§f"]),
  "void": createUniformScheme("§8", "§5", "§d"),
  "fragile": createUniformScheme("§0", "§3", "§a"),
  "mite": createMultiDigitColorScheme(["§3", "§2", "§8", "§2", "§a", "§3"]),
  "shulker": createUniformScheme("§5", "§e", "§f"),
  "redstone": createUniformScheme("§0", "§c", "§4"),
  "technical": createMultiDigitColorScheme(["§c", "§c", "§7", "§7", "§8", "§8"]),
  "melon": createMultiDigitColorScheme(["§a", "§2", "§a", "§2", "§e", "§a"]),
  "driftwood": createMultiDigitColorScheme(["§3", "§3", "§e", "§e", "§4", "§4"]),
  "river": createUniformScheme("§2", "§9", "§a"),
  "mangrove": createMultiDigitColorScheme(["§4", "§4", "§c", "§c", "§2", "§2"]),
  "jeremiah": createUniformScheme("§3", "§6", "§e"),
  "poppy": createMultiDigitColorScheme(["§c", "§4", "§0", "§0", "§4", "§c"]),
  "creeper": createMultiDigitColorScheme(["§f", "§f", "§a", "§a", "§2", "§2"]),
  "camo": createMultiDigitColorScheme(["§8", "§8", "§2", "§2", "§a", "§a"]),
  "first_aid": createUniformScheme("§4", "§f", "§c"),
  "penguin": createUniformScheme("§8", "§9", "§e"),
  "nether": createMultiDigitColorScheme(["§7", "§7", "§3", "§3", "§c", "§c"]),
  "wilderness": createMultiDigitColorScheme(["§2", "§2", "§3", "§3", "§6", "§6"]),
  "one_stone": createMultiDigitColorScheme(["§7", "§7", "§2", "§2", "§8", "§8"]),
  "circus": createMultiDigitColorScheme(["§c", "§c", "§6", "§6", "§2", "§2"]),
  "veracious": createUniformScheme("§5", "§f", "§6"),
  "valiant": createUniformScheme("§c", "§f", "§a"),
  "venerable": createUniformScheme("§9", "§f", "§e"),
  "portal": createMultiDigitColorScheme(["§a", "§a", "§d", "§d", "§c", "§c"]),
  "sorcratic": createUniformScheme("§8", "§f", "§e"),
  "parallel_dimension": createMultiDigitColorScheme(["§9", "§9", "§8", "§8", "§d", "§d"]),
  "tomb": createMultiDigitColorScheme(["§6", "§9", "§6", "§9", "§e", "§e"]),
  "irigation": createMultiDigitColorScheme(["§b", "§b", "§a", "§6", "§e", "§e"]),
  "snout": createMultiDigitColorScheme(["§5", "§0", "§d", "§d", "§0", "§5"]),
  "potato": createMultiDigitColorScheme(["§e", "§d", "§d", "§c", "§c", "§8"]),
  "royal": createMultiDigitColorScheme(["§9", "§9", "§6", "§6", "§c", "§c"]),
  "bubblegum": createMultiDigitColorScheme(["§5", "§d", "§d", "§f", "§f", "§d"]),
  "insane": createUniformScheme("§7", "§f", "§6"),
  "smoke": createMultiDigitColorScheme(["§0", "§0", "§8", "§8", "§f", "§f"]),
  "scarlet": createMultiDigitColorScheme(["§8", "§8", "§4", "§4", "§c", "§c"]),
  "afterburn": createMultiDigitColorScheme(["§b", "§b", "§6", "§8", "§8", "§7"]),
  "normal": createUniformScheme("§8", "§7", "§6"),
  "salmon": createMultiDigitColorScheme(["§c", "§c", "§3", "§3", "§2", "§2"]),
  "lucky": createUniformScheme("§0", "§2", "§6"),
  "likeable": createMultiDigitColorScheme(["§4", "§4", "§c", "§c", "§f", "§f"]),
  "lunar": createMultiDigitColorScheme(["§f", "§f", "§f", "§7", "§8", "§8"]),
  "hypixel": createUniformScheme("§4", "§6", "§e"),
  "sky": createMultiDigitColorScheme(["§e", "§e", "§b", "§b", "§f", "§f"]),
  "frosty": createUniformScheme("§8", "§f", "§7"),
  "treasure": createMultiDigitColorScheme(["§6", "§6", "§f", "§f", "§e", "§e"]),
  "gemstone": createMultiDigitColorScheme(["§4", "§c", "§f", "§f", "§c", "§4"]),
  "dark_magic": createMultiDigitColorScheme(["§4", "§4", "§5", "§5", "§c", "§c"]),
  "reflections": createMultiDigitColorScheme(["§1", "§0", "§0", "§d", "§d", "§5"]),
  "brewery": createUniformScheme("§5", "§c", "§d$"),
  "leo": createMultiDigitColorScheme(["§e", "§e", "§e", "§6", "§4", "§4"]),
  "zebra": createMultiDigitColorScheme(["§7", "§8", "§7", "§8", "§f", "§8"]),
  "emit": createMultiDigitColorScheme(["§5", "§d", "§f", "§f", "§d", "§5"]),
  "smoldering": createUniformScheme("§0", "§4", "§c"),
  "stormy": createMultiDigitColorScheme(["§e", "§e", "§f", "§f", "§7", "§7"]),
  "borealis": createMultiDigitColorScheme(["§d", "§d", "§b", "§b", "§a", "§a"]),
  "devil": createMultiDigitColorScheme(["§0", "§8", "§8", "§4", "§4", "§c"]),
  "demigod": createMultiDigitColorScheme(["§8", "§6", "§e", "§7", "§8", "§8"], "curly"),
  "laurel": createMultiDigitColorScheme(["§2", "§2", "§6", "§6", "§f", "§f"]),
  "uplifting": createMultiDigitColorScheme(["§8", "§8", "§7", "§7", "§e", "§e"]),
  "the_world_moves_on": createMultiDigitColorScheme(["§8", "§8", "§6", "§6", "§c", "§c"]),
  "swine": createMultiDigitColorScheme(["§5", "§5", "§d", "§d", "§f", "§f"]),
  "beagle": createUniformScheme("§f", "§7", "§f"),
  "the_prestige_prestige": createMultiDigitColorScheme(["§7", "§f", "§6", "§b", "§c", "§d"]),
  "opalsmith": createMultiDigitColorScheme(["§9", "§9", "§b", "§3", "§d", "§5"]),
  "scurvy": createMultiDigitColorScheme(["§9", "§3", "§b", "§f", "§a", "§2"]),
  "fools_mythic": createMultiDigitColorScheme(["§4", "§c", "§6", "§2", "§9", "§5"]),
  "eponymous": createMultiDigitColorScheme(["§3", "§3", "§2", "§a", "§e", "§6"]),
  "bandage": createMultiDigitColorScheme(["§0", "§8", "§7", "§f", "§c", "§4"]),
  "clown": createMultiDigitColorScheme(["§2", "§c", "§f", "§f", "§c", "§4"]),
  "tropical": createMultiDigitColorScheme(["§e", "§9", "§6", "§3", "§c", "§1"]),
  "sugar_crash": createMultiDigitColorScheme(["§f", "§e", "§c", "§d", "§b", "§f"]),
  "ultraviolence": createMultiDigitColorScheme(["§2", "§a", "§f", "§f", "§d", "§5"]),
} satisfies Record<string, Scheme>;

/**
 * Formats color schemes when at most the bracket, digit, and emblem color differ
 */
function createUniformScheme(bracketColor: string, digitColor = bracketColor, emblemColor = digitColor): Scheme {
  return (level, bold, underline, strikethrough, emblem) => {
    const boldFormat = bold ? "§l" : "";
    const underlineFormat = underline ? "§n" : "";
    const strikethroughFormat = strikethrough ? "§m" : "";

    return `${bracketColor}${underlineFormat}${strikethroughFormat}[§r${boldFormat}${digitColor}${underlineFormat}${underlineFormat}${level}${emblemColor}${underlineFormat}${emblem}§r${bracketColor}${underlineFormat}${strikethroughFormat}]§r`;
  };
}

/**
 * Formats color schemes where almost every digit has a different color
 */
function createMultiDigitColorScheme(
  colors: [
    leftBracket: string,
    firstDigit: string,
    secondDigit: string,
    thirdDigit: string,
    emblem: string,
    rightBracket: string
  ],
  bracketKind: "square" | "curly" = "square"
): Scheme {
  const leftBracket = bracketKind === "square" ? "[" : "{";
  const rightBracket = bracketKind === "square" ? "]" : "}";

  return (level, bold, underline, strikethrough, emblem) => {
    const boldFormat = bold ? "§l" : "";
    const underlineFormat = underline ? "§n" : "";
    const strikethroughFormat = strikethrough ? "§m" : "";

    const formattedColors = colors.map((color) => `${color}${underlineFormat}`) as [
      leftBracket: string,
      firstDigit: string,
      secondDigit: string,
      thirdDigit: string,
      emblem: string,
      rightBracket: string
    ];

    const formattedEmblem = emblem ? `${formattedColors.at(-2)}${emblem}` : "";
    const formattedLevel = [...`${level}`]
      .toReversed()
      .map((digit, index) => `${formattedColors[3 - index]}${digit}`)
      .toReversed()
      .join("");

    return `§r${formattedColors[0]}${strikethroughFormat}${leftBracket}§r${boldFormat}${formattedLevel}${formattedEmblem}§r${formattedColors.at(-1)}${strikethroughFormat}${rightBracket}§r`;
  };
}

const PRESTIGE_SCHEMES: { req: number; scheme: keyof typeof SCHEME_MAP }[] = [
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

const BOLD_LEVEL_REQUIREMENT = 300;
const UNDERLINE_LEVEL_REQUIREMENT = 400;
const STRIKETHROUGH_LEVEL_REQUIREMENT = 500;

/**
 * Gets a player's formatted level based on what scheme and emblem they should have access to at their level
 */
export const getIntendedLevelFormatted = (level: number) => {
  level = Math.floor(level);

  const { emblem: emblemKey } = findScore(PRESTIGE_EMBLEMS, level);
  const { scheme: schemeKey } = findScore(PRESTIGE_SCHEMES, level);

  const emblem = EMBLEM_MAP[emblemKey];
  const scheme = SCHEME_MAP[schemeKey];

  return scheme(
    level,
    level >= BOLD_LEVEL_REQUIREMENT,
    level >= UNDERLINE_LEVEL_REQUIREMENT,
    level >= STRIKETHROUGH_LEVEL_REQUIREMENT,
    emblem
  );
};

/**
 * Gets a player's formatted level based on their preferences
 */
export function getFormattedLevel(
  level: number,
  selectedScheme: string | undefined,
  selectedEmblem: string | undefined,
  bold: boolean,
  underline: boolean,
  strikethrough: boolean
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

  return scheme(level, bold, underline, strikethrough, emblem);
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
