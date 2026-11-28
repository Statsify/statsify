/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import data from "../../data/minecraft-data.json" with { type: "json" };
import type { ItemStack } from "./item-stack.js";
import { DOWNLOAD_TIMEOUT, namespaced, withoutNamespace } from "./pack.js";

const items: Record<string, string | undefined> = data.items;
const durability: Record<string, number | undefined> = data.durability;
const effects: Record<string, string | undefined> = data.effects;
const materials: Record<string, number | undefined> = data.materials;
const names: Record<string, string | undefined> = data.legacyNames;

const MINECRAFT_DATA =
  "https://raw.githubusercontent.com/PrismarineJS/minecraft-data/3.117.0/data/pc";

/** A file from the minecraft-data release these tables are built from, like "1.8/items.json" */
export async function fetchMinecraftData<T>(path: string): Promise<T> {
  const response = await fetch(`${MINECRAFT_DATA}/${path}`, {
    signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT),
  });
  if (!response.ok) throw new Error(`${path}: ${response.status}`);
  return response.json() as Promise<T>;
}

const POTION = 373;

// 1.8 potions keep their effect's id in the low four bits of Damage
const POTION_EFFECTS = [0, 10, 1, 12, 19, 6, 16, 0, 18, 5, 2, 8, 7, 13, 14, 0];
const LEVEL_II = 0x20;
const SPLASH = 0x40_00;

export function legacyEffect(id: number) {
  const name = effects[id];
  return name ? namespaced(name) : undefined;
}

// Damage on a tool or armor piece is kept as wear
export function legacyItem(id: number, damage = 0): ItemStack | undefined {
  if (id === POTION) {
    const effect = legacyEffect(POTION_EFFECTS[damage & 0xf]);

    return {
      id: damage & SPLASH ? "minecraft:splash_potion" : "minecraft:potion",
      effects: effect
        ? [{ id: effect, amplifier: damage & LEVEL_II ? 1 : 0 }]
        : [],
    };
  }

  const name = items[`${id}:${damage}`] ?? items[id];
  if (!name) return;

  return {
    id: namespaced(name),
    damage: durability[name] && damage > 0 ? damage : undefined,
  };
}

/** The 1.8 numeric id of a Bukkit material name, like GOLD_CHESTPLATE */
export const legacyMaterialId = (name: string) => materials[name];

export const maxDamage = (id: string) => durability[withoutNamespace(id)];

export const legacyName = (id: string) => names[withoutNamespace(id)];
