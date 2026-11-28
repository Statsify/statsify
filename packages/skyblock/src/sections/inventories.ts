/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { arrayGroup } from "@statsify/util";
import { decodeAttributes } from "#nbt";
import { decodeSlots, toToolkitItemView } from "#items";
import { resourceItem } from "#textures";
import { setImmediate } from "node:timers/promises";
import type { InventoriesSection, InventoryId, ItemsResource } from "#types";
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

const toPages = <T>(slots: T[]) =>
  slots.length > 0 ? arrayGroup(slots, PAGE_SIZE) : [[]];

export const sortByKey = (blobs: Record<string, RawNbt> = {}) =>
  Object.entries(blobs)
    .toSorted(([a], [b]) => Number(a) - Number(b))
    .map(([, blob]) => blob);

// The hotbar comes first in the blob and last on screen.
const moveHotbarLast = <T>(slots: T[]) => [
  ...slots.slice(9),
  ...slots.slice(0, 9),
];

type GetTool<T> = (blob: RawNbt, held: boolean) => T | null;

// The used-up Hunting Toolkit item sits beside the tools, so it's skipped.
function getToolkitSlots<T>(toolkit: RawToolkit, getTool: GetTool<T>) {
  const slots: T[] = [];
  for (const [kind, tools] of Object.entries(toolkit)) {
    if (!Array.isArray(tools) || kind === "HUNTING_TOOLKIT") continue;

    for (const [slot, blob] of (tools as (RawNbt | null)[]).entries()) {
      // IN_USE marks a tool taken out of the toolkit into an inventory.
      const held =
        Boolean(toolkit.IS_UNLOCKED) && toolkit.IN_USE?.[kind]?.[slot] !== true;
      const tool = blob && getTool(blob, held);
      if (tool) slots.push(tool);
    }
  }
  return slots;
}

export async function getInventoryPages<T>(
  member: RawMember,
  getSlots: (blob: RawNbt) => (T | null)[],
  getTool: GetTool<T>,
) {
  const inventory = member.inventory;
  if (!inventory?.inv_contents) return null;

  // Each blob is a synchronous gunzip, so other requests run between them.
  const decode = async (blob: RawNbt) => {
    await setImmediate();
    return getSlots(blob);
  };

  const pages: Partial<Record<InventoryId, (T | null)[][]>> = {
    inventory: [moveHotbarLast(await decode(inventory.inv_contents))],
  };

  if (inventory.ender_chest_contents)
    pages.enderChest = toPages(await decode(inventory.ender_chest_contents));
  pages.backpacks = await Array.fromAsync(
    sortByKey(inventory.backpack_contents),
    decode,
  );
  if (inventory.personal_vault_contents)
    pages.personalVault = [await decode(inventory.personal_vault_contents)];

  for (const id of Object.keys(BAGS) as (keyof typeof BAGS)[]) {
    const blob = inventory.bag_contents?.[BAGS[id]];
    // oxlint-disable-next-line no-await-in-loop -- one bag per turn
    if (blob) pages[id] = toPages(await decode(blob));
  }

  const farming = member.garden_player_data?.farming_toolkit;
  if (farming) pages.farmingToolkit = [getToolkitSlots(farming, getTool)];
  const hunting = member.foraging?.hunting_toolkit;
  if (hunting) pages.huntingToolkit = [getToolkitSlots(hunting, getTool)];

  const rift = member.rift?.inventory;
  if (rift?.inv_contents)
    pages.riftInventory = [moveHotbarLast(await decode(rift.inv_contents))];
  if (rift?.ender_chest_contents)
    pages.riftEnderChest = toPages(await decode(rift.ender_chest_contents));

  return pages;
}

export async function getInventories(
  member: RawMember,
  items: ItemsResource,
): Promise<InventoriesSection | null> {
  const inventory = member.inventory;
  const pages = await getInventoryPages(member, decodeSlots, (blob) =>
    toToolkitItemView(decodeAttributes(blob), items),
  );
  if (!inventory || !pages) return null;

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
