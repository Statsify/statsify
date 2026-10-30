/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import nbt from "prismarine-nbt";
import { gunzipSync } from "node:zlib";
import type { RawItem } from "#types";

// An empty slot simplifies to {}.
const isItem = (slot: RawItem | Record<string, never>): slot is RawItem => "id" in slot;

// Synchronous gunzip: the async one opens a zlib stream per blob, which tripled peak memory decoding many blobs at once.
function parseItems(buffer: Buffer): (RawItem | null)[] {
  const parsed = nbt.parseUncompressed(gunzipSync(buffer), "big");
  const { i } = nbt.simplify(parsed) as { i?: (RawItem | Record<string, never>)[] };
  // Garden and hunting toolkit blobs are one bare ExtraAttributes compound each, not a list of slots.
  if (!i) throw new TypeError("not an inventory blob: its NBT has no item list");
  return i.map((slot) => (isItem(slot) ? slot : null));
}

/** A New Year Cake Bag also gets `new_year_cake_bag_years` from the cakes inside it, as the networth library expects. */
export function decodeInventory(data: string | { data: string }): (RawItem | null)[] {
  const items = parseItems(Buffer.from(typeof data === "string" ? data : data.data, "base64"));

  for (const item of items) {
    const attributes = item?.tag?.ExtraAttributes;
    if (!attributes?.new_year_cake_bag_data) continue;
    const cakes = decodeNested(attributes.new_year_cake_bag_data as number[]);
    attributes.new_year_cake_bag_years = cakes.flatMap((cake) => cake?.tag?.ExtraAttributes?.new_years_cake ?? []);
  }

  return items;
}

/** The items inside a nested blob, an ExtraAttributes `*_data` byte array (cake bags, backpacks, pouches). */
const decodeNested = (bytes: number[]) => parseItems(Buffer.from(Int8Array.from(bytes).buffer));

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest;
  const { gzipSync } = await import("node:zlib");

  const blob = (items: object[]) =>
    gzipSync(
      nbt.writeUncompressed({
        type: "compound",
        name: "",
        value: { i: { type: "list", value: { type: "compound", value: items } } },
      } as nbt.NBT)
    );

  const slot = { id: { type: "short", value: 354 }, Count: { type: "byte", value: 1 }, Damage: { type: "short", value: 0 } };
  const withAttributes = (attributes: object) => ({
    ...slot,
    tag: { type: "compound", value: { ExtraAttributes: { type: "compound", value: attributes } } },
  });
  const cake = (year: number) => withAttributes({ new_years_cake: { type: "int", value: year } });

  test("decodeInventory keeps empty slots and opens cake bags", () => {
    const bag = withAttributes({
      id: { type: "string", value: "NEW_YEAR_CAKE_BAG" },
      new_year_cake_bag_data: { type: "byteArray", value: [...new Int8Array(blob([cake(12), {}, cake(300)]))] },
    });

    const items = decodeInventory(blob([bag, {}]).toString("base64"));
    expect(items).toHaveLength(2);
    expect(items[1]).toBeNull();
    expect(items[0]?.tag?.ExtraAttributes).toMatchObject({ id: "NEW_YEAR_CAKE_BAG", new_year_cake_bag_years: [12, 300] });
    expect(decodeInventory({ data: blob([cake(7)]).toString("base64") })).toMatchObject([{ id: 354, Count: 1 }]);
  });
}
