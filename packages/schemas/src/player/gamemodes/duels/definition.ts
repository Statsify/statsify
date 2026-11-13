/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BedsStats, FinalKillsStats, KillsStats, WinsStats } from "../common.js";
import { FormattedGame } from "#game";
import { createPrefixProgression } from "#prefixes";
import { type NumberSchema, type Ref, s } from "#definition/s";
import { ProgressionSchema } from "../../../progression.definition.js";
import { type TitleRequirement, getTitleAndProgression, prefixRequirementScores } from "./util.js";
import { add, deepAdd } from "@statsify/math";
import type { APIData } from "@statsify/util";
import { formats } from "#definition/format";

const BaseStats = s.fields({
  bestWinstreak: s.number().color("§e"),
  winstreak: s.number().color("§e").leaderboard(false),
  ...WinsStats,
  blocksPlaced: s.number().color("§9").leaderboard(false),
});

const PVPBaseStats = s.fields({ ...BaseStats, ...KillsStats });

const BowPVPBaseStats = s.fields({ ...PVPBaseStats, shotsFired: s.number().color("§6") });

const BaseSchema = s.object(BaseStats);
const PVPBaseSchema = s.object(PVPBaseStats);
const BowPVPBaseSchema = s.object(BowPVPBaseStats);

export type BaseDuelsGameMode = s.infer<typeof BaseSchema>;
export type PVPBaseDuelsGameMode = s.infer<typeof PVPBaseSchema>;
export type BowPVPBaseDuelsGameMode = s.infer<typeof BowPVPBaseSchema>;

// The titles also read the prefix icon and scheme beside the modes, which a computed field can't reach
const TitleStats = s.fields({
  titleFormatted: s.string(),
  titleLevelFormatted: s.string(),
  nextTitleLevelFormatted: s.string(),
});

const SingleTitleStats = s.fields({ ...TitleStats, titleFormatted: s.string().default("§7None§r") });

const titleProgression = (titleRequirement: TitleRequirement, score: Ref<NumberSchema>) =>
  ProgressionSchema.computed(
    (score) => createPrefixProgression(prefixRequirementScores[titleRequirement], score),
    [score]
  );

const singleStats = (titleRequirement: TitleRequirement) =>
  s.fields({
    ...BaseStats,
    ...SingleTitleStats,
    progression() {
      return titleProgression(titleRequirement, this.wins);
    },
  });

const singlePVPStats = (titleRequirement: TitleRequirement) =>
  s.fields({
    ...PVPBaseStats,
    ...SingleTitleStats,
    progression() {
      return titleProgression(titleRequirement, this.wins);
    },
  });

const singleBowPVPStats = (titleRequirement: TitleRequirement) =>
  s.fields({ ...singlePVPStats(titleRequirement), shotsFired: s.number().color("§6") });

const singleSchema = (titleRequirement: TitleRequirement) => s.object(singleStats(titleRequirement));
const singlePVPSchema = (titleRequirement: TitleRequirement) => s.object(singlePVPStats(titleRequirement));
const singleBowPVPSchema = (titleRequirement: TitleRequirement) =>
  s.object(singleBowPVPStats(titleRequirement));

export type SingleDuelsGameMode = s.infer<ReturnType<typeof singleSchema>>;
export type SinglePVPDuelsGameMode = s.infer<ReturnType<typeof singlePVPSchema>>;
export type SingleBowPVPDuelsGameMode = s.infer<ReturnType<typeof singleBowPVPSchema>>;

const ArenaSchema = s.object({ ...singleStats("default"), shotsFired: s.number().color("§6") });

const BlitzSGSchema = s.object({ ...singleBowPVPStats("default"), kit: s.string().default("none") });

const QuakeSchema = s.object({
  ...singlePVPStats("default"),
  headshots: s.number().color("§3"),
  shotsFired: s.number().color("§6"),
});

const ParkourSchema = s.object({
  ...singleStats("half"),
  checkpoints: s.number().color("§5"),
  bestTime: s.number().color("§d").format(formats.time).leaderboard({ sort: "ASC" }),
});

const MultiPVPStats = s.fields({
  ...TitleStats,
  progression() {
    return titleProgression("default", this.overall.wins);
  },
  overall: BowPVPBaseSchema,
  solo: BowPVPBaseSchema,
  doubles: BowPVPBaseSchema,
});

const MultiPVPSchema = s.object(MultiPVPStats);

export type MultiPVPDuelsGameMode = s.infer<typeof MultiPVPSchema>;

const SkyWarsDuelsSchema = s.object({ ...MultiPVPStats, kit: s.string().default("none") });

const UHCDuelsSchema = s.object({
  ...TitleStats,
  progression() {
    return titleProgression("default", this.overall.wins);
  },
  overall: BowPVPBaseSchema,
  solo: BowPVPBaseSchema,
  doubles: BowPVPBaseSchema,
  fours: BowPVPBaseSchema,
  deathmatch: BowPVPBaseSchema,
  gapplesEaten: s.number(),
});

const BridgeModeSchema = s.object({ ...BowPVPBaseStats, goals: s.number().color("§e") });

export type BridgeDuelsMode = s.infer<typeof BridgeModeSchema>;

const BridgeDuelsSchema = s.object({
  ...TitleStats,
  progression() {
    return titleProgression("half", this.overall.wins);
  },
  overall: BridgeModeSchema,
  solo: BridgeModeSchema,
  doubles: BridgeModeSchema,
  threes: BridgeModeSchema,
  fours: BridgeModeSchema,
});

const BedWarsDuelsOverallSchema = s.object({
  bestWinstreak: s.number().color("§e"),
  winstreak: s.number().color("§e"),
  ...WinsStats,
  ...KillsStats,
  ...FinalKillsStats,
  ...BedsStats,
  itemsPurchased: s.number().color("§d"),
});

export type BedWarsDuelsOverallMode = s.infer<typeof BedWarsDuelsOverallSchema>;

const BedWarsDuelsSchema = s.object({
  ...TitleStats,
  progression() {
    return titleProgression("default", this.overall.wins);
  },
  overall: BedWarsDuelsOverallSchema.leaderboard({ name: "BedWars Overall" }),
  bedwars: PVPBaseSchema.leaderboard({ name: "BedWars Duel" }),
  rush: PVPBaseSchema.leaderboard({ name: "Bed Rush" }),
});

const SpleefModeSchema = s.object({ ...BaseStats, blocksBroken: s.number().color("§b") });
const BowSpleefModeSchema = s.object({ ...BaseStats, shotsFired: s.number().color("§6") });

const SpleefDuelsSchema = s.object({
  ...TitleStats,
  progression() {
    return titleProgression("default", this.overallWins);
  },
  overallWins: s.number().leaderboard({ name: "Spleef Overall Wins", fieldName: "Wins" }),
  spleef: SpleefModeSchema.leaderboard({ fieldName: "Spleef" }),
  bowSpleef: BowSpleefModeSchema,
});

export const DuelsSchema = s
  .object({
    pingRange: s.number().color("§a").default(300).leaderboard(false),
    tokens() {
      return s.number().color("§2").leaderboard({ extraDisplay: this.overall.titleFormatted });
    },
    overall: singleBowPVPSchema("overall").leaderboard((overall) => ({
      extraDisplay: overall.titleFormatted,
    })),
    arena: ArenaSchema.leaderboard((arena) => ({ extraDisplay: arena.titleFormatted })),
    blitzsg: BlitzSGSchema.leaderboard((blitzsg) => ({
      fieldName: "BlitzSG",
      extraDisplay: blitzsg.titleFormatted,
    })),
    bow: singleBowPVPSchema("default").leaderboard((bow) => ({ extraDisplay: bow.titleFormatted })),
    boxing: singlePVPSchema("half").leaderboard((boxing) => ({ extraDisplay: boxing.titleFormatted })),
    bridge: BridgeDuelsSchema.leaderboard((bridge) => ({ extraDisplay: bridge.titleFormatted })),
    bedwars: BedWarsDuelsSchema.leaderboard((bedwars) => ({
      name: "",
      extraDisplay: bedwars.titleFormatted,
    })),
    classic: MultiPVPSchema.leaderboard((classic) => ({ extraDisplay: classic.titleFormatted })),
    combo: singlePVPSchema("default").leaderboard((combo) => ({ extraDisplay: combo.titleFormatted })),
    megawalls: singlePVPSchema("half").leaderboard((megawalls) => ({
      fieldName: "MegaWalls",
      extraDisplay: megawalls.titleFormatted,
    })),
    nodebuff: singlePVPSchema("half").leaderboard((nodebuff) => ({
      fieldName: "NoDebuff",
      extraDisplay: nodebuff.titleFormatted,
    })),
    op: MultiPVPSchema.leaderboard((op) => ({ fieldName: "OP", extraDisplay: op.titleFormatted })),
    parkour: ParkourSchema.leaderboard((parkour) => ({ extraDisplay: parkour.titleFormatted })),
    quake: QuakeSchema.leaderboard((quake) => ({ extraDisplay: quake.titleFormatted })),
    skywars: SkyWarsDuelsSchema.leaderboard((skywars) => ({
      fieldName: "SkyWars",
      extraDisplay: skywars.titleFormatted,
    })),
    spleef: SpleefDuelsSchema.leaderboard((spleef) => ({
      fieldName: "",
      extraDisplay: spleef.titleFormatted,
    })),
    sumo: singlePVPSchema("default").leaderboard((sumo) => ({ extraDisplay: sumo.titleFormatted })),
    uhc: UHCDuelsSchema.leaderboard((uhc) => ({ fieldName: "UHC", extraDisplay: uhc.titleFormatted })),
    scheme: s.string(),
    icon: s.string(),
  })
  .leaderboard({ fieldName: `${FormattedGame.DUELS} -` });

export type Duels = s.infer<typeof DuelsSchema>;

type BaseInput = s.input<typeof BaseSchema>;
type PVPBaseInput = s.input<typeof PVPBaseSchema>;
type BowPVPBaseInput = s.input<typeof BowPVPBaseSchema>;

function titles(data: APIData, score: number | undefined, mode: string, titleRequirement: TitleRequirement) {
  const { titleFormatted, titleLevelFormatted, nextTitleLevelFormatted } = getTitleAndProgression({
    score: score ?? 0,
    mode,
    data,
    titleRequirement,
  });

  return { titleFormatted, titleLevelFormatted, nextTitleLevelFormatted };
}

function baseMode(data: APIData, mode: string): BaseInput {
  const prefix = mode ? `${mode}_` : mode;

  return {
    bestWinstreak: mode ? data[`best_winstreak_mode_${mode}`] : data.best_overall_winstreak,
    winstreak: mode ? data[`current_winstreak_mode_${mode}`] : data.current_winstreak,
    wins: data[`${prefix}wins`],
    losses: data[`${prefix}losses`],
    // Only the PVP modes read blocks placed, so the rest leave it unset
    blocksPlaced: undefined,
  };
}

function pvpBaseMode(data: APIData, mode: string): PVPBaseInput {
  const prefix = mode ? `${mode}_` : mode;

  return {
    ...baseMode(data, mode),
    kills: data[`${prefix}kills`],
    deaths: data[`${prefix}deaths`],
    blocksPlaced: data[`${prefix}blocks_placed`],
  };
}

function bowPVPBaseMode(data: APIData, mode: string): BowPVPBaseInput {
  return { ...pvpBaseMode(data, mode), shotsFired: data[`${mode}_bow_shots`] };
}

function bridgeMode(data: APIData, mode: string): s.input<typeof BridgeModeSchema> {
  return {
    ...bowPVPBaseMode(data, mode),
    kills: data[`${mode}_bridge_kills`],
    deaths: data[`${mode}_bridge_deaths`],
    goals: data[`${mode}_goals`] || data[`${mode}_captures`],
  };
}

function singlePVPMode(
  data: APIData,
  title: string,
  mode: string,
  titleRequirement: TitleRequirement
): s.input<ReturnType<typeof singlePVPSchema>> {
  const stats = pvpBaseMode(data, mode);
  return { ...stats, ...titles(data, stats.wins, title, titleRequirement) };
}

function singleBowPVPMode(
  data: APIData,
  title: string,
  mode: string,
  titleRequirement: TitleRequirement
): s.input<ReturnType<typeof singleBowPVPSchema>> {
  const prefix = mode ? `${mode}_` : mode;
  return { ...singlePVPMode(data, title, mode, titleRequirement), shotsFired: data[`${prefix}bow_shots`] };
}

function singleMode(
  data: APIData,
  title: string,
  mode: string,
  titleRequirement: TitleRequirement
): s.input<ReturnType<typeof singleSchema>> {
  const stats = baseMode(data, mode);
  return { ...stats, ...titles(data, stats.wins, title, titleRequirement) };
}

function multiPVPMode(
  data: APIData,
  title: string,
  short: string,
  long: string,
  titleRequirement: TitleRequirement
): s.input<typeof MultiPVPSchema> {
  const solo = bowPVPBaseMode(data, `${short}_duel`);
  const doubles = bowPVPBaseMode(data, `${short}_doubles`);

  const overall: BowPVPBaseInput = {
    ...deepAdd(solo, doubles),
    bestWinstreak: data[`best_${long}_winstreak`],
    winstreak: data[`current_${long}_winstreak`],
  };

  return { ...titles(data, overall.wins, title, titleRequirement), overall, solo, doubles };
}

function uhcDuels(data: APIData): s.input<typeof UHCDuelsSchema> {
  const solo = bowPVPBaseMode(data, "uhc_duel");
  const doubles = bowPVPBaseMode(data, "uhc_doubles");
  const fours = bowPVPBaseMode(data, "uhc_four");
  const deathmatch = bowPVPBaseMode(data, "uhc_meetup");

  const overall: BowPVPBaseInput = {
    ...deepAdd(solo, doubles, fours, deathmatch),
    winstreak: data.current_uhc_winstreak,
    bestWinstreak: data.best_uhc_winstreak,
  };

  return {
    ...titles(data, overall.wins, "UHC", "default"),
    overall,
    solo,
    doubles,
    fours,
    deathmatch,
    gapplesEaten: add(
      data.uhc_duel_golden_apples_eaten,
      data.uhc_doubles_golden_apples_eaten,
      data.uhc_four_golden_apples_eaten
    ),
  };
}

function bridgeDuels(data: APIData): s.input<typeof BridgeDuelsSchema> {
  const solo = bridgeMode(data, "bridge_duel");
  const doubles = bridgeMode(data, "bridge_doubles");
  const threes = bridgeMode(data, "bridge_threes");
  const fours = bridgeMode(data, "bridge_four");

  const overall = {
    ...deepAdd(
      solo,
      doubles,
      threes,
      fours,
      bridgeMode(data, "bridge_2v2v2v2"),
      bridgeMode(data, "bridge_3v3v3v3"),
      bridgeMode(data, "capture_threes")
    ),
    winstreak: data.current_bridge_winstreak,
    bestWinstreak: data.best_bridge_winstreak,
  };

  return { ...titles(data, overall.wins, "Bridge", "half"), overall, solo, doubles, threes, fours };
}

function bedWarsDuels(data: APIData): s.input<typeof BedWarsDuelsSchema> {
  const overall: s.input<typeof BedWarsDuelsOverallSchema> = {
    bestWinstreak: data.best_bedwars_winstreak,
    winstreak: data.current_bedwars_winstreak,
    wins: data.wins_bedwars,
    losses: data.losses_bedwars,
    kills: data.kills_bedwars,
    deaths: data.deaths_bedwars,
    finalKills: data.final_kills_bedwars,
    finalDeaths: data.final_deaths_bedwars,
    bedsBroken: data.beds_broken_bedwars,
    bedsLost: data.beds_lost_bedwars,
    itemsPurchased: data.items_purchased_bedwars,
  };

  return {
    ...titles(data, overall.wins, "Bed Wars", "default"),
    overall,
    bedwars: pvpBaseMode(data, "bedwars_two_one_duels"),
    rush: pvpBaseMode(data, "bedwars_two_one_duels_rush"),
  };
}

function spleefDuels(data: APIData): s.input<typeof SpleefDuelsSchema> {
  const spleef = { ...baseMode(data, "spleef_duel"), blocksBroken: data.spleef_duel_blocks_broken };
  const bowSpleef = { ...baseMode(data, "bowspleef_duel"), shotsFired: data.bowspleef_duel_bow_shots };
  const overallWins = add(spleef.wins, bowSpleef.wins);

  return { ...titles(data, overallWins, "Spleef", "default"), overallWins, spleef, bowSpleef };
}

function megaWallsDuels(data: APIData): s.input<ReturnType<typeof singlePVPSchema>> {
  const solo = pvpBaseMode(data, "mw_duel");
  const doubles = pvpBaseMode(data, "mw_doubles");

  const stats: PVPBaseInput = {
    ...solo,
    wins: add(solo.wins, doubles.wins),
    losses: add(solo.losses, doubles.losses),
    kills: add(solo.kills, doubles.kills),
    deaths: add(solo.deaths, doubles.deaths),
    blocksPlaced: add(solo.blocksPlaced, doubles.blocksPlaced),
  };

  return { ...stats, ...titles(data, stats.wins, "Mega Walls", "half") };
}

export function duels(data: APIData = {}): s.input<typeof DuelsSchema> {
  const overall = singleBowPVPMode(data, "", "", "overall");
  const skywars = multiPVPMode(data, "SkyWars", "sw", "skywars", "default");
  const skywarsKit = data.sw_duels_kit_new3 ?? data.sw_duels_kit_new2 ?? data.sw_duels_kit_new ?? "none";

  return {
    pingRange: data.pingPreference ?? 300,
    tokens: data.coins,
    overall: { ...overall, winstreak: data.currentStreak ?? overall.winstreak },
    arena: { ...singleMode(data, "Arena", "duel_arena", "default"), shotsFired: data.duel_arena_bow_shots },
    blitzsg: {
      ...singleBowPVPMode(data, "Blitz", "blitz_duel", "default"),
      kit: data.blitz_duels_kit ?? "none",
    },
    bow: singleBowPVPMode(data, "Bow", "bow_duel", "default"),
    boxing: singlePVPMode(data, "Boxing", "boxing_duel", "half"),
    bridge: bridgeDuels(data),
    bedwars: bedWarsDuels(data),
    classic: multiPVPMode(data, "Classic", "classic", "classic", "default"),
    combo: singlePVPMode(data, "Combo", "combo_duel", "default"),
    megawalls: megaWallsDuels(data),
    nodebuff: singlePVPMode(data, "NoDebuff", "potion_duel", "half"),
    op: multiPVPMode(data, "OP", "op", "op", "default"),
    parkour: {
      ...singleMode(data, "Parkour", "parkour_eight", "half"),
      checkpoints: data.parkour_checkpoints_reached,
      bestTime: data.parkour_personal_best,
    },
    quake: {
      ...singlePVPMode(data, "Quakecraft", "quake_duel", "default"),
      headshots: data.quake_duel_quake_headshots,
      shotsFired: data.quake_duel_quake_shots_taken,
    },
    skywars: {
      ...skywars,
      kit: skywarsKit
        .replace("kit_", "")
        .replaceAll("ranked_", "")
        .replaceAll("mega_", "")
        .replaceAll("defending_team_", ""),
    },
    spleef: spleefDuels(data),
    sumo: singlePVPMode(data, "Sumo", "sumo_duel", "default"),
    uhc: uhcDuels(data),
    scheme: data.active_prefix_scheme,
    icon: data.active_prefix_icon,
  };
}
