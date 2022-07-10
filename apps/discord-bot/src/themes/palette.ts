/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Fill } from "@statsify/rendering";
import { UserPalette } from "@statsify/schemas";

export interface Palette {
  background?: Fill;
  boxes?: {
    color?: Fill;
    shadowOpacity?: number;
  };
}

export const getColorPalette = (palette: UserPalette): Palette | undefined => {
  switch (palette) {
    case UserPalette.DEFAULT:
      return undefined;
    case UserPalette.DARK:
      return {
        boxes: {
          color: "rgba(0, 0, 0, 0.75)",
          shadowOpacity: 0.6,
        },
      };
    case UserPalette.LIGHT:
      return {
        boxes: {
          color: "rgba(220, 220, 240, 0.65)",
          shadowOpacity: 0.3,
        },
        background: "rgba(0, 0, 0, 0.32)",
      };
  }
};
