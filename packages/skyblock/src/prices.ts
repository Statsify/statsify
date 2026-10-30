/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  RARITIES,
  type Bazaar,
  type ItemCost,
  type ItemsResource,
  type PriceEntry,
  type PriceMap,
  type PriceView,
} from "#types";
import { petName, petTexture } from "./sections/pets.js";
import { prettify, removeFormatting, romanNumeral } from "@statsify/util";
import { resourceTexture } from "#textures";
import type { RawBazaar } from "#raw";

export function parseBazaar(raw: RawBazaar): Bazaar {
  return {
    lastUpdated: raw.lastUpdated,
    products: Object.fromEntries(
      Object.entries(raw.products).map(([id, { buy_summary, sell_summary, quick_status }]) => [
        id,
        {
          id,
          instantBuy: buy_summary[0]?.pricePerUnit,
          instantSell: sell_summary[0]?.pricePerUnit,
          buyPrice: quick_status.buyPrice,
          sellPrice: quick_status.sellPrice,
          buyMovingWeek: quick_status.buyMovingWeek,
          sellMovingWeek: quick_status.sellMovingWeek,
        },
      ])
    ),
  };
}

const BOOK_KEY = /^ENCHANTMENT_(.+)_(\d+)$/;
const PET_KEY = /^LVL_(\d+)_(VERY_SPECIAL|[A-Z]+)_(.+)$/;

// Typed /price names reach these lookups, so "constructor" or "__proto__" mustn't read Object.prototype.
const own = <T>(record: Record<string, T>, key: string) => (Object.hasOwn(record, key) ? record[key] : undefined);

/**
 * Fragged items end in ⚚ and pet items in their rarity, since each shares its name with another key. A suffix, so
 * autocomplete's prefix match still finds them.
 */
function itemName(key: string, { name, tier, category }: ItemsResource["items"][string]) {
  const plain = removeFormatting(name);
  if (key.startsWith("STARRED_")) return `${plain} ⚚`;
  return category === "PET_ITEM" && tier ? `${plain} (${prettify(tier)})` : plain;
}

/**
 * The name, rarity and texture of a price key that search and /price cover: an items-resource id, a single-enchant book
 * (ENCHANTMENT_SHARPNESS_5) or a pet at level 1, 100 or 200 (LVL_100_LEGENDARY_ENDER_DRAGON).
 */
export function describeKey(key: string, items: ItemsResource): Omit<PriceView, "asOf"> | undefined {
  const item = own(items.items, key);
  if (item) return { id: key, name: itemName(key, item), rarity: item.tier, texture: resourceTexture(item) };

  const book = BOOK_KEY.exec(key);
  if (book) {
    const [, enchantment, level] = book;
    const texture = items.items.ENCHANTED_BOOK && resourceTexture(items.items.ENCHANTED_BOOK);
    return { id: key, name: `${prettify(enchantment)} ${romanNumeral(Number(level))}`, texture };
  }

  const pet = PET_KEY.exec(key);
  const rarity = RARITIES.find((tier) => tier === pet?.[2]);
  if (!pet || !rarity || key.includes("_SKINNED_")) return;

  const [, level, , type] = pet;
  const name = `[Lvl ${level}] ${prettify(rarity)} ${petName(type)}`;
  return { id: key, name, rarity, texture: petTexture(type, rarity) };
}

/** undefined when search can't name the key or no source prices it. */
export function toPriceView(id: string, map: PriceMap, bazaar: Bazaar, items: ItemsResource): PriceView | undefined {
  const described = describeKey(id, items);
  const entry = own(map.entries, id);
  const lowestBin = entry?.source === "bin" ? { coins: entry.coins, listings: entry.listings } : undefined;
  const product = own(bazaar.products, id);
  const npc = own(items.items, id)?.npcPrice;
  if (!described || !(product || lowestBin || npc)) return;

  return { ...described, bazaar: product, lowestBin, npc, asOf: map.asOf };
}

/** An NPC sell price is what an NPC pays for an item, so one priced only by that has no cost. */
export function costOf(entry?: PriceEntry): ItemCost | undefined {
  if (entry?.source === "bin") return { coins: entry.coins, source: "bin" };
  if (entry?.source === "bazaar" && entry.buy > 0) return { coins: entry.buy, source: "bazaar" };
  return undefined;
}
