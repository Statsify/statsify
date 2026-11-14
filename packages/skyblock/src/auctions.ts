/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { decodeInventory } from "#nbt";
import { getPetLevel } from "./sections/pets.js";
import type { Bazaar, ItemsResource, PriceEntry, PriceMap, RawItem } from "#types";
import type { RawAuction, RawAuctionsPage, RawPet } from "#raw";

// The networth library looks prices up by exact key, so each function below turns an item into one of its key formats.

type Attributes = NonNullable<NonNullable<RawItem["tag"]>["ExtraAttributes"]>;

const COLOR_HATS = new Set(["PARTY_HAT_CRAB", "PARTY_HAT_CRAB_ANIMATED", "BALLOON_HAT_2024", "BALLOON_HAT_2025"]);

const MIDAS_WEAPONS: Record<string, { maxBid: number; key: string }> = {
  MIDAS_SWORD: { maxBid: 50_000_000, key: "MIDAS_SWORD_50M" },
  STARRED_MIDAS_SWORD: { maxBid: 250_000_000, key: "STARRED_MIDAS_SWORD_250M" },
  MIDAS_STAFF: { maxBid: 100_000_000, key: "MIDAS_STAFF_100M" },
  STARRED_MIDAS_STAFF: { maxBid: 500_000_000, key: "STARRED_MIDAS_STAFF_500M" },
};

const upper = (value: unknown) => String(value).toUpperCase();

/** From the API's tier, without a Tier Boost. */
const petKey = (pet: RawPet, level: number) =>
  `LVL_${level}_${pet.tier}_${pet.type}${pet.skin ? `_SKINNED_${pet.skin}` : ""}`;

function bookKeys(attributes: Attributes) {
  const enchantments = Object.entries(attributes.enchantments ?? {});
  return enchantments.map(([name, level]) => `ENCHANTMENT_${upper(name)}_${level}`);
}

function bookKey(attributes: Attributes) {
  const keys = bookKeys(attributes);
  return keys.length === 1 ? keys[0] : undefined;
}

function runeKey(attributes: Attributes) {
  const [rune] = Object.entries(attributes.runes ?? {});
  return rune && upper(`RUNE_${rune[0]}_${rune[1]}`);
}

const cakeKey = (attributes: Attributes) => `NEW_YEAR_CAKE_${attributes.new_years_cake}`;

function hatKey(id: string, attributes: Attributes): string | undefined {
  if (COLOR_HATS.has(id) && attributes.party_hat_color) return `${id}_${upper(attributes.party_hat_color)}`;
  return id === "PARTY_HAT_SLOTH" && attributes.party_hat_emoji ? `${id}_${upper(attributes.party_hat_emoji)}` : undefined;
}

function editionKey(id: string, attributes: Attributes): string | undefined {
  if ((id === "DCTR_SPACE_HELM" || id === "ANCIENT_ELEVATOR") && attributes.edition !== undefined) return `${id}_EDITIONED`;
  return id === "CREATIVE_MIND" && !attributes.edition ? "CREATIVE_MIND_UNEDITIONED" : undefined;
}

const CROWNS = ["CROWN_OF_AVARICE", "CROWN_OF_AVARICE_1B"] as const;

/** Prices are interpolated between the 0 and 1B crowns, so a listing in between proves neither. */
function crownKey(attributes: Attributes): string | undefined {
  const coins = Number(attributes.collected_coins ?? 0);
  if (coins === 0) return CROWNS[0];
  return coins >= 1_000_000_000 ? CROWNS[1] : undefined;
}

/** A Midas weapon bought at the Dark Auction's max bid has its own key; any other is the plain id. */
function midasKey(id: string, attributes: Attributes) {
  const { maxBid, key } = MIDAS_WEAPONS[id];
  return Number(attributes.winning_bid ?? 0) + Number(attributes.additional_coins ?? 0) >= maxBid ? key : id;
}

const skinnedKey = (id: string, attributes: Attributes) => `${id}_SKINNED_${attributes.skin}`;

const shinyKey = (id: string) => `${id}_SHINY`;

const petOf = (attributes: Attributes | undefined) =>
  typeof attributes?.petInfo === "string" ? (JSON.parse(attributes.petInfo) as RawPet) : undefined;

/** The one key a BIN listing proves, or undefined when it proves none. */
export function listingKey(item: RawItem): string | undefined {
  const attributes = item.tag?.ExtraAttributes;
  const pet = petOf(attributes);
  if (pet) {
    const { level } = getPetLevel(pet);
    return level === 1 || level === 100 || level === 200 ? petKey(pet, level) : undefined;
  }

  const id = attributes?.id;
  if (!attributes || id === undefined) return;
  if (id === "ENCHANTED_BOOK") return bookKey(attributes);
  if (id === "RUNE" || id === "UNIQUE_RUNE") return runeKey(attributes);
  if (id === "NEW_YEAR_CAKE") return cakeKey(attributes);
  if (id === "CROWN_OF_AVARICE") return crownKey(attributes);
  if (id in MIDAS_WEAPONS) return midasKey(id, attributes);
  if (attributes.skin) return skinnedKey(id, attributes);
  if (attributes.is_shiny) return shinyKey(id);
  return hatKey(id, attributes) ?? editionKey(id, attributes) ?? id;
}

/** The id the networth library's getItemId picks, which depends on what the map prices. */
function networthId(id: string, attributes: Attributes, map: PriceMap) {
  const price = (key: string) => map.entries[key]?.coins;

  // It compares `prices[skinned] > prices[id]`, which is false while the plain id is unpriced.
  const plain = price(id);
  if (attributes.skin && plain !== undefined && (price(skinnedKey(id, attributes)) ?? 0) > plain) {
    return skinnedKey(id, attributes);
  }

  const sloth = id === "PARTY_HAT_SLOTH" ? hatKey(id, attributes) : undefined;
  if (sloth && price(sloth)) return sloth;
  const rune = (id === "RUNE" || id === "UNIQUE_RUNE") && runeKey(attributes);
  if (rune) return rune;
  if (id === "NEW_YEAR_CAKE") return cakeKey(attributes);
  const variant = (COLOR_HATS.has(id) && hatKey(id, attributes)) || editionKey(id, attributes);
  if (variant) return variant;
  if (attributes.is_shiny && price(shinyKey(id))) return shinyKey(id);
  const unstarred = id.replace(/^STARRED_/, "");
  if (unstarred !== id && !price(id) && price(unstarred)) return unstarred;
  return id;
}

/** The levels a pet's price is interpolated between, at the skinned key when only that one is priced. */
function petLookupKeys(pet: RawPet, map: PriceMap) {
  const { level } = getPetLevel(pet);
  const at = (lvl: number) => {
    const plain = petKey({ ...pet, skin: null }, lvl);
    const skinned = petKey(pet, lvl);
    return map.entries[plain] || !map.entries[skinned] ? plain : skinned;
  };
  if (level < 100) return [at(1), at(100)];
  return level === 100 ? [at(100)] : [at(100), at(200)];
}

/** The keys read for an item's or pet's base price; modifiers aren't included, and vanilla items have none. */
export function lookupKeys(thing: RawItem | RawPet, map: PriceMap): string[] {
  if ("exp" in thing) return petLookupKeys(thing, map);

  const attributes = thing.tag?.ExtraAttributes;
  const pet = petOf(attributes);
  if (pet) return petLookupKeys(pet, map);

  const id = attributes?.id;
  if (!attributes || id === undefined) return [];

  const books = id === "ENCHANTED_BOOK" ? bookKeys(attributes) : [];
  if (books.length > 0) return books;

  if (Number(attributes.collected_coins ?? 0) > 0) {
    const crown = crownKey(attributes);
    return crown ? [crown] : [...CROWNS];
  }

  const midas = id in MIDAS_WEAPONS ? midasKey(id, attributes) : id;
  if (midas !== id && map.entries[midas]) return [midas];

  return [networthId(id, attributes, map)];
}

/** Auction uuid → the key its listing prices and its stack size; null when it prices none. */
export type SeenIndex = Map<string, { key: string; count: number } | null>;

interface Bins {
  lowest: number;
  second?: number;
  listings: number;
}

/** An auction that doesn't decode has no key, like an unpriceable one, so it can't stop the rebuild. */
function toListing(auction: RawAuction) {
  let item: RawItem | null;
  try {
    [item] = decodeInventory(auction.item_bytes);
  } catch {
    return null;
  }

  if (!item) return null;
  const key = listingKey(item);
  return key ? { key, count: item.Count } : null;
}

function addListing(bins: Map<string, Bins>, key: string, price: number) {
  const bin = bins.get(key);
  if (!bin) {
    bins.set(key, { lowest: price, listings: 1 });
    return;
  }

  bin.listings++;
  if (price < bin.lowest) {
    bin.second = bin.lowest;
    bin.lowest = price;
  } else if (bin.second === undefined || price < bin.second) {
    bin.second = price;
  }
}

/** A lowest BIN under half the second lowest is bait or a fat finger, so the second lowest wins. */
const binPrice = ({ lowest, second }: Bins) => (second !== undefined && lowest < second / 2 ? second : lowest);

/** Auctions in `seen` reuse their key, so only new ones are decoded. asOf is the first page's lastUpdated. */
export async function buildPriceMap(
  pages: AsyncIterable<RawAuctionsPage>,
  bazaar: Bazaar,
  items: ItemsResource,
  seen: SeenIndex = new Map()
): Promise<{ map: PriceMap; seen: SeenIndex }> {
  const next: SeenIndex = new Map();
  const bins = new Map<string, Bins>();
  let asOf: number | undefined;

  for await (const page of pages) {
    asOf ??= page.lastUpdated;

    // Pages shift during a pull, so one auction can show up on two of them.
    for (const auction of page.auctions) {
      if (!auction.bin || next.has(auction.uuid)) continue;
      const listing = seen.get(auction.uuid) ?? (seen.has(auction.uuid) ? null : toListing(auction));
      next.set(auction.uuid, listing);
      if (listing) addListing(bins, listing.key, auction.starting_bid / listing.count);
    }
  }

  if (asOf === undefined) throw new Error("the auction pull had no pages");

  const entries: Record<string, PriceEntry> = {};
  for (const [key, bin] of bins) entries[key] = { coins: binPrice(bin), source: "bin", listings: bin.listings };

  // quick_status averages the top orders, so one order can't move it. The NPC always pays its price, so that's the floor.
  for (const product of Object.values(bazaar.products)) {
    if (product.sellPrice > 0) {
      const coins = Math.max(product.sellPrice, items.items[product.id]?.npcPrice ?? 0);
      entries[product.id] = { coins, source: "bazaar", buy: product.buyPrice };
    }
  }

  // Many NPC-sold items (arrows, starter tools, low talismans) are never listed as BIN, and the NPC always pays this.
  for (const [id, { npcPrice }] of Object.entries(items.items)) {
    if (npcPrice && !entries[id]) entries[id] = { coins: npcPrice, source: "npc" };
  }

  return { map: { asOf, entries }, seen: next };
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest;
  const { Readable } = await import("node:stream");
  const { itemBytes, rawItem } = await import("#fixtures");

  const pet = (type: string, tier: string, exp: number, skin?: string) =>
    rawItem({ id: "PET", attributes: { petInfo: JSON.stringify({ type, tier, exp, active: false, skin }) } });

  test("listingKey gives each format its key", () => {
    const cases: [RawItem, string | undefined][] = [
      [rawItem({ id: "GOBLIN_CHESTPLATE" }), "GOBLIN_CHESTPLATE"],
      [pet("GRIFFIN", "COMMON", 0), "LVL_1_COMMON_GRIFFIN"],
      [pet("REINDEER", "LEGENDARY", 30_000_000, "REINDEER_AURORA"), "LVL_100_LEGENDARY_REINDEER_SKINNED_REINDEER_AURORA"],
      [pet("ROSE_DRAGON", "LEGENDARY", 1e12), "LVL_200_LEGENDARY_ROSE_DRAGON"],
      [pet("GRIFFIN", "LEGENDARY", 1_000_000), undefined],
      [rawItem({ id: "ENCHANTED_BOOK", attributes: { enchantments: { ultimate_wise: 5 } } }), "ENCHANTMENT_ULTIMATE_WISE_5"],
      [rawItem({ id: "ENCHANTED_BOOK", attributes: { enchantments: { sharpness: 5, smite: 5 } } }), undefined],
      [rawItem({ id: "RUNE", attributes: { runes: { MUSIC: 1 } } }), "RUNE_MUSIC_1"],
      [rawItem({ id: "UNIQUE_RUNE", attributes: { runes: { FLOWER_CARPET: 3 } } }), "RUNE_FLOWER_CARPET_3"],
      [rawItem({ id: "NEW_YEAR_CAKE", attributes: { new_years_cake: 522 } }), "NEW_YEAR_CAKE_522"],
      [rawItem({ id: "BALLOON_HAT_2024", attributes: { party_hat_color: "pink" } }), "BALLOON_HAT_2024_PINK"],
      [rawItem({ id: "PARTY_HAT_SLOTH", attributes: { party_hat_emoji: "flushed" } }), "PARTY_HAT_SLOTH_FLUSHED"],
      [rawItem({ id: "CAKE_HAT_2026", attributes: { party_hat_color: "green" } }), "CAKE_HAT_2026"],
      [rawItem({ id: "DCTR_SPACE_HELM", attributes: { edition: 12 } }), "DCTR_SPACE_HELM_EDITIONED"],
      [rawItem({ id: "CREATIVE_MIND" }), "CREATIVE_MIND_UNEDITIONED"],
      [rawItem({ id: "CROWN_OF_AVARICE" }), "CROWN_OF_AVARICE"],
      [rawItem({ id: "CROWN_OF_AVARICE", attributes: { collected_coins: 5_000_000 } }), undefined],
      [rawItem({ id: "CROWN_OF_AVARICE", attributes: { collected_coins: 2_000_000_000 } }), "CROWN_OF_AVARICE_1B"],
      [rawItem({ id: "STARRED_MIDAS_SWORD", attributes: { winning_bid: 250_000_000 } }), "STARRED_MIDAS_SWORD_250M"],
      [rawItem({ id: "MIDAS_SWORD", attributes: { winning_bid: 12_390_000 } }), "MIDAS_SWORD"],
      [rawItem({ id: "WITHER_HELMET", attributes: { skin: "WITHER_HELMET_X" } }), "WITHER_HELMET_SKINNED_WITHER_HELMET_X"],
      [rawItem({ id: "POWER_WITHER_CHESTPLATE", attributes: { is_shiny: 1 } }), "POWER_WITHER_CHESTPLATE_SHINY"],
      [{ id: 1, Count: 1, Damage: 0 }, undefined],
    ];

    expect(cases.map(([item]) => listingKey(item))).toEqual(cases.map(([, key]) => key));
  });

  test("lookupKeys picks the keys the networth library reads", () => {
    const entries = { HELMET: 10, HELMET_SKINNED_GOLD: 20, BONZO_STAFF: 5, ARMOR_SHINY: 9, MIDAS_SWORD_50M: 99 };
    const map: PriceMap = {
      asOf: 1,
      entries: Object.fromEntries(Object.entries(entries).map(([key, coins]) => [key, { coins, source: "bin", listings: 2 }])),
    };
    const keys = (item: Parameters<typeof rawItem>[0]) => lookupKeys(rawItem(item), map);

    expect(keys({ id: "HELMET", attributes: { skin: "GOLD" } })).toEqual(["HELMET_SKINNED_GOLD"]);
    expect(keys({ id: "BOOTS", attributes: { skin: "GOLD" } })).toEqual(["BOOTS"]);
    expect(keys({ id: "STARRED_BONZO_STAFF" })).toEqual(["BONZO_STAFF"]);
    expect(keys({ id: "ARMOR", attributes: { is_shiny: 1 } })).toEqual(["ARMOR_SHINY"]);
    expect(keys({ id: "MIDAS_SWORD", attributes: { winning_bid: 50_000_000 } })).toEqual(["MIDAS_SWORD_50M"]);
    expect(keys({ id: "ENCHANTED_BOOK", attributes: { enchantments: { sharpness: 6, telekinesis: 1 } } })).toEqual([
      "ENCHANTMENT_SHARPNESS_6",
      "ENCHANTMENT_TELEKINESIS_1",
    ]);
    expect(keys({ id: "CROWN_OF_AVARICE", attributes: { collected_coins: 5_000_000 } })).toHaveLength(2);
    expect(lookupKeys({ type: "GRIFFIN", tier: "EPIC", exp: 0, active: false, skin: "X" }, map)).toEqual([
      "LVL_1_EPIC_GRIFFIN",
      "LVL_100_EPIC_GRIFFIN",
    ]);
    expect(lookupKeys(pet("GOLDEN_DRAGON", "LEGENDARY", 30_000_000), map)).toEqual([
      "LVL_100_LEGENDARY_GOLDEN_DRAGON",
      "LVL_200_LEGENDARY_GOLDEN_DRAGON",
    ]);
    expect(lookupKeys({ id: 1, Count: 1, Damage: 0 }, map)).toEqual([]);
  });

  const auction = (uuid: number, bid: number, item: Parameters<typeof itemBytes>[0], bin = true): RawAuction => ({
    uuid: uuid.toString(16).padStart(32, "0"),
    starting_bid: bid,
    bin,
    item_bytes: itemBytes(item),
  });

  const hyperion = auction(3, 950_000_000, { id: "HYPERION" });
  const pages: RawAuctionsPage[] = [
    {
      totalPages: 2,
      lastUpdated: 1000,
      auctions: [
        auction(1, 1, { id: "HYPERION" }),
        auction(2, 900_000_000, { id: "HYPERION" }),
        hyperion,
        auction(4, 100_000, { id: "ASPECT_OF_THE_END" }),
        auction(5, 150_000, { id: "ASPECT_OF_THE_END" }),
        auction(6, 400_000, { id: "KAT_BOUQUET", count: 4 }),
        auction(7, 5, { id: "ASPECT_OF_THE_END" }, false),
        auction(8, 1_000_000, { id: "ENCHANTED_DIAMOND" }),
        auction(9, 70_000_000, { id: "PET", attributes: { petInfo: JSON.stringify({ type: "GRIFFIN", tier: "LEGENDARY", exp: 1e6 }) } }),
      ],
    },
    { totalPages: 2, lastUpdated: 1060, auctions: [hyperion, auction(10, 2_000_000, { id: "GOBLIN_CHESTPLATE" })] },
  ];

  const quickStatus = { buyPrice: 2000, buyMovingWeek: 1, sellMovingWeek: 1 };
  const bazaar: Bazaar = {
    lastUpdated: 990,
    products: {
      ENCHANTED_DIAMOND: { id: "ENCHANTED_DIAMOND", sellPrice: 1700, ...quickStatus },
      UNSOLD: { id: "UNSOLD", sellPrice: 0, ...quickStatus },
      LOW_BID: { id: "LOW_BID", sellPrice: 10, ...quickStatus },
    },
  };

  const items: ItemsResource = {
    lastUpdated: 1,
    raw: [],
    items: {
      ARROW: { name: "Arrow", material: "ARROW", npcPrice: 2 },
      ENCHANTED_DIAMOND: { name: "Enchanted Diamond", material: "DIAMOND", npcPrice: 1280 },
      HYPERION: { name: "Hyperion", material: "IRON_SWORD", npcPrice: 100 },
      LOW_BID: { name: "Low Bid", material: "STONE", npcPrice: 50 },
    },
    museum: {},
  };

  test("buildPriceMap keeps the lowest BIN per unit behind the outlier guard, the bazaar wins but never under the NPC price, and NPC prices fill in", async () => {
    const { map, seen } = await buildPriceMap(Readable.from(pages), bazaar, items);

    expect(map.asOf).toBe(1000);
    expect(map.entries).toEqual({
      // 1 coin is under half of the 900M listing, so the guard skips it.
      HYPERION: { coins: 900_000_000, source: "bin", listings: 3 },
      ASPECT_OF_THE_END: { coins: 100_000, source: "bin", listings: 2 },
      KAT_BOUQUET: { coins: 100_000, source: "bin", listings: 1 },
      GOBLIN_CHESTPLATE: { coins: 2_000_000, source: "bin", listings: 1 },
      ENCHANTED_DIAMOND: { coins: 1700, source: "bazaar", buy: 2000 },
      LOW_BID: { coins: 50, source: "bazaar", buy: 2000 },
      ARROW: { coins: 2, source: "npc" },
    });
    expect([...seen.values()].filter((listing) => listing === null)).toHaveLength(1);
    expect(seen.size).toBe(9);

    // A second pull reuses what it saw: this blob no longer decodes, so the key can only come from `seen`.
    const again = { ...pages[0], auctions: [{ ...pages[0].auctions[1], item_bytes: "not nbt" }] };
    const second = await buildPriceMap(Readable.from([again]), bazaar, items, seen);
    expect(second.map.entries.HYPERION).toEqual({ coins: 900_000_000, source: "bin", listings: 1 });
    expect(second.seen.size).toBe(1);
  });
}
