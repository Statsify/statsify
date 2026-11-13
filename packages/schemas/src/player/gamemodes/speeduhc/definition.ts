/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { AssistsSchema, CoinsSchema, KillsStats, WinsStats } from "../common.js";
import { FormattedGame } from "#game";
import { createPrefixProgression } from "#prefixes";
import { ProgressionSchema } from "../../../progression.definition.js";
import { getLevelIndex, titleScores } from "./util.js";
import { s } from "#definition/s";
import type { APIData } from "@statsify/util";

const formatLevel = (level: number) => `§d[${level}❋]`;

const SpeedUHCModeSchema = s.object({
  ...WinsStats,
  ...KillsStats,
  assists: AssistsSchema.color("§e"),
});

const SpeedUHCMasterySchema = s.object({
  ...WinsStats,
  ...KillsStats,
});

export const SpeedUHCSchema = s
  .object({
    overall: SpeedUHCModeSchema,
    solo: SpeedUHCModeSchema,
    teams: SpeedUHCModeSchema,
    coins: CoinsSchema.color("§6"),
    score: s.number().color("§b"),
    activeMastery: s.string().default("none"),
    level() {
      return s
        .number()
        .computed((score) => getLevelIndex(score) + 1, [this.score])
        .subtractInSessions()
        .default(1)
        .leaderboard(false);
    },
    levelFormatted() {
      return s.string().computed(formatLevel, [this.level]).default(formatLevel(1));
    },
    nextLevelFormatted() {
      return s.string().computed((level) => formatLevel(Math.floor(level) + 1), [this.level]);
    },
    progression() {
      return ProgressionSchema.computed((score) => createPrefixProgression(titleScores, score), [
        this.score,
      ]);
    },
    title() {
      return s
        .string()
        .computed((score) => titleScores[getLevelIndex(score)].title, [this.score])
        .default(titleScores[0].title);
    },
    wildSpecialist: SpeedUHCMasterySchema,
    guardian: SpeedUHCMasterySchema,
    sniper: SpeedUHCMasterySchema,
    berserk: SpeedUHCMasterySchema,
    masterBaker: SpeedUHCMasterySchema,
    invigorate: SpeedUHCMasterySchema,
    huntsman: SpeedUHCMasterySchema,
    fortune: SpeedUHCMasterySchema,
    vampirism: SpeedUHCMasterySchema,
  })
  .leaderboard((speeduhc) => ({
    fieldName: FormattedGame.SPEED_UHC,
    extraDisplay: speeduhc.levelFormatted,
  }));

export type SpeedUHC = s.infer<typeof SpeedUHCSchema>;

function speedUHCMode(data: APIData, mode: string): s.input<typeof SpeedUHCModeSchema> {
  const suffix = mode ? `_${mode}` : mode;

  return {
    wins: data[`wins${suffix}`],
    losses: data[`losses${suffix}`],
    kills: data[`kills${suffix}`],
    deaths: data[`deaths${suffix}`],
    assists: data[`assists${suffix}`],
  };
}

function speedUHCMastery(data: APIData, mastery: string): s.input<typeof SpeedUHCMasterySchema> {
  const suffix = `_mastery_${mastery}`;

  return {
    wins: data[`wins${suffix}`],
    losses: data[`losses${suffix}`],
    kills: data[`kills${suffix}`],
    deaths: data[`deaths${suffix}`],
  };
}

export function speedUHC(data: APIData = {}): s.input<typeof SpeedUHCSchema> {
  return {
    overall: speedUHCMode(data, ""),
    solo: speedUHCMode(data, "solo"),
    teams: speedUHCMode(data, "team"),
    coins: data.coins,
    score: data.score,
    activeMastery: (data.activeMasterPerk ?? "none").replace("mastery_", ""),
    wildSpecialist: speedUHCMastery(data, "wild_specialist"),
    guardian: speedUHCMastery(data, "guardian"),
    sniper: speedUHCMastery(data, "sniper"),
    berserk: speedUHCMastery(data, "berserk"),
    masterBaker: speedUHCMastery(data, "master_baker"),
    invigorate: speedUHCMastery(data, "invigorate"),
    huntsman: speedUHCMastery(data, "huntsman"),
    fortune: speedUHCMastery(data, "fortune"),
    vampirism: speedUHCMastery(data, "vampirism"),
  };
}
