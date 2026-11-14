/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ACCESSORY_UPGRADES, IGNORED_ACCESSORIES } from "#data";
import { add } from "@statsify/math";
import { decodeInventory } from "#nbt";
import { resourceTexture } from "#textures";
import { toItemView } from "#items";
import type { AccessoriesSection, ItemView, ItemsResource, MissingAccessory, PriceMap, Rarity } from "#types";
import type { RawMember } from "#raw";

const ACCESSORY_POWER: Partial<Record<Rarity, number>> = {
  COMMON: 3,
  UNCOMMON: 5,
  RARE: 8,
  EPIC: 12,
  LEGENDARY: 16,
  MYTHIC: 22,
  SPECIAL: 3,
  VERY_SPECIAL: 5,
};

const upgradesOf = (id: string) => ACCESSORY_UPGRADES[id] ?? [];

/** Variants that replace each other (party hats) list each other; a higher tier doesn't list its lower one. */
const isMutual = (a: string, b: string) => upgradesOf(b).includes(a);

/** Of two party hats, the one with the most AP counts, then the first id. */
const outranks = (by: string, id: string, power: (id: string) => number) =>
  power(by) > power(id) || (power(by) === power(id) && by < id);

function powerOf(id: string, rarity: Rarity | undefined, contacts: number) {
  if (id === "RIFT_PRISM") return 11;
  const power = (rarity && ACCESSORY_POWER[rarity]) ?? 0;
  if (id === "HEGEMONY_ARTIFACT") return power * 2;
  return id === "ABICASE" ? power + Math.floor(contacts / 2) : power;
}

/** Rift-only accessories never go in the bag, and ignored ones can't be obtained any more. */
const isCandidate = (id: string, item: ItemsResource["items"][string]) =>
  item.category === "ACCESSORY" && !item.riftOnly && !IGNORED_ACCESSORIES.has(id);

/** Accessories in the inventory, ender chest, backpacks and vault: owned, but worth nothing until they're in the bag. */
function storedAccessories(member: RawMember, items: ItemsResource) {
  const { inv_contents, ender_chest_contents, personal_vault_contents, backpack_contents } = member.inventory ?? {};
  const blobs = [inv_contents, ender_chest_contents, personal_vault_contents, ...Object.values(backpack_contents ?? {})];

  return blobs.flatMap((blob) => (blob ? decodeInventory(blob) : [])).flatMap((item) => {
    const id = item?.tag?.ExtraAttributes?.id;
    if (!item || typeof id !== "string") return [];
    const resource = items.items[id];
    return resource && isCandidate(id, resource) ? [toItemView(item)] : [];
  });
}

/**
 * null when the inventory API is off. Only the best of each upgrade chain counts, one of each duplicate and one party
 * hat, and a consumed Rift Prism counts as one in the bag.
 */
export function getAccessories(
  member: RawMember,
  items: ItemsResource,
  prices: PriceMap
): AccessoriesSection | null {
  const bag = member.inventory?.bag_contents?.talisman_bag;
  if (!bag) return null;

  const contacts = member.nether_island_player_data?.abiphone?.active_contacts?.length ?? 0;
  const power = ({ id, rarity }: { id: string; rarity?: Rarity }) => powerOf(id, rarity, contacts);

  const views = decodeInventory(bag)
    .flatMap((item) => (item ? [toItemView(item)] : []))
    .toSorted((a, b) => power(b) - power(a));

  const prism = member.rift?.access?.consumed_prism ? ["RIFT_PRISM"] : [];
  const owned = new Set([...prism, ...views.map(({ id }) => id)]);
  const counted = new Set(prism);
  const active: ItemView[] = [];
  const inactive: ItemView[] = [];

  for (const view of views) {
    const replaced =
      counted.has(view.id) ||
      upgradesOf(view.id).some((id) => counted.has(id) || (owned.has(id) && !isMutual(view.id, id)));

    if (replaced) {
      inactive.push(view);
    } else {
      active.push(view);
      counted.add(view.id);
    }
  }

  const storage = member.accessory_bag_storage;

  return {
    accessoryPower: add(...active.map(power), prism.length * powerOf("RIFT_PRISM", undefined, 0)),
    highestAccessoryPower: storage?.highest_magical_power,
    selectedPower: storage?.selected_power,
    tuning: storage?.tuning?.slot_0 ?? {},
    pricesAsOf: prices.asOf,
    active,
    inactive,
    missing: getMissing(owned, storedAccessories(member, items), active, contacts, items, prices),
  };
}

function getMissing(
  owned: ReadonlySet<string>,
  stored: ItemView[],
  active: ItemView[],
  contacts: number,
  items: ItemsResource,
  prices: PriceMap
) {
  const byId = new Map<string, ItemView>();
  for (const view of stored) {
    const kept = byId.get(view.id);
    if (!kept || powerOf(view.id, view.rarity, contacts) > powerOf(kept.id, kept.rarity, contacts)) byId.set(view.id, view);
  }

  const storedPower = (id: string) => powerOf(id, byId.get(id)?.rarity, contacts);
  const outside = new Map(
    [...byId].filter(
      ([id]) => !upgradesOf(id).some((by) => byId.has(by) && isMutual(id, by) && outranks(by, id, storedPower))
    )
  );

  const open = new Map(
    Object.entries(items.items).filter(
      ([id, item]) =>
        item.tier !== undefined &&
        isCandidate(id, item) &&
        !owned.has(id) &&
        !upgradesOf(id).some((by) => owned.has(by) || outside.has(by))
    )
  );

  const power = (id: string) => powerOf(id, outside.get(id)?.rarity ?? open.get(id)?.tier, contacts);

  // Of the open ids in one chain, its top tier, and any kept outside the bag.
  const beats = (by: string, id: string) =>
    !outside.has(id) && open.has(by) && (!isMutual(id, by) || outranks(by, id, power));

  return [...open]
    .filter(([id]) => !upgradesOf(id).some((by) => beats(by, id)))
    .flatMap(([id, item]): MissingAccessory[] => {
      const texture = resourceTexture(item);
      if (!texture || !item.tier) return [];

      const replaces = active
        .filter((view) => upgradesOf(view.id).includes(id))
        .map((view) => ({ id: view.id, power: powerOf(view.id, view.rarity, contacts) }))
        .toSorted((a, b) => b.power - a.power)[0];

      // A recombobulated lower tier can be worth as much as the next one up.
      const gain = power(id) - (replaces?.power ?? 0);
      if (gain <= 0) return [];

      const view = outside.get(id);
      return [
        {
          id,
          name: item.name,
          rarity: view?.rarity ?? item.tier,
          accessoryPower: gain,
          outsideBag: view !== undefined,
          price: view ? undefined : prices.entries[id],
          replaces: replaces?.id,
          texture,
        },
      ];
    })
    // Outside the bag first, since those cost nothing
    .toSorted(
      (a, b) => Number(b.outsideBag) - Number(a.outsideBag) || b.accessoryPower - a.accessoryPower || a.name.localeCompare(b.name)
    );
}
