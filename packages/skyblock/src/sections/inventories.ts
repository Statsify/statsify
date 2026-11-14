/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { arrayGroup, prettify } from "@statsify/util";
import { decodeSlots, toolkitItemView } from "#items";
import { resourceTexture } from "#textures";
import type { InventoriesSection, InventoryId, ItemsResource } from "#types";
import type { RawMember, RawNbt, RawToolkit } from "#raw";

/** The ender chest's page, and the size the bags are paged at. */
const PAGE = 45;

const BAGS = {
  accessoryBag: "talisman_bag",
  potionBag: "potion_bag",
  fishingBag: "fishing_bag",
  quiver: "quiver",
  sacksBag: "sacks_bag",
} as const satisfies Partial<Record<InventoryId, string>>;

const paged = <T>(slots: T[]) => (slots.length > 0 ? arrayGroup(slots, PAGE) : [[]]);

/** A map's blobs in their numeric key's order, as the game numbers backpacks. */
export const byKey = (blobs: Record<string, RawNbt> = {}) =>
  Object.entries(blobs)
    .toSorted(([a], [b]) => Number(a) - Number(b))
    .map(([, blob]) => blob);

/** The hotbar comes first in the blob and last on screen. */
const hotbarLast = <T>(slots: T[]) => [...slots.slice(9), ...slots.slice(0, 9)];

/**
 * A toolkit holds a tool unless it's taken out into an inventory or the toolkit isn't unlocked. IN_USE, IS_UNLOCKED and
 * HUNTING_TOOLKIT (used up to unlock the menu, the wiki's Hunting Toolkit page) aren't tools; an emptied slot is null.
 */
const toolkitPage = <T>(toolkit: RawToolkit, tool: (blob: RawNbt, held: boolean) => T | null): T[] => {
  const inUse = toolkit.IN_USE as Record<string, Record<string, boolean>> | undefined;
  const held = (kind: string, slot: number) => Boolean(toolkit.IS_UNLOCKED) && inUse?.[kind]?.[slot] !== true;
  return Object.entries(toolkit)
    .flatMap(([kind, tools]) =>
      Array.isArray(tools) && kind !== "HUNTING_TOOLKIT" ?
        (tools as (RawNbt | null)[]).map((blob, slot) => blob && tool(blob, held(kind, slot))) :
        []
    )
    .filter((item) => item !== null);
};

type Pages<T> = Partial<Record<InventoryId, (T | null)[][]>>;

/** Every inventory as the game pages it, each slot from `slots` and each toolkit tool from `tool`; a null tool is dropped. */
export function inventoryPages<T>(
  member: RawMember,
  slots: (blob: RawNbt) => (T | null)[],
  tool: (blob: RawNbt, held: boolean) => T | null
): Pages<T> | null {
  const inventory = member.inventory;
  if (!inventory?.inv_contents) return null;

  const pages: Pages<T> = { inventory: [hotbarLast(slots(inventory.inv_contents))] };

  if (inventory.ender_chest_contents) pages.enderChest = paged(slots(inventory.ender_chest_contents));
  pages.backpacks = byKey(inventory.backpack_contents).map(slots);
  if (inventory.personal_vault_contents) pages.personalVault = [slots(inventory.personal_vault_contents)];

  for (const id of Object.keys(BAGS) as (keyof typeof BAGS)[]) {
    const blob = inventory.bag_contents?.[BAGS[id]];
    if (blob) pages[id] = paged(slots(blob));
  }

  const farming = member.garden_player_data?.farming_toolkit;
  if (farming) pages.farmingToolkit = [toolkitPage(farming, tool)];
  const hunting = member.foraging?.hunting_toolkit;
  if (hunting) pages.huntingToolkit = [toolkitPage(hunting, tool)];

  const rift = member.rift?.inventory;
  if (rift?.inv_contents) pages.riftInventory = [hotbarLast(slots(rift.inv_contents))];
  if (rift?.ender_chest_contents) pages.riftEnderChest = paged(slots(rift.ender_chest_contents));

  return pages;
}

/** Every inventory as the game pages it, and the sacks. */
export function getInventories(member: RawMember, items: ItemsResource): InventoriesSection | null {
  const inventory = member.inventory;
  const pages = inventoryPages(member, decodeSlots, (blob) => toolkitItemView(blob, items));
  if (!inventory || !pages) return null;

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
