/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Box, Render } from "@statsify/rendering";
import { UserBoxes } from "@statsify/schemas";

export function getBoxRenderer(boxes: UserBoxes): Render<Box.BoxRenderProps> {
  switch (boxes) {
    case UserBoxes.DEFAULT:
      return Box.render;
    case UserBoxes.HD:
      return Box.render;
  }
}
