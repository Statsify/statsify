/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type Item, type Items, ProfileNetworthCalculator, parseItems, setItems } from "skyhelper-networth";
import { boostedRarity, petTexture } from "../sections/pets.js";
import { normalizeItemText } from "../lore.js";
import { describeKey } from "#prices";
import { add } from "@statsify/math";
import { lookupKeys } from "#auctions";
import { prettify } from "@statsify/util";
import { resourceTexture, textureOf } from "#textures";
import type { ItemTexture, ItemsResource, NetworthItem, NetworthSection, PriceMap, RawItem } from "#types";
import type { RawPet } from "#raw";
import type { SectionInput } from "../sections/index.js";

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
  if (item) return textureOf(item);
  if (petData) return petTexture(petData.type, boostedRarity(petData), petData.skin, items);

  // Essence and runes of one tier (RUNE_LIGHTNING_1) have no items-resource id.
  if (id.startsWith("ESSENCE_")) return { kind: "head", skin: ESSENCE_HEAD };
  const resource = items.items[id] ?? (id.startsWith("RUNE_") ? items.items.RUNE : undefined);
  return resource && resourceTexture(resource);
}

const toNetworthItem = (priced: Priced, items: ItemsResource): NetworthItem => ({
  id: priced.id,
  name: normalizeItemText(priced.name),
  count: priced.count ?? 1,
  price: priced.price,
  soulbound: priced.soulbound,
  cosmetic: priced.cosmetic ?? false,
  texture: pricedTexture(priced, items),
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

/**
 * Kept out of SECTIONS so the main entry, which the price worker loads under a 128 MB heap cap, never loads the networth
 * library.
 */
export const NETWORTH = {
  needs: ["museum", "prices", "items"] as const,
  async compute({ profile, member, museum, prices, items }: SectionInput): Promise<NetworthSection> {
    if (!prices || !items) throw new TypeError("networth needs prices and items");

    // Our patch stops the library fetching the items resource itself.
    if (itemsUpdated !== items.lastUpdated) {
      setItems(items.raw);
      itemsUpdated = items.lastUpdated;
    }

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
      ...getUnpriced(parsed, prices, items),
    };
  },
};
