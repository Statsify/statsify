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
  getPrestigeCosmetic,
  PRESTIGE_SCHEMES,
  PRESTIGE_STARS,
  SCHEME_MAP,
  STAR_MAP,
} from "./util.js";
import { FinalKillsStats, KillsStats, WinsStats } from "../common.js";
import { FormattedGame } from "#game";
import { ProgressionSchema, progression } from "../../../progression.definition.js";
import { type APIData, findScore } from "@statsify/util";
import { deepAdd, deepSub, ratio } from "@statsify/math";
import { formats } from "#definition/format";
import { s } from "#definition/s";

const ItemsCollectedSchema = s.object({
  iron: s.number().color("gray").leaderboard({ limit: 100_000 }),
  gold: s.number().color("gold").leaderboard({ limit: 100_000 }),
  diamond: s.number().color("aqua").leaderboard({ limit: 100_000 }),
  emerald: s.number().color("dark_green").leaderboard({ limit: 100_000 }),
});

export const BedWarsModeSchema = s.object({
  winstreak: s.number().color("green"),
  gamesPlayed: s.number(),
  ...WinsStats,
  ...KillsStats,
  ...FinalKillsStats,
  bedsBroken: s.number().color("green"),
  bedsLost: s.number().color("red"),
  bblr() {
    return s.computed(ratio, [this.bedsBroken, this.bedsLost]).color("gold");
  },
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

const SlumberSchema = s
  .object({
    tickets: s.number().color("aqua").leaderboard(false),
    totalTickets: s.number().color("light_purple").leaderboard({ fieldName: "Total Slumber Tickets" }),
    wallet: s.number().leaderboard(false),
  })
  .leaderboard({ fieldName: "" });

export const BedWarsSchema = s
  .object({
    tokens: s.number().color("dark_green"),
    selectedScheme: s.string(),
    selectedStar: s.string(),
    selectedBrackets: s.string(),
    exp() {
      return s
        .number()
        .color("aqua")
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
    level: s.number().leaderboard(false),
    levelFormatted: s.string().default(getIntendedFormattedLevel(0)),
    progression: ProgressionSchema,
    naturalLevelFormatted: s.string().default(getIntendedFormattedLevel(0)),
    nextLevelFormatted: s.string().default(getIntendedFormattedLevel(1)),
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

const WALLET_SIZES: Record<string, number> = {
  MINI_WALLET: 25,
  LIGHT_SLUMBERS_WALLET: 99,
  LIGHT_IMPERIAL_WALLET: 500,
  EXPLORERS_WALLET: 5000,
  HOTEL_STAFF_WALLET: 10_000,
  PLATINUM_MEMBERSHIP_WALLET: 100_000,
};

function slumber(data: APIData = {}): s.input<typeof SlumberSchema> {
  return {
    tickets: data.tickets,
    totalTickets: data.total_tickets_earned,
    wallet: WALLET_SIZES[data.bag_type] ?? 0,
  };
}

export function bedWars(data: APIData = {}): s.input<typeof BedWarsSchema> {
  const exp = data.Experience || 0;
  const level = getLevel(exp);
  const flooredLevel = Math.floor(level);

  const cosmetics = { packages: data.packages, favorites: data.favorites };

  const scheme = getPrestigeCosmetic({
    ...cosmetics,
    cosmetic: data.active_prestige_scheme,
    getDefault: () => findScore(PRESTIGE_SCHEMES, flooredLevel).scheme,
    map: SCHEME_MAP,
    prefix: "prestige_scheme",
  });

  const star = getPrestigeCosmetic({
    ...cosmetics,
    cosmetic: data.active_star,
    getDefault: () => findScore(PRESTIGE_STARS, flooredLevel).star,
    map: STAR_MAP,
    prefix: "star",
  });

  const brackets = getPrestigeCosmetic({
    ...cosmetics,
    cosmetic: data.active_prestige_bracket,
    getDefault: () => "none",
    map: BRACKET_MAP,
    prefix: "prestige_bracket",
  });

  let levelExp = exp;
  for (let i = 0; i < flooredLevel; i++) levelExp -= getExpReq(i);

  const overall = bedWarsMode(data, "");
  const fourVFour = bedWarsMode(data, "two_four");

  return {
    tokens: data.coins,
    selectedScheme: data.active_prestige_scheme,
    selectedStar: data.active_star,
    selectedBrackets: data.active_prestige_bracket,
    exp,
    level,
    levelFormatted: scheme({
      level: flooredLevel,
      star,
      brackets,
      bold: data.dreamfeast?.toggle_bold_numbers ?? false,
      underline: data.dreamfeast?.toggle_underlined_prestige ?? false,
      strikethrough: data.dreamfeast?.toggle_strikethrough_brackets ?? false,
    }),
    progression: progression(levelExp, getExpReq(flooredLevel)),
    naturalLevelFormatted: getIntendedFormattedLevel(flooredLevel),
    nextLevelFormatted: getIntendedFormattedLevel(flooredLevel + 1),
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
