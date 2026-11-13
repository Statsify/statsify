/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { CoinsSchema, KillsStats } from "../common.js";
import { FormattedGame } from "#game";
import {
  type GamePrefix,
  createPrefixProgression,
  defaultPrefix,
  getFormattedPrefix,
} from "#prefixes";
import { ProgressionSchema, progression } from "../../../progression.definition.js";
import { add } from "@statsify/math";
import type { APIData } from "@statsify/util";
import { humanPrefixes, vampirePrefixes } from "./prefixes.js";
import { s } from "#definition/s";

const prefixProgression = (prefixes: GamePrefix[], score: number) => {
  const { current, max = 0 } = createPrefixProgression(prefixes, score);
  return progression(current, max);
};

const VampireZLifeSchema = (killsName: string, prefixes: GamePrefix[], scoredBy: "wins" | "kills") =>
  s.object({
    ...KillsStats,
    kills() {
      return KillsStats.kills.call(this).leaderboard({ fieldName: killsName });
    },
    wins: s.number().color("§e").leaderboard({ limit: 500_000 }),
    currentPrefix() {
      return s.string().computed((score) => getFormattedPrefix({ prefixes, score }), [this[scoredBy]]);
    },
    nextPrefix() {
      return s
        .string()
        .computed((score) => getFormattedPrefix({ prefixes, score, skip: true }), [this[scoredBy]]);
    },
    naturalPrefix() {
      return s
        .string()
        .computed(
          (score) => getFormattedPrefix({ prefixes, score, trueScore: true, abbreviation: false }),
          [this[scoredBy]]
        )
        .default(defaultPrefix(humanPrefixes));
    },
    progression() {
      return ProgressionSchema.computed((score) => prefixProgression(prefixes, score), [this[scoredBy]]);
    },
  });

const VampireZHumanSchema = VampireZLifeSchema("Vampires Killed", humanPrefixes, "wins");
const VampireZVampireSchema = VampireZLifeSchema("Humans Killed", vampirePrefixes, "kills");

export const VampireZSchema = s
  .object({
    coins: CoinsSchema.color("§6"),
    tokens: s.number().color("§e"),
    overallWins: s.number().color("§a"),
    mostVampireKills: s.number().color("§c"),
    zombieKills: s.number().color("§2"),
    human: VampireZHumanSchema.leaderboard((human) => ({
      fieldName: "Human -",
      extraDisplay: human.naturalPrefix,
    })),
    vampire: VampireZVampireSchema.leaderboard((vampire) => ({
      fieldName: "Vampire -",
      extraDisplay: vampire.naturalPrefix,
    })),
  })
  .leaderboard({ fieldName: FormattedGame.VAMPIREZ });

export type VampireZ = s.infer<typeof VampireZSchema>;

function life(data: APIData, mode: "human" | "vampire") {
  return {
    kills: data[`${mode === "human" ? "vampire" : "human"}_kills`],
    deaths: data[`${mode}_deaths`],
    wins: data[`${mode}_wins`],
  };
}

export function vampireZ(data: APIData = {}, legacy: APIData = {}): s.input<typeof VampireZSchema> {
  const human = life(data, "human");
  const vampire = life(data, "vampire");

  return {
    coins: data.coins,
    tokens: legacy.vampirez_tokens,
    overallWins: add(human.wins, vampire.wins),
    mostVampireKills: data.most_vampire_kills_new,
    zombieKills: data.zombie_kills,
    human,
    vampire,
  };
}
