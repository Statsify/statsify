/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ITEM_MODELS, MATERIAL_IDS, PET_TEXTURES } from "#data";
import { prettify } from "@statsify/util";
import {
  PET_SKIN_PREFIX,
  RARITIES,
  type ItemTexture,
  type ItemsResource,
  type Rarity,
} from "#types";
import type { RawItem, RawItemAttributes } from "#raw";

// Hypixel's pack picks a dagger's attunement and a capsule's state by these.
const MODEL_STATE = ["td_attune_mode", "model", "failed", "active"] as const;

type ItemModel = Pick<ItemTexture, "model" | "customData">;

// NEU's model wins, as an item's own tag keeps the model it was made with.
function getItemModel(
  attributes: RawItemAttributes = {},
  itemModel?: string,
): ItemModel {
  const neuModel =
    attributes.id === undefined ? undefined : ITEM_MODELS[attributes.id];
  const model = neuModel ?? itemModel;
  if (!model) return {};

  const state = MODEL_STATE.filter(
    (key) => typeof attributes[key] === "number",
  );
  if (state.length === 0) return { model };

  const customData = Object.fromEntries(
    state.map((key) => [key, attributes[key] as number]),
  );
  return { model, customData };
}

export function skinHash(value: string): string | undefined {
  const { textures } = JSON.parse(
    Buffer.from(value, "base64").toString("utf8"),
  ) as {
    textures?: { SKIN?: { url?: string } };
  };

  return textures?.SKIN?.url?.split("/").at(-1);
}

export function getItemTexture(item: RawItem): ItemTexture {
  const model = getItemModel(item.tag?.ExtraAttributes, item.tag?.ItemModel);
  const value = item.tag?.SkullOwner?.Properties?.textures?.[0]?.Value;
  const skin = value && skinHash(value);
  if (skin) return { kind: "head", skin, ...model };

  // Exact leather colors mark rare armor, and 7 off per channel looks the same.
  const color = item.tag?.display?.color;
  return {
    kind: "item",
    id: item.id,
    damage: item.Damage,
    ...(color === undefined ? {} : { color: color & 0xf8_f8_f8 }),
    ...model,
  };
}

// Hypixel sends a trophy fish as paper with an item_model for each tier.
export const getTrophyFishTexture = (
  id: string,
  tier: string,
): ItemTexture => ({
  kind: "item",
  id: MATERIAL_IDS.PAPER!,
  damage: 0,
  ...getItemModel({ id: `${id}_${tier.toUpperCase()}` }),
});

export function resourceTexture({
  skin,
  material,
  durability,
  color,
  model,
}: ItemsResource["items"][string]): ItemTexture | undefined {
  const pack = model ? { model } : {};
  if (skin) return { kind: "head", skin, ...pack };
  const id = MATERIAL_IDS[material];
  if (id === undefined) return undefined;

  const damage = durability ?? 0;
  if (color === undefined) return { kind: "item", id, damage, ...pack };

  const [red, green, blue] = color.split(",").map(Number);
  const rgb = (red << 16) | (green << 8) | blue;
  return { kind: "item", id, damage, color: rgb, ...pack };
}

export function resourceItem(items: ItemsResource | undefined, id: string) {
  const found = items?.items[id];
  return {
    name: found?.name ?? prettify(id),
    texture: found && resourceTexture(found),
  };
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
    (PET_TEXTURES.skins[skin] ??
      items?.items[`${PET_SKIN_PREFIX}${skin}`]?.skin);
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
      expect(
        resourceTexture({ name: "Lapis", material: "INK_SACK", durability: 4 }),
      ).toEqual({ kind: "item", id: 351, damage: 4 });
    });

    it("should read leather dye", () => {
      expect(
        resourceTexture({
          name: "Boots",
          material: "LEATHER_BOOTS",
          color: "139,0,0",
        }),
      ).toEqual({ kind: "item", id: 301, damage: 0, color: 0x8b_00_00 });
    });

    it("should skip an unknown material", () => {
      expect(
        resourceTexture({ name: "New", material: "TRIAL_KEY" }),
      ).toBeUndefined();
    });

    it("should keep the item's model", () => {
      const model = "hypixel_skyblock:item/stone";
      expect(
        resourceTexture({ name: "Stone", material: "PAPER", model }),
      ).toEqual({ kind: "item", id: 339, damage: 0, model });
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

    it("should keep NEU's model and the attributes that pick its look", () => {
      const dagger = { id: 272, Count: 1, Damage: 0 };
      const model = ITEM_MODELS.FIREDUST_DAGGER;
      const attuned = { id: "FIREDUST_DAGGER", td_attune_mode: 1, uuid: "a" };

      expect(
        getItemTexture({ ...dagger, tag: { ExtraAttributes: attuned } }),
      ).toEqual({
        kind: "item",
        id: 272,
        damage: 0,
        model,
        customData: { td_attune_mode: 1 },
      });
      expect(
        getItemTexture({
          ...dagger,
          tag: {
            ExtraAttributes: { id: "FIREDUST_DAGGER", model: "SUMSUNG_1" },
          },
        }),
      ).toEqual({ kind: "item", id: 272, damage: 0, model });
      expect(
        getItemTexture({
          ...dagger,
          tag: { ExtraAttributes: { id: "SOMETHING_NEW", td_attune_mode: 1 } },
        }),
      ).toEqual({ kind: "item", id: 272, damage: 0 });
    });

    it("should fall back to the item's own model where NEU has none", () => {
      const dagger = { id: 272, Count: 1, Damage: 0 };

      expect(
        getItemTexture({
          ...dagger,
          tag: {
            ItemModel: "minecraft:goat_spawn_egg",
            ExtraAttributes: { id: "SOMETHING_NEW" },
          },
        }).model,
      ).toBe("minecraft:goat_spawn_egg");
      expect(
        getItemTexture({
          ...dagger,
          tag: {
            ItemModel: "minecraft:blue_egg",
            ExtraAttributes: { id: "GOBLIN_EGG" },
          },
        }).model,
      ).toBe(ITEM_MODELS.GOBLIN_EGG);
    });
  });
}
