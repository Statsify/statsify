/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { legacyItem } from "../core/legacy-items.js";
import type { ItemStack } from "../core/item-stack.js";

// A player inventory and its armour: the hotbar is slots 0 to 8, the main rows 9 to 35, then
// boots, leggings, chestplate and helmet in 36 to 39
export const HOTBAR = 9;
export const ARMOR = { boots: 36, leggings: 37, chestplate: 38, helmet: 39 } as const;
export const SLOTS = 40;

/** The armour slots top to bottom, as the inventory screen shows them */
export const ARMOR_SLOTS = [ARMOR.helmet, ARMOR.chestplate, ARMOR.leggings, ARMOR.boots] as const;

export const inRange = (slot: number, length: number) => slot >= 0 && slot < length;

/** Kit names as keys: "Hype Train" and hype_train are both hypetrain */
export const kitKey = (name: string) => name.toLowerCase().replaceAll(/[^a-z]/g, "");

/**
 * A kit layout of 1.8 "id,damage" values by slot, as Mega Walls' <class>Inventory, Blitz's
 * <Kit>Inventory and classic Walls' InventoryLayout send it: { "0": "267,0", "5": "373,2" }.
 * Walls' InventoryLayout2 adds the item's name, or NONAME, which keeps items of one material
 * apart (Starter Arrow and Arrow): { "12": "273,0,§bSpeedy Spade", "17": "262,0,NONAME" }.
 */
export function fromLegacyKit(layout: Readonly<Record<string, string>>): (ItemStack | undefined)[] {
  const slots: (ItemStack | undefined)[] = Array.from({ length: SLOTS });

  for (const [slot, value] of Object.entries(layout)) {
    const [id, damage, ...rest] = value.split(",");
    const item = legacyItem(Number(id), Number(damage));
    const name = rest.join(",");
    if (inRange(Number(slot), SLOTS)) slots[Number(slot)] = item && name && name !== "NONAME" ? { ...item, name } : item;
  }

  return slots;
}
