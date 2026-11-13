/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { AssistsSchema, CoinsSchema, ExpSchema, KillsStats, WinsStats } from "../common.js";
import { FormattedGame } from "#game";
import { type NumberSchema, s } from "#definition/s";
import { ProgressionSchema, progression } from "../../../progression.definition.js";
import { add, sub } from "@statsify/math";
import type { APIData } from "@statsify/util";
import { formats } from "#definition/format";
import {
  getFormattedLevel,
  getIntendedLevelFormatted,
  getLevel,
  getLevelProgress,
  parseKit,
} from "./util.js";

const SkyWarsModeSchema = s.object({
  ...WinsStats,
  ...KillsStats,
  gamesPlayed: s.number(),
  assists: AssistsSchema.color("§a"),
  playtime: s.number().color("§c").format(formats.time),
  kit: s.string().default("default"),
});

export type SkyWarsMode = s.infer<typeof SkyWarsModeSchema>;
export type SkyWarsMini = SkyWarsMode;
type SkyWarsModeInput = s.input<typeof SkyWarsModeSchema>;

const SkyWarsChallengesSchema = s.object({
  totalWins: s.number(),
  archerWins: s.number(),
  halfHealthWins: s.number(),
  noBlockWins: s.number(),
  noChestWins: s.number(),
  paperWins: s.number(),
  rookieWins: s.number(),
  uhcWins: s.number().leaderboard({ fieldName: "UHC Wins" }),
  ultimateWarriorWins: s.number(),
});

export type ChallengesSkyWars = s.infer<typeof SkyWarsChallengesSchema>;

const formatLevel = (
  level: number,
  scheme: string,
  emblem: string,
  levelFormattedWithBrackets: string
) =>
  getFormattedLevel(
    level,
    scheme,
    emblem?.replace("_icon", "")?.replace("emblem_", ""),
    levelFormattedWithBrackets?.includes("§l") ?? false,
    levelFormattedWithBrackets?.includes("§n") ?? false,
    levelFormattedWithBrackets?.includes("§m") ?? false
  );

const levelProgression = (exp: number, level: number) => {
  const { current, max } = getLevelProgress(exp, level);
  return progression(current, max ?? 0);
};

export const SkyWarsSchema = s
  .object({
    exp() {
      return ExpSchema
        // The API sends the level as a number, which the bot formats like any other value
        .format(formats.searchedAs(getLevel, (exp) => getLevel(exp) as unknown as string))
        .leaderboard({
          fieldName: "Level",
          hidden: true,
          additionalFields: [this.overall.wins, this.overall.kills, this.overall.kdr],
        });
    },
    coins: CoinsSchema.color("§6"),
    souls(): NumberSchema {
      return s.number().color("§b").leaderboard({ additionalFields: [this.opals] });
    },
    opals() {
      return s.number().color("§9").leaderboard({ additionalFields: [this.souls] });
    },
    heads: s.number().color("§5"),
    tokens: s.number().color("§2"),
    potionsBrewed: s.number().color("§d"),
    level() {
      return s.number().computed(getLevel, [this.exp]).subtractInSessions().leaderboard(false);
    },
    naturalLevelFormatted() {
      return s
        .string()
        .computed(getIntendedLevelFormatted, [this.level])
        .default(getIntendedLevelFormatted(0));
    },
    levelFormatted() {
      return s
        .string()
        .computed(formatLevel, [
          this.level,
          this.activeScheme,
          this.emblem,
          this.levelFormattedWithBrackets,
        ]);
    },
    nextLevelFormatted() {
      return s.string().computed((level) => getIntendedLevelFormatted(level + 1), [this.level]);
    },
    progression() {
      return ProgressionSchema.computed(levelProgression, [this.exp, this.level]);
    },
    overall: SkyWarsModeSchema,
    solo: SkyWarsModeSchema,
    doubles: SkyWarsModeSchema,
    mini: SkyWarsModeSchema,
    challenges: SkyWarsChallengesSchema,
    emblem: s.string(),
    activeScheme: s.string(),
    levelFormattedWithBrackets: s.string(),
  })
  .leaderboard((skywars) => ({
    fieldName: FormattedGame.SKYWARS,
    extraDisplay: skywars.levelFormatted,
  }));

export type SkyWars = s.infer<typeof SkyWarsSchema>;

function skyWarsMode(data: APIData, mode: string, kit: string): SkyWarsModeInput {
  const suffix = mode ? `_${mode}` : mode;

  const wins = data[`wins${suffix}`];
  const losses = data[`losses${suffix}`];

  return {
    wins,
    losses,
    kills: data[`kills${suffix}`],
    deaths: data[`deaths${suffix}`],
    gamesPlayed: add(wins, losses),
    assists: data[`assists${suffix}`],
    playtime: (data[`time_played${suffix}`] ?? 0) * 1000,
    kit,
  };
}

function mini(data: APIData): SkyWarsModeInput {
  // Losses and deaths aren't tracked for mini
  const losses = sub(data.games_mini, data.wins_mini);

  return {
    wins: data.wins_mini,
    losses,
    kills: data.kills_mini,
    deaths: losses,
    gamesPlayed: data.games_mini,
    assists: data.assists_mini,
    playtime: (data.time_played_mini ?? 0) * 1000,
    kit: parseKit(data.activeKit_MINI),
  };
}

function challenges(data: APIData): s.input<typeof SkyWarsChallengesSchema> {
  return {
    totalWins: data.challenge_wins,
    archerWins: data.challenge_wins_archer,
    halfHealthWins: data.challenge_wins_half_health,
    noBlockWins: data.challenge_wins_no_block,
    noChestWins: data.challenge_wins_no_chest,
    paperWins: data.challenge_wins_paper,
    rookieWins: data.challenge_wins_rookie,
    uhcWins: data.challenge_wins_uhc,
    ultimateWarriorWins: data.challenge_wins_ultimate_warrior,
  };
}

export function skyWars(data: APIData = {}, ap: APIData = {}): s.input<typeof SkyWarsSchema> {
  const normalKit = parseKit(data.activeKit_SOLO_random ? "random" : data.activeKit_SOLO);
  const insaneKit = parseKit(data.activeKit_TEAMS_random ? "random" : data.activeKit_TEAMS);

  const chooseKit = (insane = 0, normal = 0) => (insane > normal ? insaneKit : normalKit);

  return {
    exp: data.skywars_experience ?? 0,
    coins: data.coins,
    souls: data.souls,
    opals: data.opals,
    heads: data.heads,
    tokens: data.cosmetic_tokens,
    potionsBrewed: ap.skywars_tonic_taker,
    overall: skyWarsMode(
      data,
      "",
      chooseKit(
        add(data.wins_solo_insane, data.wins_team_insane),
        add(data.wins_solo_normal, data.wins_team_normal)
      )
    ),
    solo: skyWarsMode(data, "solo", chooseKit(data.wins_solo_insane, data.wins_solo_normal)),
    doubles: skyWarsMode(data, "team", chooseKit(data.wins_team_insane, data.wins_team_normal)),
    mini: mini(data),
    challenges: challenges(data),
    emblem: data.active_emblem,
    activeScheme: data.active_scheme,
    levelFormattedWithBrackets: data.levelFormattedWithBrackets,
  };
}
