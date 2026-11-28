/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { arrayGroup } from "@statsify/util";
import { decodeSlots, toToolkitItemView } from "#items";
import { resourceItem } from "#textures";
import type {
  InventoriesSection,
  InventoryId,
  ItemView,
  ItemsResource,
  Slots,
} from "#types";
import type { RawMember, RawNbt, RawToolkit } from "#raw";

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

export const sortByKey = (blobs: Record<string, RawNbt> = {}) =>
  Object.entries(blobs)
    .toSorted(([a], [b]) => Number(a) - Number(b))
    .map(([, blob]) => blob);

// The hotbar comes first in the blob and last on screen.
const moveHotbarLast = (slots: Slots) => [
  ...slots.slice(9),
  ...slots.slice(0, 9),
];

// The used-up Hunting Toolkit item sits beside the tools, so it's skipped.
function getToolkitSlots(toolkit: RawToolkit, items: ItemsResource) {
  const slots: ItemView[] = [];
  for (const [kind, tools] of Object.entries(toolkit)) {
    if (!Array.isArray(tools) || kind === "HUNTING_TOOLKIT") continue;

    for (const blob of tools as (RawNbt | null)[]) {
      const view = blob && toToolkitItemView(blob, items);
      if (view) slots.push(view);
    }
  }
  return slots;
}

export function getInventories(
  member: RawMember,
  items: ItemsResource,
): InventoriesSection | null {
  const inventory = member.inventory;
  if (!inventory?.inv_contents) return null;

  const pages: InventoriesSection["pages"] = {
    inventory: [moveHotbarLast(decodeSlots(inventory.inv_contents))],
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

  const farming = member.garden_player_data?.farming_toolkit;
  if (farming) pages.farmingToolkit = [getToolkitSlots(farming, items)];
  const hunting = member.foraging?.hunting_toolkit;
  if (hunting) pages.huntingToolkit = [getToolkitSlots(hunting, items)];

  const rift = member.rift?.inventory;
  if (rift?.inv_contents)
    pages.riftInventory = [moveHotbarLast(decodeSlots(rift.inv_contents))];
  if (rift?.ender_chest_contents)
    pages.riftEnderChest = toPages(decodeSlots(rift.ender_chest_contents));

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
