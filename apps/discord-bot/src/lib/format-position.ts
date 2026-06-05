/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { LocalizeFunction } from "@statsify/discord";

export const formatPosition = (t: LocalizeFunction, position: number): string => {
  if (position === 1) return `§#ffd700§l#${t(position)}`;
  if (position === 2) return `§#c0c0c0§l#${t(position)}`;
  if (position === 3) return `§#cd7f32§l#${t(position)}`;

  let color: string;
  if (position <= 10) color = "§b";
  else if (position <= 100) color = "§a";
  else if (position <= 1000) color = "§9";
  else if (position <= 10_000) color = "§7";
  else color = "§8";

  return `${color}#${t(position)}`;
};
