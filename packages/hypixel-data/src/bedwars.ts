/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  CURRENCIES,
  DEFAULT_HOTBAR,
  DEFAULT_QUICK_BUY,
  EMPTY_SLOT,
  HOTBAR_CATEGORIES,
  HOTBAR_MANAGER,
  NOT_SELECTED_LORE,
  PANES,
  SHOP_CATEGORIES,
  SHOP_ITEMS,
  type ShopItem,
  TRACKER_SHOP,
  UPGRADABLE,
} from "./bedwars-shop.js";
import { HOTBAR } from "./kits.js";
import type { ItemStack } from "@statsify/textures";

const SHOP_ROWS = 6;
const SHOP_COLUMNS = 9;
const BOTTOM_ROW = (SHOP_ROWS - 1) * SHOP_COLUMNS;

// Older quick buys store Wood as wood
const RENAMED: Record<string, string | undefined> = { wood: "oak_wood_planks" };

// The quick buy's 21 slots: rows 3 to 5 of the shop, less their first and last columns
const QUICK_BUY_SLOTS = [2, 3, 4].flatMap((row) =>
  Array.from({ length: SHOP_COLUMNS - 2 }, (_, column) => row * SHOP_COLUMNS + column + 1),
);

/** An item's tooltip on Quick Buy, when you have enough to buy it */
function quickBuyLore({ cost: [amount, currency], description = [], upgradable }: ShopItem) {
  const { color, name } = CURRENCIES[currency];
  const text = upgradable ? UPGRADABLE : description;

  return [
    `§7Cost: ${color}${amount} ${name}${currency === "emerald" && amount > 1 ? "s" : ""}`,
    ...(upgradable ? ["§7Tier: §eI"] : []),
    "",
    ...text.map((line) => line && `§7${line}`),
    ...(text.length > 0 ? [""] : []),
    "§bShift Click to remove from Quick Buy!",
    "§eClick to purchase!",
  ];
}

/** The BedWars item shop open on Quick Buy, as 54 slots, with a player's quick buy from favourites_2 or else the default */
export function fromBedwarsQuickBuy(favorites: string | null | undefined): (ItemStack | undefined)[] {
  const tokens = (favorites ?? DEFAULT_QUICK_BUY).split(",");
  const slots: (ItemStack | undefined)[] = Array.from({ length: SHOP_ROWS * SHOP_COLUMNS });

  for (const [index, category] of SHOP_CATEGORIES.entries()) {
    // Quick Buy is the open category, so it alone has no "Click to view!"
    slots[index] = { ...category, lore: index === 0 ? undefined : NOT_SELECTED_LORE };
  }

  for (let column = 0; column < SHOP_COLUMNS; column++) {
    slots[SHOP_COLUMNS + column] = {
      id: column === 0 ? PANES.selected : PANES.notSelected,
      name: PANES.name,
      lore: PANES.lore,
    };
  }

  for (const [index, slot] of QUICK_BUY_SLOTS.entries()) {
    const token = tokens[index];

    if (token === undefined || token === "null") {
      slots[slot] = EMPTY_SLOT;
      continue;
    }

    const item = SHOP_ITEMS[RENAMED[token] ?? token];
    if (!item) continue;

    slots[slot] = {
      id: `minecraft:${item.id ?? token}`,
      count: item.count,
      effects: item.effects,
      enchanted: item.enchanted,
      name: `§a${item.name}`,
      lore: quickBuyLore(item),
    };
  }

  slots[BOTTOM_ROW] = TRACKER_SHOP;
  slots[BOTTOM_ROW + SHOP_COLUMNS - 1] = HOTBAR_MANAGER;

  return slots;
}

/** A BedWars hotbar as the Hotbar Manager shows it, from favorite_slots ("Melee,null,…") or else the default */
export function fromBedwarsHotbar(favorites: string | null | undefined): (ItemStack | undefined)[] {
  const categories = (favorites ?? DEFAULT_HOTBAR).split(",");

  return Array.from({ length: HOTBAR }, (_, slot) => {
    const category = categories[slot];
    const id = category && HOTBAR_CATEGORIES[category];
    if (!id) return;

    return {
      id,
      name: `§a${category}`,
      lore: [`§7${category} items will prioritize this slot!`, "", "§eClick to remove!"],
    };
  });
}
