/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { RARITIES, type ItemView, type ItemsResource, type Rarity, type RawItem, type Slots } from "#types";
import { decodeInventory } from "#nbt";
import { normalizeItemText } from "./lore.js";
import { removeFormatting } from "@statsify/util";
import { skinHash, textureOf } from "#textures";
import type { RawNbt } from "#raw";

const RARITY_NAMES = new Map<string, Rarity>([
  ...RARITIES.map((rarity) => [rarity.replace("_", " "), rarity] as const),
  // How Jerry's cosmetics name Legendary (the wiki's Rarity page)
  ["LEGENJERRY", "LEGENDARY"],
]);

const RARITY_LINE = new RegExp(`^(?:SHINY )?(${[...RARITY_NAMES.keys()].join("|")})\\b`);

function rarityOf(lore: readonly string[]): Rarity | undefined {
  const name = RARITY_LINE.exec(removeFormatting(lore.at(-1) ?? "").trim())?.[1];
  return name === undefined ? undefined : RARITY_NAMES.get(name);
}

/** An NBT long, which the decode leaves as `[high, low]` (low signed), as a number; an int as it is. */
export function nbtNumber(value: unknown): number | undefined {
  if (typeof value === "number") return value;
  if (Array.isArray(value) && value.length === 2 && value.every(Number.isInteger)) return value[0] * 2 ** 32 + (value[1] >>> 0);
  return undefined;
}

export function toItemView(item: RawItem): ItemView {
  const attributes = item.tag?.ExtraAttributes ?? {};
  const id = attributes.id ?? `minecraft:${item.id}:${item.Damage}`;
  const lore = (item.tag?.display?.Lore ?? []).map(normalizeItemText);

  return {
    id,
    name: normalizeItemText(item.tag?.display?.Name ?? id),
    lore,
    rarity: rarityOf(lore),
    count: item.Count,
    glint: item.tag?.ench !== undefined,
    texture: textureOf(item),
    reforge: attributes.modifier,
    stars: nbtNumber(attributes.upgrade_level ?? attributes.dungeon_item_level),
    recombobulated: Boolean(attributes.rarity_upgrades),
    enchantments: attributes.enchantments,
    enrichment: attributes.talisman_enrichment,
    hotPotato: nbtNumber(attributes.hot_potato_count),
    obtainedAt: nbtNumber(attributes.timestamp),
  };
}

export const decodeSlots = (blob: RawNbt): Slots => decodeInventory(blob).map((item) => item && toItemView(item));

interface RawResourceItem {
  id: string;
  name: string;
  material: string;
  durability?: number;
  tier?: string;
  category?: string;
  color?: string;
  skin?: { value: string };
  origin?: string;
  rift_transferrable?: boolean;
  npc_sell_price?: number;
  glowing?: boolean;
  generator?: string;
  generator_tier?: number;
  museum_data?: { category?: string; donation_xp?: number; armor_set_donation_xp?: Record<string, number> };
}

// The resource leaves COMMON out and still calls DIVINE by its old name. UNOBTAINABLE isn't a rarity.
const tierOf = (tier = "COMMON") => (tier === "SUPREME" ? "DIVINE" : RARITIES.find((rarity) => rarity === tier));

export function parseItemsResource(raw: { lastUpdated: number; items: RawResourceItem[] }): ItemsResource {
  // The museum keeps an armor set under the set's key, which each of its pieces names
  const museum: Record<string, string> = {};
  for (const { id, museum_data: data } of raw.items) {
    if (!data?.category) continue;
    if (data.donation_xp !== undefined) museum[id] = data.category;
    for (const set of Object.keys(data.armor_set_donation_xp ?? {})) museum[set] = data.category;
  }

  return {
    lastUpdated: raw.lastUpdated,
    raw: raw.items,
    museum,
    items: Object.fromEntries(
      raw.items.map(({ id, name, material, durability, tier, category, color, skin, origin, rift_transferrable, npc_sell_price, glowing, generator, generator_tier }) => [
        id,
        {
          name,
          material,
          durability,
          tier: tierOf(tier),
          category,
          color,
          skin: skin && skinHash(skin.value),
          riftOnly: origin === "RIFT" && !rift_transferrable ? true : undefined,
          npcPrice: npc_sell_price,
          glowing,
          generator,
          generatorTier: generator_tier,
        },
      ])
    ),
  };
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest;

  test("rarityOf reads the last lore line", () => {
    expect(rarityOf(["§7Stuff", "§6§lLEGENDARY DUNGEON BOOTS"])).toBe("LEGENDARY");
    expect(rarityOf(["§d§l§r §d§lMYTHIC ACCESSORY §r§d§l"])).toBe("MYTHIC");
    expect(rarityOf(["§c§lVERY SPECIAL HATCESSORY"])).toBe("VERY_SPECIAL");
    expect(rarityOf(["§d§l§r §d§lSHINY MYTHIC DUNGEON SWORD §r§d§l"])).toBe("MYTHIC");
    expect(rarityOf(["§a§lUNCOMMON"])).toBe("UNCOMMON");
    expect(rarityOf(["§7A rare find"])).toBeUndefined();
    expect(rarityOf([])).toBeUndefined();
  });

  test("nbtNumber joins a long's halves", () => {
    expect(nbtNumber(5)).toBe(5);
    expect(nbtNumber([0, 7])).toBe(7);
    expect(nbtNumber([0, -1])).toBe(2 ** 32 - 1);
    expect(nbtNumber([406, -2_051_689_472])).toBe(1_746_000_000_000);
    expect(nbtNumber("5")).toBeUndefined();
  });
}
