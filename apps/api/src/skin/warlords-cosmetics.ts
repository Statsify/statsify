/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { ArmorPieceDto } from "#dtos";
import { SUIT_DYES, lookup } from "./kart-cosmetics.js";

export const WARLORDS_HELMETS = {
  mage: {
    0: { blue: "item/lime_carpet", red: "item/light_blue_carpet" },
    1: { blue: "item/orange_carpet", red: "item/magenta_carpet" },
    2: { blue: "item/purple_carpet", red: "item/pink_carpet" },
    3: { blue: "item/dark_oak_sapling", red: "item/orange_tulip" },
  },
  warrior: {
    0: { blue: "item/blue_carpet", red: "item/black_carpet" },
    1: { blue: "item/cyan_carpet", red: "item/brown_carpet" },
    2: { blue: "item/green_carpet", red: "item/gray_carpet" },
    3: { blue: "item/wooden_pressure_plate", red: "item/stone_pressure_plate" },
  },
  paladin: {
    0: { blue: "item/silver_carpet", red: "item/red_carpet" },
    1: { blue: "item/yellow_carpet", red: "item/white_carpet" },
    2: { blue: "item/acacia_stairs", red: "item/acacia_slab" },
    3: { blue: "item/white_tulip", red: "item/dead_bush" },
  },
  shaman: {
    0: { blue: "item/allium", red: "item/acacia_sapling" },
    1: { blue: "item/cactus", red: "item/birch_sapling" },
    2: { blue: "item/dandelion", red: "item/oxeye_daisy" },
    3: { blue: "item/spruce_sapling", red: "item/oak_sapling" },
  },
} as const;

export const WARLORDS_WEAPONS = {
  WOOD_AXE: "item/wooden_axe",
  STONE_AXE: "item/stone_axe",
  IRON_AXE: "item/iron_axe",
  GOLD_AXE: "item/golden_axe",
  DIAMOND_AXE: "item/diamond_axe",
  WOOD_HOE: "item/wooden_hoe",
  STONE_HOE: "item/stone_hoe",
  IRON_HOE: "item/iron_hoe",
  GOLD_HOE: "item/golden_hoe",
  DIAMOND_HOE: "item/diamond_hoe",
  WOOD_PICKAXE: "item/wooden_pickaxe",
  STONE_PICKAXE: "item/stone_pickaxe",
  IRON_PICKAXE: "item/iron_pickaxe",
  GOLD_PICKAXE: "item/golden_pickaxe",
  DIAMOND_PICKAXE: "item/diamond_pickaxe",
  WOOD_SPADE: "item/wooden_shovel",
  STONE_SPADE: "item/stone_shovel",
  IRON_SPADE: "item/iron_shovel",
  GOLD_SPADE: "item/golden_shovel",
  DIAMOND_SPADE: "item/diamond_shovel",
  APPLE: "item/apple",
  BAKED_POTATO: "item/baked_potato",
  RAW_BEEF: "item/beef",
  BREAD: "item/bread",
  RAW_CHICKEN: "item/chicken",
  CLOWNFISH: "item/clownfish",
  COD: "item/cod",
  COOKED_BEEF: "item/cooked_beef",
  COOKED_CHICKEN: "item/cooked_chicken",
  COOKED_COD: "item/cooked_cod",
  COOKED_MUTTON: "item/cooked_mutton",
  COOKED_PORKCHOP: "item/cooked_porkchop",
  COOKED_RABBIT: "item/cooked_rabbit",
  COOKED_SALMON: "item/cooked_salmon",
  GOLDEN_CARROT: "item/golden_carrot",
  MELON: "item/melon",
  MUSHROOM_SOUP: "item/mushroom_stew",
  MUTTON: "item/mutton",
  POISONOUS_POTATO: "item/poisonous_potato",
  PORK: "item/porkchop",
  POTATO: "item/potato",
  PUFFERFISH: "item/pufferfish",
  PUMPKIN_PIE: "item/pumpkin_pie",
  RABBIT_STEW: "item/rabbit_stew",
  ROTTEN_FLESH: "item/rotten_flesh",
  SALMON: "item/salmon",
  STRING: "item/string",
} as const;

// The pack repaints these vanilla materials as each team's upper armor tiers
export const WARLORDS_ARMOR = {
  0: {
    blue: { material: "leather", color: SUIT_DYES.BLUE },
    red: { material: "leather", color: SUIT_DYES.RED },
  },
  1: { blue: { material: "iron" }, red: { material: "chainmail" } },
  2: { blue: { material: "gold" }, red: { material: "diamond" } },
} as const satisfies Record<number, Record<"blue" | "red", ArmorPieceDto>>;

export const getWarlordsWeaponModel = (weapon: string) =>
  lookup(WARLORDS_WEAPONS, weapon, `Unknown weapon ${weapon}`);

export function getWarlordsHelmetModel(
  playerClass: string,
  selection: number,
  team: string,
) {
  const helmets = lookup(
    WARLORDS_HELMETS,
    playerClass,
    `Unknown class ${playerClass}`,
  );
  const helmet = lookup(
    helmets,
    `${selection}`,
    `Unknown ${playerClass} helmet ${selection}`,
  );
  return lookup(helmet, team, `Unknown team ${team}`);
}

export function getWarlordsArmor(
  selection: number,
  team: string,
): ArmorPieceDto {
  const armor = lookup(
    WARLORDS_ARMOR,
    `${selection}`,
    `Unknown armor ${selection}`,
  );
  return lookup(armor, team, `Unknown team ${team}`);
}
