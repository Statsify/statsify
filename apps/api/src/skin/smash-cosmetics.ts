/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { ArmorPieceDto } from "#dtos";
import type { SmashHeroesClass } from "@statsify/schemas";
import { lookup } from "./kart-cosmetics.js";

export interface SmashHero {
  skinColor: number;
  head: string;
  held: string;
  // The camera frames the held model unless it reaches far past the body
  framesHeld?: boolean;
  chestplate: ArmorPieceDto;
  leggings: ArmorPieceDto;
  boots: ArmorPieceDto;
  master: Pick<SmashHero, "head"> & Partial<Omit<SmashHero, "head" | "master">>;
}

const dyeLeather = (color: number) => ({ material: "leather", color }) as const;

// Each active_class as its lobby stand wears it, plus its Master Skin's swaps
export const SMASH_HEROES = {
  BOTMUN: {
    skinColor: 0x1a_2a_34,
    head: "item/brown_carpet",
    held: "item/white_tulip",
    chestplate: dyeLeather(0x1a_2a_34),
    leggings: dyeLeather(0x1a_2a_34),
    boots: dyeLeather(0x1a_2a_34),
    master: {
      head: "block/dispenser",
      chestplate: dyeLeather(0xc8_16_16),
      leggings: dyeLeather(0xff_ff_00),
    },
  },
  CAKE_MONSTER: {
    skinColor: 0xac_54_00,
    head: "item/blue_carpet",
    held: "item/diamond_axe",
    chestplate: dyeLeather(0xac_54_00),
    leggings: dyeLeather(0xac_54_00),
    boots: dyeLeather(0xac_54_00),
    master: {
      head: "item/yellow_carpet",
      held: "item/salmon",
      chestplate: dyeLeather(0xff_ff_ff),
      boots: dyeLeather(0xff_ff_ff),
    },
  },
  DUSK_CRAWLER: {
    skinColor: 0xc7_db_ec,
    head: "block/gold_ore",
    held: "item/iron_axe",
    chestplate: dyeLeather(0xc7_db_ec),
    leggings: dyeLeather(0x04_04_2b),
    boots: dyeLeather(0xca_16_16),
    master: {
      head: "block/carpet_green",
      held: "item/cod",
      framesHeld: false,
      skinColor: 0xca_16_16,
      chestplate: dyeLeather(0xca_16_16),
      leggings: dyeLeather(0x22_22_22),
    },
  },
  FROSTY: {
    skinColor: 0x13_13_13,
    head: "item/black_carpet",
    held: "item/golden_axe",
    chestplate: { material: "chainmail" },
    leggings: dyeLeather(0xf1_f1_f1),
    boots: dyeLeather(0xf1_f1_f1),
    master: { head: "block/piston_normal", held: "item/baked_potato" },
  },
  GENERAL_CLUCK: {
    skinColor: 0xe0_e0_e0,
    head: "block/carpet_magenta",
    held: "item/wooden_axe",
    chestplate: dyeLeather(0xf9_8a_3f),
    leggings: dyeLeather(0x44_48_29),
    boots: dyeLeather(0xe0_e0_e0),
    master: {
      head: "block/carpet_light_blue",
      chestplate: dyeLeather(0xe0_e0_e0),
    },
  },
  GOKU: {
    skinColor: 0x23_23_2c,
    head: "block/quartz_ore",
    held: "item/stone_axe",
    chestplate: dyeLeather(0x00_3c_9e),
    leggings: dyeLeather(0xff_50_00),
    boots: dyeLeather(0xff_50_00),
    master: {
      head: "block/houstonia",
      leggings: dyeLeather(0x00_3c_9e),
      boots: dyeLeather(0x00_3c_9e),
    },
  },
  GREEN_HOOD: {
    skinColor: 0x5e_a3_43,
    head: "block/coal_ore",
    held: "item/bow",
    chestplate: dyeLeather(0x5e_88_43),
    leggings: dyeLeather(0x39_63_29),
    boots: dyeLeather(0x5e_a3_43),
    master: {
      head: "item/coal_block",
      skinColor: 0x88_2e_2e,
      chestplate: dyeLeather(0x88_2e_2e),
      leggings: dyeLeather(0x63_1f_1f),
      boots: dyeLeather(0xa3_3a_3a),
    },
  },
  MARAUDER: {
    skinColor: 0x13_13_13,
    head: "item/birch_sapling",
    held: "item/spruce_sapling",
    framesHeld: false,
    chestplate: dyeLeather(0x22_22_22),
    leggings: dyeLeather(0x22_22_22),
    boots: dyeLeather(0x22_22_22),
    master: {
      head: "block/anvil_undamaged",
      held: "item/melon",
      framesHeld: true,
    },
  },
  PUG: {
    skinColor: 0x3a_2b_24,
    head: "block/redstone_ore",
    held: "item/golden_pickaxe",
    chestplate: dyeLeather(0xbe_8d_59),
    leggings: dyeLeather(0xbe_8d_59),
    boots: dyeLeather(0xbe_8d_59),
    master: { head: "block/dropper", held: "item/cooked_cod" },
  },
  SANIC: {
    skinColor: 0x13_13_13,
    head: "item/pink_carpet",
    held: "item/stone_pickaxe",
    chestplate: dyeLeather(0x1c_2c_a6),
    leggings: dyeLeather(0x19_50_a4),
    boots: dyeLeather(0xda_30_30),
    master: {
      head: "item/silver_carpet",
      chestplate: dyeLeather(0x5a_16_1c),
      leggings: dyeLeather(0x5a_16_1c),
    },
  },
  SERGEANT_SHIELD: {
    skinColor: 0x13_13_13,
    head: "item/activator_rail",
    held: "item/clay_ball",
    chestplate: dyeLeather(0xd2_d2_d2),
    leggings: dyeLeather(0x91_24_31),
    boots: dyeLeather(0x91_24_31),
    master: {
      head: "item/detector_rail",
      held: "item/clownfish",
      chestplate: dyeLeather(0x8b_5a_2b),
      leggings: dyeLeather(0x5c_3a_1e),
      boots: dyeLeather(0x5c_3a_1e),
    },
  },
  SHOOP_DA_WHOOP: {
    skinColor: 0x00_9e_10,
    head: "block/carpet_orange",
    held: "item/beef",
    chestplate: dyeLeather(0x00_9e_10),
    leggings: dyeLeather(0x20_1c_1d),
    boots: dyeLeather(0x00_9e_10),
    master: { head: "block/gray_wool", chestplate: dyeLeather(0x3c_14_5a) },
  },
  SKULLFIRE: {
    skinColor: 0x1a_2a_34,
    head: "block/carpet_cyan",
    held: "item/diamond_pickaxe",
    chestplate: dyeLeather(0x1e_1e_1e),
    leggings: dyeLeather(0x1e_1e_1e),
    boots: dyeLeather(0x1e_1e_1e),
    master: { head: "block/anvil_very_damaged" },
  },
  SPODERMAN: {
    skinColor: 0x96_1b_1b,
    head: "block/emerald_ore",
    held: "item/golden_shovel",
    chestplate: dyeLeather(0x96_1b_1b),
    leggings: dyeLeather(0x1b_2b_96),
    boots: dyeLeather(0x96_1b_1b),
    master: {
      head: "block/sticky_piston",
      held: "item/wooden_hoe",
      skinColor: 0x22_22_22,
      chestplate: dyeLeather(0x22_22_22),
      leggings: dyeLeather(0x22_22_22),
      boots: dyeLeather(0x22_22_22),
    },
  },
  THE_BULK: {
    skinColor: 0x35_77_49,
    head: "block/diamond_ore",
    held: "item/stone_shovel",
    chestplate: dyeLeather(0x35_77_49),
    leggings: dyeLeather(0x31_16_51),
    boots: dyeLeather(0x35_77_49),
    master: {
      head: "block/cyan_wool",
      held: "item/cooked_salmon",
      skinColor: 0x7f_95_84,
      chestplate: dyeLeather(0x7f_95_84),
      boots: dyeLeather(0x7f_95_84),
    },
  },
  TINMAN: {
    skinColor: 0xc3_80_29,
    head: "block/iron_ore",
    held: "item/golden_hoe",
    chestplate: dyeLeather(0xc3_80_29),
    leggings: dyeLeather(0xa9_c7_a3),
    boots: dyeLeather(0xc3_80_29),
    master: {
      head: "block/magenta_wool",
      held: "item/iron_hoe",
      skinColor: 0xff_44_36,
      chestplate: dyeLeather(0xff_44_36),
      leggings: dyeLeather(0xff_d4_3c),
      boots: dyeLeather(0xff_44_36),
    },
  },
} as const satisfies Record<keyof typeof SmashHeroesClass, SmashHero>;

export function getSmashHero(
  hero: string,
  master: boolean,
): Omit<SmashHero, "master"> {
  const { master: masterSkin, ...base }: SmashHero = lookup(
    SMASH_HEROES,
    hero,
    `Unknown hero ${hero}`,
  );
  return master ? { ...base, ...masterSkin } : base;
}
