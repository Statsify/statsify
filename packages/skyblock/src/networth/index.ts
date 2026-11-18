/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  type Item,
  ItemNetworthCalculator,
  type Items,
  ProfileNetworthCalculator,
  parseItems,
  setItems,
} from "skyhelper-networth";
import { PET_STATS } from "#data";
import { RARITIES } from "#types";
import { boostedRarity, petName, petScorePoints, petTexture } from "../sections/pets.js";
import { decodeAttributes, decodeInventory } from "#nbt";
import { byKey, inventoryPages } from "../sections/inventories.js";
import { EQUIPMENT_PIECES } from "../sections/gear.js";
import { normalizeItemText } from "../lore.js";
import { describeKey } from "#prices";
import { add } from "@statsify/math";
import { lookupKeys } from "#auctions";
import { prettify } from "@statsify/util";
import { resourceTexture, textureOf } from "#textures";
import { toolkitItemView } from "#items";
import type {
  ItemTexture,
  ItemsResource,
  MissingPet,
  NetworthItem,
  NetworthSection,
  PriceMap,
  Rarity,
  RawItem,
  ValuesSection,
} from "#types";
import type { RawNbt, RawPet } from "#raw";
import { type SectionInput, hasMarket } from "../sections/index.js";

const TOP_ITEMS = 10;

/** A networth result: item is there with includeItemData, petData on pets; sacks and essence have neither. */
type Priced = Omit<Item, "item"> & { item?: RawItem; petData?: RawPet };

type Parsed = RawItem | RawPet | { id: string; amount: number };

/** Wither Essence's head, which every essence type draws. */
const ESSENCE_HEAD = "c4db4adfa9bf48ff5d41707ae34ea78bd2371659fcd8cd8934749af4cce9b";

let networthPrices: { asOf: number; prices: Record<string, number> } | undefined;

/** The plain key → coins map the networth library takes, built once per map. */
function toNetworthPrices(map: PriceMap): Record<string, number> {
  if (networthPrices?.asOf !== map.asOf) {
    const prices = Object.fromEntries(Object.entries(map.entries).map(([key, { coins }]) => [key, coins]));
    networthPrices = { asOf: map.asOf, prices };
  }

  return networthPrices.prices;
}

function pricedTexture({ id, item, petData }: Priced, items: ItemsResource): ItemTexture | undefined {
  // A toolkit's items are bare ExtraAttributes, with no id to draw
  if (item?.id !== undefined) return textureOf(item);
  if (petData) return petTexture(petData.type, boostedRarity(petData), petData.skin, items);

  // Essence and runes of one tier (RUNE_LIGHTNING_1) have no items-resource id.
  if (id.startsWith("ESSENCE_")) return { kind: "head", skin: ESSENCE_HEAD };
  const resource = items.items[id] ?? (id.startsWith("RUNE_") ? items.items.RUNE : undefined);
  return resource && resourceTexture(resource);
}

// These handlers replace an item's base price rather than add to it, and their entry repeats the new base
const BASE_PRICE_TYPES = new Set(["SHENS_AUCTION", "ENCHANT", "CROWN_OF_AVARICE"]);
const setsBasePrice = (type: string) => BASE_PRICE_TYPES.has(type) || type.includes("MIDAS_");

/**
 * The library's calculation summed per kind, so every enchantment is one line. A kind can take value off (pet candy),
 * so only kinds worth nothing either way are left out.
 */
function modifiersOf(calculation: Item["calculation"] = []): NetworthItem["modifiers"] {
  const sums = new Map<string, number>();
  for (const { type, price } of calculation) if (!setsBasePrice(type)) sums.set(type, (sums.get(type) ?? 0) + price);

  return [...sums]
    .filter(([, price]) => price !== 0)
    .map(([type, price]) => ({ type, price }))
    .toSorted((a, b) => b.price - a.price);
}

const toNetworthItem = (priced: Priced, items: ItemsResource): NetworthItem => ({
  id: priced.id,
  name: normalizeItemText(priced.name),
  count: priced.count ?? 1,
  price: priced.price,
  soulbound: priced.soulbound,
  cosmetic: priced.cosmetic ?? false,
  texture: pricedTexture(priced, items),
  basePrice: priced.basePrice,
  // A stack's base and calculation don't scale to its price alike (arrows, sacks, candy), so only single items add up
  modifiers: (priced.count ?? 1) > 1 ? [] : modifiersOf(priced.calculation),
});

/** The base keys the map doesn't have, by how many items and pets need each, and how many items and pets that is. */
function getUnpriced(
  parsed: Items,
  map: PriceMap,
  items: ItemsResource
): Pick<NetworthSection, "unpriced" | "unpricedCount"> {
  const counts = new Map<string, number>();
  let unpricedCount = 0;
  for (const thing of Object.values(parsed).flat() as Parsed[]) {
    const keys = ("amount" in thing ? [thing.id] : lookupKeys(thing, map)).filter((key) => !map.entries[key]);
    if (keys.length > 0) unpricedCount++;
    for (const key of keys) counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const unpriced = [...counts]
    .toSorted((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([key, count]) => ({ key, name: describeKey(key, items)?.name ?? prettify(key), count }));

  return { unpriced, unpricedCount };
}

let itemsUpdated: number | undefined;

// Our patch stops the library fetching the items resource itself.
function useItems(items: ItemsResource) {
  if (itemsUpdated === items.lastUpdated) return;
  setItems(items.raw);
  itemsUpdated = items.lastUpdated;
}

/**
 * Kept out of SECTIONS so the main entry, which the price worker loads under a 128 MB heap cap, never loads the networth
 * library.
 */
export const NETWORTH = {
  needs: ["museum", "prices", "items"] as const,
  async compute({ profile, member, museum, prices, items }: SectionInput): Promise<NetworthSection> {
    if (!prices || !items) throw new TypeError("networth needs prices and items");
    useItems(items);

    const parsed = (await parseItems(member, museum ?? {})) as Items;
    const calculator = ProfileNetworthCalculator.fromPreParsed(member, parsed, profile.banking?.balance ?? 0);
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
      nonCosmetic: { total: nonCosmetic.networth, unsoulbound: nonCosmetic.unsoulboundNetworth },
      noInventory: total.noInventory,
      museumIncluded: museum !== undefined,
      pricesAsOf: prices.asOf,
      categories: Object.fromEntries(
        Object.entries(total.types).map(([name, category]) => [
          name,
          {
            total: category.total,
            unsoulbound: category.unsoulboundTotal,
            top: ((category.items ?? []) as Priced[]).slice(0, TOP_ITEMS).map((priced) => toNetworthItem(priced, items)),
          },
        ])
      ),
      petPrices: Object.fromEntries(
        ((total.types.pets?.items ?? []) as Priced[]).flatMap(({ petData, price }) => (petData?.uuid ? [[petData.uuid, price]] : []))
      ),
      ...getUnpriced(parsed, prices, items),
    };
  },
};

/**
 * Each pet type the member has none of: at the cheapest rarity a level 1 sells for, or, on a profile without the market,
 * unpriced at its lowest rarity that scores.
 */
function getMissingPets(member: SectionInput["member"], map: PriceMap, items: ItemsResource, market: boolean): MissingPet[] {
  const owned = new Set((member.pets_data?.pets ?? []).map(({ type }) => type));
  const missing = Object.entries(PET_STATS).filter(([type]) => !owned.has(type));
  const pet = (type: string, rarity: Rarity, price?: number): MissingPet => ({
    type,
    name: petName(type),
    rarity,
    price,
    points: petScorePoints(rarity),
    texture: petTexture(type, rarity, undefined, items),
  });

  if (!market) {
    return missing
      .flatMap(([type, rarities]) => {
        const rarity = RARITIES.find((rarity) => rarity in rarities && petScorePoints(rarity) > 0);
        return rarity ? [pet(type, rarity)] : [];
      })
      .toSorted((a, b) => a.name.localeCompare(b.name));
  }

  return missing
    .flatMap(([type, rarities]) => {
      const priced = (Object.keys(rarities) as Rarity[])
        .filter((rarity) => petScorePoints(rarity) > 0)
        .flatMap((rarity) => {
          const entry = map.entries[`LVL_1_${rarity}_${type}`];
          return entry ? [{ rarity, price: entry.coins }] : [];
        })
        .toSorted((a, b) => a.price - b.price)[0];
      return priced ? [{ type, ...priced }] : [];
    })
    .toSorted((a, b) => a.price - b.price)
    .map(({ type, rarity, price }) => pet(type, rarity, price));
}

/** A toolkit tool is bare ExtraAttributes, so the library gets it as one item named from the resource. */
function toolkitItem(blob: RawNbt, items: ItemsResource): RawItem | null {
  const view = toolkitItemView(blob, items);
  return view && { id: 0, Count: 1, Damage: 0, tag: { display: { Name: view.name }, ExtraAttributes: decodeAttributes(blob) } };
}

type InventoryValues = NonNullable<ValuesSection["inventories"]>;

// The library's ITEMS_WITH_UNIQUE_MODIFIERS, which it doesn't export
const UNIQUE_MODIFIER_ITEMS = new Set(["SAFARI_BELT"]);

// The library's order, after worn and loadout equipment: a unique modifier counts on the first item in it that has one
const NETWORTH_ORDER: string[] = [
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
const networthOrder = (id: string) => (NETWORTH_ORDER.includes(id) ? NETWORTH_ORDER.indexOf(id) : NETWORTH_ORDER.length);

async function getInventoryValues(member: SectionInput["member"], map: PriceMap, items: ItemsResource): Promise<InventoryValues | null> {
  // Networth leaves out a tool its toolkit doesn't hold; one taken out is priced where it sits
  const unheld = new Set<RawItem>();
  const itemPages = inventoryPages(member, decodeInventory, (blob, held) => {
    const item = toolkitItem(blob, items);
    if (item && !held) unheld.add(item);
    return item;
  });
  if (!itemPages) return null;

  const equipment = [
    member.inventory?.equipment_contents,
    ...Object.values(member.loadout?.equipment ?? {}).flatMap((set) =>
      typeof set === "number" ? [] : EQUIPMENT_PIECES.map((piece) => set[piece])
    ),
  ].flatMap((blob) => (blob ? decodeInventory(blob) : []));

  const options = { prices: toNetworthPrices(map) };
  const price = async (item: RawItem | null) => (item && !unheld.has(item) ? new ItemNetworthCalculator(item).getNetworth(options) : null);
  const [priced, pricedBackpacks, pricedEquipment] = await Promise.all([
    Promise.all(
      Object.entries(itemPages).map(
        async ([id, inventory]) => [id, await Promise.all(inventory.map((page) => Promise.all(page.map(price))))] as const
      )
    ),
    Promise.all(byKey(member.inventory?.backpack_icons).map((blob) => price(decodeInventory(blob)[0] ?? null))),
    Promise.all(equipment.map(price)),
  ]);

  const counted = new Set<string>();
  const worth = (result: Item | null) => {
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

  for (const result of pricedEquipment) worth(result);
  const pages: InventoryValues["pages"] = Object.fromEntries(
    priced
      .toSorted(([a], [b]) => networthOrder(a) - networthOrder(b))
      .map(([id, inventory]) => [id, inventory.map((page) => page.map(worth))])
  );
  const backpackIcons = pricedBackpacks.map(worth);

  const totals: InventoryValues["totals"] = Object.fromEntries(
    Object.entries(pages).map(([id, inventory]) => [id, add(...inventory.flat().map((coins) => coins ?? 0))])
  );
  totals.backpacks = add(totals.backpacks ?? 0, ...backpackIcons.map((coins) => coins ?? 0));

  const sacks = Object.fromEntries(
    Object.entries(member.inventory?.sacks_counts ?? {}).flatMap(([id, count]) => {
      const coins = map.entries[id]?.coins;
      return count > 0 && coins ? [[id, count * coins]] : [];
    })
  );

  return { pages, backpackIcons, totals, sacks };
}

/** Beside NETWORTH for the same reason: it prices each item with the networth library. */
export const VALUES = {
  needs: ["prices", "items"] as const,
  async compute({ profile, member, prices, items }: SectionInput): Promise<ValuesSection> {
    if (!prices || !items) throw new TypeError("values needs prices and items");
    useItems(items);

    return {
      pricesAsOf: prices.asOf,
      inventories: await getInventoryValues(member, prices, items),
      missingPets: getMissingPets(member, prices, items, hasMarket(profile)),
    };
  },
};

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest;

  test("modifiersOf sums each kind, keeps what takes value off, and leaves out what replaces the base", () => {
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

    expect(modifiersOf(calculation)).toEqual([
      { type: "ENCHANTMENT", price: 5 },
      { type: "PET_CANDY", price: -4 },
    ]);
  });
}
