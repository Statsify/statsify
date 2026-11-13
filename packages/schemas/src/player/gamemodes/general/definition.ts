/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type ColorCode, type NumberSchema, s } from "#definition/s";
import { ExpSchema } from "../common.js";
import { FormattedGame } from "#game";
import { ProgressionSchema, progression } from "../../../progression.definition.js";
import type { APIData } from "@statsify/util";
import { formats } from "#definition/format";
import { getNetworkLevel } from "./util.js";

const MAX_EVENT_LEVEL = 100;

const EventSchema = (expRequirement: number, color: ColorCode) =>
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

const SummerSchema = EventSchema(25_000, "§e");
const HalloweenSchema = EventSchema(10_000, "§5");
const ChristmasSchema = EventSchema(10_000, "§c");
const EasterSchema = EventSchema(10_000, "§b");

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

const objectivesSchema = <O extends readonly Objective[]>(objectives: O) =>
  s.object(s.keyed(objectives, () => s.number().leaderboard(false)));

type ObjectivesSchema<O extends readonly Objective[]> = ReturnType<typeof objectivesSchema<O>>;

const BingoSchema = s.object({
  easy: s.object({
    casual: objectivesSchema(CASUAL_EASY),
    pvp: objectivesSchema(PVP_EASY),
    classic: objectivesSchema(CLASSIC_EASY),
  }),
  hard: s.object({
    casual: objectivesSchema(CASUAL_HARD),
    pvp: objectivesSchema(PVP_HARD),
    classic: objectivesSchema(CLASSIC_HARD),
  }),
  bucks: s.number(),
});

export const GeneralSchema = s
  .object({
    achievementPoints: s.number().color("§6"),
    giftsSent: s.number().color("§5"),
    karma: s.number().color("§d"),
    // Two fields that read each other through `this` need one return type, or TypeScript can't infer either
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

const objectives = <O extends readonly Objective[]>(list: O, data: APIData = {}) =>
  Object.fromEntries(list.map(({ property, key }) => [property, data[key]])) as s.input<
    ObjectivesSchema<O>
  >;

function bingo(data: APIData = {}): s.input<typeof BingoSchema> {
  const cards = data.easter?.["2026"]?.bingo ?? {};

  return {
    easy: {
      casual: objectives(CASUAL_EASY, cards.casual_easy?.objectives),
      pvp: objectives(PVP_EASY, cards.pvp_easy?.objectives),
      classic: objectives(CLASSIC_EASY, cards.classic_easy?.objectives),
    },
    hard: {
      casual: objectives(CASUAL_HARD, cards.casual_hard?.objectives),
      pvp: objectives(PVP_HARD, cards.pvp_hard?.objectives),
      classic: objectives(CLASSIC_HARD, cards.classic_hard?.objectives),
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
