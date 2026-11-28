/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { PET_TEXTURES } from "#data";
import {
  RARITIES,
  type ItemTexture,
  type ItemsResource,
  type Rarity,
} from "#types";
import type { RawItem } from "#raw";

// 1.8 ids for the items resource's accessory materials.
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

export function skinHash(value: string): string | undefined {
  const { textures } = JSON.parse(
    Buffer.from(value, "base64").toString("utf8"),
  ) as {
    textures?: { SKIN?: { url?: string } };
  };

  return textures?.SKIN?.url?.split("/").at(-1);
}

export function getItemTexture(item: RawItem): ItemTexture {
  const value = item.tag?.SkullOwner?.Properties?.textures?.[0]?.Value;
  const skin = value && skinHash(value);
  if (skin) return { kind: "head", skin };

  // Exact leather colors mark rare armor, and 7 off per channel looks the same.
  const color = item.tag?.display?.color;
  return {
    kind: "item",
    id: item.id,
    damage: item.Damage,
    ...(color === undefined ? {} : { color: color & 0xf8_f8_f8 }),
  };
}

export function resourceTexture({
  skin,
  material,
  durability,
}: ItemsResource["items"][string]): ItemTexture | undefined {
  if (skin) return { kind: "head", skin };
  const id = MATERIAL_IDS[material];
  return id === undefined
    ? undefined
    : { kind: "item", id, damage: durability ?? 0 };
}

interface PetTextureOptions {
  skin?: string | null;
  items?: ItemsResource;
}

export function getPetTexture(
  type: string,
  rarity: Rarity,
  { skin, items }: PetTextureOptions = {},
): ItemTexture {
  // The items resource has the skins newer than the NEU pin.
  const skinned =
    skin &&
    (PET_TEXTURES.skins[skin] ?? items?.items[`PET_SKIN_${skin}`]?.skin);
  if (skinned) return { kind: "head", skin: skinned };

  const textures = PET_TEXTURES.pets[type] ?? {};
  const distance = (candidate: Rarity) =>
    Math.abs(RARITIES.indexOf(candidate) - RARITIES.indexOf(rarity));
  const hash = RARITIES.toSorted((a, b) => distance(a) - distance(b))
    .map((candidate) => textures[candidate])
    .find(Boolean);

  // A type newer than the NEU pin has no head.
  return hash
    ? { kind: "head", skin: hash }
    : { kind: "item", id: 397, damage: 3 };
}

if (import.meta.vitest) {
  const { suite, it, expect } = import.meta.vitest;

  suite("resourceTexture", () => {
    it("should read a head's skin", () => {
      expect(
        resourceTexture({ name: "Head", material: "SKULL_ITEM", skin: "abc" }),
      ).toEqual({ kind: "head", skin: "abc" });
    });

    it("should map a known material to its 1.8 id", () => {
      expect(
        resourceTexture({
          name: "Zombie",
          material: "SKULL_ITEM",
          durability: 2,
        }),
      ).toEqual({ kind: "item", id: 397, damage: 2 });
    });

    it("should skip an unknown material", () => {
      expect(
        resourceTexture({ name: "New", material: "TRIAL_KEY" }),
      ).toBeUndefined();
    });
  });

  suite("getItemTexture", () => {
    it("should round a dyed color down to the nearest 8 a channel", () => {
      expect(
        getItemTexture({
          id: 301,
          Count: 1,
          Damage: 0,
          tag: { display: { color: 0x0f_10_17 } },
        }),
      ).toMatchObject({ color: 0x08_10_10 });
    });
  });
}
