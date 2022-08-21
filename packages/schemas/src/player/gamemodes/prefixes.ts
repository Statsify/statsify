/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Progression } from "../../progression";
import { abbreviationNumber, findScoreIndex } from "@statsify/util";

export type GamePrefix = { fmt: (n: string) => string; req: number };
export type GameTitle = { fmt: (n: string) => string; req: number; title: string };

type Prefixes = GamePrefix[] | GameTitle[];

/**
 *
 * @param prefixes An array of objects with a color code and req property
 * @param score The value to compare against
 * @param skip The number of prefixes to skip
 * @returns The score needed to reach the requested prefix
 */
export const getPrefixRequirement = (
  prefixes: Prefixes,
  score: number,
  skip = 0
): number => {
  const prefixIndex = prefixes.findIndex((requirement) => requirement.req > (score || 0));

  return prefixIndex === -1
    ? prefixes.at(-1)!.req
    : prefixes[Math.min(prefixIndex + skip - 1, prefixes.length - 1)].req || 0;
};

export const createPrefixProgression = (prefixes: Prefixes, score: number) => {
  const currentRequirement = getPrefixRequirement(prefixes, score);
  const nextRequirement = getPrefixRequirement(prefixes, score, 1);

  return new Progression(
    Math.abs(score - currentRequirement),
    nextRequirement - currentRequirement
  );
};

export interface FormatPrefixOptions {
  prefixes: Prefixes;
  score: number;

  /**
   * Whether to skip the prefix and use the next prefix
   * @default false
   */
  skip?: boolean;

  /**
   * @default true
   */
  abbreviation?: boolean;

  /**
   * Whether or not to floor the score
   * @default false
   */
  trueScore?: boolean;
}

export const getFormattedPrefix = ({
  prefixes,
  score,
  skip = false,
  trueScore = false,
  abbreviation = true,
}: FormatPrefixOptions) => {
  score = score ?? 0;

  let prefixIndex = findScoreIndex(prefixes, score);

  if (skip) prefixIndex = Math.min(prefixIndex + 1, prefixes.length - 1);

  const prefix = prefixes[prefixIndex];

  if ("title" in prefix) return prefix.fmt(prefix.title);

  if (!abbreviation) return prefix.fmt(`${trueScore ? Math.floor(score) : score}`);

  const [number, suffix] = abbreviationNumber(trueScore ? score : prefix.req);
  const formattedScore = trueScore ? Math.floor(number) : number;
  return prefix.fmt(`${formattedScore}${suffix}`);
};

export const defaultPrefix = (
  prefixes: Prefixes,
  options?: Omit<FormatPrefixOptions, "prefixes" | "score">
) => getFormattedPrefix({ prefixes, score: prefixes[0].req, ...options });

const RAINBOW_COLORS = ["c", "6", "e", "a", "b", "d", "9"];

export const rainbow = (text: string) =>
  [...text].map((l, i) => `§${RAINBOW_COLORS[i % RAINBOW_COLORS.length]}${l}`).join("");
