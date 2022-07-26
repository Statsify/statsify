/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { LocalizeFunction } from "@statsify/discord";

export const formatPosition = (t: LocalizeFunction, position: number): string => {
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

  return `${color}#§l${t(position)}`;
};
