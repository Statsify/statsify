/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  ACCESSORY_UPGRADES,
  ATTRIBUTE_SHARDS,
  IGNORED_ACCESSORIES,
  POWERS,
} from "#data";
import { add } from "@statsify/math";
import { prettify } from "@statsify/util";
import { decodeInventory } from "#nbt";
import { getAttributeLevel } from "./attributes.js";
import { getItemCost } from "#prices";
import { resourceTexture } from "#textures";
import { toItemView } from "#items";
import { toSkyBlockLevel } from "#leveling";
import {
  PLAYER_STATS,
  RARITIES,
  type AccessoriesSection,
  type InactiveAccessory,
  type ItemView,
  type ItemsResource,
  type MissingAccessory,
  type PlayerStat,
  type PowerStat,
  type PriceMap,
  type Rarity,
  type Slots,
  type Stats,
  type TierUnit,
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
  counted: Set<string>;
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

// The wiki's scaling of a Power's stats with accessory power.
const getPowerScale = (accessoryPower: number) =>
  29.97 * Math.log(0.0019 * accessoryPower + 1) ** 1.2;

function getPowerStats(
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

// Learned Powers' stats per unit of power scale, from the wiki's Powers page.
const LEARNED_POWERS: Record<string, Stats> = {
  fortuitous: {
    health: 3.35,
    defense: 1.2,
    strength: 4.8,
    crit_chance: 4.35,
    crit_damage: 4.8,
  },
  pretty: {
    health: 1.65,
    defense: 1.2,
    speed: 0.65,
    strength: 4.8,
    intelligence: 10.8,
    crit_chance: 0.475,
    crit_damage: 1.2,
  },
  protected: {
    health: 11.75,
    defense: 10.8,
    strength: 2.4,
    crit_chance: 0.475,
    crit_damage: 1.2,
  },
  simple: {
    health: 5.02,
    defense: 3.6,
    speed: 1.2,
    strength: 3.6,
    intelligence: 5.4,
    crit_chance: 1.45,
    crit_damage: 3.6,
  },
  warrior: {
    health: 3.35,
    defense: 1.2,
    strength: 8.4,
    crit_chance: 2.4,
    crit_damage: 6,
  },
  commando: {
    health: 5.02,
    defense: 2.4,
    strength: 8.4,
    crit_chance: 0.475,
    crit_damage: 8.4,
  },
  disciplined: {
    health: 5.02,
    defense: 2.4,
    strength: 7.2,
    crit_chance: 1.45,
    crit_damage: 7.2,
  },
  inspired: {
    health: 1.65,
    defense: 1.2,
    strength: 4.8,
    intelligence: 16.2,
    crit_chance: 0.95,
    crit_damage: 3.6,
  },
  ominous: {
    health: 5.02,
    speed: 0.95,
    strength: 3.6,
    intelligence: 6.1,
    crit_chance: 1.45,
    crit_damage: 3.6,
    attack_speed: 0.9,
  },
  prepared: {
    health: 12.4,
    defense: 11.3,
    strength: 1.95,
    crit_chance: 0.4,
    crit_damage: 0.95,
  },
};

const getLearnedPowerStats = (perUnit: Stats, accessoryPower: number) =>
  PLAYER_STATS.filter(({ id }) => perUnit[id] !== undefined).map(
    ({ id, color }): PowerStat => ({
      name: prettify(id),
      color,
      value: perUnit[id]! * getPowerScale(accessoryPower),
    }),
  );

export function getSelectedPowerStats(
  power: string | undefined,
  accessoryPower: number,
): PowerStat[] | undefined {
  if (!power) return undefined;

  const stone = POWERS[power];
  if (stone) return getPowerStats(stone, accessoryPower);

  const learned = LEARNED_POWERS[power];
  return learned && getLearnedPowerStats(learned, accessoryPower);
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

  return { accessoryPower, active, inactive, owned, counted, contacts };
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
            isPreferredVariant(upgrade, id, storedPower),
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

const countPerfectGems = ({ gems }: ItemView) =>
  gems?.filter(({ quality }) => quality === "PERFECT").length ?? 0;

interface InPlaceUpgrade {
  unit: TierUnit;
  tiers: Partial<Record<Rarity, number>>; // before a recombobulator
  getProgress: (view: ItemView, member: RawMember) => number;
  recombobulates?: boolean; // the others drop back when recombobulated
}

// An item has no counter until its first use, so a missing one is at 0.
const IN_PLACE_UPGRADES: Record<string, InPlaceUpgrade> = {
  BOOK_OF_PROGRESSION: {
    unit: "level",
    tiers: { UNCOMMON: 100, RARE: 200, EPIC: 300, LEGENDARY: 400, MYTHIC: 500 },
    getProgress: (_, member) =>
      toSkyBlockLevel(member.leveling?.experience ?? 0).level,
  },
  // The Codex follows the milestone claimed, which can lag the bestiary.
  BEASTSLAYERS_CODEX: {
    unit: "milestone",
    tiers: { UNCOMMON: 100, RARE: 150, EPIC: 200, LEGENDARY: 250, MYTHIC: 300 },
    getProgress: (_, member) =>
      member.bestiary?.milestone?.last_claimed_milestone ?? 0,
  },
  PULSE_RING: {
    unit: "charges",
    tiers: { RARE: 150_000, EPIC: 1_000_000, LEGENDARY: 5_000_000 },
    getProgress: ({ counters }) => counters?.thunder_charge ?? 0,
    recombobulates: true,
  },
  POWER_RELIC: {
    unit: "perfectGems",
    tiers: { LEGENDARY: 12 },
    getProgress: countPerfectGems,
    recombobulates: true,
  },
  RUNEBOOK: {
    unit: "runicKills",
    tiers: { UNCOMMON: 1, RARE: 10, EPIC: 100, LEGENDARY: 1000 },
    getProgress: ({ counters }) => counters?.runic_kills ?? 0,
  },
};

function getInPlaceSteps(
  { active, contacts }: Bag,
  member: RawMember,
  items: ItemsResource,
) {
  const steps: MissingAccessory[] = [];

  for (const view of active) {
    const upgrade = IN_PLACE_UPGRADES[view.id];
    const item = items.items[view.id];
    const texture = item && resourceTexture(item);
    if (!upgrade || !view.rarity || !texture) continue;

    const recombobulated = Number(
      Boolean(upgrade.recombobulates && view.recombobulated),
    );
    const base = RARITIES.indexOf(view.rarity) - recombobulated;
    const next = Object.entries(upgrade.tiers).find(
      ([tier]) => RARITIES.indexOf(tier as Rarity) > base,
    );
    if (!next) continue;

    const [tier, at] = next;
    const rarity = RARITIES[RARITIES.indexOf(tier as Rarity) + recombobulated];
    const power =
      getAccessoryPower(view.id, rarity, contacts) -
      getAccessoryPower(view.id, view.rarity, contacts);

    steps.push({
      id: view.id,
      name: item.name,
      rarity,
      accessoryPower: power,
      outsideBag: false,
      replaces: view.id,
      texture,
      nextTier: {
        unit: upgrade.unit,
        has: upgrade.getProgress(view, member),
        at,
      },
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

const TUNING_BOX = ATTRIBUTE_SHARDS.shards.find(
  ({ attribute }) => attribute === "tuning_box",
)!;

// Upgrades can link a chain's tiers and variants in any order.
function countChains(ids: string[]) {
  const roots = new Map(ids.map((id) => [id, id]));
  const getRoot = (id: string): string =>
    roots.get(id) === id ? id : getRoot(roots.get(id)!);

  for (const id of ids) {
    for (const upgrade of getUpgrades(id)) {
      if (roots.has(upgrade)) roots.set(getRoot(id), getRoot(upgrade));
    }
  }

  return new Set(ids.map(getRoot)).size;
}

// Nothing lists what Tuning Box I to IX give, so only 0 and X have a total.
function getTuningTotal(
  member: RawMember,
  accessoryPower: number,
  enrichments: number,
  spent: number,
) {
  const box = getAttributeLevel(TUNING_BOX, member);
  const maxBox = ATTRIBUTE_SHARDS.levels[TUNING_BOX.rarity].length;
  if (box > 0 && box < maxBox) return;

  const total =
    Math.floor(accessoryPower / 10) + enrichments + (box === 0 ? 0 : 13);
  return total < spent ? undefined : total;
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
  const steps = [
    ...getSteps(bag, member, items, market ? prices : undefined),
    ...getInPlaceSteps(bag, member, items),
  ].toSorted(
    (a, b) =>
      Number(b.outsideBag) - Number(a.outsideBag) ||
      (a.coinsPerAccessoryPower ?? Infinity) -
        (b.coinsPerAccessoryPower ?? Infinity) ||
      b.accessoryPower - a.accessoryPower ||
      a.name.localeCompare(b.name),
  );

  const storage = member.accessory_bag_storage;
  const tuning = storage?.tuning?.slot_0 ?? {};
  const tuningPoints = add(...Object.values(tuning));
  const enrichments = bag.active.filter((view) => view.enrichment).length;
  const listed = Object.keys(items.items).filter((id) =>
    isCandidate(id, items.items[id]),
  );

  return {
    accessoryPower: bag.accessoryPower,
    highestAccessoryPower: storage?.highest_magical_power,
    selectedPower: storage?.selected_power,
    powerStats: getSelectedPowerStats(
      storage?.selected_power,
      bag.accessoryPower,
    ),
    tuning,
    tuningPoints,
    tuningTotal: getTuningTotal(
      member,
      bag.accessoryPower,
      enrichments,
      tuningPoints,
    ),
    enrichments,
    unenriched: bag.active.filter(
      (view) =>
        !view.enrichment &&
        RARITIES.indexOf(view.rarity!) >= RARITIES.indexOf("LEGENDARY"),
    ).length,
    recombobulated: bag.active.filter((view) => view.recombobulated).length,
    unique: bag.counted.size,
    chains: countChains(listed),
    pricesAsOf: prices.asOf,
    market,
    active: bag.active,
    inactive: bag.inactive,
    missing: keepBestPerChain(steps),
  };
}

if (import.meta.vitest) {
  const { suite, it, expect } = import.meta.vitest;

  suite("countChains", () => {
    it("should join an accessory's tiers and variants however their upgrades link them", () => {
      const power = [
        "POWER_TALISMAN",
        "POWER_RING",
        "POWER_ARTIFACT",
        "POWER_RELIC",
      ];
      const dante = ["DANTE_TALISMAN", "DANTE_RING"];

      expect(countChains([])).toBe(0);
      expect(countChains(power)).toBe(1);
      expect(countChains(["POWER_TALISMAN", "POWER_RELIC"])).toBe(1);
      expect(countChains([...power, ...dante, "RUNEBOOK"])).toBe(3);
    });
  });
}
