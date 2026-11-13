/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { APIData } from "@statsify/util";
import { CoinsSchema, KillsStats } from "../common.js";
import { FormattedGame } from "#game";
import { ProgressionSchema, progression } from "../../../progression.definition.js";
import { createPrefixProgression } from "#prefixes";
import { deepAdd } from "@statsify/math";
import { getLevelIndex, titleScores } from "./util.js";
import { s } from "#definition/s";

const formatLevel = (level: number) => `§6[${level}✫]`;

const UHCModeSchema = s.object({
  wins: s.number().color("§e").leaderboard({ limit: 500_000 }),
  ...KillsStats,
  headsEaten: s.number().color("§6"),
  ultimatesCrafted: s.number().color("§b"),
  extraUltimates: s.number().color("§d"),
});

export type UHCMode = s.infer<typeof UHCModeSchema>;
type UHCModeInput = s.input<typeof UHCModeSchema>;

const scoreProgression = (score: number) => {
  const { current, max } = createPrefixProgression(titleScores, score);
  return progression(current, max ?? 0);
};

export const UHCSchema = s
  .object({
    overall: UHCModeSchema,
    solo: UHCModeSchema,
    teams: UHCModeSchema,
    coins: CoinsSchema.color("§6"),
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
      return ProgressionSchema.computed(scoreProgression, [this.score]);
    },
    score: s.number().color("§b"),
    kit: s.string().default("none"),
    title() {
      return s
        .string()
        .computed((score) => titleScores[getLevelIndex(score)].title, [this.score])
        .default(titleScores[0].title);
    },
  })
  .leaderboard((uhc) => ({ fieldName: FormattedGame.UHC, extraDisplay: uhc.levelFormatted }));

export type UHC = s.infer<typeof UHCSchema>;

function uhcMode(data: APIData, mode: string): UHCModeInput {
  const suffix = mode ? `_${mode}` : mode;

  return {
    wins: data[`wins${suffix}`],
    kills: data[`kills${suffix}`],
    deaths: data[`deaths${suffix}`],
    headsEaten: data[`heads_eaten${suffix}`],
    ultimatesCrafted: data[`ultimates_crafted${suffix}`],
    extraUltimates: data[`extra_ultimates_crafted${suffix}`],
  };
}

export function uhc(data: APIData = {}): s.input<typeof UHCSchema> {
  const solo = uhcMode(data, "solo");
  const teams = uhcMode(data, "");

  return {
    overall: deepAdd(
      solo,
      teams,
      uhcMode(data, "no_diamonds"),
      uhcMode(data, "vanilla_doubles"),
      uhcMode(data, "brawl"),
      uhcMode(data, "solo_brawl"),
      uhcMode(data, "duo_brawl")
    ),
    solo,
    teams,
    coins: data.coins,
    score: data.score,
    kit: data.equippedKit ?? "none",
  };
}
