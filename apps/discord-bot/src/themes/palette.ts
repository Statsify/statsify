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
  background?: Fill | null;
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
          shadowOpacity: 0.4,
        },
        background: "rgba(0, 0, 0, 0.32)",
      };
    case UserPalette.DARKBLUE:
      return {
        boxes: {
          color: "rgba(0, 0, 170, 0.5)",
          shadowOpacity: 0.6,
        },
      };
    case UserPalette.DARKGREEN:
      return {
        boxes: {
          color: "rgba(0, 170, 0, 0.5)",
          shadowOpacity: 0.6,
        },
      };
    case UserPalette.DARKAQUA:
      return {
        boxes: {
          color: "rgba(0, 170, 170, 0.5)",
          shadowOpacity: 0.6,
        },
      };
    case UserPalette.DARKRED:
      return {
        boxes: {
          color: "rgba(170, 0, 0, 0.5)",
          shadowOpacity: 0.6,
        },
      };
    case UserPalette.DARKPURPLE:
      return {
        boxes: {
          color: "rgba(170, 0, 170, 0.5)",
          shadowOpacity: 0.6,
        },
      };
    case UserPalette.GOLD:
      return {
        boxes: {
          color: "rgba(255, 170, 0, 0.4)",
          shadowOpacity: 0.6,
        },
        background: "rgba(0, 0, 0, 0.32)",
      };
    case UserPalette.BLUE:
      return {
        boxes: {
          color: "rgba(85, 85, 255, 0.4)",
          shadowOpacity: 0.6,
        },
        background: "rgba(0, 0, 0, 0.32)",
      };
    case UserPalette.GREEN:
      return {
        boxes: {
          color: "rgba(85, 255, 85, 0.4)",
          shadowOpacity: 0.6,
        },
        background: "rgba(0, 0, 0, 0.32)",
      };
    case UserPalette.AQUA:
      return {
        boxes: {
          color: "rgba(85, 255, 255, 0.4)",
          shadowOpacity: 0.6,
        },
        background: "rgba(0, 0, 0, 0.32)",
      };
    case UserPalette.RED:
      return {
        boxes: {
          color: "rgba(255, 85, 85, 0.4)",
          shadowOpacity: 0.6,
        },
        background: "rgba(0, 0, 0, 0.32)",
      };
    case UserPalette.LIGHTPURPLE:
      return {
        boxes: {
          color: "rgba(255, 85, 255, 0.4)",
          shadowOpacity: 0.6,
        },
        background: "rgba(0, 0, 0, 0.32)",
      };
    case UserPalette.YELLOW:
      return {
        boxes: {
          color: "rgba(255, 255, 85, 0.4)",
          shadowOpacity: 0.6,
        },
        background: "rgba(0, 0, 0, 0.32)",
      };
    case UserPalette.NO_BACKGROUNDS:
      return {
        background: null,
      };
  }
};
