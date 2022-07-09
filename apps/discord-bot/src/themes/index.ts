/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Background } from "#components";
import { Image, Text, Theme } from "@statsify/rendering";
import { User, UserBoxes, UserFont, UserPallet } from "@statsify/schemas";
import { getBoxRenderer } from "./boxes";
import { getColorPallet } from "./pallet";
import { getFontRenderer } from "./renderer";

export const getTheme = (user: User | null): Theme | undefined => {
  if (!user) return undefined;
  if (!User.isGold(user)) return undefined;
  if (!user.theme) return undefined;

  const {
    boxes = UserBoxes.DEFAULT,
    font = UserFont.DEFAULT,
    pallet = UserPallet.DEFAULT,
  } = user.theme;

  const renderer = getFontRenderer(font);
  const box = getBoxRenderer(boxes);
  const colorPallet = getColorPallet(pallet);

  const hasTextPallet = !!colorPallet?.textPallet;
  const hasColorPallet = !!colorPallet?.color;

  return {
    context: { renderer },
    elements: {
      box(ctx, props, location, theme) {
        if (colorPallet?.box) props.color = colorPallet.box;
        box(ctx, props, location, theme);
      },
      text(ctx, props, location, theme) {
        if (props["t:ignore"]) return Text.render(ctx, props, location, theme);

        if (hasTextPallet) {
          props.text.forEach((r) =>
            r.forEach((n) => {
              n.color = colorPallet.textPallet!(n.color);
            })
          );

          return renderer.fillText(ctx, props.text, location.x, location.y);
        }

        renderer.fillText(ctx, props.text, location.x, location.y);

        if (hasColorPallet) {
          props.text.forEach((r) =>
            r.forEach((n) => {
              n.color = colorPallet.color!;
            })
          );

          ctx.globalCompositeOperation = "color";
          renderer.fillText(ctx, props.text, location.x, location.y);
          ctx.globalCompositeOperation = "source-over";
        }
      },
      img(ctx, props, location, theme, component) {
        Image.render(ctx, props, location, theme, component);

        if (!component || !hasColorPallet) return;

        if ([Background.name].includes(component)) {
          ctx.fillStyle = colorPallet.color!;
          ctx.globalCompositeOperation = "color";
          ctx.fillRect(location.x, location.y, location.width, location.height);
          ctx.globalCompositeOperation = "source-over";
        }
      },
    },
  };
};
