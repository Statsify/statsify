/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { ArmorPieceDto } from "#dtos";
import { lookup } from "./kart-cosmetics.js";

export interface SmashHero {
  skinColor: number;
  head: string;
  held: string;
  /** False for a held model that reaches far past the body */
  framesHeld?: boolean;
  chestplate: ArmorPieceDto;
  leggings: ArmorPieceDto;
  boots: ArmorPieceDto;
  master: Pick<SmashHero, "head"> & Partial<Omit<SmashHero, "head" | "master">>;
}

const leather = (color: number) => ({ material: "leather", color }) as const;

// Each stored active_class as its lobby stand wears it, with what its Master Skin swaps in
export const SMASH_HEROES = {
  BOTMUN: {
    skinColor: 0x1A_2A_34,
    head: "item/brown_carpet",
    held: "item/white_tulip",
    chestplate: leather(0x1A_2A_34),
    leggings: leather(0x1A_2A_34),
    boots: leather(0x1A_2A_34),
    master: { head: "block/dispenser", chestplate: leather(0xC8_16_16), leggings: leather(0xFF_FF_00) },
  },
  CAKE_MONSTER: {
    skinColor: 0xAC_54_00,
    head: "item/blue_carpet",
    held: "item/diamond_axe",
    chestplate: leather(0xAC_54_00),
    leggings: leather(0xAC_54_00),
    boots: leather(0xAC_54_00),
    master: {
      head: "item/yellow_carpet",
      held: "item/salmon",
      chestplate: leather(0xFF_FF_FF),
      boots: leather(0xFF_FF_FF),
    },
  },
  DUSK_CRAWLER: {
    skinColor: 0xC7_DB_EC,
    head: "block/gold_ore",
    held: "item/iron_axe",
    chestplate: leather(0xC7_DB_EC),
    leggings: leather(0x04_04_2B),
    boots: leather(0xCA_16_16),
    master: {
      head: "block/carpet_green",
      held: "item/cod",
      framesHeld: false,
      skinColor: 0xCA_16_16,
      chestplate: leather(0xCA_16_16),
      leggings: leather(0x22_22_22),
    },
  },
  FROSTY: {
    skinColor: 0x13_13_13,
    head: "item/black_carpet",
    held: "item/golden_axe",
    chestplate: { material: "chainmail" },
    leggings: leather(0xF1_F1_F1),
    boots: leather(0xF1_F1_F1),
    master: { head: "block/piston_normal", held: "item/baked_potato" },
  },
  GENERAL_CLUCK: {
    skinColor: 0xE0_E0_E0,
    head: "block/carpet_magenta",
    held: "item/wooden_axe",
    chestplate: leather(0xF9_8A_3F),
    leggings: leather(0x44_48_29),
    boots: leather(0xE0_E0_E0),
    master: { head: "block/carpet_light_blue", chestplate: leather(0xE0_E0_E0) },
  },
  GOKU: {
    skinColor: 0x23_23_2C,
    head: "block/quartz_ore",
    held: "item/stone_axe",
    chestplate: leather(0x00_3C_9E),
    leggings: leather(0xFF_50_00),
    boots: leather(0xFF_50_00),
    master: { head: "block/houstonia", leggings: leather(0x00_3C_9E), boots: leather(0x00_3C_9E) },
  },
  GREEN_HOOD: {
    skinColor: 0x5E_A3_43,
    head: "block/coal_ore",
    held: "item/bow",
    chestplate: leather(0x5E_88_43),
    leggings: leather(0x39_63_29),
    boots: leather(0x5E_A3_43),
    master: {
      head: "item/coal_block",
      skinColor: 0x88_2E_2E,
      chestplate: leather(0x88_2E_2E),
      leggings: leather(0x63_1F_1F),
      boots: leather(0xA3_3A_3A),
    },
  },
  MARAUDER: {
    skinColor: 0x13_13_13,
    head: "item/birch_sapling",
    held: "item/spruce_sapling",
    framesHeld: false,
    chestplate: leather(0x22_22_22),
    leggings: leather(0x22_22_22),
    boots: leather(0x22_22_22),
    master: { head: "block/anvil_undamaged", held: "item/melon", framesHeld: true },
  },
  PUG: {
    skinColor: 0x3A_2B_24,
    head: "block/redstone_ore",
    held: "item/golden_pickaxe",
    chestplate: leather(0xBE_8D_59),
    leggings: leather(0xBE_8D_59),
    boots: leather(0xBE_8D_59),
    master: { head: "block/dropper", held: "item/cooked_cod" },
  },
  SANIC: {
    skinColor: 0x13_13_13,
    head: "item/pink_carpet",
    held: "item/stone_pickaxe",
    chestplate: leather(0x1C_2C_A6),
    leggings: leather(0x19_50_A4),
    boots: leather(0xDA_30_30),
    master: { head: "item/silver_carpet", chestplate: leather(0x5A_16_1C), leggings: leather(0x5A_16_1C) },
  },
  SERGEANT_SHIELD: {
    skinColor: 0x13_13_13,
    head: "item/activator_rail",
    held: "item/clay_ball",
    chestplate: leather(0xD2_D2_D2),
    leggings: leather(0x91_24_31),
    boots: leather(0x91_24_31),
    master: {
      head: "item/detector_rail",
      held: "item/clownfish",
      chestplate: leather(0x8B_5A_2B),
      leggings: leather(0x5C_3A_1E),
      boots: leather(0x5C_3A_1E),
    },
  },
  SHOOP_DA_WHOOP: {
    skinColor: 0x00_9E_10,
    head: "block/carpet_orange",
    held: "item/beef",
    chestplate: leather(0x00_9E_10),
    leggings: leather(0x20_1C_1D),
    boots: leather(0x00_9E_10),
    master: { head: "block/gray_wool", chestplate: leather(0x3C_14_5A) },
  },
  SKULLFIRE: {
    skinColor: 0x1A_2A_34,
    head: "block/carpet_cyan",
    held: "item/diamond_pickaxe",
    chestplate: leather(0x1E_1E_1E),
    leggings: leather(0x1E_1E_1E),
    boots: leather(0x1E_1E_1E),
    master: { head: "block/anvil_very_damaged" },
  },
  SPODERMAN: {
    skinColor: 0x96_1B_1B,
    head: "block/emerald_ore",
    held: "item/golden_shovel",
    chestplate: leather(0x96_1B_1B),
    leggings: leather(0x1B_2B_96),
    boots: leather(0x96_1B_1B),
    master: {
      head: "block/sticky_piston",
      held: "item/wooden_hoe",
      skinColor: 0x22_22_22,
      chestplate: leather(0x22_22_22),
      leggings: leather(0x22_22_22),
      boots: leather(0x22_22_22),
    },
  },
  THE_BULK: {
    skinColor: 0x35_77_49,
    head: "block/diamond_ore",
    held: "item/stone_shovel",
    chestplate: leather(0x35_77_49),
    leggings: leather(0x31_16_51),
    boots: leather(0x35_77_49),
    master: {
      head: "block/cyan_wool",
      held: "item/cooked_salmon",
      skinColor: 0x7F_95_84,
      chestplate: leather(0x7F_95_84),
      boots: leather(0x7F_95_84),
    },
  },
  TINMAN: {
    skinColor: 0xC3_80_29,
    head: "block/iron_ore",
    held: "item/golden_hoe",
    chestplate: leather(0xC3_80_29),
    leggings: leather(0xA9_C7_A3),
    boots: leather(0xC3_80_29),
    master: {
      head: "block/magenta_wool",
      held: "item/iron_hoe",
      skinColor: 0xFF_44_36,
      chestplate: leather(0xFF_44_36),
      leggings: leather(0xFF_D4_3C),
      boots: leather(0xFF_44_36),
    },
  },
} as const satisfies Record<string, SmashHero>;

export function getSmashHero(hero: string, master: boolean): Omit<SmashHero, "master"> {
  const { master: masterSkin, ...base }: SmashHero = lookup(SMASH_HEROES, hero, `Unknown hero ${hero}`);
  return master ? { ...base, ...masterSkin } : base;
}
