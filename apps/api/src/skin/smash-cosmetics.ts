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
    skinColor: 0x1a_2a_34,
    head: "item/brown_carpet",
    held: "item/white_tulip",
    chestplate: leather(0x1a_2a_34),
    leggings: leather(0x1a_2a_34),
    boots: leather(0x1a_2a_34),
    master: {
      head: "block/dispenser",
      chestplate: leather(0xc8_16_16),
      leggings: leather(0xff_ff_00),
    },
  },
  CAKE_MONSTER: {
    skinColor: 0xac_54_00,
    head: "item/blue_carpet",
    held: "item/diamond_axe",
    chestplate: leather(0xac_54_00),
    leggings: leather(0xac_54_00),
    boots: leather(0xac_54_00),
    master: {
      head: "item/yellow_carpet",
      held: "item/salmon",
      chestplate: leather(0xff_ff_ff),
      boots: leather(0xff_ff_ff),
    },
  },
  DUSK_CRAWLER: {
    skinColor: 0xc7_db_ec,
    head: "block/gold_ore",
    held: "item/iron_axe",
    chestplate: leather(0xc7_db_ec),
    leggings: leather(0x04_04_2b),
    boots: leather(0xca_16_16),
    master: {
      head: "block/carpet_green",
      held: "item/cod",
      framesHeld: false,
      skinColor: 0xca_16_16,
      chestplate: leather(0xca_16_16),
      leggings: leather(0x22_22_22),
    },
  },
  FROSTY: {
    skinColor: 0x13_13_13,
    head: "item/black_carpet",
    held: "item/golden_axe",
    chestplate: { material: "chainmail" },
    leggings: leather(0xf1_f1_f1),
    boots: leather(0xf1_f1_f1),
    master: { head: "block/piston_normal", held: "item/baked_potato" },
  },
  GENERAL_CLUCK: {
    skinColor: 0xe0_e0_e0,
    head: "block/carpet_magenta",
    held: "item/wooden_axe",
    chestplate: leather(0xf9_8a_3f),
    leggings: leather(0x44_48_29),
    boots: leather(0xe0_e0_e0),
    master: {
      head: "block/carpet_light_blue",
      chestplate: leather(0xe0_e0_e0),
    },
  },
  GOKU: {
    skinColor: 0x23_23_2c,
    head: "block/quartz_ore",
    held: "item/stone_axe",
    chestplate: leather(0x00_3c_9e),
    leggings: leather(0xff_50_00),
    boots: leather(0xff_50_00),
    master: {
      head: "block/houstonia",
      leggings: leather(0x00_3c_9e),
      boots: leather(0x00_3c_9e),
    },
  },
  GREEN_HOOD: {
    skinColor: 0x5e_a3_43,
    head: "block/coal_ore",
    held: "item/bow",
    chestplate: leather(0x5e_88_43),
    leggings: leather(0x39_63_29),
    boots: leather(0x5e_a3_43),
    master: {
      head: "item/coal_block",
      skinColor: 0x88_2e_2e,
      chestplate: leather(0x88_2e_2e),
      leggings: leather(0x63_1f_1f),
      boots: leather(0xa3_3a_3a),
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
    chestplate: leather(0xbe_8d_59),
    leggings: leather(0xbe_8d_59),
    boots: leather(0xbe_8d_59),
    master: { head: "block/dropper", held: "item/cooked_cod" },
  },
  SANIC: {
    skinColor: 0x13_13_13,
    head: "item/pink_carpet",
    held: "item/stone_pickaxe",
    chestplate: leather(0x1c_2c_a6),
    leggings: leather(0x19_50_a4),
    boots: leather(0xda_30_30),
    master: {
      head: "item/silver_carpet",
      chestplate: leather(0x5a_16_1c),
      leggings: leather(0x5a_16_1c),
    },
  },
  SERGEANT_SHIELD: {
    skinColor: 0x13_13_13,
    head: "item/activator_rail",
    held: "item/clay_ball",
    chestplate: leather(0xd2_d2_d2),
    leggings: leather(0x91_24_31),
    boots: leather(0x91_24_31),
    master: {
      head: "item/detector_rail",
      held: "item/clownfish",
      chestplate: leather(0x8b_5a_2b),
      leggings: leather(0x5c_3a_1e),
      boots: leather(0x5c_3a_1e),
    },
  },
  SHOOP_DA_WHOOP: {
    skinColor: 0x00_9e_10,
    head: "block/carpet_orange",
    held: "item/beef",
    chestplate: leather(0x00_9e_10),
    leggings: leather(0x20_1c_1d),
    boots: leather(0x00_9e_10),
    master: { head: "block/gray_wool", chestplate: leather(0x3c_14_5a) },
  },
  SKULLFIRE: {
    skinColor: 0x1a_2a_34,
    head: "block/carpet_cyan",
    held: "item/diamond_pickaxe",
    chestplate: leather(0x1e_1e_1e),
    leggings: leather(0x1e_1e_1e),
    boots: leather(0x1e_1e_1e),
    master: { head: "block/anvil_very_damaged" },
  },
  SPODERMAN: {
    skinColor: 0x96_1b_1b,
    head: "block/emerald_ore",
    held: "item/golden_shovel",
    chestplate: leather(0x96_1b_1b),
    leggings: leather(0x1b_2b_96),
    boots: leather(0x96_1b_1b),
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
      skinColor: 0x7f_95_84,
      chestplate: leather(0x7f_95_84),
      boots: leather(0x7f_95_84),
    },
  },
  TINMAN: {
    skinColor: 0xc3_80_29,
    head: "block/iron_ore",
    held: "item/golden_hoe",
    chestplate: leather(0xc3_80_29),
    leggings: leather(0xa9_c7_a3),
    boots: leather(0xc3_80_29),
    master: {
      head: "block/magenta_wool",
      held: "item/iron_hoe",
      skinColor: 0xff_44_36,
      chestplate: leather(0xff_44_36),
      leggings: leather(0xff_d4_3c),
      boots: leather(0xff_44_36),
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
