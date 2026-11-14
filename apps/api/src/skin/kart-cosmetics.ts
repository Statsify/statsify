/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BadRequestException } from "@nestjs/common";
import type { ArmorPieceDto } from "#dtos";

// The pack model each stored skin_active is worn as
export const KARTS = {
  "BLUE_KART;DEFAULT": "block/enchanting_table_base",
  "BLUE_KART;ALT_1": "block/dropper",
  "BLUE_KART;ALT_2": "block/mycelium",
  "BLUE_KART;JOYFUL_BEAMER": "item/detector_rail",
  "BLUE_KART;DENKO_DASHER": "item/web",
  "BLUE_KART;THE_STACHE": "block/sponge",
  "BLUE_KART;SPIRIT_RIDER": "block/piston_inventory_normal",
  "BLUE_KART;FLURRY_FLIER": "block/piston_inventory_sticky",
  "BLUE_KART;SCARLET_DRIFTER": "block/birch_fence_inventory",
  "GREEN_KART;DEFAULT": "item/jukebox",
  "GREEN_KART;ALT_1": "block/podzol",
  "GREEN_KART;ALT_2": "block/anvil_undamaged",
  "GREEN_KART;GOLDEN_ACE": "block/brown_wool",
  "GREEN_KART;STREET_SPRINTER": "item/cyan_wool",
  "GREEN_KART;CITRUS_SUNSET": "block/iron_ore",
  "GREEN_KART;TRIBAL_HUNTER": "block/diamond_ore",
  "GREEN_KART;BEACH_BUBBLE": "item/green_wool",
  "GREEN_KART;AERODYNAMIC_AZALEA": "block/coal_ore",
  "RED_KART;DEFAULT": "block/furnace",
  "RED_KART;ALT_1": "block/crafting_table",
  "RED_KART;ALT_2": "block/anvil_slightly_damaged",
  "RED_KART;VORTEX_DRIVER": "block/emerald_ore",
  "RED_KART;CORROSIVE_STALLION": "block/redstone_ore",
  "RED_KART;IMPACT_MANIAC": "block/acacia_fence_inventory",
  "RED_KART;NIGHT_FIRE": "block/dark_oak_fence_inventory",
  "RED_KART;HOT_ROD": "block/gold_ore",
  "WHITE_KART;DEFAULT": "block/dispenser",
  "WHITE_KART;ALT_1": "item/rail",
  "WHITE_KART;ALT_2": "block/anvil_very_damaged",
  "WHITE_KART;BLUE_EAGLE": "block/nether_brick_fence_inventory",
  "WHITE_KART;OCEAN_BREEZER": "block/quartz_ore",
  "WHITE_KART;THUNDER_MACKING": "item/silver_wool",
  "WHITE_KART;ENDER_RUNNER": "item/stone_slab",
  "WHITE_KART;PUMPKIN_MCSCREAM": "block/lapis_ore",
  "YELLOW_KART;DEFAULT": "block/end_portal_frame_empty",
  "YELLOW_KART;ALT_1": "item/activator_rail",
  "YELLOW_KART;ALT_2": "item/golden_rail",
  "YELLOW_KART;CYBER_CIRCUIT": "block/snow_height2",
  "YELLOW_KART;SPEED_CHAMPION": "block/stone_pressure_plate_inventory",
  "YELLOW_KART;CREEPER_ATTACK": "item/stone_stairs",
  "YELLOW_KART;WHITE_PANTHER": "block/dragon_egg",
  "YELLOW_KART;DRAGON_TAMER": "block/wooden_pressure_plate_inventory",
} as const;

// The pack model each stored helmet_active is worn as
export const HELMETS = {
  HELMET_1_1: "item/black_carpet",
  HELMET_1_2: "item/brown_carpet",
  HELMET_1_3: "item/blue_carpet",
  HELMET_1_4: "item/sandstone_slab",
  HELMET_1_5: "item/spruce_stairs",
  HELMET_1_6: "item/quartz_slab",
  HELMET_1_7: "item/oak_slab",
  HELMET_1_8: "item/jungle_slab",
  HELMET_2_1: "item/cyan_carpet",
  HELMET_2_2: "item/gray_carpet",
  HELMET_2_3: "item/green_carpet",
  HELMET_2_4: "item/stone_brick_slab",
  HELMET_2_5: "item/spruce_slab",
  HELMET_2_6: "item/brick_slab",
  HELMET_2_7: "item/nether_brick_stairs",
  HELMET_2_8: "item/sandstone_stairs",
  HELMET_3_1: "item/light_blue_carpet",
  HELMET_3_2: "item/lime_carpet",
  HELMET_3_3: "item/magenta_carpet",
  HELMET_3_4: "item/dark_oak_slab",
  HELMET_3_5: "item/nether_brick_slab",
  HELMET_4_1: "item/orange_carpet",
  HELMET_4_2: "item/pink_carpet",
  HELMET_4_3: "item/purple_carpet",
  HELMET_4_4: "item/stone_brick_stairs",
  HELMET_4_5: "item/red_sandstone_stairs",
  HELMET_4_6: "item/oak_stairs",
  HELMET_4_7: "item/acacia_fence_gate",
  HELMET_5_1: "item/red_carpet",
  HELMET_5_2: "item/silver_carpet",
  HELMET_5_3: "item/white_carpet",
  HELMET_5_4: "item/cobblestone_wall",
  HELMET_5_5: "item/acacia_stairs",
  HELMET_6_1: "item/yellow_carpet",
  HELMET_6_2: "item/acacia_sapling",
  HELMET_6_3: "item/birch_sapling",
  HELMET_6_4: "item/cobblestone_slab",
  HELMET_7_1: "item/hay_block",
  HELMET_7_2: "item/dark_oak_sapling",
  HELMET_7_3: "item/jungle_sapling",
  HELMET_7_4: "item/jungle_fence_gate",
  HELMET_7_5: "item/spruce_fence_gate",
  HELMET_7_6: "item/dark_oak_fence_gate",
  HELMET_7_7: "item/oak_fence_gate",
  HELMET_7_8: "item/birch_fence_gate",
  HELMET_8_1: "item/oak_sapling",
  HELMET_8_2: "item/spruce_sapling",
  HELMET_8_3: "item/orange_tulip",
  HELMET_8_4: "item/mossy_cobblestone_wall",
  HELMET_9_1: "item/pink_tulip",
  HELMET_9_2: "item/red_tulip",
  HELMET_9_3: "item/white_tulip",
  HELMET_9_4: "item/jungle_stairs",
  HELMET_9_5: "item/quartz_stairs",
  HELMET_9_6: "item/birch_stairs",
  HELMET_9_7: "item/brick_stairs",
  HELMET_9_8: "item/dark_oak_stairs",
  HELMET_10_1: "item/snow",
  HELMET_10_2: "item/daylight_detector",
  HELMET_10_3: "item/pink_wool",
  HELMET_10_4: "item/acacia_slab",
  HELMET_11: "item/packed_ice",
  HELMET_11_2: "item/birch_slab",
} as const;

// Leather suits are dyed with Bukkit's DyeColor names and colors
export const SUIT_DYES = {
  WHITE: 0xFF_FF_FF,
  ORANGE: 0xD8_7F_33,
  MAGENTA: 0xB2_4C_D8,
  LIGHT_BLUE: 0x66_99_D8,
  YELLOW: 0xE5_E5_33,
  LIME: 0x7F_CC_19,
  PINK: 0xF2_7F_A5,
  GRAY: 0x4C_4C_4C,
  SILVER: 0x99_99_99,
  CYAN: 0x4C_7F_99,
  PURPLE: 0x7F_3F_B2,
  BLUE: 0x33_4C_B2,
  BROWN: 0x66_4C_33,
  GREEN: 0x66_7F_33,
  RED: 0x99_33_33,
  BLACK: 0x19_19_19,
} as const;

const SUIT_MATERIALS = {
  GOLD: "gold",
  CHAIN: "chainmail",
  IRON: "iron",
  DIAMOND: "diamond",
  LEATHER: "leather",
} as const satisfies Record<string, ArmorPieceDto["material"]>;

type SuitPiece = "JACKET" | "PANTS" | "SHOES";

// Object.hasOwn, since an index would also find keys like "constructor" on the prototype
function lookup<T extends object>(registry: T, key: string, error: string): T[keyof T] {
  if (!Object.hasOwn(registry, key)) throw new BadRequestException(error);
  return registry[key as keyof T];
}

export const getKartModel = (kart: string) => lookup(KARTS, kart, `Unknown kart ${kart}`);

export const getHelmetModel = (helmet?: string) =>
  helmet === undefined || helmet === "NO_HELMET" ? undefined : lookup(HELMETS, helmet, `Unknown helmet ${helmet}`);

/** Reads a stored suit piece such as `GOLD_JACKET`, `LEATHER_JACKET` (undyed) or `LEATHER_JACKET:RED` */
export function parseSuitPiece(value: string | undefined, piece: SuitPiece): ArmorPieceDto | undefined {
  if (value === undefined || value === `NO_${piece}`) return;

  const error = `Unknown ${piece.toLowerCase()} ${value}`;
  const [item, dye, ...rest] = value.split(":");
  if (!item.endsWith(`_${piece}`) || rest.length > 0) throw new BadRequestException(error);

  const material = lookup(SUIT_MATERIALS, item.slice(0, -piece.length - 1), error);
  if (dye === undefined) return { material };
  if (material !== "leather") throw new BadRequestException(error);

  return { material, color: lookup(SUIT_DYES, dye, error) };
}

if (import.meta.vitest) {
  const { suite, it, expect } = import.meta.vitest;

  suite("parseSuitPiece", () => {
    it("should read stored suit pieces and reject values that aren't a piece of that slot", () => {
      expect(parseSuitPiece("NO_JACKET", "JACKET")).toBeUndefined();
      expect(parseSuitPiece("CHAIN_PANTS", "PANTS")).toEqual({ material: "chainmail" });
      expect(parseSuitPiece("LEATHER_SHOES", "SHOES")).toEqual({ material: "leather" });
      expect(parseSuitPiece("LEATHER_JACKET:LIGHT_BLUE", "JACKET")).toEqual({ material: "leather", color: 0x66_99_D8 });

      expect(() => parseSuitPiece("GOLD_PANTS", "JACKET")).toThrow(BadRequestException);
      expect(() => parseSuitPiece("GOLD_JACKET:RED", "JACKET")).toThrow(BadRequestException);
      expect(() => parseSuitPiece("LEATHER_JACKET:TEAL", "JACKET")).toThrow(BadRequestException);
      expect(() => parseSuitPiece("constructor_JACKET", "JACKET")).toThrow(BadRequestException);
      expect(() => parseSuitPiece("_JACKET", "JACKET")).toThrow(BadRequestException);
    });
  });
}
