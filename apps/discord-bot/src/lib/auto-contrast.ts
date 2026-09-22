/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { hexToRgb } from "@statsify/rendering";

const linearize = (c: number) => {
  const s = c / 255;
  return s <= 0.039_28 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

const relativeLuminance = (r: number, g: number, b: number) =>
  0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);

export const autoContrast = (hex: string): "#000000" | "#ffffff" => {
  const [r, g, b] = hexToRgb(hex);
  return relativeLuminance(r, g, b) > 0.179 ? "#000000" : "#ffffff";
};

export const mcAutoContrast = (hex: string): "§0" | "§f" =>
  autoContrast(hex) === "#000000" ? "§0" : "§f";
