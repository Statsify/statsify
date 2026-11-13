/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BedsStats, FinalKillsStats, KillsStats, WinsStats } from "../common.js";
import { type ExtractGameModes, FormattedGame, GameModes } from "#game";
import { type NumberSchema, type Ref, type Refs, type StringSchema, s } from "#definition/s";
import { type TitleRequirement, getTitles, prefixRequirementScores } from "./util.js";
import { prefixProgression } from "../prefix-fields.js";
import { add, deepAdd } from "@statsify/math";
import type { APIData } from "@statsify/util";
import { formats } from "#definition/format";

export const DUELS_MODES = new GameModes([
  {
    api: "overall",
    submodes: [
      { api: "stats" },
      { api: "titles" },
    ],
  },
  { api: "arena", hypixel: "DUELS_DUEL_ARENA" },
  {
    api: "bedwars",
    formatted: "BedWars",
    submodes: [
      { api: "overall" },
      { api: "bedwars", formatted: "BedWars Duel" },
      { api: "rush", formatted: "Bed Rush" },
    ],
  },
  { api: "blitzsg", hypixel: "DUELS_BLITZ_DUEL", formatted: "BlitzSG" },
  { api: "bow", hypixel: "DUELS_BOW_DUEL" },
  { api: "boxing", hypixel: "DUELS_BOXING_DUEL" },
  {
    api: "bridge",
    submodes: [
      { api: "overall" },
      { api: "solo" },
      { api: "doubles" },
      { api: "threes" },
      { api: "fours" },
    ],
  },
  { api: "classic", hypixel: "DUELS_CLASSIC_DUEL" },
  { api: "combo", hypixel: "DUELS_COMBO_DUEL" },
  { api: "megawalls", formatted: "MegaWalls" },
  { api: "nodebuff", hypixel: "DUELS_POTION_DUEL", formatted: "NoDebuff" },
  { api: "op", formatted: "OP" },
  { api: "quake", hypixel: "DUELS_QUAKE_DUEL" },
  { api: "parkour", hypixel: "DUELS_PARKOUR_EIGHT" },
  { api: "skywars", formatted: "SkyWars" },
  {
    api: "spleef",
    submodes: [
      { api: "spleef" },
      { api: "bowSpleef" },
    ],
  },
  { api: "sumo", hypixel: "DUELS_SUMO_DUEL" },
  {
    api: "uhc",
    formatted: "UHC",
    submodes: [
      { api: "overall" },
      { api: "solo" },
      { api: "doubles" },
      { api: "fours" },
      { api: "deathmatch" },
    ],
  },
  { hypixel: "DUELS_MW_DUEL", formatted: "MegaWalls Solo" },
  { hypixel: "DUELS_MW_DOUBLES", formatted: "MegaWalls Doubles" },
  { hypixel: "DUELS_UHC_DUEL", formatted: "UHC Solo" },
  { hypixel: "DUELS_UHC_DOUBLES", formatted: "UHC Doubles" },
  { hypixel: "DUELS_UHC_FOUR", formatted: "UHC Fours" },
  { hypixel: "DUELS_UHC_MEETUP", formatted: "UHC Deathmatch" },
  { hypixel: "DUELS_SW_DUEL", formatted: "SkyWars Solo" },
  { hypixel: "DUELS_SW_DOUBLES", formatted: "SkyWars Doubles" },
  { hypixel: "DUELS_OP_DUEL", formatted: "OP Solo" },
  { hypixel: "DUELS_OP_DOUBLES", formatted: "OP Doubles" },
  { hypixel: "DUELS_BRIDGE_DUEL", formatted: "Bridge Solo" },
  { hypixel: "DUELS_BRIDGE_DOUBLES", formatted: "Bridge Doubles" },
  { hypixel: "DUELS_BRIDGE_THREES", formatted: "Bridge Threes" },
  { hypixel: "DUELS_BRIDGE_FOUR", formatted: "Bridge Fours" },
  { hypixel: "DUELS_BRIDGE_2V2V2V2", formatted: "Bridge 2v2v2v2" },
  { hypixel: "DUELS_BRIDGE_3V3V3V3", formatted: "Bridge 3v3v3v3" },
  { hypixel: "DUELS_CAPTURE_THREES", formatted: "Bridge CTF" },
  { hypixel: "DUELS_BEDWARS_TWO_ONE", formatted: "BedWars Duel" },
  { hypixel: "DUELS_BEDWARS_TWO_ONE_RUSH", formatted: "Bed Rush" },
  { hypixel: "DUELS_SPLEEF_DUEL", formatted: "Spleef" },
  { hypixel: "DUELS_BOWSPLEEF_DUEL", formatted: "Bow Spleef" },
  { hypixel: "DUELS_CLASSIC_DOUBLES", formatted: "Classic Doubles" },
] as const);

export type DuelsModes = ExtractGameModes<typeof DUELS_MODES>;

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

/** The prefix icon and scheme the player picked, which draw every mode's title */
interface TitlePrefix {
  icon: Ref<StringSchema>;
  scheme: Ref<StringSchema>;
}

/** Builds a mode's title fields from the wins that earn them */
const titleFields = (mode: string, titleRequirement: TitleRequirement, { icon, scheme }: TitlePrefix) => {
  const title = (pick: keyof ReturnType<typeof getTitles>) => (score: Ref<NumberSchema>) =>
    s
      .string()
      .computed(
        (score, icon, scheme) => getTitles({ score, mode, icon, scheme, titleRequirement })[pick],
        [score, icon, scheme]
      );

  return {
    titleFormatted: title("titleFormatted"),
    titleLevelFormatted: title("titleLevelFormatted"),
    nextTitleLevelFormatted: title("nextTitleLevelFormatted"),
    progression: (score: Ref<NumberSchema>) =>
      prefixProgression(prefixRequirementScores[titleRequirement], score),
  };
};

type Titles = ReturnType<typeof titleFields>;

/** A mode's title fields, from the wins `score` picks out of the mode */
const titleStats = <Mode>(titles: Titles, score: (mode: Mode) => Ref<NumberSchema>) => ({
  titleFormatted(this: Mode) {
    return titles.titleFormatted(score(this));
  },
  titleLevelFormatted(this: Mode) {
    return titles.titleLevelFormatted(score(this));
  },
  nextTitleLevelFormatted(this: Mode) {
    return titles.nextTitleLevelFormatted(score(this));
  },
  progression(this: Mode) {
    return titles.progression(score(this));
  },
});

type ModeRefs = Refs<typeof BaseStats>;

const overallWins = (mode: Refs<{ overall: typeof BaseSchema }>) => mode.overall.wins;

const singleTitleStats = (titles: Titles) => ({
  ...titleStats(titles, (mode: ModeRefs) => mode.wins),
  titleFormatted(this: ModeRefs) {
    return titles.titleFormatted(this.wins).default("§7None§r");
  },
});

const singleStats = (titles: Titles) => s.fields({ ...BaseStats, ...singleTitleStats(titles) });

const singlePVPStats = (titles: Titles) => s.fields({ ...PVPBaseStats, ...singleTitleStats(titles) });

const singleBowPVPStats = (titles: Titles) =>
  s.fields({ ...singlePVPStats(titles), shotsFired: s.number().color("§6") });

const singleSchema = (titles: Titles) => s.object(singleStats(titles));
const singlePVPSchema = (titles: Titles) => s.object(singlePVPStats(titles));
const singleBowPVPSchema = (titles: Titles) => s.object(singleBowPVPStats(titles));

export type SingleDuelsGameMode = s.infer<ReturnType<typeof singleSchema>>;
export type SinglePVPDuelsGameMode = s.infer<ReturnType<typeof singlePVPSchema>>;
export type SingleBowPVPDuelsGameMode = s.infer<ReturnType<typeof singleBowPVPSchema>>;

const arenaSchema = (titles: Titles) =>
  s.object({ ...singleStats(titles), shotsFired: s.number().color("§6") });

const blitzSGSchema = (titles: Titles) =>
  s.object({ ...singleBowPVPStats(titles), kit: s.string().default("none") });

const quakeSchema = (titles: Titles) =>
  s.object({
    ...singlePVPStats(titles),
    headshots: s.number().color("§3"),
    shotsFired: s.number().color("§6"),
  });

const parkourSchema = (titles: Titles) =>
  s.object({
    ...singleStats(titles),
    checkpoints: s.number().color("§5"),
    bestTime: s.number().color("§d").format(formats.time).leaderboard({ sort: "ASC" }),
  });

const multiPVPStats = (titles: Titles) =>
  s.fields({
    ...titleStats(titles, overallWins),
    overall: BowPVPBaseSchema,
    solo: BowPVPBaseSchema,
    doubles: BowPVPBaseSchema,
  });

const multiPVPSchema = (titles: Titles) => s.object(multiPVPStats(titles));

export type MultiPVPDuelsGameMode = s.infer<ReturnType<typeof multiPVPSchema>>;

const skyWarsDuelsSchema = (titles: Titles) =>
  s.object({ ...multiPVPStats(titles), kit: s.string().default("none") });

const uhcDuelsSchema = (titles: Titles) =>
  s.object({
    ...titleStats(titles, overallWins),
    overall: BowPVPBaseSchema,
    solo: BowPVPBaseSchema,
    doubles: BowPVPBaseSchema,
    fours: BowPVPBaseSchema,
    deathmatch: BowPVPBaseSchema,
    gapplesEaten: s.number(),
  });

const BridgeModeSchema = s.object({ ...BowPVPBaseStats, goals: s.number().color("§e") });

export type BridgeDuelsMode = s.infer<typeof BridgeModeSchema>;

const bridgeDuelsSchema = (titles: Titles) =>
  s.object({
    ...titleStats(titles, overallWins),
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

const bedWarsDuelsSchema = (titles: Titles) =>
  s.object({
    ...titleStats(titles, overallWins),
    overall: BedWarsDuelsOverallSchema.leaderboard({ name: "BedWars Overall" }),
    bedwars: PVPBaseSchema.leaderboard({ name: "BedWars Duel" }),
    rush: PVPBaseSchema.leaderboard({ name: "Bed Rush" }),
  });

const SpleefModeSchema = s.object({ ...BaseStats, blocksBroken: s.number().color("§b") });
const BowSpleefModeSchema = s.object({ ...BaseStats, shotsFired: s.number().color("§6") });

const spleefDuelsSchema = (titles: Titles) =>
  s.object({
    ...titleStats(titles, (spleef: Refs<{ overallWins: NumberSchema }>) => spleef.overallWins),
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
    // Each mode is built in a method so its titles can read the prefix icon and scheme below
    overall() {
      return singleBowPVPSchema(titleFields("", "overall", this)).leaderboard((overall) => ({
        extraDisplay: overall.titleFormatted,
      }));
    },
    arena() {
      return arenaSchema(titleFields("Arena", "default", this)).leaderboard((arena) => ({
        extraDisplay: arena.titleFormatted,
      }));
    },
    blitzsg() {
      return blitzSGSchema(titleFields("Blitz", "default", this)).leaderboard((blitzsg) => ({
        fieldName: "BlitzSG",
        extraDisplay: blitzsg.titleFormatted,
      }));
    },
    bow() {
      return singleBowPVPSchema(titleFields("Bow", "default", this)).leaderboard((bow) => ({
        extraDisplay: bow.titleFormatted,
      }));
    },
    boxing() {
      return singlePVPSchema(titleFields("Boxing", "half", this)).leaderboard((boxing) => ({
        extraDisplay: boxing.titleFormatted,
      }));
    },
    bridge() {
      return bridgeDuelsSchema(titleFields("Bridge", "half", this)).leaderboard((bridge) => ({
        extraDisplay: bridge.titleFormatted,
      }));
    },
    bedwars() {
      return bedWarsDuelsSchema(titleFields("Bed Wars", "default", this)).leaderboard((bedwars) => ({
        name: "",
        extraDisplay: bedwars.titleFormatted,
      }));
    },
    classic() {
      return multiPVPSchema(titleFields("Classic", "default", this)).leaderboard((classic) => ({
        extraDisplay: classic.titleFormatted,
      }));
    },
    combo() {
      return singlePVPSchema(titleFields("Combo", "default", this)).leaderboard((combo) => ({
        extraDisplay: combo.titleFormatted,
      }));
    },
    megawalls() {
      return singlePVPSchema(titleFields("Mega Walls", "half", this)).leaderboard((megawalls) => ({
        fieldName: "MegaWalls",
        extraDisplay: megawalls.titleFormatted,
      }));
    },
    nodebuff() {
      return singlePVPSchema(titleFields("NoDebuff", "half", this)).leaderboard((nodebuff) => ({
        fieldName: "NoDebuff",
        extraDisplay: nodebuff.titleFormatted,
      }));
    },
    op() {
      return multiPVPSchema(titleFields("OP", "default", this)).leaderboard((op) => ({
        fieldName: "OP",
        extraDisplay: op.titleFormatted,
      }));
    },
    parkour() {
      return parkourSchema(titleFields("Parkour", "half", this)).leaderboard((parkour) => ({
        extraDisplay: parkour.titleFormatted,
      }));
    },
    quake() {
      return quakeSchema(titleFields("Quakecraft", "default", this)).leaderboard((quake) => ({
        extraDisplay: quake.titleFormatted,
      }));
    },
    skywars() {
      return skyWarsDuelsSchema(titleFields("SkyWars", "default", this)).leaderboard((skywars) => ({
        fieldName: "SkyWars",
        extraDisplay: skywars.titleFormatted,
      }));
    },
    spleef() {
      return spleefDuelsSchema(titleFields("Spleef", "default", this)).leaderboard((spleef) => ({
        fieldName: "",
        extraDisplay: spleef.titleFormatted,
      }));
    },
    sumo() {
      return singlePVPSchema(titleFields("Sumo", "default", this)).leaderboard((sumo) => ({
        extraDisplay: sumo.titleFormatted,
      }));
    },
    uhc() {
      return uhcDuelsSchema(titleFields("UHC", "default", this)).leaderboard((uhc) => ({
        fieldName: "UHC",
        extraDisplay: uhc.titleFormatted,
      }));
    },
    scheme: s.string(),
    icon: s.string(),
  })
  .leaderboard({ fieldName: `${FormattedGame.DUELS} -` });

export type Duels = s.infer<typeof DuelsSchema>;

type BaseInput = s.input<typeof BaseSchema>;
type PVPBaseInput = s.input<typeof PVPBaseSchema>;
type BowPVPBaseInput = s.input<typeof BowPVPBaseSchema>;

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
  const prefix = mode ? `${mode}_` : mode;
  return { ...pvpBaseMode(data, mode), shotsFired: data[`${prefix}bow_shots`] };
}

function bridgeMode(data: APIData, mode: string): s.input<typeof BridgeModeSchema> {
  return {
    ...bowPVPBaseMode(data, mode),
    kills: data[`${mode}_bridge_kills`],
    deaths: data[`${mode}_bridge_deaths`],
    goals: data[`${mode}_goals`] || data[`${mode}_captures`],
  };
}

function multiPVPMode(
  data: APIData,
  short: string,
  long: string
): s.input<ReturnType<typeof multiPVPSchema>> {
  const solo = bowPVPBaseMode(data, `${short}_duel`);
  const doubles = bowPVPBaseMode(data, `${short}_doubles`);

  const overall: BowPVPBaseInput = {
    ...deepAdd(solo, doubles),
    bestWinstreak: data[`best_${long}_winstreak`],
    winstreak: data[`current_${long}_winstreak`],
  };

  return { overall, solo, doubles };
}

function uhcDuels(data: APIData): s.input<ReturnType<typeof uhcDuelsSchema>> {
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

function bridgeDuels(data: APIData): s.input<ReturnType<typeof bridgeDuelsSchema>> {
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

  return { overall, solo, doubles, threes, fours };
}

function bedWarsDuels(data: APIData): s.input<ReturnType<typeof bedWarsDuelsSchema>> {
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
    overall,
    bedwars: pvpBaseMode(data, "bedwars_two_one_duels"),
    rush: pvpBaseMode(data, "bedwars_two_one_duels_rush"),
  };
}

function spleefDuels(data: APIData): s.input<ReturnType<typeof spleefDuelsSchema>> {
  const spleef = { ...baseMode(data, "spleef_duel"), blocksBroken: data.spleef_duel_blocks_broken };
  const bowSpleef = { ...baseMode(data, "bowspleef_duel"), shotsFired: data.bowspleef_duel_bow_shots };

  return { overallWins: add(spleef.wins, bowSpleef.wins), spleef, bowSpleef };
}

function megaWallsDuels(data: APIData): PVPBaseInput {
  const solo = pvpBaseMode(data, "mw_duel");
  const doubles = pvpBaseMode(data, "mw_doubles");

  return {
    ...solo,
    wins: add(solo.wins, doubles.wins),
    losses: add(solo.losses, doubles.losses),
    kills: add(solo.kills, doubles.kills),
    deaths: add(solo.deaths, doubles.deaths),
    blocksPlaced: add(solo.blocksPlaced, doubles.blocksPlaced),
  };
}

export function duels(data: APIData = {}): s.input<typeof DuelsSchema> {
  const overall = bowPVPBaseMode(data, "");
  const skywars = multiPVPMode(data, "sw", "skywars");
  const skywarsKit = data.sw_duels_kit_new3 ?? data.sw_duels_kit_new2 ?? data.sw_duels_kit_new ?? "none";

  return {
    pingRange: data.pingPreference ?? 300,
    tokens: data.coins,
    overall: { ...overall, winstreak: data.currentStreak ?? overall.winstreak },
    arena: { ...baseMode(data, "duel_arena"), shotsFired: data.duel_arena_bow_shots },
    blitzsg: { ...bowPVPBaseMode(data, "blitz_duel"), kit: data.blitz_duels_kit ?? "none" },
    bow: bowPVPBaseMode(data, "bow_duel"),
    boxing: pvpBaseMode(data, "boxing_duel"),
    bridge: bridgeDuels(data),
    bedwars: bedWarsDuels(data),
    classic: multiPVPMode(data, "classic", "classic"),
    combo: pvpBaseMode(data, "combo_duel"),
    megawalls: megaWallsDuels(data),
    nodebuff: pvpBaseMode(data, "potion_duel"),
    op: multiPVPMode(data, "op", "op"),
    parkour: {
      ...baseMode(data, "parkour_eight"),
      checkpoints: data.parkour_checkpoints_reached,
      bestTime: data.parkour_personal_best,
    },
    quake: {
      ...pvpBaseMode(data, "quake_duel"),
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
    sumo: pvpBaseMode(data, "sumo_duel"),
    uhc: uhcDuels(data),
    scheme: data.active_prefix_scheme,
    icon: data.active_prefix_icon,
  };
}
