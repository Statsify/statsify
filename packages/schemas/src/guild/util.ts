/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

/**
 *
 * @param exp The guild's exp
 * @returns The guild's level and the required exp to reach the next level
 */
export const getLevel = (exp: number) => {
  const required = [
    100_000, 150_000, 250_000, 500_000, 750_000, 1_000_000, 1_250_000, 1_500_000,
    2_000_000, 2_500_000, 2_500_000, 2_500_000, 2_500_000, 2_500_000, 3_000_000,
  ];

  let level = 0;

  for (let i = 0; i <= 1000; i += 1) {
    let need = 0;

    need = i >= required.length ? required.at(-1)! : required[i];

    if (exp - need < 0)
      return {
        level: Math.round((level + exp / need) * 100) / 100,
        current: Math.round(exp),
        max: Math.round(need),
      };

    level += 1;
    exp -= need;
  }

  return { level: 1000, current: 0, max: 1 };
};
