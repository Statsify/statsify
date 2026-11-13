/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type ColorCode, type NumberSchema, s } from "#definition/s";
import { ExpSchema } from "../common.js";
import { type ExtractGameModes, FormattedGame, GameModes } from "#game";
import { ProgressionSchema, progression } from "../../../progression.definition.js";
import type { APIData } from "@statsify/util";
import { formats } from "#definition/format";
import { getNetworkLevel } from "./util.js";

export const GENERAL_MODES = new GameModes([{ api: "overall" }] as const);
export type GeneralModes = ExtractGameModes<typeof GENERAL_MODES>;

const MAX_EVENT_LEVEL = 100;

const eventSchema = (expRequirement: number, color: ColorCode) =>
  s.object({
    exp: ExpSchema.color(color),
    level() {
      return s
        .number()
        .computed(
          (exp) => Math.min(MAX_EVENT_LEVEL, Math.floor(exp / expRequirement) + 1),
          [this.exp]
        )
        .subtractInSessions()
        .default(1)
        .leaderboard(false);
    },
    progression() {
      return ProgressionSchema.computed(
        (exp, level) =>
          progression(exp % expRequirement, level >= MAX_EVENT_LEVEL ? 0 : expRequirement),
        [this.exp, this.level]
      );
    },
  });

const SummerSchema = eventSchema(25_000, "§e");
const HalloweenSchema = eventSchema(10_000, "§5");
const ChristmasSchema = eventSchema(10_000, "§c");
const EasterSchema = eventSchema(10_000, "§b");

export type Event = s.infer<typeof SummerSchema>;

const EventsSchema = s.object({
  summer2022: SummerSchema.leaderboard({ name: "Summer 2022" }),
  halloween2022: HalloweenSchema.leaderboard({ name: "Halloween 2022" }),
  christmas2022: ChristmasSchema.leaderboard({ name: "Christmas 2022" }),
  easter2023: EasterSchema.leaderboard({ name: "Easter 2023" }),
  summer2023: SummerSchema.leaderboard({ name: "Summer 2023" }),
  halloween2023: HalloweenSchema.leaderboard({ name: "Halloween 2023" }),
  christmas2023: ChristmasSchema.leaderboard({ name: "Christmas 2023" }),
  easter2024: EasterSchema.leaderboard({ name: "Easter 2024" }),
  summer2024: SummerSchema.leaderboard({ name: "Summer 2024" }),
  halloween2024: HalloweenSchema.leaderboard({ name: "Halloween 2024" }),
  christmas2024: ChristmasSchema.leaderboard({ name: "Christmas 2024" }),
  easter2025: EasterSchema.leaderboard({ name: "Easter 2025" }),
  summer2025: SummerSchema.leaderboard({ name: "Summer 2025" }),
  halloween2025: HalloweenSchema.leaderboard({ name: "Halloween 2025" }),
  christmas2025: ChristmasSchema.leaderboard({ name: "Christmas 2025" }),
  easter2026: EasterSchema.leaderboard({ name: "Easter 2026" }),
  summer2026: SummerSchema.leaderboard({ name: "Summer 2026" }),
  halloween2026: HalloweenSchema.leaderboard({ name: "Halloween 2026" }),
  silver: s.number().color("§7"),
});

export type Events = s.infer<typeof EventsSchema>;

export type EventType = {
  period: EventPeriod;
  year: number;
  key: Exclude<keyof Events, "silver">;
};

export type EventPeriod = "summer" | "halloween" | "christmas" | "easter";

export const EVENT_TYPES: EventType[] = [
  { period: "halloween", year: 2026, key: "halloween2026" },
  { period: "summer", year: 2026, key: "summer2026" },
  { period: "easter", year: 2026, key: "easter2026" },
  { period: "christmas", year: 2025, key: "christmas2025" },
  { period: "halloween", year: 2025, key: "halloween2025" },
  { period: "summer", year: 2025, key: "summer2025" },
  { period: "easter", year: 2025, key: "easter2025" },
  { period: "christmas", year: 2024, key: "christmas2024" },
  { period: "halloween", year: 2024, key: "halloween2024" },
  { period: "summer", year: 2024, key: "summer2024" },
  { period: "easter", year: 2024, key: "easter2024" },
  { period: "christmas", year: 2023, key: "christmas2023" },
  { period: "halloween", year: 2023, key: "halloween2023" },
  { period: "summer", year: 2023, key: "summer2023" },
  { period: "easter", year: 2023, key: "easter2023" },
  { period: "christmas", year: 2022, key: "christmas2022" },
  { period: "halloween", year: 2022, key: "halloween2022" },
  { period: "summer", year: 2022, key: "summer2022" },
];

interface Objective {
  property: string;
  key: string;
}

// Lists rather than objects keyed by property: swc's jsonify writes a large object literal with its keys sorted
const CASUAL_EASY = [
  { property: "iSurvivedAnniversaryBingo", key: "Disasterssurvive" },
  { property: "theEvilDead", key: "Arcadeevildead" },
  { property: "festiveSpirit", key: "Bbvote" },
  { property: "goal", key: "Arcadefootballgoal" },
  { property: "nailedIt", key: "Bbguess" },
  { property: "readyAim", key: "Murderbowgold" },
  { property: "ifYouGiveAHouseACookie", key: "Housingcookie" },
  { property: "beginnerEggHunter", key: "Arcadebeginneregghunter" },
  { property: "seasonalStar", key: "Arcadeseasonalstar" },
  { property: "oneWithTheFish", key: "Maincatchfish" },
  { property: "shoppingRun", key: "Arcadeshoppingrun" },
  { property: "goldenSun", key: "Murdergoldensun" },
  { property: "readyOrNot", key: "Murderreadyornot" },
  { property: "creepShow", key: "Arcadecreepshow" },
  { property: "theThing", key: "Bbthething" },
  { property: "homeRun", key: "Arcademanywinseasy" },
] as const satisfies readonly Objective[];

const PVP_EASY = [
  { property: "elfish", key: "Skywarsholidayrefill" },
  { property: "spleefVictor", key: "Duelsspleefvictor" },
  { property: "willItHatch", key: "Bedwarswillithatch" },
  { property: "bloodhound", key: "Skywarsbloodhound" },
  { property: "quakeVictor", key: "Duelsquakevictor" },
  { property: "eatThis", key: "Bedwarseatthis" },
  { property: "suitUp", key: "Woolctwkit" },
  { property: "feelingLight", key: "Duelsboost" },
  { property: "brightAndEarly", key: "Skywarsbrightandearly" },
  { property: "bloodHealing", key: "Woolbloodhealing" },
  { property: "aLongWayDown", key: "Skywarsvoidkill" },
  { property: "shiny", key: "Bedwarsdiamond" },
  { property: "flowingDefense", key: "Bedwarsflowingdefense" },
  { property: "eggstraterrestrial", key: "Duelsfarmerkit" },
  { property: "areaSecured", key: "Wwplacewool" },
  { property: "treasureHunter", key: "Skywarsopenchests" },
] as const satisfies readonly Objective[];

const CLASSIC_EASY = [
  { property: "countingDown", key: "Blitzcountingdown" },
  { property: "aDashingFellow", key: "Quakedash" },
  { property: "itFollows", key: "Tkritfollows" },
  { property: "prepTime", key: "Vampzprep" },
  { property: "poweringUp", key: "Pbpowerup" },
  { property: "braiiiins", key: "Cvcbrains" },
  { property: "explosiveEnding", key: "Cvcthrowprojectile" },
  { property: "freeFood", key: "Megawallsskywarsfreefood" },
  { property: "nowhereToHide", key: "Smashnowheretohide" },
  { property: "leafMeAlone", key: "Tntleafmealone" },
  { property: "hotSpell", key: "Warlordshotspell" },
  { property: "mutant", key: "Tntmutant" },
  { property: "forTheTeam", key: "Warlordsfortheteam" },
  { property: "witheringHeights", key: "Megawallswitheringheights" },
  { property: "youreIt", key: "Tnttagplayer" },
  { property: "tooStronk", key: "Smashthrowoff" },
] as const satisfies readonly Objective[];

const CASUAL_HARD = [
  { property: "deathDestructionDragons", key: "Arcadedragons" },
  { property: "thePurger", key: "Arcadepurger" },
  { property: "scaryGood", key: "Bbscarygood" },
  { property: "lifeOfTheParty", key: "Arcadepartystarswin" },
  { property: "warmingUp", key: "Arcadedropperwarmingup" },
  { property: "undisputedMasterpiece", key: "Bbtop3" },
  { property: "caughtInTheAct", key: "Murderkillmurdermultiple" },
  { property: "noHelpNeeded", key: "Arcadeenderspleef" },
  { property: "bloodthirsty", key: "Murderstreak" },
  { property: "heresSteve", key: "Arcadesteve" },
  { property: "shiny", key: "Mainraremythical" },
  { property: "fastAndAccurate", key: "Bbspeedfirst" },
  { property: "bossBuilder", key: "Buildbattlebossbuilder" },
  { property: "vengeance", key: "Murdervengeance" },
  { property: "survivorStreak", key: "Arcadesurvivorstreak" },
  { property: "moonlitEscape", key: "Arcademoonlitescape" },
] as const satisfies readonly Objective[];

const PVP_HARD = [
  { property: "sneaky", key: "Bedwarsinvisibility" },
  { property: "unmoving", key: "Woolunmoving" },
  { property: "technicolorMurder", key: "Wooltechnicolor" },
  { property: "cabinetOfSouls", key: "Skywarscabinetofsouls" },
  { property: "cleanSheet", key: "Duelsbridgeflawless" },
  { property: "childsPlay", key: "Bedwarschildsplay" },
  { property: "anOffering", key: "Swoffering" },
  { property: "giveThatBack", key: "Woolctwcarrier" },
  { property: "prizefighter", key: "Duelsprizefighter" },
  { property: "betterNerfThis", key: "Skywarschallenge" },
  { property: "immortal", key: "Bedwarsflawless" },
  { property: "barbarian", key: "Woolbarbarian" },
  { property: "betterWithBuds", key: "Skywarsbetterwithbuds" },
  { property: "renaissanceKiller", key: "Duelshardkillsacrossmodes" },
  { property: "headInTheClouds", key: "Duelsheadintheclouds" },
  { property: "expensiveSlaying", key: "Bedwarsdiamondsword" },
] as const satisfies readonly Objective[];

const CLASSIC_HARD = [
  { property: "multifaceted", key: "Cvcallaround" },
  { property: "unlimitedPower", key: "Blitzstar" },
  { property: "deathmatchMadness", key: "Megawallsblitzdeathmatch" },
  { property: "theEndIsNigh", key: "Smashtheendisnigh" },
  { property: "graveConsequences", key: "Warlordsgraveconsequences" },
  { property: "springtimeShowcase", key: "Quakespringtimeshowcase" },
  { property: "pursuit", key: "Wallspursuit" },
  { property: "triumphant", key: "Tntspleeftriumphant" },
  { property: "overkill", key: "Pbnuke" },
  { property: "tilDeathDoUsPart", key: "Tnttagtildeath" },
  { property: "safetyIsAnIllusion", key: "Blitzsafetyisanillusion" },
  { property: "whatsDeadIsDead", key: "Megawallsfinal" },
  { property: "allHallowsHavoc", key: "Blitzallhallowshavoc" },
  { property: "notSoClose", key: "Smashtwolives" },
  { property: "catchMeIfYouCan", key: "Warlordscapture" },
  { property: "soulSiphoner", key: "Arenasoulsiphoner" },
] as const satisfies readonly Objective[];

const objective = () => s.number().leaderboard(false);

const BingoSchema = s.object({
  easy: s.object({
    casual: s.object(s.keyed(CASUAL_EASY, objective)),
    pvp: s.object(s.keyed(PVP_EASY, objective)),
    classic: s.object(s.keyed(CLASSIC_EASY, objective)),
  }),
  hard: s.object({
    casual: s.object(s.keyed(CASUAL_HARD, objective)),
    pvp: s.object(s.keyed(PVP_HARD, objective)),
    classic: s.object(s.keyed(CLASSIC_HARD, objective)),
  }),
  bucks: s.number(),
});

export const GeneralSchema = s
  .object({
    achievementPoints: s.number().color("§6"),
    giftsSent: s.number().color("§5"),
    karma: s.number().color("§d"),
    networkExp(): NumberSchema {
      return s
        .number()
        .format(formats.searchedAs(getNetworkLevel, getNetworkLevel))
        .leaderboard({
          fieldName: "Network Level",
          hidden: true,
          limit: Number.POSITIVE_INFINITY,
          additionalFields: [this.networkLevel],
        });
    },
    networkLevel() {
      return s
        .number()
        .computed(getNetworkLevel, [this.networkExp])
        .subtractInSessions()
        .color("§6")
        .default(1)
        .leaderboard(false);
    },
    currentRewardStreak(): NumberSchema {
      return s.number().color("§d").leaderboard({ additionalFields: [this.highestRewardStreak] });
    },
    highestRewardStreak() {
      return s.number().leaderboard({ additionalFields: [this.currentRewardStreak] });
    },
    tournamentTributes: s.number(),
    ranksGifted: s.number().color("§5"),
    classicTokens: s.number().leaderboard({ fieldName: "Tokens", name: "Classic Tokens" }),
    events: EventsSchema,
    bingo: BingoSchema,
  })
  .leaderboard({ fieldName: `${FormattedGame.GENERAL} -` });

export type General = s.infer<typeof GeneralSchema>;
export type Bingo = s.infer<typeof BingoSchema>;

const event = (data: APIData = {}): s.input<typeof SummerSchema> => ({
  exp: data.levelling?.experience ?? 0,
});

function events(data: APIData = {}): s.input<typeof EventsSchema> {
  return {
    summer2022: event(data.summer?.["2022"]),
    halloween2022: event(data.halloween?.["2022"]),
    christmas2022: event(data.christmas?.["2022"]),
    easter2023: event(data.easter?.["2023"]),
    summer2023: event(data.summer?.["2023"]),
    halloween2023: event(data.halloween?.["2023"]),
    christmas2023: event(data.christmas?.["2023"]),
    easter2024: event(data.easter?.["2024"]),
    summer2024: event(data.summer?.["2024"]),
    halloween2024: event(data.halloween?.["2024"]),
    christmas2024: event(data.christmas?.["2024"]),
    easter2025: event(data.easter?.["2025"]),
    summer2025: event(data.summer?.["2025"]),
    halloween2025: event(data.halloween?.["2025"]),
    christmas2025: event(data.christmas?.["2025"]),
    easter2026: event(data.easter?.["2026"]),
    summer2026: event(data.summer?.["2026"]),
    halloween2026: event(data.halloween?.["2026"]),
    silver: data.silver,
  };
}

const objectives =
  (data: APIData = {}) =>
    ({ key }: Objective) =>
      data[key];

function bingo(data: APIData = {}): s.input<typeof BingoSchema> {
  const cards = data.easter?.["2026"]?.bingo ?? {};

  return {
    easy: {
      casual: s.keyed(CASUAL_EASY, objectives(cards.casual_easy?.objectives)),
      pvp: s.keyed(PVP_EASY, objectives(cards.pvp_easy?.objectives)),
      classic: s.keyed(CLASSIC_EASY, objectives(cards.classic_easy?.objectives)),
    },
    hard: {
      casual: s.keyed(CASUAL_HARD, objectives(cards.casual_hard?.objectives)),
      pvp: s.keyed(PVP_HARD, objectives(cards.pvp_hard?.objectives)),
      classic: s.keyed(CLASSIC_HARD, objectives(cards.classic_hard?.objectives)),
    },
    bucks: data.bingo?.bucks,
  };
}

export function general(data: APIData = {}, legacy: APIData = {}): s.input<typeof GeneralSchema> {
  return {
    achievementPoints: data.achievementPoints,
    giftsSent: data.giftingMeta?.bundlesGiven,
    karma: data.karma,
    networkExp: data.networkExp || 1,
    currentRewardStreak: data.rewardScore,
    highestRewardStreak: data.rewardHighScore,
    tournamentTributes: data.tourney?.total_tributes,
    ranksGifted: data.giftingMeta?.ranksGiven,
    classicTokens: legacy.total_tokens,
    events: events(data.seasonal),
    bingo: bingo(data.seasonal),
  };
}
