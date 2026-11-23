/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

/** A leaderboard position as the bot prints it: a bold number, gold, silver and bronze for the top three. */
export const formatPosition = (position: number, format: (value: number) => string): string => {
  let color = "§f";

  switch (position) {
    case 1:
      color = "§#ffd700";
      break;

    case 2:
      color = "§#c0c0c0";
      break;

    case 3:
      color = "§#cd7f32";
      break;
  }

  return `${color}#§l${format(position)}`;
};
