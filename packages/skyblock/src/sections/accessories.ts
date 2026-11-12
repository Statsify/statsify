/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ACCESSORY_UPGRADES, IGNORED_ACCESSORIES, POWERS } from "#data";
import { add } from "@statsify/math";
import { RARITIES } from "#types";
import { costOf } from "#prices";
import { decodeInventory } from "#nbt";
import { resourceTexture } from "#textures";
import { toItemView } from "#items";
import type {
  AccessoriesSection,
  InactiveAccessory,
  ItemView,
  ItemsResource,
  MissingAccessory,
  PlayerStat,
  PriceMap,
  Rarity,
} from "#types";
import type { RawMember } from "#raw";

// What a tuning point gives, by the API's tuning keys (wiki: each stat's page)
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
  SPECIAL: 3,
  VERY_SPECIAL: 5,
};

const upgradesOf = (id: string) => ACCESSORY_UPGRADES[id] ?? [];

// How a Power's stats scale with Accessory Power, per the wiki
export const powerScale = (accessoryPower: number) => 29.97 * Math.log(0.0019 * accessoryPower + 1) ** 1.2;

export function stonePowerStats({ accessoryPower: listedAt, stats, bonus }: (typeof POWERS)[string], accessoryPower: number) {
  const scaled = stats.map((stat) => ({ ...stat, value: (stat.value * powerScale(accessoryPower)) / powerScale(listedAt) }));

  for (const extra of bonus) {
    const stat = scaled.find(({ name }) => name === extra.name);
    if (stat) stat.value = add(stat.value, extra.value);
    else scaled.push({ ...extra });
  }

  return scaled;
}

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

/** Accessories in the inventory, ender chest, backpacks and vault: owned, but no accessory power until they're in the bag. */
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
 * Accessories in the inventory whose family isn't in the bag, one of each: they give their stats there too, but no
 * accessory power (the wiki's Accessories page, unverified).
 */
export function heldAccessories(member: RawMember, items: ItemsResource, owned: ReadonlySet<string>) {
  const inBag = (id: string) =>
    owned.has(id) || upgradesOf(id).some((by) => owned.has(by)) || [...owned].some((bagged) => upgradesOf(bagged).includes(id));
  const blob = member.inventory?.inv_contents;
  const held = new Map<string, ItemView>();

  for (const item of blob ? decodeInventory(blob) : []) {
    const id = item?.tag?.ExtraAttributes?.id;
    if (!item || typeof id !== "string" || held.has(id) || inBag(id)) continue;
    const resource = items.items[id];
    if (resource && isCandidate(id, resource)) held.set(id, toItemView(item));
  }

  return [...held.values()];
}

type StepOrder = (a: MissingAccessory, b: MissingAccessory) => number;

/**
 * null when the inventory API is off. Only the best of each upgrade chain counts, one of each duplicate and one party
 * hat, and a consumed Rift Prism counts as one in the bag. Each chain's missing step is the first in `order`.
 */
export function getAccessories(
  member: RawMember,
  items: ItemsResource,
  prices: PriceMap,
  market: boolean,
  order: (accessoryPower: number, highest: number | undefined) => StepOrder = () => byCoinsPerAccessoryPower
): AccessoriesSection | null {
  const bag = bagAccessories(member, items);
  if (!bag) return null;

  const { active, inactive, owned, contacts, accessoryPower } = bag;
  const storage = member.accessory_bag_storage;
  const tuning = storage?.tuning?.slot_0 ?? {};
  const stone = storage?.selected_power ? POWERS[storage.selected_power] : undefined;
  const stepOrder = order(accessoryPower, storage?.highest_magical_power);
  const stored = storedAccessories(member, items);

  return {
    accessoryPower,
    highestAccessoryPower: storage?.highest_magical_power,
    selectedPower: storage?.selected_power,
    powerStats: stone && stonePowerStats(stone, accessoryPower),
    tuning,
    tuningPoints: add(...Object.values(tuning)),
    enrichments: active.filter((view) => view.enrichment).length,
    unenriched: active.filter((view) => !view.enrichment && RARITIES.indexOf(view.rarity!) >= RARITIES.indexOf("LEGENDARY")).length,
    recombobulated: active.filter((view) => view.recombobulated).length,
    pricesAsOf: prices.asOf,
    market,
    active,
    inactive,
    missing: getMissing(owned, stored, active, contacts, items, stepOrder, market ? prices : undefined),
  };
}

/** The bag's accessories that count and those that don't, and their accessory power; null with the inventory API off. */
export function bagAccessories(member: RawMember, items: ItemsResource) {
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
  const inactive: InactiveAccessory[] = [];

  for (const view of views) {
    const upgrades = upgradesOf(view.id);
    const replacedBy =
      upgrades.find((id) => counted.has(id)) ?? upgrades.find((id) => owned.has(id) && !isMutual(view.id, id));

    if (counted.has(view.id)) {
      inactive.push({ ...view, reason: "duplicate" });
    } else if (replacedBy) {
      const by = items.items[replacedBy];
      if (by) inactive.push({ ...view, reason: "replaced", replacedBy: { id: replacedBy, name: by.name } });
    } else {
      active.push(view);
      counted.add(view.id);
    }
  }

  const accessoryPower = add(...active.map(power), prism.length * powerOf("RIFT_PRISM", undefined, 0));
  return { active, inactive, owned, contacts, accessoryPower };
}

/** Outside the bag first, since it costs nothing, then coins per point gained; unpriced ones sort last, by points. */
export const cheapestFirst =
  <T extends { outsideBag: boolean; name: string }>(coinsPer: (step: T) => number | undefined, gain: (step: T) => number) =>
  (a: T, b: T) =>
    Number(b.outsideBag) - Number(a.outsideBag) ||
    (coinsPer(a) ?? Infinity) - (coinsPer(b) ?? Infinity) ||
    gain(b) - gain(a) ||
    a.name.localeCompare(b.name);

const byCoinsPerAccessoryPower = cheapestFirst<MissingAccessory>(
  (step) => step.coinsPerAccessoryPower,
  (step) => step.accessoryPower
);

/**
 * Every tier above the bag's best in a chain is a step, worth its accessory power over that tier. Each chain (and the party
 * hats) keeps its first step in `order`. One the player keeps outside the bag is free, and nothing below it is offered.
 */
function getMissing(
  owned: ReadonlySet<string>,
  stored: ItemView[],
  active: ItemView[],
  contacts: number,
  items: ItemsResource,
  order: StepOrder,
  prices?: PriceMap
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

  const steps = Object.entries(items.items)
    .flatMap(([id, item]): MissingAccessory[] => {
      if (!item.tier || !isCandidate(id, item) || owned.has(id)) return [];
      if (upgradesOf(id).some((by) => owned.has(by) || outside.has(by))) return [];

      const replaces = active
        .filter((view) => upgradesOf(view.id).includes(id))
        .map((view) => ({ id: view.id, power: powerOf(view.id, view.rarity, contacts) }))
        .toSorted((a, b) => b.power - a.power)[0];

      const view = outside.get(id);
      // A recombobulated lower tier can be worth as much as the next one up.
      const gain = powerOf(id, view?.rarity ?? item.tier, contacts) - (replaces?.power ?? 0);
      const texture = resourceTexture(item);
      if (gain <= 0 || !texture) return [];

      const cost = view ? undefined : costOf(prices?.entries[id]);
      return [
        {
          id,
          name: item.name,
          rarity: view?.rarity ?? item.tier,
          accessoryPower: gain,
          outsideBag: view !== undefined,
          cost,
          coinsPerAccessoryPower: cost && cost.coins / gain,
          replaces: replaces?.id,
          texture,
        },
      ];
    })
    .toSorted(order);

  // A tier lists every tier above it as an upgrade, so the first step of each chain in that order is its best.
  const best: MissingAccessory[] = [];
  for (const step of steps) {
    if (!best.some(({ id }) => upgradesOf(id).includes(step.id) || upgradesOf(step.id).includes(id))) best.push(step);
  }

  return best;
}
