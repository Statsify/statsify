/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Progression } from "#progression";
import { abbreviationNumber, findScoreIndex } from "@statsify/util";

export type GamePrefix<T extends unknown[] = []> = {
  fmt: (n: string, ...args: T) => string;
  req: number;
};

export type GameTitle<T extends unknown[] = []> = {
  fmt: (n: string, ...args: T) => string;
  req: number;
  title: string;
};

type Prefixes<T extends unknown[] = []> = GamePrefix<T>[] | GameTitle<T>[];

/**
 *
 * @param prefixes An array of objects with a color code and req property
 * @param score The value to compare against
 * @param skip The number of prefixes to skip
 * @returns The score needed to reach the requested prefix
 */
const getPrefixRequirement = <T extends unknown[] = []>(
  prefixes: Prefixes<T>,
  score: number,
  skip = 0
): number => {
  const prefixIndex = prefixes.findIndex((requirement) => requirement.req > (score || 0));

  return prefixIndex === -1
    ? prefixes.at(-1)!.req
    : prefixes[Math.min(prefixIndex + skip - 1, prefixes.length - 1)].req || 0;
};

export const createPrefixProgression = <T extends unknown[] = []>(
  prefixes: Prefixes<T>,
  score: number
) => {
  const currentRequirement = getPrefixRequirement(prefixes, score);
  const nextRequirement = getPrefixRequirement(prefixes, score, 1);

  return new Progression(
    Math.abs(score - currentRequirement),
    nextRequirement - currentRequirement
  );
};

export interface FormatPrefixOptions<T extends unknown[] = []> {
  prefixes: Prefixes<T>;
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

  /**
   * Extra arguments to pass to the prefix format function
   */
  prefixParams?: T;
}

export const getFormattedPrefix = <T extends unknown[] = []>({
  prefixes,
  score,
  skip = false,
  trueScore = false,
  abbreviation = true,
  prefixParams = [] as unknown as T,
}: FormatPrefixOptions<T>) => {
  score = score ?? 0;

  let prefixIndex = findScoreIndex(prefixes, score);

  if (skip) prefixIndex = Math.min(prefixIndex + 1, prefixes.length - 1);

  const prefix = prefixes[prefixIndex];

  if ("title" in prefix) return prefix.fmt(prefix.title, ...prefixParams);

  if (!abbreviation)
    return prefix.fmt(`${trueScore ? Math.floor(score) : prefix.req}`, ...prefixParams);

  const [prefixNumber, prefixSuffix] = abbreviationNumber(prefix.req);

  if (!trueScore) return prefix.fmt(`${prefixNumber}${prefixSuffix}`, ...prefixParams);

  let [number, suffix] = abbreviationNumber(score);

  number = Math.floor(number);

  if (number < prefixNumber) {
    number = prefixNumber;
    suffix = prefixSuffix;
  }

  return prefix.fmt(`${number}${suffix}`, ...prefixParams);
};

export const defaultPrefix = <T extends unknown[] = []>(
  prefixes: Prefixes<T>,
  options?: Omit<FormatPrefixOptions<T>, "prefixes" | "score">
) => getFormattedPrefix({ prefixes, score: prefixes[0].req, ...options });

const RAINBOW_COLORS = ["c", "6", "e", "a", "b", "d", "9"];

export const rainbow = (text: string) =>
  [...text].map((l, i) => `§${RAINBOW_COLORS[i % RAINBOW_COLORS.length]}${l}`).join("");
