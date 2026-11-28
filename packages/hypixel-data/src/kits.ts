/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { legacyItem, legacyMaterialId } from "@statsify/textures";

// Hotbar 0 to 8, main rows 9 to 35, then boots to helmet in 36 to 39
export const HOTBAR = 9;
export const ARMOR = {
  boots: 36,
  leggings: 37,
  chestplate: 38,
  helmet: 39,
} as const;
export const SLOTS = 40;

export const ARMOR_SLOTS = [
  ARMOR.helmet,
  ARMOR.chestplate,
  ARMOR.leggings,
  ARMOR.boots,
] as const;

export const inRange = (slot: number, length: number) =>
  slot >= 0 && slot < length;

export const kitKey = (name: string) =>
  name.toLowerCase().replaceAll(/[^a-z]/g, "");

const SPAWN_EGG = 383;

export const isUntypedEgg = (id: number, damage: number) =>
  id === SPAWN_EGG && !legacyItem(id, damage);

export function hypixelItem(id: number, damage = 0) {
  const item = legacyItem(id, damage);
  if (!item && !isUntypedEgg(id, damage))
    throw new Error(`No 26.3 item for 1.8's ${id}:${damage}`);
  return item;
}

export function hypixelMaterial(name: string, damage = 0) {
  const id = legacyMaterialId(name);
  if (id === undefined) throw new Error(`No 1.8 material ${name}`);
  return hypixelItem(id, damage);
}
