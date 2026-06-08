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

type Brackets = [left: string, right: string];

type SchemeOptions = {
  level: number;
  star: string;
  brackets: Brackets;
  bold: boolean;
  underline: boolean;
  strikethrough: boolean;
};

type Scheme = (options: SchemeOptions) => string;

/**
 * Formats color schemes when at most the bracket, digit, and emblem color differ
 */
function createUniformScheme(
  bracketColor: string,
  digitColor = bracketColor,
  starColor = digitColor,
): Scheme {
  return ({ level, bold, underline, strikethrough, star }) => {
    const boldFormat = bold ? "§l" : "";
    const underlineFormat = underline ? "§n" : "";
    const strikethroughFormat = strikethrough ? "§m" : "";

    return `${bracketColor}${underlineFormat}${strikethroughFormat}[§r${boldFormat}${digitColor}${underlineFormat}${level}${starColor}${underlineFormat}${star}§r${bracketColor}${underlineFormat}${strikethroughFormat}]§r`;
  };
}

/**
 * Creates a list of level "parts" which contain groups characters in a formatted level
 * Handles adding bold, underline and strikethrough formatting to the level
 */
function createLevelParts({
  level,
  bold,
  underline,
  strikethrough,
  star,
  brackets,
}: SchemeOptions) {
  const boldFormat = bold ? "§l" : "";
  const underlineFormat = underline ? "§n" : "";
  const strikethroughFormat = strikethrough ? "§m" : "";

  return [
    `${underlineFormat}${strikethroughFormat}${brackets[0]}§r${boldFormat}${underlineFormat}`,
    ...`${level}`,
    `${star}§r`,
    `${underlineFormat}${strikethroughFormat}${brackets[1]}§r`,
  ];
}

function createCycleScheme(...colors: string[]): Scheme {
  return (options) =>
    createLevelParts(options)
      .map((part, index) => `${colors[index % colors.length]}${part}`)
      .join("");
}

function createPrefixScheme(prefix: string[], remainingColor: string): Scheme {
  return (options) =>
    createLevelParts(options)
      .map((part, index) => {
        if (index >= prefix.length) {
          return `${remainingColor}${part}`;
        }

        return `${prefix[index]}${part}`;
      })
      .join("");
}

function createSuffixScheme(remainingColor: string, suffix: string[]): Scheme {
  return (options) =>
    createLevelParts(options)
      .map((part, index, parts) => {
        const relativeIndex = parts.length - index;

        if (relativeIndex >= suffix.length) {
          return `${remainingColor}${part}`;
        }

        return `${suffix[relativeIndex]}${part}`;
      })
      .join("");
}

export const SCHEME_MAP = {
  none: createUniformScheme("§7"),
  iron: createUniformScheme("§f"),
  gold: createUniformScheme("§6"),
  diamond: createUniformScheme("§b"),
  emerald: createUniformScheme("§2"),
  sapphire: createUniformScheme("§3"),
  ruby: createUniformScheme("§4"),
  crystal: createUniformScheme("§d"),
  opal: createUniformScheme("§9"),
  amethyst: createUniformScheme("§5"),
  rainbow: createCycleScheme("§c", "§6", "§e", "§a", "§b", "§d", "§5"),
  iron_prime: createUniformScheme("§7", "§f", "§7"),
  gold_prime: createUniformScheme("§7", "§e", "§6"),
  diamond_prime: createUniformScheme("§7", "§b", "§3"),
  emerald_prime: createUniformScheme("§7", "§a", "§2"),
  sapphire_prime: createUniformScheme("§7", "§3", "§9"),
  ruby_prime: createUniformScheme("§7", "§c", "§4"),
  crystal_prime: createUniformScheme("§7", "§d", "§5"),
  opal_prime: createUniformScheme("§7", "§9", "§1"),
  amethyst_prime: createUniformScheme("§7", "§5", "§8"),
  mirror: createCycleScheme("§8", "§7", "§f", "§f", "§7", "§7"),
  light: createCycleScheme("§7", "§7", "§e", "§e", "§6", "§6", "§6"),
  dawn: createCycleScheme("§6", "§6", "§f", "§f", "§b", "§3", "§3"),
  dusk: createCycleScheme("§5", "§5", "§d", "§d", "§6", "§e", "§e"),
  air: createCycleScheme("§b", "§b", "§f", "§f", "§7", "§7", "§8", "§8"),
  wind: createCycleScheme("§7", "§7", "§a", "§a", "§2", "§2", "§2", "§2"),
  nebula: createCycleScheme("§4", "§4", "§c", "§c", "§d", "§d", "§5", "§5"),
  thunder: createCycleScheme("§e", "§e", "§f", "§f", "§8", "§8", "§8"),
  earth: createCycleScheme("§a", "§a", "§2", "§2", "§6", "§6", "§e", "§e"),
  water: createCycleScheme("§b", "§b", "§3", "§3", "§9", "§9", "§1", "§1"),
  fire: createCycleScheme("§e", "§e", "§6", "§6", "§c", "§c", "§4", "§4"),
  sunrise: createCycleScheme("§9", "§9", "§3", "§3", "§6", "§6", "§e"),
  eclipse: createCycleScheme("§c", "§4", "§7", "§7", "§4", "§c", "§c"),
  gamma: createCycleScheme("§9", "§9", "§9", "§d", "§c", "§c", "§4"),
  majestic: createCycleScheme("§2", "§a", "§d", "§d", "§5", "§5"),
  andesine: createCycleScheme("§c", "§c", "§4", "§4", "§2", "§a", "§a"),
  marine: createCycleScheme("§a", "§a", "§a", "§b", "§9", "§9", "§1"),
  element: createCycleScheme("§4", "§4", "§c", "§c", "§b", "§3", "§3"),
  galaxy: createCycleScheme("§1", "§1", "§9", "§5", "§5", "§d", "§1"),
  atomic: createCycleScheme("§c", "§c", "§a", "§a", "§3", "§9", "§9"),
  sunset: createCycleScheme("§5", "§5", "§c", "§c", "§6", "§6", "§e"),
  time: createCycleScheme("§e", "§e", "§6", "§c", "§d", "§d", "§5"),
  winter: createCycleScheme("§1", "§9", "§3", "§b", "§f", "§7", "§7"),
  obsidian: createCycleScheme("§0", "§5", "§8", "§8", "§5", "§5"),
  spring: createCycleScheme("§2", "§2", "§a", "§e", "§6", "§5", "§d"),
  ice: createCycleScheme("§f", "§f", "§b", "§b", "§3", "§3", "§3"),
  summer: createCycleScheme("§3", "§b", "§e", "§6", "§6", "§d", "§5"),
  spinel: createCycleScheme("§f", "§4", "§c", "§c", "§9", "§1", "§9"),
  autumn: createCycleScheme("§5", "§5", "§c", "§6", "§6", "§b", "§3"),
  mystic: createCycleScheme("§2", "§a", "§f", "§f", "§f", "§a"),
  eternal: createCycleScheme("§4", "§4", "§5", "§9", "§9", "§1", "§0"),
  burnout: createCycleScheme("§4", "§c", "§c", "§6", "§e", "§f", "§4"),
  cooldown: createCycleScheme("§1", "§9", "§3", "§b", "§f", "§e", "§1"),
  obliteration: createCycleScheme("§5", "§d", "§e", "§f", "§e", "§d"),
  ender: createCycleScheme("§3", "§a", "§2", "§8", "§2", "§a", "§3"),
  brust: createCycleScheme("§2", "§a", "§e", "§f", "§b", "§d", "§5"),
  comical: createCycleScheme("§4", "§c", "§e", "§f", "§e", "§c"),
  lusterlost: createCycleScheme("§4", "§6", "§2", "§3", "§9", "§5", "§8"),
  maelstrom: createCycleScheme("§5", "§c", "§6", "§f", "§b", "§3", "§9"),
  time_undone: createCycleScheme("§7", "§0", "§8", "§7", "§f", "§f"),
  umbrella: createCycleScheme("§c", "§f", "§f", "§f", "§f"),
  luminous: createCycleScheme("§6", "§e", "§f", "§f", "§f", "§b", "§3"),
  tortilla: createCycleScheme("§e", "§f", "§e", "§6", "§6", "§f", "§e"),
  corn: createUniformScheme("§a", "§e", "§a"),
  bittersweet: createCycleScheme("§b", "§b", "§c", "§c", "§c", "§a", "§a"),
  sweetsour: createCycleScheme("§3", "§3", "§a", "§a", "§f", "§a", "§3"),
  pop: createUniformScheme("§9", "§d", "§b"),
  bubblegum: createUniformScheme("§5", "§d", "§f"),
  contrast: createCycleScheme("§0", "§6", "§6", "§e", "§e", "§f", "§f"),
  blended: createCycleScheme("§a", "§a", "§a", "§a", "§2", "§2", "§8"),
  allay: createUniformScheme("§3", "§b", "§f"),
  blaze: createCycleScheme("§4", "§c", "§6", "§e", "§c", "§6", "§e", "§4"),
  creeper: createCycleScheme("§2", "§a", "§f", "§2", "§a", "§f", "§8"),
  drowned: createCycleScheme("§2", "§3", "§3", "§b", "§b", "§a", "§2"),
  enderman: createUniformScheme("§8", "§8", "§d"),
  frog: createCycleScheme("§6", "§6", "§2", "§2", "§f", "§f", "§f"),
  ghast: createCycleScheme("§f", "§f", "§f", "§7", "§7", "§c", "§8"),
  hoglin: createUniformScheme("§d", "§c", "§6"),
  iron_golem: createCycleScheme("§8", "§7", "§f", "§f", "§f", "§e", "§8"),
  jerry: createCycleScheme("§6", "§f", "§2", "§6", "§2", "§f"),
  kringle: createCycleScheme("§2", "§a", "§a", "§a", "§c", "§4", "§2"),
  liquid: createCycleScheme("§8", "§7", "§f", "§b", "§3", "§9", "§1"),
  mint: createUniformScheme("§f", "§f", "§a"),
  neglected: createCycleScheme("§8", "§8", "§4", "§4", "§c", "§c", "§8"),
  onion: createCycleScheme("§f", "§d", "§d", "§d", "§a", "§a", "§f"),
  poser: createUniformScheme("§3", "§6", "§e"),
  quartz: createUniformScheme("§d", "§f", "§e"),
  rich: createUniformScheme("§8", "§6"),
  sanguine: createCycleScheme("§4", "§4", "§4", "§c", "§c", "§f", "§f"),
  titanic: createCycleScheme("§9", "§b", "§b", "§b", "§3", "§3", "§9"),
  unorthodox: createSuffixScheme("§d", ["§5", "§8"]),
  volcanic: createCycleScheme("§0", "§c", "§6", "§6", "§c", "§c", "§4"),
  weeping_cherry: createUniformScheme("§2", "§d", "§a"),
  x_ray: createUniformScheme("§f", "§8", "§f"),
  yearn: createPrefixScheme(["§e", "§6", "§4"], "§8"),
  zebra: createCycleScheme("§0", "§0", "§8", "§8", "§7", "§7", "§f", "§f"),
  caution: createCycleScheme("§e", "§e", "§e", "§0", "§0", "§e", "§0"),
  indescribable: createCycleScheme("§d", "§d", "§d", "§e", "§e", "§b", "§e"),
  forgotten: createUniformScheme("§0", "§8"),
  fuse: createCycleScheme("§8", "§7", "§f", "§f", "§f", "§e", "§f"),
  prestigious: createCycleScheme("§9", "§b", "§f", "§f", "§f", "§c", "§4"),
} satisfies Record<string, Scheme>;

export const STAR_MAP = {
  black_open: "✫",
  white_circled: "✪",
  white_outlined: "⚝",
  four_clubs: "✥",
  black_outlined: "✭",
  four_pointed: "✦",
  pinwheel: "✵",
  hollow: "✰",
  nautical: "✯",
} satisfies Record<string, string>;

export const BRACKET_MAP = {
  none: ["[", "]"],
  curly_brace: ["{", "}"],
  parenthesis: ["(", ")"],
  angled: ["<", ">"],
  double_angle_quotation_mark: ["«", "»"],
} satisfies Record<string, Brackets>;

export const PRESTIGE_SCHEMES: {
  req: number;
  scheme: keyof typeof SCHEME_MAP;
}[] = [
  { req: 0, scheme: "none" },
  { req: 100, scheme: "iron" },
  { req: 200, scheme: "gold" },
  { req: 300, scheme: "diamond" },
  { req: 400, scheme: "emerald" },
  { req: 500, scheme: "sapphire" },
  { req: 600, scheme: "ruby" },
  { req: 700, scheme: "crystal" },
  { req: 800, scheme: "opal" },
  { req: 900, scheme: "amethyst" },
  { req: 1000, scheme: "rainbow" },
  { req: 1100, scheme: "iron_prime" },
  { req: 1200, scheme: "gold_prime" },
  { req: 1300, scheme: "diamond_prime" },
  { req: 1400, scheme: "emerald_prime" },
  { req: 1500, scheme: "sapphire_prime" },
  { req: 1600, scheme: "ruby_prime" },
  { req: 1700, scheme: "crystal_prime" },
  { req: 1800, scheme: "opal_prime" },
  { req: 1900, scheme: "amethyst_prime" },
  { req: 2000, scheme: "mirror" },
  { req: 2100, scheme: "light" },
  { req: 2200, scheme: "dawn" },
  { req: 2300, scheme: "dusk" },
  { req: 2400, scheme: "air" },
  { req: 2500, scheme: "wind" },
  { req: 2600, scheme: "nebula" },
  { req: 2700, scheme: "thunder" },
  { req: 2800, scheme: "earth" },
  { req: 2900, scheme: "water" },
  { req: 3000, scheme: "fire" },
  { req: 3100, scheme: "sunrise" },
  { req: 3200, scheme: "eclipse" },
  { req: 3300, scheme: "gamma" },
  { req: 3400, scheme: "majestic" },
  { req: 3500, scheme: "andesine" },
  { req: 3600, scheme: "marine" },
  { req: 3700, scheme: "element" },
  { req: 3800, scheme: "galaxy" },
  { req: 3900, scheme: "atomic" },
  { req: 4000, scheme: "sunset" },
  { req: 4100, scheme: "time" },
  { req: 4200, scheme: "winter" },
  { req: 4300, scheme: "obsidian" },
  { req: 4400, scheme: "spring" },
  { req: 4500, scheme: "ice" },
  { req: 4600, scheme: "summer" },
  { req: 4700, scheme: "spinel" },
  { req: 4800, scheme: "autumn" },
  { req: 4900, scheme: "mystic" },
  { req: 5000, scheme: "eternal" },
  { req: 5100, scheme: "burnout" },
  { req: 5200, scheme: "cooldown" },
  { req: 5300, scheme: "obliteration" },
  { req: 5400, scheme: "ender" },
  { req: 5500, scheme: "brust" },
  { req: 5600, scheme: "comical" },
  { req: 5700, scheme: "lusterlost" },
  { req: 5800, scheme: "maelstrom" },
  { req: 5900, scheme: "time_undone" },
  { req: 6000, scheme: "umbrella" },
  { req: 6100, scheme: "luminous" },
  { req: 6200, scheme: "tortilla" },
  { req: 6300, scheme: "corn" },
  { req: 6400, scheme: "bittersweet" },
  { req: 6500, scheme: "sweetsour" },
  { req: 6600, scheme: "pop" },
  { req: 6700, scheme: "bubblegum" },
  { req: 6800, scheme: "contrast" },
  { req: 6900, scheme: "blended" },
  { req: 7000, scheme: "allay" },
  { req: 7100, scheme: "blaze" },
  { req: 7200, scheme: "creeper" },
  { req: 7300, scheme: "drowned" },
  { req: 7400, scheme: "enderman" },
  { req: 7500, scheme: "frog" },
  { req: 7600, scheme: "ghast" },
  { req: 7700, scheme: "hoglin" },
  { req: 7800, scheme: "iron_golem" },
  { req: 7900, scheme: "jerry" },
  { req: 8000, scheme: "kringle" },
  { req: 8100, scheme: "liquid" },
  { req: 8200, scheme: "mint" },
  { req: 8300, scheme: "neglected" },
  { req: 8400, scheme: "onion" },
  { req: 8500, scheme: "poser" },
  { req: 8600, scheme: "quartz" },
  { req: 8700, scheme: "rich" },
  { req: 8800, scheme: "sanguine" },
  { req: 8900, scheme: "titanic" },
  { req: 9000, scheme: "unorthodox" },
  { req: 9100, scheme: "volcanic" },
  { req: 9200, scheme: "weeping_cherry" },
  { req: 9300, scheme: "x_ray" },
  { req: 9400, scheme: "yearn" },
  { req: 9500, scheme: "zebra" },
  { req: 9600, scheme: "caution" },
  { req: 9700, scheme: "indescribable" },
  { req: 9800, scheme: "forgotten" },
  { req: 9900, scheme: "fuse" },
  { req: 10_000, scheme: "prestigious" },
];

export const PRESTIGE_STARS: { req: number; star: keyof typeof STAR_MAP }[] = [
  { req: 0, star: "black_open" },
  { req: 1000, star: "white_circled" },
  { req: 2000, star: "white_outlined" },
  { req: 3000, star: "four_clubs" },
  { req: 4000, star: "black_outlined" },
];

export const getIntendedFormattedLevel = (level: number): string => {
  const { scheme: schemeKey } = findScore(PRESTIGE_SCHEMES, level);
  const { star: starKey } = findScore(PRESTIGE_STARS, level);

  const scheme = SCHEME_MAP[schemeKey];
  const star = STAR_MAP[starKey];

  return scheme({
    level,
    star,
    brackets: BRACKET_MAP.none,
    bold: false,
    underline: false,
    strikethrough: false,
  });
};

export const getPrestigeCosmetic = <M extends Record<string, any>>({
  cosmetic,
  packages,
  favorites,
  prefix,
  map,
  getDefault,
}: {
  cosmetic?: string;
  packages?: string[];
  prefix: string;
  favorites?: Record<string, string[] | undefined>;
  map: M;
  getDefault: () => keyof M;
}): M[keyof M] => {
  const pickRandom = (items: (keyof M)[]) => {
    if (items.length === 0) return map[getDefault()];
    return map[items[Math.floor(Math.random() * items.length)]];
  };

  const filterValid = (items: string[]) =>
    items.filter((item) => item in map).map((item) => item as keyof M);

  if (cosmetic === "random_cosmetic") {
    const items = filterValid(
      (packages ?? [])
        .filter((pkg) => pkg.startsWith(prefix))
        // remove the prefix and the following underscore
        .map((pkg) => pkg.slice(prefix.length + 1)),
    );

    return pickRandom(items);
  }

  if (cosmetic === "random_favorite_cosmetic") {
    const items = filterValid(favorites?.[prefix] ?? []);
    return pickRandom(items);
  }

  // remove the prefix and the following underscore
  const cosmeticWithoutPrefix = cosmetic?.slice(prefix.length + 1);

  if (cosmeticWithoutPrefix && cosmeticWithoutPrefix in map) {
    return map[cosmeticWithoutPrefix];
  }

  if (cosmeticWithoutPrefix) {
    console.warn(`Missing BedWars cosmetic: ${cosmetic}`);
  }

  return map[getDefault()];
};
