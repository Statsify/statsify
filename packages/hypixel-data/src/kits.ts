/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { legacyItem, legacyMaterialId } from "@statsify/textures";

// A player inventory and its armor: the hotbar is slots 0 to 8, the main rows 9 to 35, then
// boots, leggings, chestplate and helmet in 36 to 39
export const HOTBAR = 9;
export const ARMOR = { boots: 36, leggings: 37, chestplate: 38, helmet: 39 } as const;
export const SLOTS = 40;

/** The armor slots top to bottom, as the inventory screen shows them */
export const ARMOR_SLOTS = [ARMOR.helmet, ARMOR.chestplate, ARMOR.leggings, ARMOR.boots] as const;

export const inRange = (slot: number, length: number) => slot >= 0 && slot < length;

/** Kit names as keys: "Hype Train" and hype_train are both hypetrain */
export const kitKey = (name: string) => name.toLowerCase().replaceAll(/[^a-z]/g, "");

const SPAWN_EGG = 383;

/**
 * The 26.3 item for a 1.8 id and Damage value as Hypixel stores them. A spawn egg 26.3 has no item for, like 1.8's
 * untyped one (Damage 0, SkyWars' Mystery Egg), is undefined; any other id the table lacks throws
 */
export function hypixelItem(id: number, damage = 0) {
  const item = legacyItem(id, damage);
  if (!item && id !== SPAWN_EGG) throw new Error(`No 26.3 item for 1.8's ${id}:${damage}`);
  return item;
}

/** As hypixelItem, by Bukkit material name, like GOLD_CHESTPLATE */
export function hypixelMaterial(name: string, damage = 0) {
  const id = legacyMaterialId(name);
  if (id === undefined) throw new Error(`No 1.8 material ${name}`);
  return hypixelItem(id, damage);
}
