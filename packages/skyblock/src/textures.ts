/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

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

  // Exact leather colours identify rare armour, and a shade up to 7 off per channel looks the same
  const color = item.tag?.display?.color;
  return { kind: "item", id: item.id, damage: item.Damage, ...(color === undefined ? {} : { color: color & 0xf8_f8_f8 }) };
}

// 1.8 ids for the material names the items resource gives accessories that aren't heads.
const MATERIAL_IDS: Record<string, number> = {
  BOOK: 340,
  COMPASS: 345,
  DISPENSER: 23,
  DROPPER: 158,
  ENCHANTED_BOOK: 403,
  GOLD_BARDING: 418,
  GOLD_NUGGET: 371,
  IRON_BARDING: 417,
  PAPER: 339,
  SKULL_ITEM: 397,
  STRING: 287,
};

/** The texture of an item the player doesn't own, from the items resource. undefined for a material not in MATERIAL_IDS. */
export function resourceTexture({ skin, material, durability }: ItemsResource["items"][string]): ItemTexture | undefined {
  if (skin) return { kind: "head", skin };
  const id = MATERIAL_IDS[material];
  return id === undefined ? undefined : { kind: "item", id, damage: durability ?? 0 };
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest;

  test("resourceTexture reads heads and known materials", () => {
    expect(resourceTexture({ name: "Head", material: "SKULL_ITEM", skin: "abc123" })).toEqual({ kind: "head", skin: "abc123" });
    expect(resourceTexture({ name: "Zombie", material: "SKULL_ITEM", durability: 2 })).toEqual({ kind: "item", id: 397, damage: 2 });
    expect(resourceTexture({ name: "New", material: "TRIAL_KEY" })).toBeUndefined();
  });

  test("textureOf rounds a dyed item's colour down to the nearest 8 a channel", () => {
    expect(textureOf({ id: 301, Count: 1, Damage: 0, tag: { display: { color: 0x0f_10_17 } } })).toMatchObject({ color: 0x08_10_10 });
  });
}
