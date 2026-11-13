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

export function progression(current: number, max: number): s.input<typeof ProgressionSchema> {
  if (!max) return { current: current || 0, percent: 1 };
  return { current: current || 0, max, percent: ratio(current, max) };
}
