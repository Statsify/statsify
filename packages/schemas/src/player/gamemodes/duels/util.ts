/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData, findScoreIndex, romanNumeral } from "@statsify/util";
import { GamePrefix, createPrefixProgression, cycleColors } from "#prefixes";
import type { ColorCode } from "#color";

export interface Title {
  req: number;
  step: number;
  max: number;
  title: string;
  defaultColor: ColorCode;
  bold: boolean;
}

export const defaultTitleScores: Title[] = [
  { req: 0, step: 0, max: 5, title: "None", defaultColor: "§7", bold: false },
  { req: 50, step: 10, max: 5, title: "Rookie", defaultColor: "§7", bold: false },
  { req: 100, step: 30, max: 5, title: "Iron", defaultColor: "§f", bold: false },
  { req: 250, step: 50, max: 5, title: "Gold", defaultColor: "§6", bold: false },
  { req: 500, step: 100, max: 5, title: "Diamond", defaultColor: "§3", bold: false },
  { req: 1000, step: 200, max: 5, title: "Master", defaultColor: "§2", bold: false },
  { req: 2000, step: 600, max: 5, title: "Legend", defaultColor: "§4", bold: true },
  { req: 5000, step: 1000, max: 5, title: "Grandmaster", defaultColor: "§e", bold: true },
  { req: 10_000, step: 3000, max: 5, title: "Godlike", defaultColor: "§5", bold: true },
  { req: 25_000, step: 5000, max: 5, title: "CELESTIAL", defaultColor: "§b", bold: true },
  { req: 50_000, step: 10_000, max: 5, title: "DIVINE", defaultColor: "§d", bold: true },
  { req: 100_000, step: 10_000, max: 50, title: "ASCENDED", defaultColor: "§c", bold: true },
];

const overallTitleScores = defaultTitleScores.map((data) => ({
  ...data,
  req: data.req * 2,
  step: data.step * 2,
}));

const halfTitleScores = defaultTitleScores.map((data) => ({
  ...data,
  req: data.req / 2,
  step: data.step / 2,
}));

export type TitleRequirement = "overall" | "default" | "half";

const titleRequirementScores: Record<TitleRequirement, Title[]> = {
  default: defaultTitleScores,
  overall: overallTitleScores,
  half: halfTitleScores,
};

const getPrefixes = (titles: Title[]) =>
  titles.flatMap((title) => {
    const calculatedTitles: GamePrefix[] = [];

    for (let i = 0; i < title.max; i++) {
      calculatedTitles.push({ fmt: (n) => `[${n}]`, req: title.req + i * title.step });
    }

    return calculatedTitles;
  });

const prefixRequirementScores: Record<TitleRequirement, GamePrefix[]> = {
  default: getPrefixes(defaultTitleScores),
  overall: getPrefixes(overallTitleScores),
  half: getPrefixes(halfTitleScores),
};

export const getTitleAndProgression = ({
  score,
  mode,
  data,
  titleRequirement,
}: {
  score: number;
  mode: string;
  data: APIData;
  titleRequirement: TitleRequirement;
}) => {
  mode = mode ? `${mode} ` : mode;

  const titleScores = titleRequirementScores[titleRequirement];
  const prefixScores = prefixRequirementScores[titleRequirement];

  const index = findScoreIndex(titleScores, score);
  const { req, step, title, max, defaultColor, bold } = titleScores[index];

  const remaining = score - req;
  const division = Math.min(max, (step ? Math.floor(remaining / step) : step) + 1);

  const iconKey = data.active_prefix_icon?.replace("prefix_icon_", "");
  const schemeKey = data.active_prefix_scheme?.replace("prefix_scheme_", "");

  const icon = iconKey in ICON_MAP ? ICON_MAP[iconKey as keyof typeof ICON_MAP] : ICON_MAP.none;

  const scheme = schemeKey in SCHEME_MAP ?
    SCHEME_MAP[schemeKey as keyof typeof SCHEME_MAP] :
    SCHEME_MAP.default;

  const titleFormatted = scheme.title(icon, `${mode}${title}${division > 1 ? ` ${romanNumeral(division)}` : ""}`, bold, defaultColor);
  const titleLevelFormatted = scheme.level(romanNumeral(division), bold, defaultColor);

  let nextDivision = division + 1;
  let nextDefaultColor = defaultColor;

  if (nextDivision > max) {
    nextDivision = 1;
    if (index < titleScores.length - 1) nextDefaultColor = titleScores[index + 1].defaultColor;
  }

  const nextTitleLevelFormatted = scheme.level(romanNumeral(nextDivision), bold, nextDefaultColor);
  const progression = createPrefixProgression(prefixScores, score);

  return {
    titleFormatted,
    titleLevelFormatted,
    nextTitleLevelFormatted,
    progression,
  };
};

// removed prefix_icon_ from each icon name
const ICON_MAP = {
  strike: "⚡",
  heart: "❤",
  fists: "ლ(ಠ_ಠლ)",
  podium: "π",
  speed: "»",
  uninterested: "(T_T)",
  platforms: "...",
  sigma: "Σ",
  biohazard: "☣",
  deny: "∅",
  sun: "❂",
  lucky: String.raw`\༼•◡•༽/`,
  fish: "><>",
  excited: "!!",
  arrow: "➜",
  reminiscence: "≈",
  beam: "——",
  layered: "≡",
  same_great_taste: "ಠ_ಠ",
  pointy_star: "✵",
  victory: "༼つ°◡°༽つ",
  regretting_this: "uwu",
  smiley: "^_^",
  rhythm: "♫♪",
  yin_and_yang: "☯",
  flower: "❀",
  repeated: "²",
  fancy_star: "✯",
  weight: "❚==❚",
  arena: "Θ",
  confused: "??",
  // in game this icon shows a player's position in a certain stat
  // since we can't fetch an accurate position just put a square instead
  div_ranking: "#X",
  snowman: "☃",
  final: "☠",
  gg: "GG",
  star: "✫",
  walls: "÷",
  delta: "δ",
  root: "√",
  none: "",
  fallen_crest: "☬",
  // unverified api names below
  innocent: "{▀͜ʖ▀}",
  bear: "ʕo͜oʔ",
  dont_blink: "-»[*_*]",
  dont_punch: "(°͜ʖ°)",
  alchemist: "<∅_∅>",
  wither: "[■_■]",
  bliss: "(°‿つ°)",
  flipper: "(┛ಠ_ಠ)┛彡┻━┻",
  boxer: "o=('-'Q)",
  piercing_look: "|> - <|",
  hypnotized: "[@~@]",
  ghost: "ヘ(-w-ヘ)",
  reference: "{┳}",
  bill: "[($)]",
  smile_spam: ":)))))",
};

type Scheme = {
  title: (icon: string, title: string, bold: boolean, defaultColor: ColorCode) => string;
  level: (level: string, bold: boolean, defaultColor: ColorCode) => string;
};

const solidColorScheme = (color: string): Scheme => ({
  title: (icon, title, bold) => `${icon ? `${color}${icon} ` : ""}${bold ? "§l" : ""}${color}${title}§r`,
  level: (level, bold) => `${color}[${bold ? "§l" : ""}${level}§r${color}]§r`,
});

const gradientColorScheme = (colors: string[]): Scheme => ({
  title: (icon, title, bold) => {
    icon = icon ? `${icon} ` : "";
    const chunks = [...`${icon}${title}`];
    if (bold) chunks[icon.length] = `§l${chunks[icon.length]}`;

    const colorWidth = Math.floor(chunks.length / colors.length);
    let coloredTitleWithIcon = "";

    for (let i = 0; i < colors.length; i++) {
      coloredTitleWithIcon += colors[i];
      coloredTitleWithIcon += chunks
        .slice(i * colorWidth, i === colors.length - 1 ? chunks.length : (i + 1) * colorWidth)
        .join("");
    }

    coloredTitleWithIcon += "§r";

    return coloredTitleWithIcon;
  },
  level: (numerals, bold) => {
    const inner = cycleColors(numerals, colors.slice(1, -1));
    return `${colors[0]}[${bold ? "§l" : ""}${inner}§r${colors.at(-1)}]§r`;
  },
});

const defaultScheme: Scheme = {
  title: (icon, title, bold, defaultColor) => `${defaultColor}${icon ? `${icon} ` : ""}${bold ? "§l" : ""}${title}§r`,
  level: (level, bold, defaultColor) => `${defaultColor}[${bold ? "§l" : ""}${level}§r${defaultColor}]§r`,
};

// removed prefix_scheme_ from each scheme
const SCHEME_MAP: Record<string, Scheme> = {
  default: defaultScheme,
  boilerplate_gold: solidColorScheme("§6"),
  carpeted_light_purple: solidColorScheme("§d"),
  vanilla_white: solidColorScheme("§f"),
  absorption_yellow: solidColorScheme("§e"),
  heavy_dark_green: solidColorScheme("§2"),
  explosive_dark_red: solidColorScheme("§4"),
  ender_green: solidColorScheme("§a"),
  platformer_dark_purple: solidColorScheme("§5"),
  armored_aqua: solidColorScheme("§b"),
  pearl_dark_aqua: solidColorScheme("§3"),
  withering_black: solidColorScheme("§0"),
  persistent_dark_blue: solidColorScheme("§1"),
  good_ol_gray: solidColorScheme("§7"),
  punchable_red: solidColorScheme("§c"),
  drawstring_dark_gray: solidColorScheme("§8"),
  blitz_blue: solidColorScheme("§9"),
  ultra_hardcore_undertone: gradientColorScheme(["§2", "§a", "§e", "§e", "§6"]),
  in_case_of_chroma: gradientColorScheme(["§5", "§d", "§f", "§9", "§1"]),
  elusive_jeremiah_huestring: gradientColorScheme(["§3", "§6", "§6", "§e", "§b"]),
  healthy_stain: gradientColorScheme(["§8", "§7", "§7", "§f", "§c"]),
  four_team_tie_dye: gradientColorScheme(["§e", "§a", "§f", "§c", "§9"]),
  combo_coating: gradientColorScheme(["§4", "§c", "§6", "§e", "§f"]),
  mythic_pigment: gradientColorScheme(["§c", "§e", "§a", "§b", "§d"]),
  picturesque_firework: gradientColorScheme(["§1", "§9", "§f", "§c", "§4"]),
  punching_paint: gradientColorScheme(["§4", "§5", "§5", "§d", "§b"]),
  flint_gradient: gradientColorScheme(["§f", "§f", "§7", "§8", "§0"]),
  a_splash_of_star: gradientColorScheme(["§1", "§9", "§3", "§3", "§b"]),
  sunny_shades: gradientColorScheme(["§3", "§b", "§b", "§f", "§e"]),
  blossoms: gradientColorScheme(["§5", "§d", "§f", "§d", "§f"]),
  festive_finish: gradientColorScheme(["§2", "§c", "§c", "§c", "§2"]),
  with_a_side_of_skies: gradientColorScheme(["§3", "§a", "§a", "§a", "§2"]),
  overpowered_gloss: gradientColorScheme(["§d", "§d", "§b", "§b", "§f"]),
  the_impossible_varnish: gradientColorScheme(["§d", "§a", "§a", "§a", "§f"]),
  color_of_a_flash: gradientColorScheme(["§8", "§f", "§f", "§f", "§8"]),
  bedding_hues: gradientColorScheme(["§c", "§c", "§c", "§f", "§f"]),
  variety_values: gradientColorScheme(["§b", "§f", "§f", "§f", "§b"]),
  og_fade: gradientColorScheme(["§6", "§e", "§f", "§7", "§8"]),
};

