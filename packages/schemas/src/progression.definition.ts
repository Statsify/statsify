/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ratio } from "@statsify/math";
import { s } from "#definition/s";

export const ProgressionSchema = s.object({
  current: s.number().leaderboard(false),
  max: s.number().optional().leaderboard(false),
  percent: s.number().leaderboard(false),
});

export type Progression = s.infer<typeof ProgressionSchema>;

export function progression(current: number, max: number): Progression {
  if (!max) return { current: current || 0, percent: 1 };
  return { current: current || 0, max, percent: ratio(current, max) };
}

/** Progress through the current level, for games whose level `n` takes `getExpReq(n)` exp */
export const expProgression = (getExpReq: (level: number) => number) => (exp: number, level: number) => {
  const flooredLevel = Math.floor(level);

  let levelExp = exp;
  for (let i = 0; i < flooredLevel; i++) levelExp -= getExpReq(i);

  return progression(levelExp, getExpReq(flooredLevel));
};
