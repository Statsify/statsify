/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Background } from "#components";
import { Container } from "typedi";
import { type DeferredGradient, FontRenderer, Image, Theme } from "@statsify/rendering";
import { User, UserBoxes, UserFont, UserPalette } from "@statsify/schemas";
import { getBoxRenderer } from "./boxes/index.js";
import { getColorPalette } from "./palette.js";
import { getFontRenderer } from "./renderer.js";

export const HalloweenBoxColors = {
  orange: ["rgb(44 13 1 / 0.60)", "rgb(85 28 8 / 0.75)"] as const,
  green: ["rgb(7 35 8 / 0.60)", "rgb(2 37 18 / 0.75)"] as const,
  purple: ["rgb(18 6 30 / 0.60)", "rgb(28 5 54 / 0.75)"] as const,
};

const colors = ["orange", "green", "purple"] as (keyof typeof HalloweenBoxColors)[];
const colorsDistribution = [0.3, 0.25, 0.45];

function pickWithDistribution<T>(items: T[], distribution: number[]): T {
  const key = Math.random();
  let sum = 0;

  for (const [i, element] of distribution.entries()) {
    if (key >= sum && key <= (sum + element)) return items[i];
    sum += element;
  }

  return items.at(-1)!;
}

function boxColorFill(color: keyof typeof HalloweenBoxColors): DeferredGradient {
  return (ctx, x, y, width, height) => {
    const gradient = ctx.createLinearGradient(x + width / 2, y + height, x + width / 2, y);
    gradient.addColorStop(0, HalloweenBoxColors[color][0]);
    gradient.addColorStop(1, HalloweenBoxColors[color][1]);
    return gradient;
  };
}

export const getTheme = (user: User | null): Theme | undefined => {
  const boxColorId = pickWithDistribution(colors, colorsDistribution);

  const defaultTheme = {
    context: {
      renderer: Container.get(FontRenderer),
      boxColorId,
      boxColorFill: boxColorFill(boxColorId),
    },
    elements: {},
  };

  if (!user) return defaultTheme;
  if (!User.isGold(user)) return defaultTheme;
  if (!user.theme) return defaultTheme;

  const {
    boxes = UserBoxes.DEFAULT,
    font = UserFont.DEFAULT,
    palette = UserPalette.DEFAULT,
  } = user.theme;

  const renderer = getFontRenderer(font);
  const box = getBoxRenderer(boxes);
  const colorPalette = User.isDiamond(user) ? getColorPalette(palette) : undefined;

  return {
    context: {
      renderer,
      boxColorId,
      boxColorFill: boxColorFill(boxColorId),
    },
    elements: {
      box(ctx, props, location, theme) {
        if (colorPalette?.boxes?.color) props.color ??= colorPalette.boxes.color;
        if (colorPalette?.boxes?.shadowOpacity !== undefined) {
          props.shadowOpacity ??= colorPalette.boxes.shadowOpacity;
        }

        box(ctx, props, location, theme);
      },
      img(ctx, props, location, theme, component) {
        if (component !== Background.name)
          return Image.render(ctx, props, location, theme, component);

        if (colorPalette?.background === null) return;

        Image.render(ctx, props, location, theme, component);

        if (!colorPalette?.background || !component) return;

        ctx.fillStyle = colorPalette.background;
        ctx.fillRect(location.x, location.y, location.width, location.height);
      },
    },
  };
};
