/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { UserFont } from "@statsify/schemas";
import { loadFonts } from "../fonts.js";
import { renderCard } from "./render.js";
import type { RenderRequest } from "./protocol.js";

// Site visitors never carry a premium theme, so only the default font pages are needed.
await loadFonts([UserFont.DEFAULT]);

// Not piscina's `move()`: the built site runs the pool from its own copy of piscina, which doesn't recognize another
// copy's transfer wrapper and posts the wrapper instead of the image.
export default function render(request: RenderRequest) {
  return renderCard(request);
}
