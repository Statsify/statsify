/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import Container, { Service } from "typedi";
import { FontRenderer } from "@statsify/rendering";
import { getMinecraftTexturePath } from "@statsify/assets";

const renderer = new FontRenderer();
const hdRenderer = new FontRenderer();

Container.set(FontRenderer, renderer);
Container.set("HDFontRenderer", hdRenderer);

@Service()
export class FontLoaderService {
  public async init() {
    await renderer.loadImages(getMinecraftTexturePath("textures/font"));
    await hdRenderer.loadImages(getMinecraftTexturePath("textures/font", "hd"));
  }
}
