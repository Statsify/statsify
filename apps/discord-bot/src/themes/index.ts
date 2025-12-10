/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Background } from "#components";
import { Image, Theme } from "@statsify/rendering";
import { User, UserBoxes, UserFont, UserPalette } from "@statsify/schemas";
import { getBoxRenderer } from "./boxes/index.js";
import { getColorPalette } from "./palette.js";
import { getFontRenderer } from "./renderer.js";

export const getTheme = (user: User | null): Theme | undefined => {
  if (!user) return undefined;
  if (!User.isGold(user)) return undefined;
  if (!user.theme) return undefined;

  const {
    boxes = UserBoxes.DEFAULT,
    font = UserFont.DEFAULT,
    palette = UserPalette.DEFAULT,
  } = user.theme;

  const renderer = getFontRenderer(font);
  const box = getBoxRenderer(boxes);
  const colorPalette = User.isDiamond(user)
    ? getColorPalette(palette)
    : undefined;

  return {
    context: { renderer, boxColorId: undefined },
    elements: {
      box(ctx, props, location, theme) {
        if (colorPalette?.boxes?.color)
          props.color ??= colorPalette.boxes.color;
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
