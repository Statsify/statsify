/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type PackStack, assetPath, namespaceTypes, namespaced } from "./pack.js";
import type { ItemStack } from "./item-stack.js";
import type { TintSource } from "./tints.js";
import type { Transformation, Vec3 } from "./geometry.js";

export interface Transform {
  rotation?: Vec3;
  translation?: Vec3;
  scale?: Vec3;
}

export type Direction = "down" | "up" | "north" | "south" | "west" | "east";

export interface ModelFace {
  texture: string;
  uv?: [number, number, number, number];
  rotation?: number;
  tintindex?: number;
}

export interface ModelElement {
  from: Vec3;
  to: Vec3;
  rotation?: { origin: Vec3; axis: "x" | "y" | "z"; angle: number; rescale?: boolean };
  shade?: boolean;
  faces: Partial<Record<Direction, ModelFace>>;
}

type TextureValue = string | { sprite: string };

interface ModelFile {
  parent?: string;
  textures?: Record<string, TextureValue>;
  elements?: ModelElement[];
  display?: Record<string, Transform>;
  gui_light?: "front" | "side";
}

/** A model with its parents merged in and its #texture references resolved */
export interface Model {
  id: string;
  /** builtin/generated items are drawn flat from layer0, layer1, … */
  generated: boolean;
  textures: Record<string, string>;
  elements: ModelElement[];
  display: Record<string, Transform>;
  guiLight: "front" | "side";
}

/** Geometry drawn in code, like heads and chests, placed by its base model's display */
export interface SpecialModel {
  type: string;
  kind?: string;
  texture?: string;
  color?: string;
  transformation?: Transformation;
}

export interface ItemLayer {
  model: Model;
  tints: TintSource[];
  special?: SpecialModel;
}

// https://minecraft.wiki/w/Items_model_definition
type ItemModel =
  | { type: "minecraft:model"; model: string; tints?: TintSource[] }
  | { type: "minecraft:composite"; models: ItemModel[] }
  | {
      type: "minecraft:condition";
      property: string;
      component?: string;
      on_true: ItemModel;
      on_false: ItemModel;
      transformation?: Transformation;
    }
  | {
      type: "minecraft:select";
      property: string;
      cases: { when: string | string[]; model: ItemModel }[];
      fallback?: ItemModel;
    }
  | {
      type: "minecraft:range_dispatch";
      property: string;
      entries: { threshold: number; model: ItemModel }[];
      scale?: number;
      fallback?: ItemModel;
    }
  | {
      type: "minecraft:special";
      model: Omit<SpecialModel, "transformation">;
      base: string;
      transformation?: Transformation;
    }
  | { type: "minecraft:empty" }
  | { type: "minecraft:bundle/selected_item" };

// Properties are read as they are for an item sitting in an inventory: not in use, not
// selected, not cast, so every condition without a case here is false
function condition(model: Extract<ItemModel, { type: "minecraft:condition" }>, item: ItemStack) {
  if (model.property !== "minecraft:has_component") return false;
  return model.component === "minecraft:dyed_color" && item.color !== undefined;
}

// Trims, block states, charge types and clock times aren't on Hypixel's items, so those
// selects take their fallback
const select = (model: Extract<ItemModel, { type: "minecraft:select" }>) =>
  model.property === "minecraft:display_context" ? "gui" : undefined;

const BUILTIN_GENERATED = "minecraft:builtin/generated";

export class ModelResolver {
  private models = new Map<string, Model>();
  private definitions = new Map<string, ItemModel>();

  public constructor(private stack: PackStack) {}

  /** The models an item draws in an inventory slot, bottom layer first */
  public resolve(item: ItemStack): ItemLayer[] {
    return this.layers(this.definition(item.id), item);
  }

  private definition(id: string) {
    const path = assetPath(id, "items", ".json");
    const cached = this.definitions.get(path);
    if (cached) return cached;

    const definition = this.stack.json<{ model: ItemModel }>(path, namespaceTypes);
    if (!definition) throw new Error(`${id} has no item model definition (${path})`);

    this.definitions.set(path, definition.model);
    return definition.model;
  }

  private model(id: string): Model {
    const cached = this.models.get(namespaced(id));
    if (cached) return cached;

    const chain: ModelFile[] = [];
    let generated = false;

    for (let next: string | undefined = id; next; ) {
      if (namespaced(next) === BUILTIN_GENERATED) {
        generated = true;
        break;
      }

      const file: ModelFile | undefined = this.stack.json(assetPath(next, "models", ".json"));
      if (!file) throw new Error(`${id} needs the model ${next}, which isn't in the pack`);

      chain.push(file);
      next = file.parent;
    }

    // Children override their parents' textures and display transforms key by key, and
    // replace their elements whole
    const root = chain.toReversed();

    const model: Model = {
      id: namespaced(id),
      generated,
      textures: resolveTextures(Object.assign({}, ...root.map((file) => file.textures))),
      elements: chain.find((file) => file.elements)?.elements ?? [],
      display: Object.assign({}, ...root.map((file) => file.display)),
      guiLight: chain.find((file) => file.gui_light)?.gui_light ?? "side",
    };

    this.models.set(model.id, model);
    return model;
  }

  private layers(model: ItemModel, item: ItemStack, transformation?: Transformation): ItemLayer[] {
    switch (model.type) {
      case "minecraft:model":
        return [{ model: this.model(model.model), tints: model.tints ?? [] }];

      case "minecraft:composite":
        return model.models.flatMap((child) => this.layers(child, item));

      // Shields keep their special models' transformation on the condition around them
      case "minecraft:condition":
        return this.layers(
          condition(model, item) ? model.on_true : model.on_false,
          item,
          model.transformation ?? transformation,
        );

      case "minecraft:select": {
        const value = select(model);

        const match = model.cases.find(({ when }) =>
          Array.isArray(when) ? when.includes(value ?? "") : when === value,
        );

        const next = match?.model ?? model.fallback;
        if (!next) throw new Error(`${item.id} has no model for ${model.property} ${value}`);

        return this.layers(next, item);
      }

      // Compasses, clocks and bows sit at their first frame
      case "minecraft:range_dispatch": {
        const next = model.entries.findLast(({ threshold }) => threshold <= 0)?.model ?? model.fallback;
        if (!next) throw new Error(`${item.id} has no model for ${model.property} 0`);

        return this.layers(next, item);
      }

      case "minecraft:special":
        return [
          {
            model: this.model(model.base),
            tints: [],
            special: { ...model.model, transformation: model.transformation ?? transformation },
          },
        ];

      case "minecraft:empty":
      case "minecraft:bundle/selected_item":
        return [];
    }
  }
}

/** Follows #references until each texture is a sprite id, and drops any that never get one */
function resolveTextures(textures: Record<string, TextureValue>) {
  const resolved: Record<string, string> = {};

  for (const key of Object.keys(textures)) {
    let value: TextureValue | undefined = textures[key];

    while (value !== undefined) {
      const sprite: string = typeof value === "string" ? value : value.sprite;

      if (!sprite.startsWith("#")) {
        resolved[key] = sprite;
        break;
      }

      value = textures[sprite.slice(1)];
    }
  }

  return resolved;
}

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;
  const { PackStack } = await import("./pack.js");

  const encoder = new TextEncoder();

  const packOf = (files: Record<string, unknown>) =>
    new PackStack([
      {
        name: "test",
        hash: "test",
        layout: "modern",
        files: new Map(
          Object.entries(files).map(([path, json]) => [path, encoder.encode(JSON.stringify(json))]),
        ),
      },
    ]);

  describe("ModelResolver", () => {
    it("merges parents and resolves texture references", () => {
      const resolver = new ModelResolver(
        packOf({
          "assets/minecraft/items/leather_boots.json": {
            model: {
              type: "condition",
              property: "minecraft:has_component",
              component: "minecraft:dyed_color",
              on_true: { type: "model", model: "item/dyed" },
              on_false: { type: "model", model: "item/plain" },
            },
          },
          "assets/minecraft/models/item/dyed.json": {
            parent: "item/base",
            textures: { layer1: "#layer0", layer0: "minecraft:item/leather_boots" },
          },
          "assets/minecraft/models/item/base.json": {
            parent: "builtin/generated",
            textures: { layer0: "item/base", layer2: "#missing" },
            gui_light: "front",
          },
        }),
      );

      const [layer] = resolver.resolve({ id: "minecraft:leather_boots", color: 0xff_00_00 });

      expect(layer.model).toMatchObject({
        id: "minecraft:item/dyed",
        generated: true,
        guiLight: "front",
        textures: { layer0: "minecraft:item/leather_boots", layer1: "minecraft:item/leather_boots" },
      });
      expect(layer.model.textures).not.toHaveProperty("layer2");
    });
  });
}
