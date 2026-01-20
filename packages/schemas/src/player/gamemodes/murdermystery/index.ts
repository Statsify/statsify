/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type APIData, abbreviationNumber } from "@statsify/util";
import {
  AssassinsMurderMysteryMode,
  ClassicMurderMysteryMode,
  InfectionMurderMysteryMode,
  MurderMysteryKnife,
  OverallMurderMysteryMode,
} from "./mode.js";
import { type ExtractGameModes, GameModes } from "#game";
import { Field } from "#metadata";
import { add } from "@statsify/math";
import { cycleColors } from "#prefixes";

export const MURDER_MYSTERY_MODES = new GameModes([
  { api: "overall" },
  { api: "classic" },
  { api: "doubleUp" },
  { api: "assassins" },
  { api: "infection" },

  { hypixel: "MURDER_DOUBLE_UP", formatted: "Double Up" },
  { hypixel: "MURDER_INFECTION", formatted: "Infection" },
  { hypixel: "MURDER_ASSASSINS", formatted: "Assassins" },
  { hypixel: "MURDER_CLASSIC", formatted: "Classic" },
] as const);

export type MurderMysteryModes = ExtractGameModes<typeof MURDER_MYSTERY_MODES>;

export class MurderMystery {
  @Field({ historical: { enabled: false } })
  public tokens: number;

  @Field({ store: { default: "§7✪" } })
  public prefix: string;

  @Field()
  public knife: MurderMysteryKnife;

  @Field()
  public overall: OverallMurderMysteryMode;

  @Field()
  public classic: ClassicMurderMysteryMode;

  @Field()
  public assassins: AssassinsMurderMysteryMode;

  @Field()
  public doubleUp: ClassicMurderMysteryMode;

  @Field()
  public infection: InfectionMurderMysteryMode;

  public constructor(data: APIData, ap: APIData) {
    this.tokens = data.coins;

    this.knife = new MurderMysteryKnife(data);

    this.overall = new OverallMurderMysteryMode(data, ap);
    this.classic = new ClassicMurderMysteryMode(data, "MURDER_CLASSIC");
    this.doubleUp = new ClassicMurderMysteryMode(data, "MURDER_DOUBLE_UP");
    this.assassins = new AssassinsMurderMysteryMode(data, "MURDER_ASSASSINS");
    this.infection = new InfectionMurderMysteryMode(data, "MURDER_INFECTION");

    const prefixIcon = data.active_prefixicon ?? "prefixicon_default";
    const prefixScheme = data.active_prefixscheme ?? "prefixscheme_none";
    const prefixStat = data.active_prefixstat ?? "prefixstat_none";
    this.prefix = createPrefix(prefixIcon, prefixScheme, prefixStat, this);
  }
}

const BRACKETS: Record<string, (prefix: string) => string> = {
  random_cosmetic: (prefix) => prefix,
  random_favorite_cosmetic: (prefix) => prefix,
  none: (prefix) => prefix,
  classic: (prefix) => `[${prefix}]`,
  infection: (prefix) => `{${prefix}}`,
  assassins: (prefix) => `(${prefix})`,
};

const PREFIX_STAT: Record<string, (mm: MurderMystery) => number | undefined> = {
  random_cosmetic: () => undefined,
  random_favorite_cosmetic: () => undefined,
  prefixstat_none: () => undefined,
  prefixstat_classic_wins: (mm) => add(mm.classic.wins, mm.doubleUp.wins),
  prefixstat_infection_wins: (mm) => mm.infection.wins ?? 0,
  prefixstat_assassins_wins: (mm) => mm.assassins.wins ?? 0,
  prefixstat_classic_kills: (mm) => add(mm.classic.kills, mm.doubleUp.kills),
  prefixstat_infection_kills: (mm) => mm.infection.kills ?? 0,
  prefixstat_assassins_kills: (mm) => mm.assassins.kills ?? 0,
};

const PREFIX_SCHEME: Record<string, (prefix: string) => string> = {
  random_cosmetic: (prefix) => `§7${prefix}`,
  random_favorite_cosmetic: (prefix) => `§7${prefix}`,
  prefixscheme_none: (prefix) => `§7${prefix}`,
  prefixscheme_dull_dark_gray: (prefix) => `§8${prefix}`,
  prefixscheme_sharp_gray: (prefix) => `§7${prefix}`,
  prefixscheme_basic_white: (prefix) => `§f${prefix}`,
  prefixscheme_bloodthirsty_gold: (prefix) => `§6${prefix}`,
  prefixscheme_obvious_yellow: (prefix) => `§e${prefix}`,
  prefixscheme_camo_green: (prefix) => `§a${prefix}`,
  prefixscheme_shady_dark_green: (prefix) => `§2${prefix}`,
  prefixscheme_passive_aqua: (prefix) => `§b${prefix}`,
  prefixscheme_suspicious_dark_aqua: (prefix) => `§3${prefix}`,
  prefixscheme_silent_black: (prefix) => `§0${prefix}`,
  prefixscheme_regal_dark_purple: (prefix) => `§5${prefix}`,
  prefixscheme_disguised_blue: (prefix) => `§9${prefix}`,
  prefixscheme_ruthless_light_purple: (prefix) => `§d${prefix}`,
  prefixscheme_dried_dark_red: (prefix) => `§4${prefix}`,
  prefixscheme_guilty_blood_red: (prefix) => `§c${prefix}`,
  prefixscheme_killer_khroma: (prefix) =>
    cycleColors(prefix, ["§c", "§6", "§e", "§a", "§d"]),
};

const PREFIX_ICON: Record<string, string> = {
  random_cosmetic: "✪",
  random_favorite_cosmetic: "✪",
  prefixicon_default: "✪",
  prefixicon_divine: "Φ",
  prefixicon_zero: "∅",
  prefixicon_sigma: "Σ",
  prefixicon_omega: "Ω",
  prefixicon_alpha: "α",
  prefixicon_equivalence: "≡",
  prefixicon_rich: "$",
  prefixicon_podium: "π",
  prefixicon_florin: "ƒ",
};

function createPrefix(
  iconKey: string,
  schemeKey: string,
  statKey: string,
  mm: MurderMystery
) {
  const icon =
    iconKey in PREFIX_ICON ?
      PREFIX_ICON[iconKey] :
      PREFIX_ICON.prefixicon_default;
  const scheme =
    schemeKey in PREFIX_SCHEME ?
      PREFIX_SCHEME[schemeKey] :
      PREFIX_SCHEME.prefixscheme_none;
  const statFn =
    statKey in PREFIX_STAT ? PREFIX_STAT[statKey] : PREFIX_STAT.prefixstat_none;
  const stat = statFn(mm);

  let formattedStat: string = "";

  if (stat !== undefined) {
    const [number, suffix] = abbreviationNumber(stat, 1);
    formattedStat = `${number}${suffix.toLowerCase()}`;
  }

  const bracketKey = statKey.replace("prefixstat_", "").split("_")[0];
  const bracket = bracketKey in BRACKETS ? BRACKETS[bracketKey] : BRACKETS.none;

  const hasUnderline = statKey.endsWith("_kills");
  const prefix = scheme(bracket(`${formattedStat}${icon}`));
  return hasUnderline ? `§n${prefix}` : prefix;
}

export * from "./mode.js";
