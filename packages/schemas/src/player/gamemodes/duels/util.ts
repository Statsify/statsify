/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData, findScore, romanNumeral } from "@statsify/util";
import { GamePrefix, createPrefixProgression, cycleColors } from "#prefixes";

export interface Title {
  req: number;
  inc: number;
  max?: number;
  title: string;
}

export const modeTitleScores: Title[] = [
  { req: 0, inc: 0, title: "None" },
  { req: 50, inc: 10, title: "Rookie" },
  { req: 100, inc: 30, title: "Iron" },
  { req: 250, inc: 50, title: "Gold" },
  { req: 500, inc: 100, title: "Diamond" },
  { req: 1000, inc: 200, title: "Master" },
  { req: 2000, inc: 600, title: "Legend" },
  { req: 5000, inc: 1000, title: "Grandmaster" },
  { req: 10_000, inc: 3000, title: "Godlike" },
  { req: 25_000, inc: 5000, title: "CELESTIAL" },
  { req: 50_000, inc: 10_000, title: "DIVINE" },
  { req: 100_000, inc: 10_000, max: 50, title: "ASCENDED" },
];

const overallTitleScores = modeTitleScores.map((data) => ({
  ...data,
  req: data.req * 2,
  inc: data.inc * 2,
}));

const getPrefixes = (titles: Title[]) =>
  titles.flatMap((title) => {
    const calculatedTitles: GamePrefix[] = [];

    for (let i = 0; i < (title.max ?? 5); i++) {
      calculatedTitles.push({ fmt: (n) => `[${n}]`, req: title.req + i * title.inc });
    }

    return calculatedTitles;
  });

const overallTitlePrefixes = getPrefixes(overallTitleScores);
const modeTitlePrefixes = getPrefixes(modeTitleScores);

const BOLD_TITLE_REQUIREMENT = 100_000;

export const getTitleAndProgression = ({
  wins,
  mode,
  data,
}: {
  wins: number;
  mode: string;
  data: APIData;
}) => {
  const isOverall = mode === "";
  mode = mode ? `${mode} ` : mode;

  const { req, inc, title, max } = findScore(isOverall ? overallTitleScores : modeTitleScores, wins);

  const remaining = wins - req;
  let index = (inc ? Math.floor(remaining / inc) : inc) + 1;
  index = max ? Math.min(index, max) : index;

  const iconKey = data.active_prefix_icon?.replace("prefix_icon_", "");
  const schemeKey = data.active_prefix_scheme?.replace("prefix_scheme_", "");

  const icon = iconKey in ICON_MAP ? ICON_MAP[iconKey as keyof typeof ICON_MAP] : ICON_MAP.none;

  const scheme = schemeKey in SCHEME_MAP ?
    SCHEME_MAP[schemeKey as keyof typeof SCHEME_MAP] :
    SCHEME_MAP.boilerplate_gold;

  const bold = (data?.settings?.bold_title === undefined && data.wins > BOLD_TITLE_REQUIREMENT) ||
    Boolean(data?.settings?.bold_title);

  const titleFormatted = scheme.title(icon, `${mode}${title}${index > 1 ? ` ${romanNumeral(index)}` : ""}`, bold);

  const titleLevelFormatted = scheme.level(romanNumeral(index), bold);
  const nextTitleLevelFormatted = scheme.level(romanNumeral(index + 1 > (max ?? 5) ? 1 : index + 1), bold);
  const progression = createPrefixProgression(isOverall ? overallTitlePrefixes : modeTitlePrefixes, wins);

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
  title: (icon: string, title: string, bold: boolean) => string;
  level: (level: string, bold: boolean) => string;
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

// removed prefix_scheme_ from each scheme
const SCHEME_MAP: Record<string, Scheme> = {
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
};

