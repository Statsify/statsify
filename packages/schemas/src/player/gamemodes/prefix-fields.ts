/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  type FormatPrefixOptions,
  type GamePrefix,
  createPrefixProgression,
  defaultPrefix,
  getFormattedPrefix,
} from "#prefixes";
import { type NumberSchema, type Ref, s } from "#definition/s";
import { ProgressionSchema } from "../../progression.definition.js";

type Score = Ref<NumberSchema>;

/** Progress from the requirement the score last reached to the next one */
export const prefixProgression = (requirements: { req: number }[], score: Score) =>
  ProgressionSchema.computed((score) => createPrefixProgression(requirements, score), [score]);

/** The fields a game with prefixes computes from the score that earns them */
export const prefixFields = (
  prefixes: GamePrefix[],
  options: Pick<FormatPrefixOptions, "abbreviation"> = {}
) => {
  const format = (score: number, prefix: Pick<FormatPrefixOptions, "skip" | "trueScore">) =>
    getFormattedPrefix({ prefixes, score, ...options, ...prefix });

  return {
    progression: (score: Score) => prefixProgression(prefixes, score),
    currentPrefix: (score: Score) => s.string().computed((score) => format(score, {}), [score]),
    naturalPrefix: (score: Score) =>
      s
        .string()
        .computed((score) => format(score, { trueScore: true }), [score])
        .default(defaultPrefix(prefixes, options)),
    nextPrefix: (score: Score) => s.string().computed((score) => format(score, { skip: true }), [score]),
  };
};
