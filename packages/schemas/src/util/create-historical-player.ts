/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { RATIOS, RATIO_STATS } from "#ratios";
import { isObject } from "class-validator";
import { ratio, sub } from "@statsify/math";

export function createHistoricalPlayer<T>(oldOne: T, newOne: T): T {
  const merged = {} as T;

  const keys = Object.keys({ ...oldOne, ...(newOne as any) });

  for (const _key of keys) {
    const key = _key as keyof T;
    const newOneType = typeof newOne[key];

    if (typeof oldOne[key] === "number" || newOneType === "number") {
      const ratioIndex = RATIOS.indexOf(_key);

      if (ratioIndex === -1) {
        merged[key] = sub(
          newOne[key] as unknown as number,
          oldOne[key] as unknown as number
        ) as unknown as T[keyof T];
      } else {
        const numerator = sub(
          newOne[RATIO_STATS[ratioIndex][0] as unknown as keyof T] as unknown as number,
          oldOne[RATIO_STATS[ratioIndex][0] as unknown as keyof T] as unknown as number
        );

        const denominator = sub(
          newOne[RATIO_STATS[ratioIndex][1] as unknown as keyof T] as unknown as number,
          oldOne[RATIO_STATS[ratioIndex][1] as unknown as keyof T] as unknown as number
        );

        merged[key] = ratio(
          numerator,
          denominator,
          RATIO_STATS[ratioIndex][4] ?? 1
        ) as unknown as T[keyof T];
      }
    } else if (newOneType === "string") {
      merged[key] = newOne[key];
    } else if (isObject(newOne[key])) {
      merged[key] =
        key === "progression"
          ? newOne[key]
          : (createHistoricalPlayer(
              oldOne[key] ?? {},
              newOne[key] ?? {}
            ) as unknown as T[keyof T]);
    }
  }

  return merged;
}
