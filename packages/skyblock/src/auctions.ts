/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type Bins, getPriceEntries, listingKey } from "#prices";
import { decodeInventory } from "#nbt";
import type { Bazaar, ItemsResource, PriceMap } from "#types";
import type { RawAuction, RawAuctionsPage, RawItem } from "#raw";
import type { NBT } from "prismarine-nbt";

interface Listing {
  key: string;
  count: number;
}

// Keyed by auction uuid, and null for a listing that prices no key.
export type SeenIndex = Map<string, Listing | null>;

// An auction that doesn't decode prices nothing, so it can't stop a rebuild.
function toListing(auction: RawAuction): Listing | null {
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
    bin.third = bin.second;
    bin.second = bin.lowest;
    bin.lowest = price;
  } else if (bin.second === undefined || price < bin.second) {
    bin.third = bin.second;
    bin.second = price;
  } else if (bin.third === undefined || price < bin.third) {
    bin.third = price;
  }
}

// Auctions in seen keep their key, so a rebuild only decodes new ones.
export async function buildPriceMap(
  pages: AsyncIterable<RawAuctionsPage>,
  bazaar: Bazaar,
  items: ItemsResource,
  seen: SeenIndex = new Map(),
): Promise<{ map: PriceMap; seen: SeenIndex }> {
  const next: SeenIndex = new Map();
  const bins = new Map<string, Bins>();
  let asOf: number | undefined;

  for await (const page of pages) {
    asOf ??= page.lastUpdated;

    // Pages shift during a pull, so one auction can show up on two of them.
    for (const auction of page.auctions) {
      if (!auction.bin || next.has(auction.uuid)) continue;

      const known = seen.get(auction.uuid);
      const listing = known === undefined ? toListing(auction) : known;
      next.set(auction.uuid, listing);

      if (listing) {
        addListing(bins, listing.key, auction.starting_bid / listing.count);
      }
    }
  }

  if (asOf === undefined) throw new Error("the auction pull had no pages");

  const entries = getPriceEntries(bins, bazaar, items);
  return { map: { asOf, entries }, seen: next };
}

if (import.meta.vitest) {
  const { suite, it, expect } = import.meta.vitest;
  const { Readable } = await import("node:stream");
  const { gzipSync } = await import("node:zlib");
  const { default: nbt } = await import("prismarine-nbt");

  const itemBytes = (id: string, count = 1) => {
    const slot = {
      id: nbt.short(397),
      Count: nbt.byte(count),
      Damage: nbt.short(3),
      tag: nbt.comp({ ExtraAttributes: nbt.comp({ id: nbt.string(id) }) }),
    };
    const list = { type: "list", value: { type: "compound", value: [slot] } };
    const root = { type: "compound", name: "", value: { i: list } };
    return gzipSync(nbt.writeUncompressed(root as NBT)).toString("base64");
  };

  const auction = (uuid: string, bid: number, id: string, count = 1) => ({
    uuid,
    starting_bid: bid,
    bin: true,
    item_bytes: itemBytes(id, count),
  });

  const bazaar: Bazaar = { lastUpdated: 1, products: {} };
  const items: ItemsResource = { lastUpdated: 1, museum: {}, items: {} };

  suite("buildPriceMap", () => {
    it("should price each BIN per unit, once per auction", async () => {
      const page = {
        totalPages: 2,
        lastUpdated: 1000,
        auctions: [
          auction("a", 900, "HYPERION"),
          auction("b", 400_000, "KAT_BOUQUET", 4),
          { ...auction("c", 5, "HYPERION"), bin: false },
        ],
      };
      const repeat = {
        ...page,
        lastUpdated: 1060,
        auctions: [page.auctions[0]],
      };

      const { map, seen } = await buildPriceMap(
        Readable.from([page, repeat]),
        bazaar,
        items,
      );

      expect(map).toEqual({
        asOf: 1000,
        entries: {
          HYPERION: { coins: 900, source: "bin", listings: 1 },
          KAT_BOUQUET: { coins: 100_000, source: "bin", listings: 1 },
        },
      });
      expect(seen.size).toBe(2);
    });

    it("should reuse the keys it has seen", async () => {
      const page = {
        totalPages: 1,
        lastUpdated: 1000,
        auctions: [{ ...auction("a", 900, "HYPERION"), item_bytes: "not nbt" }],
      };
      const seen: SeenIndex = new Map([["a", { key: "HYPERION", count: 1 }]]);

      const { map } = await buildPriceMap(
        Readable.from([page]),
        bazaar,
        items,
        seen,
      );
      expect(map.entries.HYPERION).toEqual({
        coins: 900,
        source: "bin",
        listings: 1,
      });
    });
  });
}
