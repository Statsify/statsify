/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

/**
 * Design tokens for the site. The `§` colors and the card panel's color and shadow are the bot's own, read from the
 * import-free entries of `@statsify/util` and `@statsify/rendering`.
 * `scripts/tokens-css.ts` turns these into `dist/tokens.css` for Tailwind's `@theme`.
 */

import { DEFAULT_COLOR, SHADOW_OPACITY } from "@statsify/rendering/colors";
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

/** The card panel, as `@statsify/rendering`'s `Box` draws it. Lengths are in px. */
export const panel = {
  background: DEFAULT_COLOR,
  overlay: {
    from: "rgba(255, 255, 255, 0.3)",
    to: "rgba(0, 0, 0, 0.3)",
  },
  bevel: 4,
  shadow: 4,
  shadowOpacity: SHADOW_OPACITY,
  outline: 4,
} as const;

/** Type: Minecraft for the wordmark, headings and stat values; Mona Sans for everything else. */
export const type = {
  families: {
    // Monospace until the TTF arrives: closer to the pixel font's width than the browser's serif.
    minecraft: "\"Minecraft\", ui-monospace, monospace",
    sans: [
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
    ].join(", "),
  },
  /** The shared size scale in px; 112 is the hero wordmark only. */
  scale: [16, 20, 24, 32, 48, 64, 112],
  /** Sizes on the Minecraft pixel grid. */
  minecraftSizes: [16, 24, 32, 48, 64, 112],
  /** Mona Sans weights: 500 on glass, 600 for emphasis, nothing lighter. */
  weights: { regular: 500, emphasis: 600 },
  /** Mona Sans widths in %: 100 on desktop, 90 for phone labels that would wrap. */
  widths: { normal: 100, narrow: 90 },
} as const;
