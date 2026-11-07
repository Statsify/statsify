/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { arrayGroup, prettify } from "@statsify/util";
import { decodeSlots } from "#items";
import { resourceTexture } from "#textures";
import type { InventoriesSection, InventoryId, ItemsResource, Slots } from "#types";
import type { RawMember, RawNbt } from "#raw";

/** The ender chest's page, and the size the bags are paged at. */
const PAGE = 45;

const BAGS = {
  accessoryBag: "talisman_bag",
  potionBag: "potion_bag",
  fishingBag: "fishing_bag",
  quiver: "quiver",
  sacksBag: "sacks_bag",
} as const satisfies Partial<Record<InventoryId, string>>;

const paged = (slots: Slots) => (slots.length > 0 ? arrayGroup(slots, PAGE) : [[]]);

/** A map's blobs in their numeric key's order, as the game numbers backpacks. */
const byKey = (blobs: Record<string, RawNbt> = {}) =>
  Object.entries(blobs)
    .toSorted(([a], [b]) => Number(a) - Number(b))
    .map(([, blob]) => blob);

/** Every inventory as the game pages it, and the sacks. */
export function getInventories(member: RawMember, items: ItemsResource): InventoriesSection | null {
  const inventory = member.inventory;
  if (!inventory?.inv_contents) return null;

  // The hotbar comes first in the blob and last on screen
  const main = decodeSlots(inventory.inv_contents);
  const pages: InventoriesSection["pages"] = { inventory: [[...main.slice(9), ...main.slice(0, 9)]] };

  if (inventory.ender_chest_contents) pages.enderChest = paged(decodeSlots(inventory.ender_chest_contents));
  pages.backpacks = byKey(inventory.backpack_contents).map(decodeSlots);
  if (inventory.personal_vault_contents) pages.personalVault = [decodeSlots(inventory.personal_vault_contents)];

  for (const [id, bag] of Object.entries(BAGS) as [keyof typeof BAGS, (typeof BAGS)[keyof typeof BAGS]][]) {
    const blob = inventory.bag_contents?.[bag];
    if (blob) pages[id] = paged(decodeSlots(blob));
  }

  const sacks = Object.entries(inventory.sacks_counts ?? {})
    .filter(([, count]) => count > 0)
    .map(([id, count]) => {
      const resource = items.items[id];
      return {
        id,
        name: resource?.name ?? prettify(id),
        count,
        rarity: resource?.tier,
        glint: resource?.glowing ?? false,
        texture: resource && resourceTexture(resource),
      };
    })
    .toSorted((a, b) => b.count - a.count);

  return {
    pages,
    backpackIcons: byKey(inventory.backpack_icons).map((blob) => decodeSlots(blob)[0] ?? null),
    sacks,
  };
}
