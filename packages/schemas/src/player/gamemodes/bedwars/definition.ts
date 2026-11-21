/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  BRACKET_MAP,
  getExpReq,
  getIntendedFormattedLevel,
  getLevel,
  pickPrestigeCosmetic,
  pickRandomCosmetic,
  PRESTIGE_SCHEMES,
  PRESTIGE_STARS,
  SCHEME_MAP,
  STAR_MAP,
  warnMissingCosmetic,
} from "./util.js";
import { BedsStats, ExpSchema, FinalKillsStats, KillsStats, WinsStats } from "../common.js";
import { type ExtractGameModes, FormattedGame, GameModes } from "#game";
import { ProgressionSchema, expProgression } from "../../../progression.definition.js";
import { type APIData, findScore } from "@statsify/util";
import { deepAdd, deepSub } from "@statsify/math";
import { formats } from "#definition/format";
import { s } from "#definition/s";

export const BEDWARS_MODES = new GameModes([
  { api: "overall" },
  { api: "core" },
  { api: "solo", hypixel: "BEDWARS_EIGHT_ONE" },
  { api: "doubles", hypixel: "BEDWARS_EIGHT_TWO" },
  { api: "threes", hypixel: "BEDWARS_FOUR_THREE" },
  { api: "fours", hypixel: "BEDWARS_FOUR_FOUR" },
  { api: "4v4", hypixel: "BEDWARS_TWO_FOUR" },
  { api: "armed" },
  { api: "castle", hypixel: "BEDWARS_CASTLE" },
  { api: "lucky" },
  { api: "rush" },
  { api: "swap" },
  { api: "ultimate" },
  { api: "underworld" },
  { api: "voidless" },
  { api: "oneBlock", hypixel: "BEDWARS_EIGHT_ONE_ONEBLOCK" },
  { api: "challenges" },

  { hypixel: "BEDWARS_EIGHT_TWO_ARMED", formatted: "Armed Doubles" },
  { hypixel: "BEDWARS_FOUR_FOUR_ARMED", formatted: "Armed Fours" },
  { hypixel: "BEDWARS_EIGHT_TWO_LUCKY", formatted: "Lucky Doubles" },
  { hypixel: "BEDWARS_FOUR_FOUR_LUCKY", formatted: "Lucky Fours" },
  { hypixel: "BEDWARS_EIGHT_TWO_RUSH", formatted: "Rush Doubles" },
  { hypixel: "BEDWARS_FOUR_FOUR_RUSH", formatted: "Rush Fours" },
  { hypixel: "BEDWARS_EIGHT_TWO_SWAP", formatted: "Swap Doubles" },
  { hypixel: "BEDWARS_FOUR_FOUR_SWAP", formatted: "Swap Fours" },
  { hypixel: "BEDWARS_EIGHT_TWO_ULTIMATE", formatted: "Ultimate Doubles" },
  { hypixel: "BEDWARS_FOUR_FOUR_ULTIMATE", formatted: "Ultimate Fours" },
  { hypixel: "BEDWARS_EIGHT_TWO_UNDERWORLD", formatted: "Underworld Doubles" },
  { hypixel: "BEDWARS_FOUR_FOUR_UNDERWORLD", formatted: "Underworld Fours" },
  { hypixel: "BEDWARS_EIGHT_TWO_VOIDLESS", formatted: "Voidless Doubles" },
  { hypixel: "BEDWARS_FOUR_FOUR_VOIDLESS", formatted: "Voidless Fours" },
  { hypixel: "BEDWARS_PRACTICE", formatted: "Practice" },
] as const);

export type BedWarsModes = ExtractGameModes<typeof BEDWARS_MODES>;

const ItemsCollectedSchema = s.object({
  iron: s.number().color("§7").leaderboard({ limit: 100_000 }),
  gold: s.number().color("§6").leaderboard({ limit: 100_000 }),
  diamond: s.number().color("§b").leaderboard({ limit: 100_000 }),
  emerald: s.number().color("§2").leaderboard({ limit: 100_000 }),
});

export const BedWarsModeSchema = s.object({
  winstreak: s.number().color("§a"),
  gamesPlayed: s.number(),
  ...WinsStats,
  ...KillsStats,
  ...FinalKillsStats,
  ...BedsStats,
  itemsCollected: ItemsCollectedSchema,
});

export type BedWarsMode = s.infer<typeof BedWarsModeSchema>;
type BedWarsModeInput = s.input<typeof BedWarsModeSchema>;

const BedWarsChallengesSchema = s.object({
  uniqueChallenges: s.number().leaderboard(false),
  totalChallenges: s.number(),
  renegade: s.number(),
  warmonger: s.number(),
  selfish: s.number(),
  minimumWage: s.number(),
  assassin: s.number(),
  regularShopper: s.number(),
  invisibleShop: s.number(),
  collector: s.number(),
  woodworker: s.number(),
  bridgingForDummies: s.number(),
  toxicRain: s.number(),
  defuser: s.number(),
  miningFatigue: s.number(),
  ultimateUHC: s.number().leaderboard({ fieldName: "Ultimate UHC" }),
  sleightOfHand: s.number(),
  weightedItems: s.number(),
  socialDistancing: s.number(),
  swordless: s.number(),
  marksman: s.number(),
  patriot: s.number(),
  stamina: s.number(),
  oldMan: s.number(),
  cappedResources: s.number(),
  redLightGreenLight: s.number(),
  slowReflexes: s.number(),
  pacifist: s.number(),
  masterAssassin: s.number(),
  standingTall: s.number(),
  protectThePresident: s.number(),
  cantTouchThis: s.number().leaderboard({ fieldName: "Can't Touch This" }),
  woolWarrior: s.number(),
  anchor: s.number(),
  noDreaming: s.number(),
  quickMaths: s.number(),
  blockrepellentBeds: s.number(),
  midnight: s.number(),
  bedsAndBloodlust: s.number().leaderboard({ fieldName: "Beds & Bloodlust" }),
  begAndBarter: s.number().leaderboard({ fieldName: "Beg & Barter" }),
  halvedAndDoubled: s.number().leaderboard({ fieldName: "Halved & Doubled" }),
});

const WALLET_SIZES: Record<string, number> = {
  MINI_WALLET: 25,
  LIGHT_SLUMBERS_WALLET: 99,
  LIGHT_IMPERIAL_WALLET: 500,
  EXPLORERS_WALLET: 5000,
  HOTEL_STAFF_WALLET: 10_000,
  PLATINUM_MEMBERSHIP_WALLET: 100_000,
};

const SlumberSchema = s
  .object({
    tickets: s.number().color("§b").leaderboard(false),
    totalTickets: s.number().color("§d").leaderboard({ fieldName: "Total Slumber Tickets" }),
    bagType: s.string(),
    wallet() {
      return s
        .number()
        .computed((bagType) => WALLET_SIZES[bagType] ?? 0, [this.bagType])
        .subtractInSessions()
        .leaderboard(false);
    },
  })
  .leaderboard({ fieldName: "" });

/** Where each random prestige selection landed, which can't be picked again on read, and Hypixel's toggles */
const PrestigeSchema = s.object({
  randomScheme: s.string<keyof typeof SCHEME_MAP>().optional(),
  randomStar: s.string<keyof typeof STAR_MAP>().optional(),
  randomBrackets: s.string<keyof typeof BRACKET_MAP>().optional(),
  boldNumbers: s.boolean(),
  underlinedPrestige: s.boolean(),
  strikethroughBrackets: s.boolean(),
});

type Prestige = s.infer<typeof PrestigeSchema>;

// Read back from Mongo, a random selection with nothing to pick from has "" rather than undefined
const selectedCosmetic = <M extends Record<string, any>>(
  map: M,
  prefix: string,
  cosmetic: string,
  randomPick: keyof M | undefined
) => randomPick || pickPrestigeCosmetic({ cosmetic, prefix, map });

const formatLevel = (
  exp: number,
  scheme: string,
  star: string,
  brackets: string,
  prestige: Prestige
) => {
  const level = Math.floor(getLevel(exp));

  const format =
    SCHEME_MAP[
      selectedCosmetic(SCHEME_MAP, "prestige_scheme", scheme, prestige.randomScheme) ??
        findScore(PRESTIGE_SCHEMES, level).scheme
    ];

  return format({
    level,
    star: STAR_MAP[
      selectedCosmetic(STAR_MAP, "star", star, prestige.randomStar) ??
        findScore(PRESTIGE_STARS, level).star
    ],
    brackets:
      BRACKET_MAP[
        selectedCosmetic(BRACKET_MAP, "prestige_bracket", brackets, prestige.randomBrackets) ?? "none"
      ],
    bold: prestige.boldNumbers,
    underline: prestige.underlinedPrestige,
    strikethrough: prestige.strikethroughBrackets,
  });
};

export const BedWarsSchema = s
  .object({
    tokens: s.number().color("§2"),
    selectedScheme: s.string(),
    selectedStar: s.string(),
    selectedBrackets: s.string(),
    prestige: PrestigeSchema,
    exp() {
      return ExpSchema
        .color("§b")
        .format(
          formats.searchedAs(getLevel, (exp) =>
            getIntendedFormattedLevel(Math.floor(getLevel(exp)))
          )
        )
        .leaderboard({
          fieldName: "Level",
          hidden: true,
          additionalFields: [this.overall.wins, this.overall.finalKills, this.overall.fkdr],
        });
    },
    level() {
      return s.number().computed(getLevel, [this.exp]).subtractInSessions().leaderboard(false);
    },
    levelFormatted() {
      return s
        .string()
        .computed(formatLevel, [
          this.exp,
          this.selectedScheme,
          this.selectedStar,
          this.selectedBrackets,
          this.prestige,
        ])
        .default(getIntendedFormattedLevel(0));
    },
    progression() {
      return ProgressionSchema.computed(expProgression(getExpReq), [this.exp, this.level]);
    },
    naturalLevelFormatted() {
      return s
        .string()
        .computed((level) => getIntendedFormattedLevel(Math.floor(level)), [this.level])
        .default(getIntendedFormattedLevel(0));
    },
    nextLevelFormatted() {
      return s
        .string()
        .computed((level) => getIntendedFormattedLevel(Math.floor(level) + 1), [this.level])
        .default(getIntendedFormattedLevel(1));
    },
    overall: BedWarsModeSchema,
    solo: BedWarsModeSchema,
    doubles: BedWarsModeSchema,
    threes: BedWarsModeSchema,
    fours: BedWarsModeSchema,
    core: BedWarsModeSchema,
    "4v4": BedWarsModeSchema,
    armed: BedWarsModeSchema,
    castle: BedWarsModeSchema,
    lucky: BedWarsModeSchema,
    rush: BedWarsModeSchema,
    swap: BedWarsModeSchema,
    ultimate: BedWarsModeSchema,
    underworld: BedWarsModeSchema,
    voidless: BedWarsModeSchema,
    oneBlock: BedWarsModeSchema,
    challenges: BedWarsChallengesSchema,
    slumber: SlumberSchema,
  })
  .leaderboard((bedwars) => ({
    fieldName: FormattedGame.BEDWARS,
    extraDisplay: bedwars.levelFormatted,
  }));

export type BedWars = s.infer<typeof BedWarsSchema>;

function bedWarsMode(data: APIData, mode: string): BedWarsModeInput {
  const prefix = mode ? `${mode}_` : mode;

  return {
    winstreak: data[`${prefix}winstreak`],
    gamesPlayed: data[`${prefix}games_played_bedwars`],
    wins: data[`${prefix}wins_bedwars`],
    losses: data[`${prefix}losses_bedwars`],
    kills: data[`${prefix}kills_bedwars`],
    deaths: data[`${prefix}deaths_bedwars`],
    finalKills: data[`${prefix}final_kills_bedwars`],
    finalDeaths: data[`${prefix}final_deaths_bedwars`],
    bedsBroken: data[`${prefix}beds_broken_bedwars`],
    bedsLost: data[`${prefix}beds_lost_bedwars`],
    itemsCollected: {
      iron: data[`${prefix}iron_resources_collected_bedwars`],
      gold: data[`${prefix}gold_resources_collected_bedwars`],
      diamond: data[`${prefix}diamond_resources_collected_bedwars`],
      emerald: data[`${prefix}emerald_resources_collected_bedwars`],
    },
  };
}

function dreamsMode(data: APIData, mode: string): BedWarsModeInput {
  const stats = deepAdd(
    bedWarsMode(data, `eight_two_${mode}`),
    bedWarsMode(data, `four_four_${mode}`)
  );

  return { ...stats, winstreak: 0 };
}

function challenges(data: APIData): s.input<typeof BedWarsChallengesSchema> {
  return {
    uniqueChallenges: data.bw_unique_challenges_completed,
    totalChallenges: data.total_challenges_completed,
    renegade: data.bw_challenge_no_team_upgrades,
    warmonger: data.bw_challenge_no_utilities,
    selfish: data.bw_challenge_selfish,
    minimumWage: data.bw_challenge_slow_generator,
    assassin: data.bw_challenge_assassin,
    regularShopper: data.bw_challenge_reset_armor,
    invisibleShop: data.bw_challenge_invisible_shop,
    collector: data.bw_challenge_collector,
    woodworker: data.bw_challenge_woodworker,
    bridgingForDummies: data.bw_challenge_sponge,
    toxicRain: data.bw_challenge_toxic_rain,
    defuser: data.bw_challenge_defuser,
    miningFatigue: data.bw_challenge_mining_fatigue,
    ultimateUHC: data.bw_challenge_no_healing,
    sleightOfHand: data.bw_challenge_hotbar,
    weightedItems: data.bw_challenge_weighted_items,
    socialDistancing: data.bw_challenge_knockback_stick_only,
    swordless: data.bw_challenge_no_swords,
    marksman: data.bw_challenge_archer_only,
    patriot: data.bw_challenge_patriot,
    stamina: data.bw_challenge_stamina,
    oldMan: data.bw_challenge_no_sprint,
    cappedResources: data.bw_challenge_capped_resources,
    redLightGreenLight: data.bw_challenge_stop_light,
    slowReflexes: data.bw_challenge_delayed_hitting,
    pacifist: data.bw_challenge_no_hitting,
    masterAssassin: data.bw_challenge_master_assassin,
    standingTall: data.bw_challenge_no_shift,
    protectThePresident: data.bw_challenge_protect_the_president,
    cantTouchThis: data.bw_challenge_cant_touch_this,
    woolWarrior: data.bw_challenge_wool_warrior,
    anchor: data.bw_challenge_anchor,
    noDreaming: data.bw_challenge_no_dreaming,
    quickMaths: data.bw_challenge_quick_maths,
    blockrepellentBeds: data.bw_challenge_block_repellent_beds,
    midnight: data.bw_challenge_midnight,
    bedsAndBloodlust: data.bw_challenge_beds_and_bloodlust,
    begAndBarter: data.bw_challenge_beg_and_barter,
    halvedAndDoubled: data.bw_challenge_halved_and_doubled,
  };
}

function slumber(data: APIData = {}): s.input<typeof SlumberSchema> {
  return {
    tickets: data.tickets,
    totalTickets: data.total_tickets_earned,
    bagType: data.bag_type,
  };
}

export function bedWars(data: APIData = {}): s.input<typeof BedWarsSchema> {
  const cosmetics = { packages: data.packages, favorites: data.favorites };

  const scheme = {
    ...cosmetics,
    cosmetic: data.active_prestige_scheme,
    map: SCHEME_MAP,
    prefix: "prestige_scheme",
  };

  const star = { ...cosmetics, cosmetic: data.active_star, map: STAR_MAP, prefix: "star" };

  const brackets = {
    ...cosmetics,
    cosmetic: data.active_prestige_bracket,
    map: BRACKET_MAP,
    prefix: "prestige_bracket",
  };

  warnMissingCosmetic(scheme);
  warnMissingCosmetic(star);
  warnMissingCosmetic(brackets);

  const overall = bedWarsMode(data, "");
  const fourVFour = bedWarsMode(data, "two_four");

  return {
    tokens: data.coins,
    selectedScheme: data.active_prestige_scheme,
    selectedStar: data.active_star,
    selectedBrackets: data.active_prestige_bracket,
    prestige: {
      randomScheme: pickRandomCosmetic(scheme),
      randomStar: pickRandomCosmetic(star),
      randomBrackets: pickRandomCosmetic(brackets),
      boldNumbers: data.dreamfeast?.toggle_bold_numbers ?? false,
      underlinedPrestige: data.dreamfeast?.toggle_underlined_prestige ?? false,
      strikethroughBrackets: data.dreamfeast?.toggle_strikethrough_brackets ?? false,
    },
    exp: data.Experience || 0,
    overall,
    solo: bedWarsMode(data, "eight_one"),
    doubles: bedWarsMode(data, "eight_two"),
    threes: bedWarsMode(data, "four_three"),
    fours: bedWarsMode(data, "four_four"),
    core: { ...deepSub(overall, fourVFour), winstreak: overall.winstreak },
    "4v4": fourVFour,
    armed: dreamsMode(data, "armed"),
    castle: bedWarsMode(data, "castle"),
    lucky: dreamsMode(data, "lucky"),
    rush: dreamsMode(data, "rush"),
    swap: dreamsMode(data, "swap"),
    ultimate: dreamsMode(data, "ultimate"),
    underworld: dreamsMode(data, "underworld"),
    voidless: dreamsMode(data, "voidless"),
    oneBlock: bedWarsMode(data, "eight_one_oneblock"),
    challenges: challenges(data),
    slumber: slumber(data.slumber),
  };
}
