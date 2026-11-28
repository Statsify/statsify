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
import type {
  AccessoriesSection,
  ItemView,
  ItemsResource,
  MissingAccessory,
  PriceMap,
  Rarity,
} from "#types";
import type { RawMember } from "#raw";

const ACCESSORY_POWER: Partial<Record<Rarity, number>> = {
  COMMON: 3,
  UNCOMMON: 5,
  RARE: 8,
  EPIC: 12,
  LEGENDARY: 16,
  MYTHIC: 22,
};

// Some old hats aren't in the items resource, so their rarity marks them.
const isFormerAccessory = ({ id, rarity }: ItemView, items: ItemsResource) => {
  const category = items.items[id]?.category;
  return (
    rarity === "SPECIAL" ||
    rarity === "VERY_SPECIAL" ||
    (category !== undefined && category !== "ACCESSORY")
  );
};

const getUpgrades = (id: string) => ACCESSORY_UPGRADES[id] ?? [];

// Variants list each other, while a higher tier doesn't list its lower one.
const isVariant = (a: string, b: string) => getUpgrades(b).includes(a);

// Of two variants, the one with more accessory power counts, then the first id.
const isPreferredVariant = (
  variant: string,
  id: string,
  power: (id: string) => number,
) =>
  power(variant) > power(id) || (power(variant) === power(id) && variant < id);

function getAccessoryPower(
  id: string,
  rarity: Rarity | undefined,
  contacts: number,
) {
  const power = (rarity && ACCESSORY_POWER[rarity]) ?? 0;
  if (id === "HEGEMONY_ARTIFACT") return power * 2;
  if (id === "ABICASE") return power + Math.floor(contacts / 2);
  return power;
}

// Rift-only and ignored accessories can't go in the bag.
const isCandidate = (id: string, item: ItemsResource["items"][string]) =>
  item.category === "ACCESSORY" &&
  !item.riftOnly &&
  !IGNORED_ACCESSORIES.has(id);

function getStoredAccessories(member: RawMember, items: ItemsResource) {
  const {
    inv_contents,
    ender_chest_contents,
    personal_vault_contents,
    backpack_contents,
  } = member.inventory ?? {};
  const blobs = [
    inv_contents,
    ender_chest_contents,
    personal_vault_contents,
    ...Object.values(backpack_contents ?? {}),
  ];

  const stored: ItemView[] = [];
  for (const blob of blobs) {
    if (!blob) continue;

    for (const item of decodeInventory(blob)) {
      const id = item?.tag?.ExtraAttributes?.id;
      if (!item || id === undefined) continue;

      const resource = items.items[id];
      if (resource && isCandidate(id, resource)) stored.push(toItemView(item));
    }
  }

  return stored;
}

export function getAccessories(
  member: RawMember,
  items: ItemsResource,
  prices: PriceMap,
): AccessoriesSection | null {
  const bag = member.inventory?.bag_contents?.talisman_bag;
  if (!bag) return null;

  const contacts =
    member.nether_island_player_data?.abiphone?.active_contacts?.length ?? 0;
  const power = ({ id, rarity }: { id: string; rarity?: Rarity }) =>
    getAccessoryPower(id, rarity, contacts);

  const views = decodeInventory(bag)
    .filter((item) => item !== null)
    .map(toItemView)
    .filter((view) => !isFormerAccessory(view, items))
    .toSorted((a, b) => power(b) - power(a));

  const prism = member.rift?.access?.consumed_prism ? ["RIFT_PRISM"] : [];
  const owned = new Set([...prism, ...views.map(({ id }) => id)]);
  const counted = new Set(prism);
  const active: ItemView[] = [];
  const inactive: ItemView[] = [];

  // Only the best tier of each chain counts, and one of two variants.
  for (const view of views) {
    const replaced =
      counted.has(view.id) ||
      getUpgrades(view.id).some(
        (id) => counted.has(id) || (owned.has(id) && !isVariant(view.id, id)),
      );

    if (replaced) {
      inactive.push(view);
    } else {
      active.push(view);
      counted.add(view.id);
    }
  }

  const storage = member.accessory_bag_storage;
  const stored = getStoredAccessories(member, items);

  return {
    // A consumed Rift Prism comes back to the bag as a Rare.
    accessoryPower: add(
      ...active.map(power),
      prism.length * getAccessoryPower("RIFT_PRISM", "RARE", 0),
    ),
    highestAccessoryPower: storage?.highest_magical_power,
    selectedPower: storage?.selected_power,
    tuning: storage?.tuning?.slot_0 ?? {},
    pricesAsOf: prices.asOf,
    active,
    inactive,
    missing: getMissing(owned, stored, active, contacts, items, prices),
  };
}

function getMissing(
  owned: Set<string>,
  stored: ItemView[],
  active: ItemView[],
  contacts: number,
  items: ItemsResource,
  prices: PriceMap,
) {
  const bestStored = new Map<string, ItemView>();
  for (const view of stored) {
    const kept = bestStored.get(view.id);
    const power = getAccessoryPower(view.id, view.rarity, contacts);
    if (!kept || power > getAccessoryPower(kept.id, kept.rarity, contacts)) {
      bestStored.set(view.id, view);
    }
  }

  const storedPower = (id: string) =>
    getAccessoryPower(id, bestStored.get(id)?.rarity, contacts);
  const outsideBag = new Map(
    [...bestStored].filter(
      ([id]) =>
        !getUpgrades(id).some(
          (upgrade) =>
            bestStored.has(upgrade) &&
            isVariant(id, upgrade) &&
            isPreferredVariant(upgrade, id, storedPower),
        ),
    ),
  );

  const unowned = new Map(
    Object.entries(items.items).filter(
      ([id, item]) =>
        item.tier !== undefined &&
        isCandidate(id, item) &&
        !owned.has(id) &&
        !getUpgrades(id).some(
          (upgrade) => owned.has(upgrade) || outsideBag.has(upgrade),
        ),
    ),
  );

  const power = (id: string) =>
    getAccessoryPower(
      id,
      outsideBag.get(id)?.rarity ?? unowned.get(id)?.tier,
      contacts,
    );

  // A chain offers its top unowned tier, and any tier kept outside the bag.
  const supersedes = (upgrade: string, id: string) =>
    !outsideBag.has(id) &&
    unowned.has(upgrade) &&
    (!isVariant(id, upgrade) || isPreferredVariant(upgrade, id, power));

  const missing: MissingAccessory[] = [];
  for (const [id, item] of unowned) {
    if (getUpgrades(id).some((upgrade) => supersedes(upgrade, id))) continue;

    const texture = resourceTexture(item);
    if (!texture || !item.tier) continue;

    let replaces: { id: string; power: number } | undefined;
    for (const view of active) {
      if (!getUpgrades(view.id).includes(id)) continue;

      const viewPower = getAccessoryPower(view.id, view.rarity, contacts);
      if (!replaces || viewPower > replaces.power) {
        replaces = { id: view.id, power: viewPower };
      }
    }

    // A recombobulated lower tier can be worth as much as the next one up.
    const gain = power(id) - (replaces?.power ?? 0);
    if (gain <= 0) continue;

    const view = outsideBag.get(id);
    missing.push({
      id,
      name: item.name,
      rarity: view?.rarity ?? item.tier,
      accessoryPower: gain,
      outsideBag: view !== undefined,
      price: view ? undefined : prices.entries[id],
      replaces: replaces?.id,
      texture,
    });
  }

  // Outside the bag first, since those cost nothing.
  return missing.toSorted(
    (a, b) =>
      Number(b.outsideBag) - Number(a.outsideBag) ||
      b.accessoryPower - a.accessoryPower ||
      a.name.localeCompare(b.name),
  );
}
