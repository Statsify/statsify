/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import itemModels from "./generated/item-models.json" with { type: "json" };
import textures from "./generated/textures-1.8.json" with { type: "json" };
import type { ItemAttributes, ItemTexture, ItemsResource, RawItem } from "#types";

/** NEU's item_model for each item a modern client draws as something other than its 1.8 material. */
const ITEM_MODELS: Record<string, string | undefined> = itemModels;

// The ExtraAttributes Hypixel's pack picks models by: a dagger's attunement and a critter capsule's state
const MODEL_STATE = ["td_attune_mode", "model", "failed", "active"] as const;

// NEU's model comes before an item's own ItemModel tag, which keeps the stand-in the item was made with (a goblin
// egg's spawn egg) after Hypixel gives it a model of its own
function modelOf(attributes: ItemAttributes = {}, itemModel?: string): Pick<ItemTexture, "model" | "customData"> {
  const model = (attributes.id === undefined ? undefined : ITEM_MODELS[attributes.id]) ?? itemModel;
  if (!model) return {};

  const state = MODEL_STATE.flatMap((key) => (typeof attributes[key] === "number" ? [[key, attributes[key]] as const] : []));
  return state.length > 0 ? { model, customData: Object.fromEntries(state) } : { model };
}

/** The texture hash in a base64 skin value (`{"textures":{"SKIN":{"url":…}}}`). */
export function skinHash(value: string): string | undefined {
  const { textures } = JSON.parse(Buffer.from(value, "base64").toString("utf8")) as {
    textures?: { SKIN?: { url?: string } };
  };

  return textures?.SKIN?.url?.split("/").at(-1);
}

export function textureOf(item: RawItem): ItemTexture {
  const model = modelOf(item.tag?.ExtraAttributes, item.tag?.ItemModel);
  const value = item.tag?.SkullOwner?.Properties?.textures?.[0]?.Value;
  const skin = value && skinHash(value);
  if (skin) return { kind: "head", skin, ...model };

  // Exact leather colors identify rare armor, and a shade up to 7 off per channel looks the same
  const color = item.tag?.display?.color;
  return { kind: "item", id: item.id, damage: item.Damage, ...(color === undefined ? {} : { color: color & 0xf8_f8_f8 }), ...model };
}

const MATERIAL_IDS: Record<string, number | undefined> = textures.materials;

/** A trophy fish at a tier, which Hypixel sends as paper with its own item_model. */
export const trophyFishTexture = (id: string, tier: string): ItemTexture => ({
  kind: "item",
  id: textures.materials.PAPER,
  damage: 0,
  ...modelOf({ id: `${id}_${tier.toUpperCase()}` }),
});

/** From the items resource, for an item the player doesn't own; undefined for a material 1.8 doesn't have. */
export function resourceTexture({ skin, material, durability, color, model }: ItemsResource["items"][string]): ItemTexture | undefined {
  const pack = model ? { model } : {};
  if (skin) return { kind: "head", skin, ...pack };
  const id = MATERIAL_IDS[material];
  if (id === undefined) return undefined;

  const damage = durability ?? 0;
  if (color === undefined) return { kind: "item", id, damage, ...pack };

  const [red, green, blue] = color.split(",").map(Number);
  return { kind: "item", id, damage, color: (red << 16) | (green << 8) | blue, ...pack };
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest;

  test("resourceTexture reads heads, the items resource's material names and leather dye", () => {
    expect(resourceTexture({ name: "Head", material: "SKULL_ITEM", skin: "abc123" })).toEqual({ kind: "head", skin: "abc123" });
    expect(resourceTexture({ name: "Zombie", material: "SKULL_ITEM", durability: 2 })).toEqual({ kind: "item", id: 397, damage: 2 });
    expect(resourceTexture({ name: "Lapis", material: "INK_SACK", durability: 4 })).toEqual({ kind: "item", id: 351, damage: 4 });
    expect(resourceTexture({ name: "Boots", material: "LEATHER_BOOTS", color: "139,0,0" })).toEqual({ kind: "item", id: 301, damage: 0, color: 0x8b_00_00 });
    expect(resourceTexture({ name: "New", material: "TRIAL_KEY" })).toBeUndefined();
    expect(resourceTexture({ name: "Stone", material: "PAPER", model: "hypixel_skyblock:item/stone" })).toEqual({ kind: "item", id: 339, damage: 0, model: "hypixel_skyblock:item/stone" });
  });

  test("textureOf rounds a dyed item's color down to the nearest 8 a channel", () => {
    expect(textureOf({ id: 301, Count: 1, Damage: 0, tag: { display: { color: 0x0f_10_17 } } })).toMatchObject({ color: 0x08_10_10 });
  });

  test("textureOf keeps an item's model and the attributes that pick its look", () => {
    const dagger = { id: 272, Count: 1, Damage: 0 };
    const model = ITEM_MODELS.FIREDUST_DAGGER;
    expect(textureOf({ ...dagger, tag: { ExtraAttributes: { id: "FIREDUST_DAGGER", td_attune_mode: 1, uuid: "a" } } })).toEqual({ kind: "item", id: 272, damage: 0, model, customData: { td_attune_mode: 1 } });
    expect(textureOf({ ...dagger, tag: { ExtraAttributes: { id: "FIREDUST_DAGGER", model: "SUMSUNG_1" } } })).toEqual({ kind: "item", id: 272, damage: 0, model });
    expect(textureOf({ ...dagger, tag: { ExtraAttributes: { id: "SOMETHING_NEW", td_attune_mode: 1 } } })).toEqual({ kind: "item", id: 272, damage: 0 });
    expect(textureOf({ ...dagger, tag: { ItemModel: "minecraft:goat_spawn_egg", ExtraAttributes: { id: "SOMETHING_NEW" } } }).model).toBe("minecraft:goat_spawn_egg");
    expect(textureOf({ ...dagger, tag: { ItemModel: "minecraft:blue_egg", ExtraAttributes: { id: "GOBLIN_EGG" } } }).model).toBe(ITEM_MODELS.GOBLIN_EGG);
  });
}
