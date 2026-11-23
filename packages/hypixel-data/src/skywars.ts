/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { SLOTS, hypixelMaterial, inRange, kitKey } from "./kits.js";
import type { ItemStack } from "@statsify/textures";
import { armorOf } from "./armor.js";
import dumped from "../data/skywars-kits.json" with { type: "json" };

export interface SkyWarsKit {
  /** As the lobby's kit menus name it, menu first, like Normal Scout */
  name: string;
  /** The items its menu lists by layout key (DIAMOND_AXE:0:16), with default slots when every one is known */
  items: { slot?: number; token: string; item: ItemStack }[];
}

// Built by scripts/import-dump.ts from the lobby's kit menus and Kit Customizers
const KITS = dumped as Record<string, SkyWarsKit>;

const hasDefault = ({ items }: SkyWarsKit) => items.length > 0 && items.every(({ slot }) => slot !== undefined);

/** Every SkyWars kit with a default layout, by the key fromSkyWarsKit takes (normal_scout) and its menu's name */
export const SKYWARS_KITS = Object.entries(KITS).flatMap(([key, kit]) => (hasDefault(kit) ? [{ key, name: kit.name }] : []));

// Kit ids are kit_<type>_<mode>_<kit>. Ranked's kits (kit_ranked_ranked_scout) hold Mini's items
const MENUS: Record<string, string | undefined> = { solo: "normal", team: "insane", ranked: "mini", mega: "mega" };

// Mega's Pyro is stored as pyromaniac
const RENAMED: Record<string, string | undefined> = { mega_pyromaniac: "mega_pyro" };

// Mythical kits (kit_mythical_end-lord) have no mode, and Normal and Insane enchant them
// differently, so they match no menu
function skyWarsKit(kit: string) {
  if (KITS[kit]) return KITS[kit];

  const id = /^kit_([a-z]+)_([a-z]+)_(.+)$/.exec(kit);
  const menu = id && (id[1] === "mini" ? "mini" : MENUS[id[2]]);
  if (!id || !menu) return undefined;

  const key = `${menu}_${kitKey(id[3])}`;
  return KITS[RENAMED[key] ?? key];
}

/** The armor a SkyWars kit's menu lists, by kit id or SKYWARS_KITS key as fromSkyWarsKit takes it */
export function skyWarsKitArmor(kit: string) {
  const items = skyWarsKit(kit)?.items;
  // A listed head, like Frog's Hat, starts in the hotbar, since the game only puts on armor
  return items && armorOf(items.map(({ item }) => item).filter(({ id }) => id !== "minecraft:player_head"));
}

/** A layout key with its enchantment ids in order, as tokens have them */
function withSortedEnchantments(key: string) {
  const [material, damage, enchantments] = key.split(":");
  const ids = enchantments?.split(",").map(Number).toSorted((a, b) => a - b);
  return [material, damage, ...(ids ? [ids.join(",")] : [])].join(":");
}

/**
 * A SkyWars kit_…_inventory ({ "IRON_PICKAXE:0:32,34": "0", "GOLD_HELMET:0": [39] }), or the kit's default (undefined
 * for a kit the dump lacks). `kit` is its id (kit_basic_solo_scout, as activeKit_SOLO holds it) or a SKYWARS_KITS key
 */
export function fromSkyWarsKit(
  stored: Readonly<Record<string, string | readonly number[]>> | null | undefined,
  kit: string,
): (ItemStack | undefined)[] | undefined {
  const slots: (ItemStack | undefined)[] = Array.from({ length: SLOTS });
  const dumpedKit = skyWarsKit(kit);

  if (!stored) {
    if (!dumpedKit || !hasDefault(dumpedKit)) return;
    for (const { slot, item } of dumpedKit.items) if (slot !== undefined) slots[slot] = item;
    return slots;
  }

  const listed = new Map(dumpedKit?.items.map(({ token, item }) => [token, item]));
  const byMaterial = Map.groupBy(dumpedKit?.items ?? [], ({ token }) => token.split(":").slice(0, 2).join(":"));

  // Many layouts (all of Ranked's) store a listed item without its enchantment ids
  const findListed = (key: string) => {
    const sameMaterial = byMaterial.get(key);
    return listed.get(withSortedEnchantments(key)) ?? (sameMaterial?.length === 1 ? sameMaterial[0].item : undefined);
  };

  // Older versions of a kit leave their items in a layout, so a slot can hold two: the kit's
  // current item wins, then the first
  const entries = Object.entries(stored)
    .map(([key, value]) => ({ key, value, listedItem: findListed(key) }))
    .toSorted((a, b) => Number(b.listedItem !== undefined) - Number(a.listedItem !== undefined));

  for (const { key, value, listedItem } of entries) {
    const [material, damage, enchantments] = key.split(":");
    const plain = hypixelMaterial(material, Number(damage));
    const item = listedItem ?? (plain && { ...plain, enchanted: enchantments ? true : undefined });
    if (!item) continue;

    for (const slot of [value].flat().map(Number)) {
      if (inRange(slot, SLOTS) && !slots[slot]) slots[slot] = item;
    }
  }

  return slots;
}
