/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { legacyItem, legacyMaterial } from "../core/legacy-items.js";
import type { ItemStack } from "../core/item-stack.js";

// A player inventory and its armour: the hotbar is slots 0 to 8, the main rows 9 to 35, then
// boots, leggings, chestplate and helmet in 36 to 39
export const HOTBAR = 9;
export const ARMOR = { boots: 36, leggings: 37, chestplate: 38, helmet: 39 } as const;
export const SLOTS = 40;

/** The armour slots top to bottom, as the inventory screen shows them */
export const ARMOR_SLOTS = [ARMOR.helmet, ARMOR.chestplate, ARMOR.leggings, ARMOR.boots] as const;

export const inRange = (slot: number, length: number) => slot >= 0 && slot < length;

/**
 * A kit layout of 1.8 "id,damage" values by slot, as Mega Walls' <class>Inventory, Blitz's
 * <Kit>Inventory and classic Walls' InventoryLayout send it: { "0": "267,0", "5": "373,2" }.
 */
export function fromLegacyKit(layout: Readonly<Record<string, string>>): (ItemStack | undefined)[] {
  const slots: (ItemStack | undefined)[] = Array.from({ length: SLOTS });

  for (const [slot, value] of Object.entries(layout)) {
    // Walls adds a third part, like NONAME
    const [id, damage] = value.split(",").map(Number);
    if (inRange(Number(slot), SLOTS)) slots[Number(slot)] = legacyItem(id, damage);
  }

  return slots;
}

/**
 * A SkyWars kit layout (kit_<type>_<mode>_<kit>_inventory): a Bukkit material, Damage and, on
 * enchanted items, the enchantment ids, mapped to their slot, like
 * { "IRON_PICKAXE:0:32,34": "0", "GOLD_HELMET:0": [39] }.
 */
export function fromSkyWarsKit(
  layout: Readonly<Record<string, string | readonly number[]>>,
): (ItemStack | undefined)[] {
  const slots: (ItemStack | undefined)[] = Array.from({ length: SLOTS });

  for (const [key, value] of Object.entries(layout)) {
    const [material, damage, enchantments] = key.split(":");
    const item = legacyMaterial(material, Number(damage));
    if (!item) continue;

    for (const slot of [value].flat().map(Number)) {
      // A plain and an enchanted copy can share a slot, and which one the game shows isn't
      // known yet, so the first stays
      if (inRange(slot, SLOTS) && !slots[slot]) slots[slot] = { ...item, enchanted: enchantments ? true : undefined };
    }
  }

  return slots;
}
