/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Background } from "#components";
import { Image, Theme } from "@statsify/rendering";
import { User, UserBoxes, UserFont } from "@statsify/schemas";
import { getBoxRenderer } from "./boxes";
import { getFontRenderer } from "./renderer";

export const getTheme = (user: User | null): Theme | undefined => {
  if (!user) return undefined;
  if (!User.isGold(user)) return undefined;
  if (!user.theme) return undefined;

  const { boxes = UserBoxes.DEFAULT, font = UserFont.DEFAULT } = user.theme;

  const renderer = getFontRenderer(font);
  const box = getBoxRenderer(boxes);

  return {
    context: { renderer },
    elements: {
      box(ctx, props, location, theme) {
        // if (colorPallet?.box) props.color = colorPallet.box;
        // // props.color = "rgba(0, 0, 0, 0.75)";
        // // props.shadowOpacity = 0.6;

        // props.color = "rgba(220, 220, 240, 0.65)";
        // props.shadowOpacity = 0.3;

        box(ctx, props, location, theme);
      },
      img(ctx, props, location, theme, component) {
        Image.render(ctx, props, location, theme, component);

        if (!component) return;

        if ([Background.name].includes(component)) {
          // ctx.fillStyle = "rgba(0, 0, 0, 0.32)";
          // ctx.fillRect(location.x, location.y, location.width, location.height);
        }
      },
    },
  };
};
