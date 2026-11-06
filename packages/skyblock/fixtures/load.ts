/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

// Test-only fake items.
import nbt from "prismarine-nbt";
import { gzipSync } from "node:zlib";
import type { RawItem } from "#types";

const toTag = (value: unknown): nbt.Tags[nbt.TagType] => {
  if (typeof value === "string") return nbt.string(value);
  if (typeof value === "number") return Number.isInteger(value) ? nbt.int(value) : nbt.double(value);
  return nbt.comp(Object.fromEntries(Object.entries(value as object).map(([key, child]) => [key, toTag(child)])));
};

export interface FakeItem {
  id: string;
  count?: number;
  attributes?: Record<string, unknown>;
}

export const rawItem = ({ id, count = 1, attributes }: FakeItem): RawItem => ({
  id: 397,
  Count: count,
  Damage: 3,
  tag: { display: { Name: id }, ExtraAttributes: { id, ...attributes } },
});

/** Base64 gzipped NBT holding these SkyBlock items, the way auction item_bytes arrive. */
export function itemBytes(...items: FakeItem[]): string {
  const slots = items.map(rawItem).map(({ id, Count, Damage, tag }) => ({
    id: nbt.short(id),
    Count: nbt.byte(Count),
    Damage: nbt.short(Damage),
    tag: toTag(tag),
  }));

  const root = { type: "compound", name: "", value: { i: { type: "list", value: { type: "compound", value: slots } } } };
  return gzipSync(nbt.writeUncompressed(root as nbt.NBT)).toString("base64");
}
