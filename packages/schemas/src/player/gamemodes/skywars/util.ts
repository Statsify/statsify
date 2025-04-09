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

type Scheme = (level: number, bold: boolean, underline: boolean, strikethrough: boolean, emblem?: string,) => string;

const SCHEME_MAP = {
  "stone_prestige": formatStaticColorLevel("§7"),
  "iron_prestige": formatStaticColorLevel("§f"),
  "gold_prestige": formatStaticColorLevel("§6"),
  "diamond_prestige": formatStaticColorLevel("§b"),
  "ruby_prestige": formatStaticColorLevel("§c"),
  "crystal_prestige": formatStaticColorLevel("§d"),
  "amethyst_prestige": formatStaticColorLevel("§5"),
  "opal_prestige": formatStaticColorLevel("§9"),
  "topaz_prestige": formatStaticColorLevel("§e"),
  "jade_prestige": formatStaticColorLevel("§a"),
  "mythic_i_prestige": formatDigitColorLevel(["§c", "§6", "§e", "§a", "§b", "§d"]),
  "bloody_prestige": formatStaticColorLevel("§4", "§c"),
  "cobalt_prestige": formatStaticColorLevel("§1"),
  "content_prestige": formatStaticColorLevel("§c", "§f"),
  "crimson_prestige": formatStaticColorLevel("§4"),
  "firefly_prestige": formatStaticColorLevel("§6", "§e"),
  "emerald_prestige": formatStaticColorLevel("§2"),
  "abyss_prestige": formatStaticColorLevel("§1", "§9"),
  "sapphire_prestige": formatStaticColorLevel("§3"),
  "emergency_prestige": formatStaticColorLevel("§4", "§e"),
  "mythic_ii_prestige": formatDigitColorLevel(["§6", "§e", "§a", "§b", "§d", "§c"]),
  "mulberry_prestige": formatStaticColorLevel("§5", "§d"),
  "slate_prestige": formatStaticColorLevel("§8"),
  "blood_god_prestige": formatStaticColorLevel("§d", "§b"),
  "midnight_prestige": formatStaticColorLevel("§0"),
  "sun_prestige": formatDigitColorLevel(["§c", "§6", "§e", "§e", "§6", "§c"]),
  "bulb_prestige": formatDigitColorLevel(["§0", "§e", "§6", "§6", "§e", "§0"]),
  "twilight_prestige": formatStaticColorLevel("§1", "§3"),
  "natural_prestige": formatDigitColorLevel(["§a", "§2", "§a", "§e", "§a", "§2"]),
  "icile_prestige": formatStaticColorLevel("§9", "§b"),
  "mythic_iii_prestige": formatDigitColorLevel(["§e", "§a", "§b", "§d", "§c", "§6"]),
  "graphite_prestige": formatStaticColorLevel("§8", "§7"),
  "punk_prestige": formatStaticColorLevel("§d", "§a"),
  "meltdown_prestige": formatStaticColorLevel("§e", "§c"),
  "iridescent_prestige": formatDigitColorLevel(["§b", "§a", "§b", "§d", "§a", "§a"]),
  "marigold_prestige": formatDigitColorLevel(["§f", "§f", "§e", "§e", "§6", "§6"]),
  "beach_prestige": formatDigitColorLevel(["§9", "§3", "§b", "§f", "§e", "§e"]),
  "spark_prestige": formatDigitColorLevel(["§e", "§e", "§f", "§f", "§8", "§8"]),
  "target_prestige": formatDigitColorLevel(["§c", "§f", "§c", "§c", "§f", "§c"]),
  "limelight_prestige": formatStaticColorLevel("§2", "§a"),
  "mythic_iv_prestige": formatDigitColorLevel(["§a", "§b", "§d", "§c", "§6", "§e"]),
  "cerulean_prestige": formatStaticColorLevel("§3", "§b"),
  "magical_prestige": formatDigitColorLevel(["§0", "§5", "§8", "§8", "§5", "§0"]),
  "luminous_prestige": formatDigitColorLevel(["§6", "§6", "§f", "§f", "§b", "§3"]),
  "synthesis_prestige": formatDigitColorLevel(["§a", "§2", "§a", "§e", "§f", "§f"]),
  "burn_prestige": formatDigitColorLevel(["§4", "§4", "§c", "§6", "§e", "§f"]),
  "dramatic_prestige": formatDigitColorLevel(["§9", "§b", "§3", "§d", "§5", "§4"]),
  "radiant_prestige": formatDigitColorLevel(["§0", "§8", "§7", "§f", "§7", "§8"]),
  "tidal_prestige": formatDigitColorLevel(["§1", "§1", "§9", "§3", "§b", "§f"]),
  "firework_prestige": formatDigitColorLevel(["§9", "§b", "§f", "§f", "§c", "§4"]),
  "mythic_v_prestige": formatDigitColorLevel(["§b", "§d", "§c", "§6", "§e", "§a"]),

  "ancient": formatStaticColorLevel("§7", "§8"),
  "the_new_default": formatStaticColorLevel("§6", "§7", "§6"),
  "the_new_new_default": formatStaticColorLevel("§b", "§7", "§b"),
  "launch": formatStaticColorLevel("§6", "§6", "§8"),
  "jersey": formatStaticColorLevel("§f", "§f", "§c"),
  "spotlight": formatStaticColorLevel("§0", "§f"),
  "earth": formatStaticColorLevel("§4", "§4", "§a"),
  "glint": formatStaticColorLevel("§d", "§d", "§b"),
  "strength": formatStaticColorLevel("§c", "§d"),
  "adrenaline": formatStaticColorLevel("§c", "§a"),
  "pumpkin": formatStaticColorLevel("§4", "§6"),
  "seashell": formatStaticColorLevel("§e", "§e", "§c"),
  "obsidian": formatStaticColorLevel("§8", "§8", "§5"),
  "support": formatStaticColorLevel("§f", "§c"),
  "mahogany": formatStaticColorLevel("§e", "§6"),
  "spell": formatDigitColorLevel(["§d", "§d", "§d", "§e", "§e", "§e"]),
  "pillar": formatStaticColorLevel("§f", "§6"),
  "agile": formatStaticColorLevel("§a", "§f"),
  "bone": formatStaticColorLevel("§f", "§7", "§f"),
  "slimy": formatStaticColorLevel("§a", "§2"),
  "holiday": formatStaticColorLevel("§4", "§a"),
  "iconic": formatStaticColorLevel("§0", "§0", "§f"),
  // TODO: Figure out name: Level-conic?
  "level-conic?": formatStaticColorLevel("§0", "§f", "§0"),
  "safari": formatDigitColorLevel(["§2", "§2", "§2", "§6", "§6", "§6"]),
  "gummy_worm": formatDigitColorLevel(["§c", "§c", "§c", "§b", "§b", "§b"]),
  "timetravel": formatDigitColorLevel(["§7", "§0", "§0", "§7", "§7", "§7"]),
  "horned": formatStaticColorLevel("§c", "§8"),
  "sandy": formatDigitColorLevel(["§6", "§e", "§f", "§e", "§6", "§e"]),
  "brutus": formatDigitColorLevel(["§9", "§9", "§8", "§8", "§f", "§f"]),
  "coinsmith": formatDigitColorLevel(["§e", "§8", "§8", "§8", "§6", "§e"]),
  "soulsmith": formatDigitColorLevel(["§7", "§b", "§b", "§f", "§f", "§f"]),
  "grand_slam": formatStaticColorLevel("§2", "§a", "§f"),
  "fleet": formatDigitColorLevel(["§0", "§c", "§e", "§a", "§a", "§0"]),
  "vengeance": formatStaticColorLevel("§0", "§8", "§e"),
  "dry": formatStaticColorLevel("§e", "§f", "§6"),
  "prickly": formatStaticColorLevel("§e", "§a", "§f"),
  "cast_iron": formatDigitColorLevel(["§7", "§7", "§8", "§8", "§3", "§3"]),
  "explosive": formatDigitColorLevel(["§c", "§c", "§e", "§e", "§6", "§6"]),
  "verdant": formatDigitColorLevel(["§2", "§a", "§a", "§e", "§6", "§e"]),
  "enchantment": formatDigitColorLevel(["§f", "§d", "§5", "§5", "§d", "§f"]),
  "void": formatStaticColorLevel("§8", "§5", "§d"),
  "fragile": formatStaticColorLevel("§0", "§3", "§a"),
  "mite": formatDigitColorLevel(["§3", "§2", "§8", "§2", "§a", "§3"]),
  "shulker": formatStaticColorLevel("§5", "§e", "§f"),
  "redstone": formatStaticColorLevel("§0", "§c", "§4"),
  "technical": formatDigitColorLevel(["§c", "§c", "§7", "§7", "§8", "§8"]),
  "melon": formatDigitColorLevel(["§a", "§2", "§a", "§2", "§e", "§a"]),
  "driftwood": formatDigitColorLevel(["§3", "§3", "§e", "§e", "§4", "§4"]),
  "river": formatStaticColorLevel("§2", "§9", "§a"),
  "mangrove": formatDigitColorLevel(["§4", "§4", "§c", "§c", "§2", "§2"]),
  "jeremiah": formatStaticColorLevel("§3", "§6", "§e"),
  "poppy": formatDigitColorLevel(["§c", "§4", "§0", "§0", "§4", "§c"]),
  "creeper": formatDigitColorLevel(["§f", "§f", "§a", "§a", "§2", "§2"]),
  "camo": formatDigitColorLevel(["§8", "§8", "§2", "§2", "§a", "§a"]),
  "first_aid": formatStaticColorLevel("§4", "§f", "§c"),
  "penguin": formatStaticColorLevel("§8", "§9", "§e"),
  "nether": formatDigitColorLevel(["§7", "§7", "§3", "§3", "§c", "§c"]),
  "wilderness": formatDigitColorLevel(["§2", "§2", "§3", "§3", "§6", "§6"]),
  "one_stone": formatDigitColorLevel(["§7", "§7", "§2", "§2", "§8", "§8"]),
  "circus": formatDigitColorLevel(["§c", "§c", "§6", "§6", "§2", "§2"]),
  "veracious": formatStaticColorLevel("§5", "§f", "§6"),
  "valiant": formatStaticColorLevel("§c", "§f", "§a"),
  "venerable": formatStaticColorLevel("§9", "§f", "§e"),
  "portal": formatDigitColorLevel(["§a", "§a", "§d", "§d", "§c", "§c"]),
  "sorcratic": formatStaticColorLevel("§8", "§f", "§e"),
  "parallel_dimension": formatDigitColorLevel(["§9", "§9", "§8", "§8", "§d", "§d"]),
  "tomb": formatDigitColorLevel(["§6", "§9", "§6", "§9", "§e", "§e"]),
  "irigation": formatDigitColorLevel(["§b", "§b", "§a", "§6", "§e", "§e"]),
  "snout": formatDigitColorLevel(["§5", "§0", "§d", "§d", "§0", "§5"]),
  "potato": formatDigitColorLevel(["§e", "§d", "§d", "§c", "§c", "§8"]),
  "royal": formatDigitColorLevel(["§9", "§9", "§6", "§6", "§c", "§c"]),
  "bubblegum": formatDigitColorLevel(["§5", "§d", "§d", "§f", "§f", "§d"]),
  "insane": formatStaticColorLevel("§7", "§f", "§6"),
  "smoke": formatDigitColorLevel(["§0", "§0", "§8", "§8", "§f", "§f"]),
  "scarlet": formatDigitColorLevel(["§8", "§8", "§4", "§4", "§c", "§c"]),
  "afterburn": formatDigitColorLevel(["§b", "§b", "§6", "§8", "§8", "§7"]),
  "normal": formatStaticColorLevel("§8", "§7", "§6"),
  "salmon": formatDigitColorLevel(["§c", "§c", "§3", "§3", "§2", "§2"]),
  "lucky": formatStaticColorLevel("§0", "§2", "§6"),
  "likeable": formatDigitColorLevel(["§4", "§4", "§c", "§c", "§f", "§f"]),
  "lunar": formatDigitColorLevel(["§f", "§f", "§f", "§7", "§8", "§8"]),
  "hypixel": formatStaticColorLevel("§4", "§6", "§e"),
  "sky": formatDigitColorLevel(["§e", "§e", "§b", "§b", "§f", "§f"]),
  "frosty": formatStaticColorLevel("§8", "§f", "§7"),
  "treasure": formatDigitColorLevel(["§6", "§6", "§f", "§f", "§e", "§e"]),
  "gemstone": formatDigitColorLevel(["§4", "§c", "§f", "§f", "§c", "§4"]),
  "dark_magic": formatDigitColorLevel(["§4", "§4", "§5", "§5", "§c", "§c"]),
  "reflections": formatDigitColorLevel(["§1", "§0", "§0", "§d", "§d", "§5"]),
  "brewery": formatStaticColorLevel("§5", "§c", "§d$"),
  "leo": formatDigitColorLevel(["§e", "§e", "§e", "§6", "§4", "§4"]),
  "zebra": formatDigitColorLevel(["§7", "§8", "§7", "§8", "§f", "§8"]),
  "emit": formatDigitColorLevel(["§5", "§d", "§f", "§f", "§d", "§5"]),
  "smoldering": formatStaticColorLevel("§0", "§4", "§c"),
  "stormy": formatDigitColorLevel(["§e", "§e", "§f", "§f", "§7", "§7"]),
  "borealis": formatDigitColorLevel(["§d", "§d", "§b", "§b", "§a", "§a"]),
  "devil": formatDigitColorLevel(["§0", "§8", "§8", "§4", "§4", "§c"]),
  "demigod": formatDigitColorLevel(["§8", "§6", "§e", "§7", "§8", "§8"], "curly"),
  "laurel": formatDigitColorLevel(["§2", "§2", "§6", "§6", "§f", "§f"]),
  "uplifting": formatDigitColorLevel(["§8", "§8", "§7", "§7", "§e", "§e"]),
  "the_world_moves_on": formatDigitColorLevel(["§8", "§8", "§6", "§6", "§c", "§c"]),
  "swine": formatDigitColorLevel(["§5", "§5", "§d", "§d", "§f", "§f"]),
  "beagle": formatStaticColorLevel("§f", "§7", "§f"),
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

function formatStaticColorLevel(bracketColor: string, digitColor = bracketColor, emblemColor = digitColor): Scheme {
  return (level, bold, underline, strikethrough, emblem) => {
    const boldFormat = bold ? "§l" : "";
    const underlineFormat = underline ? "§n" : "";
    const strikethroughFormat = strikethrough ? "§m" : "";

    digitColor = `${digitColor}${underlineFormat}`;
    emblemColor = `${emblemColor}${underlineFormat}`;

    return `${bracketColor}${underlineFormat}${strikethroughFormat}[§r${boldFormat}${digitColor}${underlineFormat}${level}${emblemColor}${emblem}§r${bracketColor}${underlineFormat}${strikethroughFormat}]§r`;
  };
}

function formatDigitColorLevel(
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
    console.log(level, bold, underline, strikethrough, emblem);

    const boldFormat = bold ? "§l" : "";
    const underlineFormat = underline ? "§n" : "";
    const strikethroughFormat = strikethrough ? "§m" : "";

    colors = colors.map((color) => `${color}${underlineFormat}`) as [
      leftBracket: string,
      firstDigit: string,
      secondDigit: string,
      thirdDigit: string,
      emblem: string,
      rightBracket: string
    ];

    const formattedEmblem = emblem ? `${colors.at(-2)}${emblem}` : "";
    const formattedLevel = [...`${level}`]
      .reverse()
      .map((digit, index) => `${colors[3 - index]}${digit}`)
      .reverse()
      .join("");

    return `§r${colors[0]}${strikethroughFormat}${leftBracket}§r${boldFormat}${formattedLevel}${formattedEmblem}§r${colors.at(-1)}${strikethroughFormat}${rightBracket}§r`;
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

const BOLD_LEVEL_REQUIREMENT = 300;
const UNDERLINE_LEVEL_REQUIREMENT = 400;
const STRIKETHROUGH_LEVEL_REQUIREMENT = 500;

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
