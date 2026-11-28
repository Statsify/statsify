/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ACCESSORY_UPGRADES, IGNORED_ACCESSORIES, POWERS } from "#data";
import { add } from "@statsify/math";
import { decodeInventory } from "#nbt";
import { getItemCost } from "#prices";
import { resourceTexture } from "#textures";
import { toItemView } from "#items";
import {
  RARITIES,
  type AccessoriesSection,
  type InactiveAccessory,
  type ItemView,
  type ItemsResource,
  type MissingAccessory,
  type PlayerStat,
  type PriceMap,
  type Rarity,
  type Slots,
} from "#types";
import type { RawMember } from "#raw";

export const TUNING: Record<string, [PlayerStat, number]> = {
  health: ["health", 5],
  defense: ["defense", 1],
  walk_speed: ["speed", 1.5],
  strength: ["strength", 1],
  critical_damage: ["crit_damage", 1],
  critical_chance: ["crit_chance", 0.2],
  attack_speed: ["attack_speed", 0.3],
  intelligence: ["intelligence", 2],
};

const ACCESSORY_POWER: Partial<Record<Rarity, number>> = {
  COMMON: 3,
  UNCOMMON: 5,
  RARE: 8,
  EPIC: 12,
  LEGENDARY: 16,
  MYTHIC: 22,
};

interface Bag {
  accessoryPower: number;
  active: ItemView[];
  inactive: InactiveAccessory[];
  owned: Set<string>;
  contacts: number;
}

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
const outranks = (variant: string, id: string, power: (id: string) => number) =>
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

// The wiki's scaling of a Power's stats with accessory power.
export const getPowerScale = (accessoryPower: number) =>
  29.97 * Math.log(0.0019 * accessoryPower + 1) ** 1.2;

export function getPowerStats(
  { accessoryPower: listedAt, stats, bonus }: (typeof POWERS)[string],
  accessoryPower: number,
) {
  const scale = getPowerScale(accessoryPower);
  const listedScale = getPowerScale(listedAt);
  const scaled = stats.map((stat) => ({
    ...stat,
    value: (stat.value * scale) / listedScale,
  }));

  for (const extra of bonus) {
    const stat = scaled.find(({ name }) => name === extra.name);
    if (stat) stat.value = add(stat.value, extra.value);
    else scaled.push({ ...extra });
  }

  return scaled;
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

export function readBag(member: RawMember, items: ItemsResource): Bag | null {
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
  const inactive: InactiveAccessory[] = [];

  // Only the best tier of each chain counts, and one of two variants.
  for (const view of views) {
    const upgrades = getUpgrades(view.id);
    const replacedBy =
      upgrades.find((id) => counted.has(id)) ??
      upgrades.find((id) => owned.has(id) && !isVariant(view.id, id));

    if (counted.has(view.id)) {
      inactive.push({ ...view, reason: "duplicate" });
    } else if (replacedBy) {
      const replacement = items.items[replacedBy];
      if (!replacement) continue;

      inactive.push({
        ...view,
        reason: "replaced",
        replacedBy: { id: replacedBy, name: replacement.name },
      });
    } else {
      active.push(view);
      counted.add(view.id);
    }
  }

  // A consumed Rift Prism comes back to the bag as a Rare.
  const accessoryPower = add(
    ...active.map(power),
    prism.length * getAccessoryPower("RIFT_PRISM", "RARE", 0),
  );

  return { accessoryPower, active, inactive, owned, contacts };
}

// An accessory in the inventory gives its stats but no accessory power.
export function getHeldAccessories(
  inventory: Slots,
  items: ItemsResource,
  owned: Set<string>,
) {
  const held = new Map<string, ItemView>();

  for (const view of inventory) {
    if (!view || held.has(view.id) || owned.has(view.id)) continue;

    const resource = items.items[view.id];
    if (resource && isCandidate(view.id, resource)) held.set(view.id, view);
  }

  return [...held.values()];
}

// Of two variants that replace each other, the first one listed counts.
export function getHighestTiers(accessories: ItemView[]) {
  const indexes = new Map(accessories.map(({ id }, index) => [id, index]));

  return accessories.filter(
    ({ id }, index) =>
      !getUpgrades(id).some(
        (upgrade) =>
          indexes.has(upgrade) &&
          (!isVariant(id, upgrade) || indexes.get(upgrade)! < index),
      ),
  );
}

// Every unowned tier above the bag's best in a chain is a step.
function getSteps(
  { active, owned, contacts }: Bag,
  member: RawMember,
  items: ItemsResource,
  prices: PriceMap | undefined,
) {
  const bestStored = new Map<string, ItemView>();
  for (const view of getStoredAccessories(member, items)) {
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
            outranks(upgrade, id, storedPower),
        ),
    ),
  );

  const steps: MissingAccessory[] = [];
  for (const [id, item] of Object.entries(items.items)) {
    if (!item.tier || !isCandidate(id, item) || owned.has(id)) continue;

    const upgrades = getUpgrades(id);
    if (upgrades.some((upgrade) => owned.has(upgrade))) continue;
    if (upgrades.some((upgrade) => outsideBag.has(upgrade))) continue;

    let replaces: { id: string; power: number } | undefined;
    for (const view of active) {
      if (!getUpgrades(view.id).includes(id)) continue;

      const viewPower = getAccessoryPower(view.id, view.rarity, contacts);
      if (!replaces || viewPower > replaces.power) {
        replaces = { id: view.id, power: viewPower };
      }
    }

    const view = outsideBag.get(id);
    const rarity = view?.rarity ?? item.tier;
    // A recombobulated lower tier can be worth as much as the next one up.
    const gain =
      getAccessoryPower(id, rarity, contacts) - (replaces?.power ?? 0);
    const texture = resourceTexture(item);
    if (gain <= 0 || !texture) continue;

    const cost = view ? undefined : getItemCost(prices?.entries[id]);
    steps.push({
      id,
      name: item.name,
      rarity,
      accessoryPower: gain,
      outsideBag: view !== undefined,
      cost,
      coinsPerAccessoryPower: cost && cost.coins / gain,
      replaces: replaces?.id,
      texture,
    });
  }

  return steps;
}

// A tier lists every tier above it, so a chain's first step is its best.
export function keepBestPerChain<T extends { id: string }>(sorted: T[]) {
  const best: T[] = [];
  for (const step of sorted) {
    const sameChain = best.some(
      ({ id }) =>
        getUpgrades(id).includes(step.id) || getUpgrades(step.id).includes(id),
    );
    if (!sameChain) best.push(step);
  }

  return best;
}

// Without a market, nothing has a cost.
export function getAccessorySteps(
  member: RawMember,
  items: ItemsResource,
  prices: PriceMap,
  market: boolean,
) {
  const bag = readBag(member, items);
  if (!bag) return null;

  return {
    accessoryPower: bag.accessoryPower,
    highestAccessoryPower: member.accessory_bag_storage?.highest_magical_power,
    steps: getSteps(bag, member, items, market ? prices : undefined),
  };
}

export function getAccessories(
  member: RawMember,
  items: ItemsResource,
  prices: PriceMap,
  market: boolean,
): AccessoriesSection | null {
  const bag = readBag(member, items);
  if (!bag) return null;

  // Outside the bag first, since those cost nothing.
  const steps = getSteps(
    bag,
    member,
    items,
    market ? prices : undefined,
  ).toSorted(
    (a, b) =>
      Number(b.outsideBag) - Number(a.outsideBag) ||
      (a.coinsPerAccessoryPower ?? Infinity) -
        (b.coinsPerAccessoryPower ?? Infinity) ||
      b.accessoryPower - a.accessoryPower ||
      a.name.localeCompare(b.name),
  );

  const storage = member.accessory_bag_storage;
  const tuning = storage?.tuning?.slot_0 ?? {};
  const stone = storage?.selected_power
    ? POWERS[storage.selected_power]
    : undefined;

  return {
    accessoryPower: bag.accessoryPower,
    highestAccessoryPower: storage?.highest_magical_power,
    selectedPower: storage?.selected_power,
    powerStats: stone && getPowerStats(stone, bag.accessoryPower),
    tuning,
    tuningPoints: add(...Object.values(tuning)),
    enrichments: bag.active.filter((view) => view.enrichment).length,
    unenriched: bag.active.filter(
      (view) =>
        !view.enrichment &&
        RARITIES.indexOf(view.rarity!) >= RARITIES.indexOf("LEGENDARY"),
    ).length,
    recombobulated: bag.active.filter((view) => view.recombobulated).length,
    pricesAsOf: prices.asOf,
    market,
    active: bag.active,
    inactive: bag.inactive,
    missing: keepBestPerChain(steps),
  };
}
