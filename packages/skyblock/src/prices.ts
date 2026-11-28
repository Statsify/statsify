/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  RARITIES,
  type Bazaar,
  type ItemCost,
  type ItemMatch,
  type ItemsResource,
  type PriceEntry,
  type PriceMap,
  type PriceView,
} from "#types";
import { getPetLevel } from "#leveling";
import { getPetName } from "#data";
import { getPetTexture, resourceTexture } from "#textures";
import { prettify, removeFormatting, romanNumeral } from "@statsify/util";
import type { RawBazaar, RawItem, RawPet } from "#raw";

type Attributes = NonNullable<NonNullable<RawItem["tag"]>["ExtraAttributes"]>;

const COLOR_HATS = new Set([
  "PARTY_HAT_CRAB",
  "PARTY_HAT_CRAB_ANIMATED",
  "BALLOON_HAT_2024",
  "BALLOON_HAT_2025",
]);

const RUNES = new Set(["RUNE", "UNIQUE_RUNE"]);

const PRICED_PET_LEVELS = [1, 100, 200] as const;

const SKINNED = "_SKINNED_";

const PET_KEY = /^LVL_(\d+)_(VERY_SPECIAL|[A-Z]+)_(.+)$/;

const BOOK_KEY = /^ENCHANTMENT_(.+)_(\d{1,2})$/;

const CROWNS = ["CROWN_OF_AVARICE", "CROWN_OF_AVARICE_1B"] as const;

const MIDAS_WEAPONS: Record<string, { maxBid: number; key: string }> = {
  MIDAS_SWORD: { maxBid: 50_000_000, key: "MIDAS_SWORD_50M" },
  STARRED_MIDAS_SWORD: { maxBid: 250_000_000, key: "STARRED_MIDAS_SWORD_250M" },
  MIDAS_STAFF: { maxBid: 100_000_000, key: "MIDAS_STAFF_100M" },
  STARRED_MIDAS_STAFF: { maxBid: 500_000_000, key: "STARRED_MIDAS_STAFF_500M" },
};

export interface Bins {
  lowest: number;
  second?: number;
  third?: number;
  listings: number;
}

export function parseBazaar(raw: RawBazaar): Bazaar {
  return {
    lastUpdated: raw.lastUpdated,
    products: Object.fromEntries(
      Object.entries(raw.products).map(
        ([id, { buy_summary, sell_summary, quick_status }]) => [
          id,
          {
            id,
            instantBuy: buy_summary[0]?.pricePerUnit,
            instantSell: sell_summary[0]?.pricePerUnit,
            buyPrice: quick_status.buyPrice,
            sellPrice: quick_status.sellPrice,
            buyMovingWeek: quick_status.buyMovingWeek,
            sellMovingWeek: quick_status.sellMovingWeek,
          },
        ],
      ),
    ),
  };
}

// The networth library looks prices up by exact key, in these formats.
const toUpperCase = (value: unknown) => String(value).toUpperCase();

// Pet keys use the API's tier, without Tier Boost.
const petKey = (pet: RawPet, level: number) =>
  `LVL_${level}_${pet.tier}_${pet.type}${pet.skin ? `${SKINNED}${pet.skin}` : ""}`;

const bookKeys = (attributes: Attributes) =>
  Object.entries(attributes.enchantments ?? {}).map(
    ([name, level]) => `ENCHANTMENT_${toUpperCase(name)}_${level}`,
  );

function runeKey(attributes: Attributes) {
  const [rune] = Object.entries(attributes.runes ?? {});
  return rune && toUpperCase(`RUNE_${rune[0]}_${rune[1]}`);
}

const cakeKey = (attributes: Attributes) =>
  `NEW_YEAR_CAKE_${attributes.new_years_cake}`;

function hatKey(id: string, attributes: Attributes) {
  if (COLOR_HATS.has(id) && attributes.party_hat_color) {
    return `${id}_${toUpperCase(attributes.party_hat_color)}`;
  }

  if (id === "PARTY_HAT_SLOTH" && attributes.party_hat_emoji) {
    return `${id}_${toUpperCase(attributes.party_hat_emoji)}`;
  }

  return undefined;
}

function editionKey(id: string, attributes: Attributes) {
  const editioned = id === "DCTR_SPACE_HELM" || id === "ANCIENT_ELEVATOR";
  if (editioned && attributes.edition !== undefined) return `${id}_EDITIONED`;
  if (id === "CREATIVE_MIND" && !attributes.edition) {
    return "CREATIVE_MIND_UNEDITIONED";
  }

  return undefined;
}

// Crowns are priced only at 0 and 1B coins, and interpolated between.
function crownKey(attributes: Attributes) {
  const coins = Number(attributes.collected_coins ?? 0);
  if (coins === 0) return CROWNS[0];
  if (coins >= 1_000_000_000) return CROWNS[1];
  return undefined;
}

// A Midas weapon bought at the Dark Auction's max bid has its own key.
function midasKey(id: string, attributes: Attributes) {
  const { maxBid, key } = MIDAS_WEAPONS[id];
  const paid =
    Number(attributes.winning_bid ?? 0) +
    Number(attributes.additional_coins ?? 0);
  return paid >= maxBid ? key : id;
}

const skinnedKey = (id: string, attributes: Attributes) =>
  `${id}${SKINNED}${attributes.skin}`;

function parsePetInfo(attributes: Attributes | undefined) {
  if (typeof attributes?.petInfo !== "string") return;
  return JSON.parse(attributes.petInfo) as RawPet;
}

export function listingKey(item: RawItem): string | undefined {
  const attributes = item.tag?.ExtraAttributes;
  const pet = parsePetInfo(attributes);
  if (pet) {
    const { level } = getPetLevel(pet);
    const priced = PRICED_PET_LEVELS.some((candidate) => candidate === level);
    return priced ? petKey(pet, level) : undefined;
  }

  const id = attributes?.id;
  if (!attributes || id === undefined) return;

  if (id === "ENCHANTED_BOOK") {
    const books = bookKeys(attributes);
    return books.length === 1 ? books[0] : undefined;
  }

  if (RUNES.has(id)) return runeKey(attributes);
  if (id === "NEW_YEAR_CAKE") return cakeKey(attributes);
  if (id === "CROWN_OF_AVARICE") return crownKey(attributes);
  if (id in MIDAS_WEAPONS) return midasKey(id, attributes);
  if (attributes.skin) return skinnedKey(id, attributes);
  if (attributes.is_shiny) return `${id}_SHINY`;
  return hatKey(id, attributes) ?? editionKey(id, attributes) ?? id;
}

// This mirrors the networth library's getItemId, which reads the map.
function getNetworthId(id: string, attributes: Attributes, map: PriceMap) {
  const price = (key: string) => map.entries[key]?.coins;

  // It compares prices[skinned] > prices[id], which is false with no id price.
  const idPrice = price(id);
  const skinnedPrice = price(skinnedKey(id, attributes)) ?? 0;
  if (attributes.skin && idPrice !== undefined && skinnedPrice > idPrice) {
    return skinnedKey(id, attributes);
  }

  const sloth = id === "PARTY_HAT_SLOTH" ? hatKey(id, attributes) : undefined;
  if (sloth && price(sloth)) return sloth;

  const rune = RUNES.has(id) && runeKey(attributes);
  if (rune) return rune;
  if (id === "NEW_YEAR_CAKE") return cakeKey(attributes);

  const hat = COLOR_HATS.has(id) && hatKey(id, attributes);
  const variant = hat || editionKey(id, attributes);
  if (variant) return variant;

  const shiny = `${id}_SHINY`;
  if (attributes.is_shiny && price(shiny)) return shiny;

  const unstarred = id.replace(/^STARRED_/, "");
  if (unstarred !== id && !price(id) && price(unstarred)) return unstarred;
  return id;
}

// The library interpolates a pet's price between the priced levels around it.
function getPetLookupKeys(pet: RawPet, map: PriceMap) {
  const { level } = getPetLevel(pet);
  const keyAtLevel = (pricedLevel: number) => {
    const unskinned = petKey({ ...pet, skin: null }, pricedLevel);
    const skinned = petKey(pet, pricedLevel);
    return map.entries[unskinned] || !map.entries[skinned]
      ? unskinned
      : skinned;
  };

  const [low, mid, high] = PRICED_PET_LEVELS;
  if (level < mid) return [keyAtLevel(low), keyAtLevel(mid)];
  if (level === mid) return [keyAtLevel(mid)];
  return [keyAtLevel(mid), keyAtLevel(high)];
}

// The keys the library reads for an item's base price, before modifiers.
export function lookupKeys(
  itemOrPet: RawItem | RawPet,
  map: PriceMap,
): string[] {
  if ("exp" in itemOrPet) return getPetLookupKeys(itemOrPet, map);

  const attributes = itemOrPet.tag?.ExtraAttributes;
  const pet = parsePetInfo(attributes);
  if (pet) return getPetLookupKeys(pet, map);

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

  return [getNetworthId(id, attributes, map)];
}

// Skip a lowest BIN under half the second when a third backs the second.
function getBinPrice({ lowest, second, third }: Bins) {
  if (second === undefined || third === undefined) return lowest;
  if (lowest >= second / 2) return lowest;
  return third <= second * 2 ? second : lowest;
}

// The bazaar's sell price wins over the lowest BIN, and NPC prices fill gaps.
export function getPriceEntries(
  bins: Map<string, Bins>,
  bazaar: Bazaar,
  items: ItemsResource,
) {
  const entries: Record<string, PriceEntry> = {};
  for (const [key, bin] of bins) {
    entries[key] = {
      coins: getBinPrice(bin),
      source: "bin",
      listings: bin.listings,
    };
  }

  // quick_status averages the top orders, so one order can't move it.
  for (const product of Object.values(bazaar.products)) {
    if (product.sellPrice <= 0) continue;
    entries[product.id] = {
      coins: product.sellPrice,
      source: "bazaar",
      buy: product.buyPrice,
    };
  }

  // Many NPC-sold items are never listed as BIN, and an NPC always pays this.
  for (const [id, { npcPrice }] of Object.entries(items.items)) {
    if (npcPrice && !entries[id])
      entries[id] = { coins: npcPrice, source: "npc" };
  }

  return entries;
}

export function parsePetKey(key: string) {
  const [, level, tier, type] = PET_KEY.exec(key) ?? [];
  const rarity = RARITIES.find((candidate) => candidate === tier);
  if (!rarity || key.includes(SKINNED)) return;
  return { type, rarity, level: Number(level) };
}

type PetKey = NonNullable<ReturnType<typeof parsePetKey>>;

export const getPetKeyName = ({ type, rarity, level }: PetKey) =>
  `[Lvl ${level}] ${prettify(rarity)} ${getPetName(type)}`;

// Typed /price names reach these, so "__proto__" mustn't read the prototype.
const getOwn = <T>(record: Record<string, T>, key: string) =>
  Object.hasOwn(record, key) ? record[key] : undefined;

// A suffix, not a prefix, tells apart keys that share a name.
function getItemName(
  key: string,
  { name, tier, category }: ItemsResource["items"][string],
) {
  const plain = removeFormatting(name);
  if (key.startsWith("STARRED_")) return `${plain} ⚚`;
  if (category === "PET_ITEM" && tier) return `${plain} (${prettify(tier)})`;
  return plain;
}

export function describeKey(
  key: string,
  items: ItemsResource,
): Omit<PriceView, "asOf"> | undefined {
  const item = getOwn(items.items, key);
  if (item) {
    return {
      id: key,
      name: getItemName(key, item),
      rarity: item.tier,
      texture: resourceTexture(item),
    };
  }

  const book = BOOK_KEY.exec(key);
  if (book) {
    const [, enchantment, level] = book;
    const resource = items.items.ENCHANTED_BOOK;
    return {
      id: key,
      name: `${prettify(enchantment)} ${romanNumeral(Number(level))}`,
      texture: resource && resourceTexture(resource),
    };
  }

  const pet = parsePetKey(key);
  if (!pet) return;

  return {
    id: key,
    name: getPetKeyName(pet),
    rarity: pet.rarity,
    texture: getPetTexture(pet.type, pet.rarity),
  };
}

export function labelVariants(
  name: string,
  keys: Omit<ItemMatch, "name">[],
): ItemMatch[] {
  if (keys.length === 1) return [{ ...keys[0], name }];

  const rarities = new Set(keys.map(({ rarity }) => rarity));
  if (rarities.size === keys.length && !rarities.has(undefined)) {
    return keys.map((key) => ({
      ...key,
      name: `${name} (${prettify(key.rarity!)})`,
    }));
  }

  const words = keys.map(({ id }) => id.split("_"));
  const shared = words[0].filter((word) =>
    words.every((other) => other.includes(word)),
  );

  return keys.map((key, index) => {
    const differs = words[index].filter((word) => !shared.includes(word));
    if (differs.length === 0) return { ...key, name };
    return { ...key, name: `${name} (${prettify(differs.join("_"))})` };
  });
}

export function toPriceView(
  id: string,
  map: PriceMap,
  bazaar: Bazaar,
  items: ItemsResource,
): PriceView | undefined {
  const described = describeKey(id, items);
  const entry = getOwn(map.entries, id);
  const lowestBin =
    entry?.source === "bin"
      ? { coins: entry.coins, listings: entry.listings }
      : undefined;
  const product = getOwn(bazaar.products, id);
  const npc = getOwn(items.items, id)?.npcPrice;
  if (!described || !(product || lowestBin || npc)) return;

  const current = entry && { coins: entry.coins, source: entry.source };
  return {
    ...described,
    current,
    bazaar: product,
    lowestBin,
    npc,
    asOf: map.asOf,
  };
}

// An NPC price is what an NPC pays, so it's never what an item costs.
export function getItemCost(entry?: PriceEntry): ItemCost | undefined {
  if (entry?.source === "bin") return { coins: entry.coins, source: "bin" };
  if (entry?.source === "bazaar" && entry.buy > 0) {
    return { coins: entry.buy, source: "bazaar" };
  }

  return undefined;
}

if (import.meta.vitest) {
  const { suite, it, expect } = import.meta.vitest;

  const getNames = (name: string, keys: Omit<ItemMatch, "name">[]) =>
    labelVariants(name, keys).map((match) => match.name);

  const skull = { id: 397, Count: 1, Damage: 3 };
  const item = (id: string, attributes: Record<string, unknown> = {}) => ({
    ...skull,
    tag: { ExtraAttributes: { id, ...attributes } },
  });

  const pet = (type: string, tier: string, exp: number, skin?: string) =>
    item("PET", {
      petInfo: JSON.stringify({ type, tier, exp, active: false, skin }),
    });

  suite("listingKey", () => {
    it("should key an item by its id", () => {
      expect(listingKey(item("GOBLIN_CHESTPLATE"))).toBe("GOBLIN_CHESTPLATE");
      expect(listingKey({ id: 1, Count: 1, Damage: 0 })).toBeUndefined();
    });

    it("should key a pet only at a priced level", () => {
      expect(listingKey(pet("GRIFFIN", "COMMON", 0))).toBe(
        "LVL_1_COMMON_GRIFFIN",
      );
      expect(
        listingKey(pet("REINDEER", "LEGENDARY", 30_000_000, "REINDEER_AURORA")),
      ).toBe("LVL_100_LEGENDARY_REINDEER_SKINNED_REINDEER_AURORA");
      expect(listingKey(pet("ROSE_DRAGON", "LEGENDARY", 1e12))).toBe(
        "LVL_200_LEGENDARY_ROSE_DRAGON",
      );
      expect(
        listingKey(pet("GRIFFIN", "LEGENDARY", 1_000_000)),
      ).toBeUndefined();
    });

    it("should key a book only with one enchantment", () => {
      const wise = { enchantments: { ultimate_wise: 5 } };
      expect(listingKey(item("ENCHANTED_BOOK", wise))).toBe(
        "ENCHANTMENT_ULTIMATE_WISE_5",
      );

      const both = { enchantments: { sharpness: 5, smite: 5 } };
      expect(listingKey(item("ENCHANTED_BOOK", both))).toBeUndefined();
    });

    it("should key runes and cakes by their value", () => {
      expect(listingKey(item("RUNE", { runes: { MUSIC: 1 } }))).toBe(
        "RUNE_MUSIC_1",
      );
      expect(
        listingKey(item("UNIQUE_RUNE", { runes: { FLOWER_CARPET: 3 } })),
      ).toBe("RUNE_FLOWER_CARPET_3");
      expect(listingKey(item("NEW_YEAR_CAKE", { new_years_cake: 522 }))).toBe(
        "NEW_YEAR_CAKE_522",
      );
    });

    it("should key hats and editions by their variant", () => {
      const pink = { party_hat_color: "pink" };
      expect(listingKey(item("BALLOON_HAT_2024", pink))).toBe(
        "BALLOON_HAT_2024_PINK",
      );

      const flushed = { party_hat_emoji: "flushed" };
      expect(listingKey(item("PARTY_HAT_SLOTH", flushed))).toBe(
        "PARTY_HAT_SLOTH_FLUSHED",
      );

      const green = { party_hat_color: "green" };
      expect(listingKey(item("CAKE_HAT_2026", green))).toBe("CAKE_HAT_2026");
      expect(listingKey(item("DCTR_SPACE_HELM", { edition: 12 }))).toBe(
        "DCTR_SPACE_HELM_EDITIONED",
      );
      expect(listingKey(item("CREATIVE_MIND"))).toBe(
        "CREATIVE_MIND_UNEDITIONED",
      );
    });

    it("should key a crown only at 0 or 1B coins", () => {
      expect(listingKey(item("CROWN_OF_AVARICE"))).toBe("CROWN_OF_AVARICE");

      const some = { collected_coins: 5_000_000 };
      expect(listingKey(item("CROWN_OF_AVARICE", some))).toBeUndefined();

      const full = { collected_coins: 2_000_000_000 };
      expect(listingKey(item("CROWN_OF_AVARICE", full))).toBe(
        "CROWN_OF_AVARICE_1B",
      );
    });

    it("should key a Midas weapon at its max bid", () => {
      const max = { winning_bid: 250_000_000 };
      expect(listingKey(item("STARRED_MIDAS_SWORD", max))).toBe(
        "STARRED_MIDAS_SWORD_250M",
      );

      const low = { winning_bid: 12_390_000 };
      expect(listingKey(item("MIDAS_SWORD", low))).toBe("MIDAS_SWORD");
    });

    it("should key skinned and shiny items", () => {
      const skin = { skin: "WITHER_HELMET_X" };
      expect(listingKey(item("WITHER_HELMET", skin))).toBe(
        "WITHER_HELMET_SKINNED_WITHER_HELMET_X",
      );
      expect(listingKey(item("POWER_WITHER_CHESTPLATE", { is_shiny: 1 }))).toBe(
        "POWER_WITHER_CHESTPLATE_SHINY",
      );
    });
  });

  suite("lookupKeys", () => {
    const listings = 2;
    const map: PriceMap = {
      asOf: 1,
      entries: {
        HELMET: { coins: 10, source: "bin", listings },
        HELMET_SKINNED_GOLD: { coins: 20, source: "bin", listings },
        BONZO_STAFF: { coins: 5, source: "bin", listings },
        ARMOR_SHINY: { coins: 9, source: "bin", listings },
        MIDAS_SWORD_50M: { coins: 99, source: "bin", listings },
      },
    };

    it("should read the skinned key only over a priced id", () => {
      const gold = { skin: "GOLD" };
      expect(lookupKeys(item("HELMET", gold), map)).toEqual([
        "HELMET_SKINNED_GOLD",
      ]);
      expect(lookupKeys(item("BOOTS", gold), map)).toEqual(["BOOTS"]);
    });

    it("should fall back to the priced variant", () => {
      expect(lookupKeys(item("STARRED_BONZO_STAFF"), map)).toEqual([
        "BONZO_STAFF",
      ]);
      expect(lookupKeys(item("ARMOR", { is_shiny: 1 }), map)).toEqual([
        "ARMOR_SHINY",
      ]);

      const max = { winning_bid: 50_000_000 };
      expect(lookupKeys(item("MIDAS_SWORD", max), map)).toEqual([
        "MIDAS_SWORD_50M",
      ]);
    });

    it("should read every enchantment and both crowns", () => {
      const books = { enchantments: { sharpness: 6, telekinesis: 1 } };
      expect(lookupKeys(item("ENCHANTED_BOOK", books), map)).toEqual([
        "ENCHANTMENT_SHARPNESS_6",
        "ENCHANTMENT_TELEKINESIS_1",
      ]);

      const coins = { collected_coins: 5_000_000 };
      expect(lookupKeys(item("CROWN_OF_AVARICE", coins), map)).toEqual([
        "CROWN_OF_AVARICE",
        "CROWN_OF_AVARICE_1B",
      ]);
    });

    it("should read the priced levels around a pet", () => {
      const griffin = {
        type: "GRIFFIN",
        tier: "EPIC",
        exp: 0,
        active: false,
        skin: "X",
      };
      expect(lookupKeys(griffin, map)).toEqual([
        "LVL_1_EPIC_GRIFFIN",
        "LVL_100_EPIC_GRIFFIN",
      ]);
      expect(
        lookupKeys(pet("GOLDEN_DRAGON", "LEGENDARY", 30_000_000), map),
      ).toEqual([
        "LVL_100_LEGENDARY_GOLDEN_DRAGON",
        "LVL_200_LEGENDARY_GOLDEN_DRAGON",
      ]);
      expect(lookupKeys({ id: 1, Count: 1, Damage: 0 }, map)).toEqual([]);
    });
  });

  suite("getBinPrice", () => {
    it("should skip a low outlier only when a third backs the second", () => {
      expect(
        getBinPrice({ lowest: 1, second: 900, third: 950, listings: 3 }),
      ).toBe(900);
      expect(
        getBinPrice({ lowest: 1, second: 900, third: 5000, listings: 3 }),
      ).toBe(1);
      expect(getBinPrice({ lowest: 1, second: 900, listings: 2 })).toBe(1);
      expect(
        getBinPrice({ lowest: 500, second: 900, third: 950, listings: 3 }),
      ).toBe(500);
    });
  });

  suite("getPriceEntries", () => {
    it("should take the bazaar over BINs and fill in NPC prices", () => {
      const bins = new Map([
        ["HYPERION", { lowest: 900, listings: 1 }],
        ["ENCHANTED_DIAMOND", { lowest: 5, listings: 1 }],
      ]);
      const status = { buyMovingWeek: 1, sellMovingWeek: 1 };
      const bazaar: Bazaar = {
        lastUpdated: 1,
        products: {
          ENCHANTED_DIAMOND: {
            id: "ENCHANTED_DIAMOND",
            sellPrice: 1700,
            buyPrice: 2000,
            ...status,
          },
          UNSOLD: { id: "UNSOLD", sellPrice: 0, buyPrice: 0, ...status },
        },
      };
      const items: ItemsResource = {
        lastUpdated: 1,
        museum: {},
        items: {
          ARROW: { name: "Arrow", material: "ARROW", npcPrice: 2 },
          HYPERION: { name: "Hyperion", material: "IRON_SWORD", npcPrice: 100 },
        },
      };

      expect(getPriceEntries(bins, bazaar, items)).toEqual({
        HYPERION: { coins: 900, source: "bin", listings: 1 },
        ENCHANTED_DIAMOND: { coins: 1700, source: "bazaar", buy: 2000 },
        ARROW: { coins: 2, source: "npc" },
      });
    });
  });

  suite("labelVariants", () => {
    it("should keep a name only one key has", () => {
      expect(getNames("Apple", [{ id: "APPLE", rarity: "COMMON" }])).toEqual([
        "Apple",
      ]);
    });

    it("should tell keys apart by rarity", () => {
      expect(
        getNames("Salmon Helmet", [
          { id: "SALMON_HELMET_NEW", rarity: "RARE" },
          { id: "SALMON_HELMET", rarity: "EPIC" },
        ]),
      ).toEqual(["Salmon Helmet (Rare)", "Salmon Helmet (Epic)"]);
    });

    it("should tell keys apart by the words their ids don't share", () => {
      expect(
        getNames("Melon", [
          { id: "MELON_BLOCK", rarity: "COMMON" },
          { id: "BUILDER_MELON", rarity: "COMMON" },
        ]),
      ).toEqual(["Melon (Block)", "Melon (Builder)"]);
    });
  });
}
