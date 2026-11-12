/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container } from "typedi";
import { FontRenderer } from "@statsify/rendering";
import { UserFont } from "@statsify/schemas";
import { getMinecraftTexturePath } from "@statsify/assets";

const renderers: Record<UserFont, FontRenderer> = {
  [UserFont.DEFAULT]: new FontRenderer(false),
  [UserFont.HD]: new FontRenderer(false),
  [UserFont.FPACK]: new FontRenderer(true),
};

Container.set(FontRenderer, renderers[UserFont.DEFAULT]);
Container.set("HDFontRenderer", renderers[UserFont.HD]);
Container.set("FPackFontRenderer", renderers[UserFont.FPACK]);

/**
 * Reads the bitmap font pages into the renderers `getTheme` picks from. The texture pack
 * directories are named after the `UserFont` values; without the private assets every font
 * falls back to the default pack.
 */
export async function loadFonts(fonts: readonly UserFont[] = Object.values(UserFont)): Promise<void> {
  await Promise.all(
    fonts.map((font) => renderers[font].loadImages(getMinecraftTexturePath("textures/font", font)))
  );
}
