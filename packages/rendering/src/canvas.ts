/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Canvas } from "skia-canvas";

type CanvasOptions = ConstructorParameters<typeof Canvas>[2] & { gpu?: boolean };

export function createCanvas(
  width?: number,
  height?: number,
  options: CanvasOptions = {}
): Canvas {
  return new Canvas(width, height, { gpu: false, ...options });
}
