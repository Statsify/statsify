/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { minecraftColors } from "@statsify/util";
import { s } from "#definition/s";
import type { ColorCode, ColorHex, ColorId } from "./color.js";

const COLORS = Object.fromEntries(minecraftColors.map((color) => [color.id, color])) as Record<
  ColorId,
  (typeof minecraftColors)[number]
>;

// Stored by id, Hypixel's name for a color. An id that isn't a Minecraft color leaves the
// code and hex undefined, like the Color class did
export const ColorSchema = s.object({
  code() {
    return s.string<ColorCode>().computed((id) => COLORS[id]?.code, [this.id]);
  },
  hex() {
    return s.string<ColorHex>().computed((id) => COLORS[id]?.hex, [this.id]);
  },
  id: s.string<ColorId>(),
});

export type Color = s.infer<typeof ColorSchema>;
