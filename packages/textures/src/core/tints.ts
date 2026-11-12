/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { ItemStack, PotionEffect } from "./item-stack.js";

/** An ARGB integer, or RGB floats from 0 to 1 */
export type TintColor = number | [number, number, number];

export type TintSource =
  | { type: "minecraft:constant"; value: TintColor }
  | { type: "minecraft:dye"; default: TintColor }
  | { type: "minecraft:potion"; default: TintColor }
  | { type: "minecraft:firework"; default: TintColor }
  | { type: "minecraft:map_color"; default: TintColor }
  | { type: "minecraft:team"; default: TintColor }
  | { type: "minecraft:custom_model_data"; index?: number; default: TintColor }
  | { type: "minecraft:grass"; temperature: number; downfall: number };

// 26.3's effect colors for the effects 1.8 items can carry, from
// https://minecraft.wiki/w/Effect_colors
const EFFECT_COLORS: Record<string, number | undefined> = {
  "minecraft:speed": 0x33_eb_ff,
  "minecraft:slowness": 0x8b_af_e0,
  "minecraft:haste": 0xd9_c0_43,
  "minecraft:mining_fatigue": 0x4a_42_17,
  "minecraft:strength": 0xff_c7_00,
  "minecraft:instant_health": 0xf8_24_23,
  "minecraft:instant_damage": 0xa9_65_6a,
  "minecraft:jump_boost": 0xfd_ff_84,
  "minecraft:nausea": 0x55_1d_4a,
  "minecraft:regeneration": 0xcd_5c_ab,
  "minecraft:resistance": 0x91_46_f0,
  "minecraft:fire_resistance": 0xff_99_00,
  "minecraft:water_breathing": 0x98_da_c0,
  "minecraft:invisibility": 0xf6_f6_f6,
  "minecraft:blindness": 0x1f_1f_23,
  "minecraft:night_vision": 0xc2_ff_66,
  "minecraft:hunger": 0x58_76_53,
  "minecraft:weakness": 0x48_4d_48,
  "minecraft:poison": 0x87_a3_63,
  "minecraft:wither": 0x73_61_56,
  "minecraft:health_boost": 0xf8_7d_23,
  "minecraft:absorption": 0x25_52_a5,
  "minecraft:saturation": 0xf8_24_23,
};

/** In the order of 1.8 wool's Damage values */
export const DYES = [
  "white",
  "orange",
  "magenta",
  "light_blue",
  "yellow",
  "lime",
  "pink",
  "gray",
  "light_gray",
  "cyan",
  "purple",
  "blue",
  "brown",
  "green",
  "red",
  "black",
] as const;

export type DyeColor = (typeof DYES)[number];

const DYE_COLORS: Record<string, number | undefined> = {
  white: 0xf9_ff_fe,
  orange: 0xf9_80_1d,
  magenta: 0xc7_4e_bd,
  light_blue: 0x3a_b3_da,
  yellow: 0xfe_d8_3d,
  lime: 0x80_c7_1f,
  pink: 0xf3_8b_aa,
  gray: 0x47_4f_52,
  light_gray: 0x9d_9d_97,
  cyan: 0x16_9c_9c,
  purple: 0x89_32_b8,
  blue: 0x3c_44_aa,
  brown: 0x83_54_32,
  green: 0x5e_7c_16,
  red: 0xb0_2e_26,
  black: 0x1d_1d_21,
};

export function dyeColor(dye: string) {
  const color = DYE_COLORS[dye];
  if (color === undefined) throw new Error(`No colour for the dye ${dye}`);
  return color;
}

const rgb = (color: TintColor) =>
  typeof color === "number"
    ? color & 0xff_ff_ff
    : (Math.round(color[0] * 255) << 16) |
      (Math.round(color[1] * 255) << 8) |
      Math.round(color[2] * 255);

/** Effects mix weighted by level, as potion colors do in game */
function potionColor(effects: PotionEffect[]) {
  let red = 0;
  let green = 0;
  let blue = 0;
  let total = 0;

  for (const effect of effects) {
    const color = EFFECT_COLORS[effect.id];
    if (color === undefined) throw new Error(`No color for ${effect.id}`);

    const weight = (effect.amplifier ?? 0) + 1;
    red += ((color >> 16) & 0xff) * weight;
    green += ((color >> 8) & 0xff) * weight;
    blue += (color & 0xff) * weight;
    total += weight;
  }

  return (
    (Math.round(red / total) << 16) | (Math.round(green / total) << 8) | Math.round(blue / total)
  );
}

/** A grass color from the pack's colormap/grass.png */
function grassColor(colormap: ImageData, temperature: number, downfall: number) {
  const x = Math.floor((1 - temperature) * 255);
  const y = Math.floor((1 - downfall * temperature) * 255);
  const pixel = (y * colormap.width + x) * 4;
  const [red, green, blue] = colormap.data.subarray(pixel, pixel + 3);

  return (red << 16) | (green << 8) | blue;
}

/** The color a tint source gives this item, as 0xRRGGBB */
export function tintColor(tint: TintSource, item: ItemStack, grass?: ImageData): number {
  switch (tint.type) {
    case "minecraft:constant":
      return rgb(tint.value);

    case "minecraft:dye":
      return item.color ?? rgb(tint.default);

    case "minecraft:potion":
      return item.effects?.length ? potionColor(item.effects) : rgb(tint.default);

    case "minecraft:firework":
    case "minecraft:map_color":
    case "minecraft:team":
    case "minecraft:custom_model_data":
      return rgb(tint.default);

    case "minecraft:grass":
      if (!grass) throw new Error("Grass tints need the pack's grass colormap");
      return grassColor(grass, tint.temperature, tint.downfall);
  }
}
