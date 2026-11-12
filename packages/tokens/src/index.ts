/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

/**
 * Design tokens for the site. The `§` colours are the bot's own, read from the import-free entry of `@statsify/util`.
 * `scripts/tokens-css.ts` turns these into `dist/tokens.css` for Tailwind's `@theme`.
 */

import { minecraftColors } from "@statsify/util/minecraft-colors";

const mc = (code: string) => minecraftColors.find((color) => color.code === code)!.hex;

/** The 16 `§` colors, under the site's names, and the site palette. */
export const colors = {
  minecraft: {
    black: mc("§0"),
    darkBlue: mc("§1"),
    darkGreen: mc("§2"),
    darkAqua: mc("§3"),
    darkRed: mc("§4"),
    darkPurple: mc("§5"),
    gold: mc("§6"),
    gray: mc("§7"),
    darkGray: mc("§8"),
    blue: mc("§9"),
    green: mc("§a"),
    aqua: mc("§b"),
    red: mc("§c"),
    pink: mc("§d"),
    yellow: mc("§e"),
    white: mc("§f"),
  },
  blueify: {
    100: "#d0efff",
    200: "#7dc6fa",
    300: "#2a9df4",
    400: "#2492e7",
    500: "#1e86da",
    600: "#187bcd",
    700: "#1571bf",
    800: "#1167b1",
  },
  redify: {
    100: "#ffd0d7",
    200: "#f42a37",
    300: "#cd1820",
    400: "#b11117",
    500: "#a10b10",
  },
  blackify: {
    700: "#292929",
    800: "#1d1d1d",
    950: "#111111",
  },
  discord: {
    500: "rgb(88 101 242)",
  },
} as const;

/**
 * The card panel as the Next site drew its boxes: a black fill with a faint light-to-dark gradient over it, blended
 * with `overlay` inside the box only, so the background shows through untinted; a hard shadow, and a bevel smaller
 * than the Next site's 8 px.
 * Lengths are in px.
 */
export const panel = {
  background: "rgb(0 0 0 / 0.5)",
  overlay: {
    from: "rgb(255 255 255 / 0.06)",
    to: "rgb(0 0 0 / 0.5)",
  },
  bevel: 4,
  shadow: 8,
  shadowOpacity: 0.42,
} as const;

const SANS = [
  // Mona Sans, instanced and subset for the site; renamed because "Mona" is an OFL Reserved Font Name.
  "\"Statsify Sans\"",
  "\"Noto Sans\"",
  "\"Noto Sans Thai\"",
  "system-ui",
  "\"Hiragino Sans\"",
  "\"PingFang SC\"",
  "\"PingFang TC\"",
  "\"Microsoft YaHei\"",
  "\"Apple SD Gothic Neo\"",
  "\"Malgun Gothic\"",
  "sans-serif",
];

/** Type: Minecraft for all text; the sans stack only draws what the pixel font and its Unifont slices lack. */
export const type = {
  families: {
    // A glyph neither the pixel font nor its Unifont slices have comes from the sans stack.
    minecraft: ["\"Minecraft\"", ...SANS].join(", "),
    sans: SANS.join(", "),
  },
  /** The shared size scale in px; 112 is the hero wordmark only. */
  scale: [16, 20, 24, 32, 48, 64, 112],
} as const;
