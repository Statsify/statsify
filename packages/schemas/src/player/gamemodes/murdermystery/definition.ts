/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type APIData, abbreviationNumber, prettify } from "@statsify/util";
import { FormattedGame } from "#game";
import { KillsStats } from "../common.js";
import { ProgressionSchema, progression } from "../../../progression.definition.js";
import { add } from "@statsify/math";
import { cycleColors } from "#prefixes";
import { formats } from "#definition/format";
import { s } from "#definition/s";

const BaseModeStats = s.fields({
  wins: s.number().color("§a").leaderboard({ limit: 500_000 }),
  gamesPlayed: s.number().color("§b"),
  ...KillsStats,
  bowKills: s.number().color("§6"),
  goldPickedUp: s.number().color("§6"),
});

const StandardModeStats = s.fields({
  ...BaseModeStats,
  trapKills: s.number().color("§c"),
  thrownKnifeKills: s.number().color("§a"),
  heroKills: s.number().color("§e"),
  detectiveWins: s.number().color("§b"),
  murdererWins: s.number().color("§c"),
  killsAsMurderer: s.number().color("§4"),
  suicides: s.number().color("§4"),
});

const OverallMurderMysteryModeSchema = s.object({
  ...StandardModeStats,
  heroWins: s.number().color("§e"),
});

const fastestWin = (color: "§b" | "§c") =>
  s.number().color(color).format(formats.time).leaderboard({ sort: "ASC" });

const ClassicMurderMysteryModeSchema = s.object({
  ...StandardModeStats,
  fastestDetectiveWin: fastestWin("§b"),
  fastestMurdererWin: fastestWin("§c"),
});

const InfectionMurderMysteryModeSchema = s.object({
  ...BaseModeStats,
  alphaWins: s.number().color("§c"),
  killsAsAlpha: s.number().color("§4"),
  killsAsSurvivor: s.number().color("§6"),
  killsAsInfected: s.number().color("§2"),
  lastAliveGames: s.number().color("§b"),
});

const AssassinsMurderMysteryModeSchema = s.object({
  ...BaseModeStats,
  wins: s.number().color("§e").leaderboard({ limit: 500_000 }),
  trapKills: s.number().color("§c"),
  thrownKnifeKills: s.number().color("§a"),
  knifeKills: s.number(),
});

const KNIFE_EXP_LIMITS: Record<string, number> = {
  none: 200,
  vip: 200,
  mvp: 200,
};

const KNIFE_NAMES: Record<string, string> = {
  "none": "Default Iron Sword",
  "10000_spoons": "10,000 Spoons",
  "apple": "Unfortunately Colored Jacket",
  "basted_turkey": "Basted Turkey",
  "blaze_stick": "Blaze Rod",
  "bloody_brick": "Bloody Brick",
  "bone": "Big Bone",
  "campfire_leftovers": "Campfire Leftovers",
  "carrot_on_stick": "Somewhat Sharp Rock",
  "cheapo": "Cheapo Sword",
  "cheese": "Freshly Frozen Baguette",
  "chewed_bush": "Chewed Up Bush",
  "diamond_shovel": "Only the Best",
  "earthen_dagger": "Earthen Dagger",
  "easter_basket": "Easter Basket",
  "farming_implement": "Farming Implement",
  "feather": "Jagged Knife",
  "fragile_plant": "Fragile Plant",
  "frisbee": "Frisbee",
  "glistening_melon": "Glistening Melon",
  "gold_digger": "Gold Digger",
  "grilled_steak": "Grilled Steak",
  "grimoire": "Grimoire",
  "ice_shard": "Ice Shard",
  "mvp": "MVP Diamond Sword",
  "mouse_trap": "Mouse Trap",
  "prickly": "Prickly",
  "pumpkin_pie": "Pumpkin Pie",
  "rudolphs_nose": "Rudolph's Nose",
  "rudolphs_snack": "Rudolph's Favorite Snack",
  "salmon": "Salmon",
  "scythe": "The Scythe",
  "shears": "Shears",
  "shiny_snack": "Sparkly Snack",
  "shovel": "Shovel",
  "shred": "Shred",
  "stake": "Stake",
  "stick_with_hat": "Stick with a Hat",
  "stick": "Stick",
  "sweet_treat": "Sweet Treat",
  "timber": "Timber",
  "vip": "VIP Golden Sword",
  "wood_axe": "Wooden Axe",
  "double_death_scythe": "Double Death Scythe",
  "spray_painted_shovel": "Gold Spray Painted Shovel",
};

const MurderMysteryKnifeSchema = s.object({
  kind: s.string().default("none"),
  /** The selected knife's exp, from `knifeSkinPrestiges.xp` */
  xp: s.number().leaderboard(false),
  name() {
    return s
      .string()
      .computed((kind) => KNIFE_NAMES[kind] ?? prettify(kind), [this.kind])
      .default(KNIFE_NAMES.none);
  },
  progression() {
    return ProgressionSchema.computed(
      (kind, xp) => progression(xp, KNIFE_EXP_LIMITS[kind] ?? 500),
      [this.kind, this.xp]
    );
  },
});

const BRACKETS: Record<string, (prefix: string) => string> = {
  random_cosmetic: (prefix) => prefix,
  random_favorite_cosmetic: (prefix) => prefix,
  none: (prefix) => prefix,
  classic: (prefix) => `[${prefix}]`,
  infection: (prefix) => `{${prefix}}`,
  assassins: (prefix) => `(${prefix})`,
};

interface PrefixModes {
  classic: { wins: number; kills: number };
  doubleUp: { wins: number; kills: number };
  infection: { wins: number; kills: number };
  assassins: { wins: number; kills: number };
}

const PREFIX_STAT: Record<string, (mm: PrefixModes) => number | undefined> = {
  random_cosmetic: () => {},
  random_favorite_cosmetic: () => {},
  prefixstat_none: () => {},
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
  prefixscheme_killer_khroma: (prefix) => cycleColors(prefix, ["§c", "§6", "§e", "§a", "§d"]),
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

function formatPrefix(
  iconKey: string | undefined,
  schemeKey: string | undefined,
  statKey: string | undefined,
  modes: PrefixModes
) {
  const icon = PREFIX_ICON[iconKey ?? ""] ?? PREFIX_ICON.prefixicon_default;
  const scheme = PREFIX_SCHEME[schemeKey ?? ""] ?? PREFIX_SCHEME.prefixscheme_none;
  const stat = (PREFIX_STAT[statKey ?? ""] ?? PREFIX_STAT.prefixstat_none)(modes);

  let formattedStat = "";

  if (stat !== undefined) {
    const [number, suffix] = abbreviationNumber(stat, 1);
    formattedStat = `${number}${suffix.toLowerCase()}`;
  }

  const bracketKey = (statKey ?? "prefixstat_none").replace("prefixstat_", "").split("_")[0];
  const bracket = BRACKETS[bracketKey] ?? BRACKETS.none;

  const prefix = scheme(bracket(`${formattedStat}${icon}`));
  return statKey?.endsWith("_kills") ? `§n${prefix}` : prefix;
}

export const MurderMysterySchema = s
  .object({
    tokens: s.number().color("§2"),
    activePrefixicon: s.string(),
    activePrefixscheme: s.string(),
    activePrefixstat: s.string(),
    prefix() {
      return s
        .string()
        .computed(
          (icon, scheme, stat, classic, doubleUp, infection, assassins) =>
            formatPrefix(icon, scheme, stat, { classic, doubleUp, infection, assassins }),
          [
            this.activePrefixicon,
            this.activePrefixscheme,
            this.activePrefixstat,
            this.classic,
            this.doubleUp,
            this.infection,
            this.assassins,
          ]
        )
        .default("§7✪");
    },
    knife: MurderMysteryKnifeSchema,
    overall: OverallMurderMysteryModeSchema,
    classic: ClassicMurderMysteryModeSchema,
    assassins: AssassinsMurderMysteryModeSchema,
    doubleUp: ClassicMurderMysteryModeSchema,
    infection: InfectionMurderMysteryModeSchema,
  })
  .leaderboard((murdermystery) => ({
    fieldName: FormattedGame.MURDER_MYSTERY,
    extraDisplay: murdermystery.prefix,
  }));

export type MurderMystery = s.infer<typeof MurderMysterySchema>;

function baseMode(data: APIData, mode: string) {
  const suffix = mode ? `_${mode}` : mode;

  return {
    wins: data[`wins${suffix}`],
    gamesPlayed: data[`games${suffix}`],
    kills: data[`kills${suffix}`],
    deaths: data[`deaths${suffix}`],
    bowKills: data[`bow_kills${suffix}`],
    goldPickedUp: data[`coins_pickedup${suffix}`],
  };
}

function standardMode(data: APIData, mode: string) {
  const suffix = mode ? `_${mode}` : mode;

  return {
    ...baseMode(data, mode),
    trapKills: data[`trap_kills${suffix}`],
    thrownKnifeKills: data[`thrown_knife_kills${suffix}`],
    heroKills: data[`was_hero${suffix}`],
    detectiveWins: data[`detective_wins${suffix}`],
    murdererWins: data[`murderer_wins${suffix}`],
    killsAsMurderer: data[`kills_as_murderer${suffix}`],
    suicides: data[`suicides${suffix}`],
  };
}

function classicMode(
  data: APIData,
  mode: string
): s.input<typeof ClassicMurderMysteryModeSchema> {
  return {
    ...standardMode(data, mode),
    fastestDetectiveWin: (data[`quickest_detective_win_time_seconds_${mode}`] ?? 0) * 1000,
    fastestMurdererWin: (data[`quickest_murderer_win_time_seconds_${mode}`] ?? 0) * 1000,
  };
}

function knife(data: APIData): s.input<typeof MurderMysteryKnifeSchema> {
  const xp: Record<string, number> = data.knifeSkinPrestiges?.xp ?? {};
  let kind: string = data.active_knife_skin?.replace("knife_skin_", "") ?? "none";

  if (kind === "random_cosmetic") {
    let max: [string, number] | undefined;

    for (const knife of Object.entries(xp)) {
      if (max === undefined || knife[1] > max[1]) max = knife;
    }

    kind = max?.[0] ?? "none";
  }

  return { kind, xp: xp[kind] ?? 0 };
}

export function murderMystery(data: APIData = {}, ap: APIData = {}): s.input<typeof MurderMysterySchema> {
  return {
    tokens: data.coins,
    activePrefixicon: data.active_prefixicon,
    activePrefixscheme: data.active_prefixscheme,
    activePrefixstat: data.active_prefixstat,
    knife: knife(data),
    overall: { ...standardMode(data, ""), heroWins: ap.murdermystery_countermeasures },
    classic: classicMode(data, "MURDER_CLASSIC"),
    assassins: {
      ...baseMode(data, "MURDER_ASSASSINS"),
      trapKills: data.trap_kills_MURDER_ASSASSINS,
      thrownKnifeKills: data.thrown_knife_kills_MURDER_ASSASSINS,
      knifeKills: data.knife_kills_MURDER_ASSASSINS,
    },
    doubleUp: classicMode(data, "MURDER_DOUBLE_UP"),
    infection: {
      ...baseMode(data, "MURDER_INFECTION"),
      alphaWins: data.alpha_wins_MURDER_INFECTION,
      killsAsAlpha: data.kills_as_alpha_MURDER_INFECTION,
      killsAsSurvivor: data.kills_as_survivor_MURDER_INFECTION,
      killsAsInfected: data.kills_as_infected_MURDER_INFECTION,
      lastAliveGames: data.last_one_alive_MURDER_INFECTION,
    },
  };
}
