/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { CoinsSchema, KillsStats, WinsSchema } from "../common.js";
import { type ExtractGameModes, FormattedGame, GameModes } from "#game";
import { type GamePrefix, defaultPrefix, getFormattedPrefix } from "#prefixes";
import { add } from "@statsify/math";
import type { APIData } from "@statsify/util";
import { humanPrefixes, vampirePrefixes } from "./prefixes.js";
import { prefixFields } from "../prefix-fields.js";
import { s } from "#definition/s";

export const VAMPIREZ_MODES = new GameModes([{ api: "human" }, { api: "vampire" }] as const);
export type VampireZModes = ExtractGameModes<typeof VAMPIREZ_MODES>;

const vampireZLifeSchema = (killsName: string, prefixes: GamePrefix[], scoredBy: "wins" | "kills") => {
  const prefix = prefixFields(prefixes);

  return s.object({
    ...KillsStats,
    kills() {
      return KillsStats.kills.call(this).leaderboard({ fieldName: killsName });
    },
    wins: WinsSchema.color("§e"),
    currentPrefix() {
      return prefix.currentPrefix(this[scoredBy]);
    },
    nextPrefix() {
      return prefix.nextPrefix(this[scoredBy]);
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
      return prefix.progression(this[scoredBy]);
    },
  });
};

const VampireZHumanSchema = vampireZLifeSchema("Vampires Killed", humanPrefixes, "wins");
const VampireZVampireSchema = vampireZLifeSchema("Humans Killed", vampirePrefixes, "kills");

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

function life(data: APIData, mode: "human" | "vampire"): s.input<typeof VampireZHumanSchema> {
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
