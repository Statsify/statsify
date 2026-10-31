/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import textures from "./generated/textures-1.8.json" with { type: "json" };
import type { ItemTexture, ItemsResource, RawItem } from "#types";

/** The texture hash in a base64 skin value (`{"textures":{"SKIN":{"url":…}}}`). */
export function skinHash(value: string): string | undefined {
  const { textures } = JSON.parse(Buffer.from(value, "base64").toString("utf8")) as {
    textures?: { SKIN?: { url?: string } };
  };

  return textures?.SKIN?.url?.split("/").at(-1);
}

export function textureOf(item: RawItem): ItemTexture {
  const value = item.tag?.SkullOwner?.Properties?.textures?.[0]?.Value;
  const skin = value && skinHash(value);
  if (skin) return { kind: "head", skin };

  // Exact leather colors identify rare armor, and a shade up to 7 off per channel looks the same
  const color = item.tag?.display?.color;
  return { kind: "item", id: item.id, damage: item.Damage, ...(color === undefined ? {} : { color: color & 0xf8_f8_f8 }) };
}

const MATERIAL_IDS: Record<string, number | undefined> = textures.materials;

/** From the items resource, for an item the player doesn't own; undefined for a material 1.8 doesn't have. */
export function resourceTexture({ skin, material, durability, color }: ItemsResource["items"][string]): ItemTexture | undefined {
  if (skin) return { kind: "head", skin };
  const id = MATERIAL_IDS[material];
  if (id === undefined) return undefined;

  const damage = durability ?? 0;
  if (color === undefined) return { kind: "item", id, damage };

  const [red, green, blue] = color.split(",").map(Number);
  return { kind: "item", id, damage, color: (red << 16) | (green << 8) | blue };
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest;

  test("resourceTexture reads heads, the items resource's material names and leather dye", () => {
    expect(resourceTexture({ name: "Head", material: "SKULL_ITEM", skin: "abc123" })).toEqual({ kind: "head", skin: "abc123" });
    expect(resourceTexture({ name: "Zombie", material: "SKULL_ITEM", durability: 2 })).toEqual({ kind: "item", id: 397, damage: 2 });
    expect(resourceTexture({ name: "Lapis", material: "INK_SACK", durability: 4 })).toEqual({ kind: "item", id: 351, damage: 4 });
    expect(resourceTexture({ name: "Boots", material: "LEATHER_BOOTS", color: "139,0,0" })).toEqual({ kind: "item", id: 301, damage: 0, color: 0x8b_00_00 });
    expect(resourceTexture({ name: "New", material: "TRIAL_KEY" })).toBeUndefined();
  });

  test("textureOf rounds a dyed item's color down to the nearest 8 a channel", () => {
    expect(textureOf({ id: 301, Count: 1, Damage: 0, tag: { display: { color: 0x0f_10_17 } } })).toMatchObject({ color: 0x08_10_10 });
  });
}
