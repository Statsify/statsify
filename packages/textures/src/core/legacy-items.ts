/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import data from "../../data/minecraft-data.json" with { type: "json" };
import type { ItemStack } from "./item-stack.js";

const items: Record<string, string | undefined> = data.items;
const durability: Record<string, number | undefined> = data.durability;
const effects: Record<string, string | undefined> = data.effects;
const materials: Record<string, number | undefined> = data.materials;
const names: Record<string, string | undefined> = data.legacyNames;

const POTION = 373;

// 1.8 potions keep their effect's id in the low four bits of Damage
// https://minecraft.wiki/w/Java_Edition_pre-flattening_data_values#Potions
const POTION_EFFECTS = [0, 10, 1, 12, 19, 6, 16, 0, 18, 5, 2, 8, 7, 13, 14, 0];
const LEVEL_II = 0x20;
const SPLASH = 0x40_00;

/** A 26.3 effect id for a 1.8 numeric effect id */
export function legacyEffect(id: number) {
  const name = effects[id];
  return name ? `minecraft:${name}` : undefined;
}

/**
 * The 26.3 item for a 1.8 numeric id and Damage value, as Hypixel sends them.
 * Damage on a tool or armor piece is kept as wear.
 */
export function legacyItem(id: number, damage = 0): ItemStack | undefined {
  if (id === POTION) {
    const effect = legacyEffect(POTION_EFFECTS[damage & 0xf]);

    return {
      id: damage & SPLASH ? "minecraft:splash_potion" : "minecraft:potion",
      effects: effect ? [{ id: effect, amplifier: damage & LEVEL_II ? 1 : 0 }] : [],
    };
  }

  const name = items[`${id}:${damage}`] ?? items[id];
  if (!name) return;

  return { id: `minecraft:${name}`, damage: durability[name] && damage > 0 ? damage : undefined };
}

/** The 26.3 item for a 1.8 Bukkit material name, like GOLD_CHESTPLATE, and Damage value */
export function legacyMaterial(name: string, damage = 0) {
  const id = materials[name];
  return id === undefined ? undefined : legacyItem(id, damage);
}

/** How much wear a 26.3 item takes before it breaks */
export const maxDamage = (id: string) => durability[id.replace("minecraft:", "")];

/** 1.8's English name for a 26.3 item, after its rarity color, like "§bGolden Apple" */
export const legacyName = (id: string) => names[id.replace("minecraft:", "")];
