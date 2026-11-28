/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import nbt from "prismarine-nbt";
import { gunzipSync } from "node:zlib";
import type { RawItem } from "#raw";

// The async gunzip opens a zlib stream per blob, which tripled peak memory.
function parseItems(buffer: Buffer): (RawItem | null)[] {
  const parsed = nbt.parseUncompressed(gunzipSync(buffer), "big");
  const { i } = nbt.simplify(parsed) as {
    i?: (RawItem | Record<string, never>)[];
  };

  // Garden and hunting toolkit blobs are one bare compound, not a slot list.
  if (!i)
    throw new TypeError("not an inventory blob: its NBT has no item list");

  // An empty slot simplifies to {}.
  return i.map((slot) => ("id" in slot ? (slot as RawItem) : null));
}

// The networth library reads a New Year Cake Bag's years off the bag itself.
export function decodeInventory(
  data: string | { data: string },
): (RawItem | null)[] {
  const items = parseItems(
    Buffer.from(typeof data === "string" ? data : data.data, "base64"),
  );

  for (const item of items) {
    const attributes = item?.tag?.ExtraAttributes;
    if (!attributes?.new_year_cake_bag_data) continue;

    const bytes = attributes.new_year_cake_bag_data as number[];
    const cakes = parseItems(Buffer.from(Int8Array.from(bytes).buffer));
    attributes.new_year_cake_bag_years = cakes
      .map((cake) => cake?.tag?.ExtraAttributes?.new_years_cake)
      .filter((year) => year !== undefined);
  }

  return items;
}

if (import.meta.vitest) {
  const { suite, it, expect } = import.meta.vitest;
  const { gzipSync } = await import("node:zlib");

  const blob = (items: object[]) =>
    gzipSync(
      nbt.writeUncompressed({
        type: "compound",
        name: "",
        value: {
          i: { type: "list", value: { type: "compound", value: items } },
        },
      } as nbt.NBT),
    );

  const slot = {
    id: { type: "short", value: 354 },
    Count: { type: "byte", value: 1 },
    Damage: { type: "short", value: 0 },
  };

  const cake = (year: number) => ({
    ...slot,
    tag: {
      type: "compound",
      value: {
        ExtraAttributes: {
          type: "compound",
          value: { new_years_cake: { type: "int", value: year } },
        },
      },
    },
  });

  suite("decodeInventory", () => {
    it("should keep empty slots", () => {
      const items = decodeInventory(blob([slot, {}]).toString("base64"));
      expect(items).toMatchObject([{ id: 354, Count: 1 }, null]);
    });

    it("should read the years in a cake bag", () => {
      const bag = {
        ...slot,
        tag: {
          type: "compound",
          value: {
            ExtraAttributes: {
              type: "compound",
              value: {
                new_year_cake_bag_data: {
                  type: "byteArray",
                  value: [...new Int8Array(blob([cake(12), {}, cake(300)]))],
                },
              },
            },
          },
        },
      };

      const [item] = decodeInventory({ data: blob([bag]).toString("base64") });
      expect(item?.tag?.ExtraAttributes?.new_year_cake_bag_years).toEqual([
        12, 300,
      ]);
    });
  });
}
