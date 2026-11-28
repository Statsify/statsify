/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { EQUIPMENT_PIECES } from "../sections/gear.js";
import {
  type Item,
  ItemNetworthCalculator,
  type Items,
  ProfileNetworthCalculator,
  parseItems,
  setItems,
} from "skyhelper-networth";
import { PET_STATS, getPetName } from "#data";
import {
  type InventoryValues,
  type ItemTexture,
  type ItemsResource,
  type MissingPet,
  type NetworthItem,
  type NetworthSection,
  type PriceMap,
  RARITIES,
  type Rarity,
} from "#types";
import { add } from "@statsify/math";
import { boostedRarity, getPetScorePoints } from "#leveling";
import { decodeAttributes, decodeInventory, decodeNestedInventory } from "#nbt";
import { describeKey, lookupKeys, petKey } from "#prices";
import { getInventoryPages, sortByKey } from "../sections/inventories.js";
import { getItemTexture, getPetTexture, resourceTexture } from "#textures";
import { hasMarket } from "../profiles.js";
import { normalizeItemText } from "#lore";
import { prettify } from "@statsify/util";
import { toToolkitItemView } from "#items";
import type {
  RawItem,
  RawItemsResource,
  RawMember,
  RawNbt,
  RawPet,
} from "#raw";
import {
  NETWORTH_SECTION,
  SECTIONS,
  type Section,
  type SkyBlockSection,
  VALUES_SECTION,
} from "../sections/index.js";

const TOP_ITEMS = 10;

// Every essence type draws Wither Essence's head.
const ESSENCE_HEAD =
  "c4db4adfa9bf48ff5d41707ae34ea78bd2371659fcd8cd8934749af4cce9b";

// Sacks and essence come back with neither item nor petData.
type Priced = Omit<Item, "item"> & { item?: RawItem; petData?: RawPet };

type Parsed = RawItem | RawPet | { id: string; amount: number };

let networthPrices:
  | { asOf: number; prices: Record<string, number> }
  | undefined;

// The library takes plain coins, so this builds them once per price map.
function toNetworthPrices(map: PriceMap): Record<string, number> {
  if (networthPrices?.asOf !== map.asOf) {
    const prices = Object.fromEntries(
      Object.entries(map.entries).map(([key, { coins }]) => [key, coins]),
    );
    networthPrices = { asOf: map.asOf, prices };
  }

  return networthPrices.prices;
}

function getPricedTexture(
  { id, item, petData }: Priced,
  items: ItemsResource,
): ItemTexture | undefined {
  // A toolkit's items are bare ExtraAttributes, with no id to draw.
  if (item?.id !== undefined) return getItemTexture(item);
  if (petData) {
    const rarity = boostedRarity(petData);
    return getPetTexture(petData.type, rarity, { skin: petData.skin, items });
  }

  if (id.startsWith("ESSENCE_")) return { kind: "head", skin: ESSENCE_HEAD };

  // Runes of one tier, like RUNE_LIGHTNING_1, have no items resource id.
  const rune = id.startsWith("RUNE_") ? items.items.RUNE : undefined;
  const resource = items.items[id] ?? rune;
  return resource && resourceTexture(resource);
}

// These replace an item's base price, so their entries repeat the new base.
const BASE_PRICE_TYPES = new Set([
  "SHENS_AUCTION",
  "ENCHANT",
  "CROWN_OF_AVARICE",
]);

function getModifiers(
  calculation: Item["calculation"] = [],
): NetworthItem["modifiers"] {
  const sums = new Map<string, number>();
  for (const { type, price } of calculation) {
    if (BASE_PRICE_TYPES.has(type) || type.includes("MIDAS_")) continue;
    sums.set(type, (sums.get(type) ?? 0) + price);
  }

  // Pet candy takes value off, so only kinds worth exactly 0 are dropped.
  return [...sums]
    .filter(([, price]) => price !== 0)
    .map(([type, price]) => ({ type, price }))
    .toSorted((a, b) => b.price - a.price);
}

const toNetworthItem = (
  priced: Priced,
  items: ItemsResource,
): NetworthItem => ({
  id: priced.id,
  name: normalizeItemText(priced.name),
  count: priced.count ?? 1,
  price: priced.price,
  soulbound: priced.soulbound,
  cosmetic: priced.cosmetic ?? false,
  texture: getPricedTexture(priced, items),
  basePrice: priced.basePrice,
  // A stack's base doesn't scale like its price, so only single items get them.
  modifiers: (priced.count ?? 1) > 1 ? [] : getModifiers(priced.calculation),
});

function getUnpriced(
  parsed: Items,
  map: PriceMap,
  items: ItemsResource,
): Pick<NetworthSection, "unpriced" | "unpricedCount"> {
  const counts = new Map<string, number>();
  let unpricedCount = 0;

  for (const counted of Object.values(parsed).flat() as Parsed[]) {
    const keys = "amount" in counted ? [counted.id] : lookupKeys(counted, map);
    const missing = keys.filter((key) => !map.entries[key]);
    if (missing.length > 0) unpricedCount++;
    for (const key of missing) counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const unpriced = [...counts]
    .toSorted((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([key, count]) => ({
      key,
      name: describeKey(key, items)?.name ?? prettify(key),
      count,
    }));

  return { unpriced, unpricedCount };
}

let networthItemsUpdated: number | undefined;

// Our patch stops the library fetching the items resource itself.
function setNetworthItems(resource: RawItemsResource) {
  if (networthItemsUpdated === resource.lastUpdated) return;
  setItems(resource.items);
  networthItemsUpdated = resource.lastUpdated;
}

// The price worker can't afford this library, so these stay out of SECTIONS.
const NETWORTH: Section<"networth"> = {
  needs: ["museum", "prices", "items"],
  async compute({ profile, member, museum, prices, items, rawItems }) {
    if (!prices || !items || !rawItems) {
      throw new TypeError("networth needs prices and items");
    }

    setNetworthItems(rawItems);

    const parsed = (await parseItems(member, museum ?? {})) as Items;
    const calculator = ProfileNetworthCalculator.fromPreParsed(
      member,
      parsed,
      profile.banking?.balance ?? 0,
    );
    const options = { prices: toNetworthPrices(prices), includeItemData: true };
    const [total, nonCosmetic] = await Promise.all([
      calculator.getNetworth(options),
      calculator.getNonCosmeticNetworth(options),
    ]);

    return {
      total: total.networth,
      unsoulbound: total.unsoulboundNetworth,
      purse: total.purse,
      bank: total.bank,
      personalBank: total.personalBank,
      coins: add(total.purse, total.bank, total.personalBank),
      nonCosmetic: {
        total: nonCosmetic.networth,
        unsoulbound: nonCosmetic.unsoulboundNetworth,
      },
      noInventory: total.noInventory,
      museumIncluded: museum !== undefined,
      pricesAsOf: prices.asOf,
      categories: Object.fromEntries(
        Object.entries(total.types).map(([name, category]) => [
          name,
          {
            total: category.total,
            unsoulbound: category.unsoulboundTotal,
            top: ((category.items ?? []) as Priced[])
              .slice(0, TOP_ITEMS)
              .map((priced) => toNetworthItem(priced, items)),
          },
        ]),
      ),
      petPrices: Object.fromEntries(
        ((total.types.pets?.items ?? []) as Priced[])
          .filter(({ petData }) => petData?.uuid)
          .map(({ petData, price }) => [petData!.uuid, price]),
      ),
      ...getUnpriced(parsed, prices, items),
    };
  },
};

function getCheapestRarity(
  type: string,
  rarities: (typeof PET_STATS)[string],
  map: PriceMap,
) {
  let cheapest: { rarity: Rarity; price: number } | undefined;
  for (const rarity of Object.keys(rarities) as Rarity[]) {
    const entry = map.entries[petKey({ tier: rarity, type }, 1)];
    if (getPetScorePoints(rarity) === 0 || !entry) continue;
    if (!cheapest || entry.coins < cheapest.price) {
      cheapest = { rarity, price: entry.coins };
    }
  }
  return cheapest;
}

function getMissingPets(
  member: RawMember,
  map: PriceMap,
  items: ItemsResource,
  market: boolean,
): MissingPet[] {
  const owned = new Set(member.pets_data?.pets?.map(({ type }) => type));
  const missing = Object.entries(PET_STATS).filter(
    ([type]) => !owned.has(type),
  );

  const toMissingPet = (
    type: string,
    rarity: Rarity,
    price?: number,
  ): MissingPet => ({
    type,
    name: getPetName(type),
    rarity,
    price,
    points: getPetScorePoints(rarity),
    texture: getPetTexture(type, rarity, { items }),
  });

  if (!market) {
    const pets: MissingPet[] = [];
    for (const [type, rarities] of missing) {
      const rarity = RARITIES.find(
        (rarity) => rarity in rarities && getPetScorePoints(rarity) > 0,
      );
      if (rarity) pets.push(toMissingPet(type, rarity));
    }
    return pets.toSorted((a, b) => a.name.localeCompare(b.name));
  }

  const priced: { type: string; rarity: Rarity; price: number }[] = [];
  for (const [type, rarities] of missing) {
    const cheapest = getCheapestRarity(type, rarities, map);
    if (cheapest) priced.push({ type, ...cheapest });
  }

  return priced
    .toSorted((a, b) => a.price - b.price)
    .map(({ type, rarity, price }) => toMissingPet(type, rarity, price));
}

// The library prices a toolkit's tool as an item named from the resource.
function toToolkitItem(blob: RawNbt, items: ItemsResource): RawItem | null {
  const attributes = decodeAttributes(blob);
  const view = toToolkitItemView(attributes, items);
  if (!view) return null;

  return {
    id: 0,
    Count: 1,
    Damage: 0,
    tag: { display: { Name: view.name }, ExtraAttributes: attributes },
  };
}

// The library adds these years in its profile parse, which items skip.
function setCakeBagYears(item: RawItem) {
  const attributes = item.tag?.ExtraAttributes;
  if (!attributes?.new_year_cake_bag_data) return;

  const cakes = decodeNestedInventory(attributes.new_year_cake_bag_data);
  attributes.new_year_cake_bag_years = cakes
    .map((cake) => cake?.tag?.ExtraAttributes?.new_years_cake)
    .filter((year) => year !== undefined);
}

// The library's ITEMS_WITH_UNIQUE_MODIFIERS, which it doesn't export.
const UNIQUE_MODIFIER_ITEMS = new Set(["SAFARI_BELT"]);

// A unique modifier counts on the first item in the library's order.
const NETWORTH_ORDER = [
  "inventory",
  "enderChest",
  "accessoryBag",
  "personalVault",
  "fishingBag",
  "potionBag",
  "sacksBag",
  "quiver",
  "backpacks",
];

function getNetworthOrder(id: string) {
  const index = NETWORTH_ORDER.indexOf(id);
  return index === -1 ? NETWORTH_ORDER.length : index;
}

function getEquipment(member: RawMember) {
  const blobs = [member.inventory?.equipment_contents];
  for (const set of Object.values(member.loadout?.equipment ?? {})) {
    if (typeof set === "number") continue;
    blobs.push(...EQUIPMENT_PIECES.map((piece) => set[piece]));
  }

  return blobs
    .filter((blob) => blob !== undefined)
    .flatMap((blob) => decodeInventory(blob));
}

async function getInventoryValues(
  member: RawMember,
  map: PriceMap,
  items: ItemsResource,
): Promise<InventoryValues | null> {
  // Networth leaves out a tool its toolkit doesn't hold.
  const unheld = new Set<RawItem>();
  const inventories = await getInventoryPages(
    member,
    decodeInventory,
    (blob, held) => {
      const item = toToolkitItem(blob, items);
      if (item && !held) unheld.add(item);
      return item;
    },
  );
  if (!inventories) return null;

  const options = { prices: toNetworthPrices(map) };
  const price = async (item: RawItem | null) => {
    // The item calculator throws on an item without ExtraAttributes.
    if (!item?.tag?.ExtraAttributes || unheld.has(item)) return null;
    setCakeBagYears(item);
    return new ItemNetworthCalculator(item).getNetworth(options);
  };

  const [priced, pricedIcons, pricedEquipment] = await Promise.all([
    Promise.all(
      Object.entries(inventories).map(async ([id, pages]) => {
        const prices = await Promise.all(
          pages.map((page) => Promise.all(page.map(price))),
        );
        return [id, prices] as const;
      }),
    ),
    Promise.all(
      sortByKey(member.inventory?.backpack_icons).map((blob) =>
        price(decodeInventory(blob)[0] ?? null),
      ),
    ),
    Promise.all(getEquipment(member).map(price)),
  ]);

  const counted = new Set<string>();
  const getWorth = (result: Item | null) => {
    if (!result) return null;

    let coins = result.price;
    if (UNIQUE_MODIFIER_ITEMS.has(result.id)) {
      for (const { type, id, price } of result.calculation ?? []) {
        const key = `${result.id}:${type}:${id}`;
        if (counted.has(key)) coins -= price;
        else counted.add(key);
      }
    }
    return coins > 0 ? coins : null;
  };

  // Worn and loadout equipment come first in the library's order.
  for (const result of pricedEquipment) getWorth(result);

  const pages: InventoryValues["pages"] = Object.fromEntries(
    priced
      .toSorted(([a], [b]) => getNetworthOrder(a) - getNetworthOrder(b))
      .map(([id, pages]) => [id, pages.map((page) => page.map(getWorth))]),
  );
  const backpackIcons = pricedIcons.map(getWorth);

  const totals: InventoryValues["totals"] = Object.fromEntries(
    Object.entries(pages).map(([id, pages]) => [
      id,
      add(...pages.flat().map((coins) => coins ?? 0)),
    ]),
  );
  totals.backpacks = add(
    totals.backpacks ?? 0,
    ...backpackIcons.map((coins) => coins ?? 0),
  );

  const sacks: InventoryValues["sacks"] = {};
  for (const [id, count] of Object.entries(
    member.inventory?.sacks_counts ?? {},
  )) {
    const coins = map.entries[id]?.coins;
    if (count > 0 && coins) sacks[id] = count * coins;
  }

  return { pages, backpackIcons, totals, sacks };
}

const VALUES: Section<"values"> = {
  needs: ["prices", "items"],
  async compute({ profile, member, prices, items, rawItems }) {
    if (!prices || !items || !rawItems) {
      throw new TypeError("values needs prices and items");
    }

    setNetworthItems(rawItems);

    return {
      pricesAsOf: prices.asOf,
      inventories: await getInventoryValues(member, prices, items),
      missingPets: getMissingPets(member, prices, items, hasMarket(profile)),
    };
  },
};

export const ALL_SECTIONS: { [K in SkyBlockSection]: Section<K> } = {
  ...SECTIONS,
  [NETWORTH_SECTION]: NETWORTH,
  [VALUES_SECTION]: VALUES,
};

if (import.meta.vitest) {
  const { suite, it, expect } = import.meta.vitest;

  suite("getModifiers", () => {
    it("should sum each kind, keeping negatives but not base prices", () => {
      const calculation = (
        [
          ["ENCHANT", 5_000_000],
          ["MIDAS_SWORD_50M", 50_000_000],
          ["ENCHANTMENT", 2],
          ["PET_CANDY", -4],
          ["ENCHANTMENT", 3],
          ["REFORGE", 0],
        ] as const
      ).map(([type, price]) => ({ id: type, type, price, count: 1 }));

      expect(getModifiers(calculation)).toEqual([
        { type: "ENCHANTMENT", price: 5 },
        { type: "PET_CANDY", price: -4 },
      ]);
    });
  });
}
