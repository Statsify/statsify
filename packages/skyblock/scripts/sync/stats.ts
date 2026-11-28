/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { add, roundTo } from "@statsify/math";
import { parseStatName } from "#lore";
import { prettify } from "@statsify/util";
import type { PlayerStat, StatValue } from "#types";

// Rounding to 4 places drops the float noise of running totals.
export function sumStatValues(values: StatValue[]) {
  const totals: Partial<Record<PlayerStat, number>> = {};
  for (const { stat, value } of values) {
    totals[stat] = add(totals[stat] ?? 0, value);
  }

  return Object.fromEntries(
    Object.entries(totals)
      .filter(([, value]) => value !== 0)
      .map(([stat, value]) => [stat, roundTo(value, 4)]),
  );
}

// NEU's ids for a stat that isn't a player's, like damage, are left out.
export function readNeuStats(stats: Record<string, number>) {
  const values: StatValue[] = [];
  for (const [id, value] of Object.entries(stats)) {
    const stat = parseStatName(prettify(id));
    if (stat) values.push({ stat, value });
  }

  return sumStatValues(values);
}
