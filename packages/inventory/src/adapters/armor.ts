/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ARMOR } from "./kits.js";
import type { ItemStack } from "../core/item-stack.js";

type ArmorMaterial = "leather" | "chainmail" | "iron" | "gold" | "diamond";

/** A worn piece as a skin render draws it: armour, or a player head by its textures.minecraft.net hash */
export type ArmorPiece = { material: ArmorMaterial; color?: number; enchanted?: boolean } | { head: string };

export type Armor = Partial<Record<keyof typeof ARMOR, ArmorPiece>>;

const MATERIALS: Record<string, ArmorMaterial | undefined> = {
  leather: "leather",
  chainmail: "chainmail",
  iron: "iron",
  golden: "gold",
  diamond: "diamond",
};

const PIECE = /^minecraft:(\w+?)_(helmet|chestplate|leggings|boots)$/;
const SKIN_HASH = /^https:\/\/textures\.minecraft\.net\/texture\/([\da-f]+)$/;

/**
 * The armour among items, like Pit's inv_armor, a kit's items or slots 36 to 39, each piece the
 * first of its kind. Anything else on the head, a block or a mob skull, is left out
 */
export function armorOf(items: Iterable<ItemStack | undefined>): Armor {
  const armor: Armor = {};

  for (const item of items) {
    if (!item) continue;

    if (item.id === "minecraft:player_head") {
      const head = item.skin && SKIN_HASH.exec(item.skin)?.[1];
      if (head) armor.helmet ??= { head };
      continue;
    }

    const piece = PIECE.exec(item.id);
    const material = piece && MATERIALS[piece[1]];
    if (material) armor[piece[2] as keyof typeof ARMOR] ??= { material, color: item.color, enchanted: item.enchanted };
  }

  return armor;
}

// Hypixel dyes kit leather with Bukkit's Color constants, which the kit pickers name ("White
// Leather Chestplate"); none of the dumped kit pieces uses 1.8's dye colours
const LEATHER_COLORS: Record<string, number | undefined> = {
  White: 0xff_ff_ff,
  Silver: 0xc0_c0_c0,
  Gray: 0x80_80_80,
  Grey: 0x80_80_80,
  Black: 0x00_00_00,
  Red: 0xff_00_00,
  Maroon: 0x80_00_00,
  Yellow: 0xff_ff_00,
  Olive: 0x80_80_00,
  Lime: 0x00_ff_00,
  Green: 0x00_80_00,
  Aqua: 0x00_ff_ff,
  Teal: 0x00_80_80,
  Blue: 0x00_00_ff,
  Navy: 0x00_00_80,
  Fuchsia: 0xff_00_ff,
  Purple: 0x80_00_80,
  Orange: 0xff_a5_00,
};

/** The dye a kit picker names on a leather piece, like "White Leather Chestplate" */
export function leatherColor(name: string) {
  const dye = /^(\w+) Leather (?:Helmet|Chestplate|Leggings|Boots)$/.exec(name)?.[1];
  if (dye === undefined) return undefined;

  const color = LEATHER_COLORS[dye];
  if (color === undefined) throw new Error(`No leather colour is named ${dye}`);
  return color;
}

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

  describe("armor", () => {
    it("names leather dyes and keeps only armour and player heads", () => {
      expect(leatherColor("White Leather Chestplate")).toBe(0xff_ff_ff);
      expect(leatherColor("Grey Leather Boots")).toBe(0x80_80_80);
      expect(leatherColor("Leather Boots")).toBeUndefined();
      expect(() => leatherColor("Plaid Leather Boots")).toThrow();

      const head = "51e05727d64ff697e27a13f69d88131f4e7d9b81d18e1c2581b1cdc4492e40";
      expect(
        armorOf([
          { id: "minecraft:leather_boots", color: 0 },
          undefined,
          { id: "minecraft:golden_chestplate", enchanted: true },
          { id: "minecraft:iron_chestplate" },
          { id: "minecraft:player_head", skin: `https://textures.minecraft.net/texture/${head}` },
        ]),
      ).toEqual({
        boots: { material: "leather", color: 0 },
        chestplate: { material: "gold", enchanted: true },
        helmet: { head },
      });
      expect(armorOf([{ id: "minecraft:wither_skeleton_skull" }, { id: "minecraft:carved_pumpkin" }])).toEqual({});
    });
  });
}
