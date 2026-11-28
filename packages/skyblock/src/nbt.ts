/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import nbt from "prismarine-nbt";
import { gunzipSync } from "node:zlib";
import type { RawItem, RawItemAttributes } from "#raw";

function decodeCompound(data: string | { data: string }) {
  const buffer = Buffer.from(
    typeof data === "string" ? data : data.data,
    "base64",
  );

  // The async gunzip opens a zlib stream per blob, which tripled peak memory.
  return nbt.simplify(nbt.parseUncompressed(gunzipSync(buffer), "big"));
}

export function decodeInventory(
  data: string | { data: string },
): (RawItem | null)[] {
  const { i } = decodeCompound(data) as {
    i?: (RawItem | Record<string, never>)[];
  };

  // Garden and hunting toolkit blobs are one bare compound, not a slot list.
  if (!i)
    throw new TypeError("not an inventory blob: its NBT has no item list");

  // An empty slot simplifies to {}.
  return i.map((slot) => ("id" in slot ? (slot as RawItem) : null));
}

// A toolkit's tool is its bare ExtraAttributes, with no slot around it.
export const decodeAttributes = (data: string | { data: string }) =>
  decodeCompound(data) as RawItemAttributes;

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

  suite("decodeInventory", () => {
    it("should keep empty slots", () => {
      const items = decodeInventory(blob([slot, {}]).toString("base64"));
      expect(items).toMatchObject([{ id: 354, Count: 1 }, null]);
    });
  });
}
