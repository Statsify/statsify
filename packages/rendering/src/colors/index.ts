/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

export type RGB = [number, number, number];

export type RGBA = [number, number, number, number];

export const hexToRgb = (hex: string): RGB => {
  hex = hex.replace("#", "");

  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);

  const color = [r, g, b];

  if (hex.length === 8) {
    const a = Number.parseInt(hex.slice(6, 8), 16);
    color.push(a / 256);
  }

  return color as unknown as RGB;
};

export const rgbToHex = (rgb: RGB | RGBA): string =>
  `#${rgb.map(o => o.toString(16).toUpperCase().padStart(2, "0")).join("")}`;

export const rgbToString = (rgb: RGB | RGBA): string => `rgba(${rgb.join(", ")})`;

export const mcShadow = (color: string): string =>
  rgbToHex(hexToRgb(color).map(o => Math.floor(o * 0.25)) as RGB);

export const parseColor = (color: string): RGBA => {
  if (color.startsWith("#")) {
    return hexToRgb(color) as unknown as RGBA;
  } else if (color.startsWith("rgb") || color.startsWith("rgba")) {
    return color
      .split("(")[1]
      .split(")")[0]
      .split(",")
      .map(o => +o) as RGBA;
  } else {
    return [0, 0, 0, 0];
  }
};
