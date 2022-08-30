/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container } from "typedi";
import { FontRenderer } from "@statsify/rendering";
import { UserFont } from "@statsify/schemas";

export function getFontRenderer(font: UserFont): FontRenderer {
  switch (font) {
    case UserFont.HD:
      return Container.get("HDFontRenderer");
    default:
      return Container.get(FontRenderer);
  }
}
