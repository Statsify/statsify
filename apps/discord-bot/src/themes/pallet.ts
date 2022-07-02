/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Fill } from "@statsify/rendering";
import { UserPallet } from "@statsify/schemas";
import { minecraftColors } from "@statsify/util";

interface TextPallet {
  BLACK: Fill;
  DARK_BLUE: Fill;
  DARK_GREEN: Fill;
  DARK_AQUA: Fill;
  DARK_RED: Fill;
  DARK_PURPLE: Fill;
  GOLD: Fill;
  GRAY: Fill;
  DARK_GRAY: Fill;
  BLUE: Fill;
  GREEN: Fill;
  AQUA: Fill;
  RED: Fill;
  LIGHT_PURPLE: Fill;
  YELLOW: Fill;
  WHITE: Fill;
}

const createTextPallet = (pallet: TextPallet) => (color: Fill) => {
  switch (color) {
    case minecraftColors[0].hex:
      return pallet.BLACK;
    case minecraftColors[1].hex:
      return pallet.DARK_BLUE;
    case minecraftColors[2].hex:
      return pallet.DARK_GREEN;
    case minecraftColors[3].hex:
      return pallet.DARK_AQUA;
    case minecraftColors[4].hex:
      return pallet.DARK_RED;
    case minecraftColors[5].hex:
      return pallet.DARK_PURPLE;
    case minecraftColors[6].hex:
      return pallet.GOLD;
    case minecraftColors[7].hex:
      return pallet.GRAY;
    case minecraftColors[8].hex:
      return pallet.DARK_GRAY;
    case minecraftColors[9].hex:
      return pallet.BLUE;
    case minecraftColors[10].hex:
      return pallet.GREEN;
    case minecraftColors[11].hex:
      return pallet.AQUA;
    case minecraftColors[12].hex:
      return pallet.RED;
    case minecraftColors[13].hex:
      return pallet.LIGHT_PURPLE;
    case minecraftColors[14].hex:
      return pallet.YELLOW;
    case minecraftColors[15].hex:
      return pallet.WHITE;
    default:
      return color;
  }
};

export interface Pallet {
  box: Fill;
  textPallet: (color: Fill) => Fill;
  color: Fill;
}

export function getColorPallet(pallet: UserPallet): Partial<Pallet> | undefined {
  switch (pallet) {
    case UserPallet.DEFAULT:
      return undefined;
    case UserPallet.PASTEL:
      return {
        textPallet: createTextPallet({
          BLACK: "#808080",
          DARK_BLUE: "#8080d5",
          DARK_GREEN: "#80d580",
          DARK_AQUA: "#80d5d5",
          DARK_RED: "#d58080",
          DARK_PURPLE: "#d580d5",
          GOLD: "#ffd580",
          GRAY: "#d9d0d0",
          DARK_GRAY: "#aea6a6",
          BLUE: "#aaaaff",
          GREEN: "#aaffaa",
          AQUA: "#aaffff",
          RED: "#ffaaaa",
          LIGHT_PURPLE: "#ffaaff",
          YELLOW: "#ffffaa",
          WHITE: "#ffffff",
        }),
      };
    case UserPallet.MIDNIGHT:
      return {
        color: "#702963",
      };
  }
}
