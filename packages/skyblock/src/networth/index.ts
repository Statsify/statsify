/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  type Item,
  type Items,
  ProfileNetworthCalculator,
  parseItems,
  setItems,
} from "skyhelper-networth";
import { add } from "@statsify/math";
import { boostedRarity } from "#leveling";
import { describeKey, lookupKeys } from "#prices";
import { getItemTexture, getPetTexture, resourceTexture } from "#textures";
import { normalizeItemText } from "#lore";
import { prettify } from "@statsify/util";
import type {
  ItemTexture,
  ItemsResource,
  NetworthItem,
  NetworthSection,
  PriceMap,
} from "#types";
import type { RawItem, RawItemsResource, RawPet } from "#raw";
import {
  NETWORTH_SECTION,
  SECTIONS,
  type Section,
  type SkyBlockSection,
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
  // A stack's base doesn't scale like its price, so only single items get these.
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

// The price worker can't afford this library, so it stays out of SECTIONS.
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

export const ALL_SECTIONS: { [K in SkyBlockSection]: Section<K> } = {
  ...SECTIONS,
  [NETWORTH_SECTION]: NETWORTH,
};

if (import.meta.vitest) {
  const { suite, it, expect } = import.meta.vitest;

  suite("getModifiers", () => {
    const toCalculation = (entries: [string, number][]) =>
      entries.map(([type, price]) => ({ id: type, type, price, count: 1 }));

    it("should sum each kind and keep one that takes value off", () => {
      const calculation = toCalculation([
        ["ENCHANTMENT", 2],
        ["PET_CANDY", -4],
        ["ENCHANTMENT", 3],
        ["REFORGE", 0],
      ]);
      expect(getModifiers(calculation)).toEqual([
        { type: "ENCHANTMENT", price: 5 },
        { type: "PET_CANDY", price: -4 },
      ]);
    });

    it("should leave out what replaces the base price", () => {
      const calculation = toCalculation([
        ["ENCHANT", 5_000_000],
        ["MIDAS_SWORD_50M", 50_000_000],
      ]);
      expect(getModifiers(calculation)).toEqual([]);
    });
  });
}
