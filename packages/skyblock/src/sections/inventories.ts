/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { arrayGroup } from "@statsify/util";
import { decodeSlots } from "#items";
import { resourceItem } from "#textures";
import type {
  InventoriesSection,
  InventoryId,
  ItemsResource,
  Slots,
} from "#types";
import type { RawMember, RawNbt } from "#raw";

// The bags are paged at the size of an ender chest page.
const PAGE_SIZE = 45;

const BAGS = {
  accessoryBag: "talisman_bag",
  potionBag: "potion_bag",
  fishingBag: "fishing_bag",
  quiver: "quiver",
  sacksBag: "sacks_bag",
} as const satisfies Partial<Record<InventoryId, string>>;

const toPages = (slots: Slots) =>
  slots.length > 0 ? arrayGroup(slots, PAGE_SIZE) : [[]];

const sortByKey = (blobs: Record<string, RawNbt> = {}) =>
  Object.entries(blobs)
    .toSorted(([a], [b]) => Number(a) - Number(b))
    .map(([, blob]) => blob);

export function getInventories(
  member: RawMember,
  items: ItemsResource,
): InventoriesSection | null {
  const inventory = member.inventory;
  if (!inventory?.inv_contents) return null;

  // The hotbar comes first in the blob and last on screen.
  const main = decodeSlots(inventory.inv_contents);
  const pages: InventoriesSection["pages"] = {
    inventory: [[...main.slice(9), ...main.slice(0, 9)]],
  };

  if (inventory.ender_chest_contents)
    pages.enderChest = toPages(decodeSlots(inventory.ender_chest_contents));
  pages.backpacks = sortByKey(inventory.backpack_contents).map(decodeSlots);
  if (inventory.personal_vault_contents)
    pages.personalVault = [decodeSlots(inventory.personal_vault_contents)];

  for (const id of Object.keys(BAGS) as (keyof typeof BAGS)[]) {
    const blob = inventory.bag_contents?.[BAGS[id]];
    if (blob) pages[id] = toPages(decodeSlots(blob));
  }

  const sacks = Object.entries(inventory.sacks_counts ?? {})
    .filter(([, count]) => count > 0)
    .map(([id, count]) => {
      const resource = items.items[id];
      return {
        id,
        ...resourceItem(items, id),
        count,
        rarity: resource?.tier,
        glint: resource?.glowing ?? false,
      };
    })
    .toSorted((a, b) => b.count - a.count);

  return {
    pages,
    backpackIcons: sortByKey(inventory.backpack_icons).map(
      (blob) => decodeSlots(blob)[0] ?? null,
    ),
    sacks,
  };
}
