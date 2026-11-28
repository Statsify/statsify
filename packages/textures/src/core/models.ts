/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

// oxlint-disable-next-line typescript/triple-slash-reference -- importers don't load our tsconfig
/// <reference path="./mojangson.d.ts" />

import { type PackStack, assetPath, namespaceIds, namespaced } from "./pack.js";
import type { ItemStack } from "./item-stack.js";
import type { TintSource } from "./tints.js";
import { maxDamage } from "./legacy-items.js";
import mojangson from "mojangson";
import { LRUCache } from "lru-cache";
import {
  type Transformation,
  type Vec3,
  composeTransforms,
} from "./geometry.js";

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

type ElementRotation = { origin: Vec3 } & (
  | { axis: "x" | "y" | "z"; angle: number; rescale?: boolean }
  | { x?: number; y?: number; z?: number }
);

export interface ModelElement {
  from: Vec3;
  to: Vec3;
  rotation?: ElementRotation;
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

export interface Model {
  id: string;
  generated: boolean;
  textures: Record<string, string>;
  elements: ModelElement[];
  display: Record<string, Transform>;
  guiLight: "front" | "side";
}

export interface SpecialModel {
  type: string;
  kind?: string;
  texture?: string;
  transformation?: Transformation;
}

export interface ItemLayer {
  model: Model;
  tints: TintSource[];
  special?: SpecialModel;
}

type ItemModel =
  | { type: "minecraft:model"; model: string; tints?: TintSource[] }
  | { type: "minecraft:composite"; models: ItemModel[] }
  | {
      type: "minecraft:condition";
      property: string;
      component?: string;
      predicate?: string;
      value?: unknown;
      on_true: ItemModel;
      on_false: ItemModel;
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

const SNBT_CACHE_LIMIT = 10_000;

const snbtCache = new LRUCache<string, Record<string, unknown>>({
  max: SNBT_CACHE_LIMIT,
});

function parseSnbt(snbt: string) {
  const cached = snbtCache.get(snbt);
  if (cached) return cached;

  const tag = mojangson.parse(snbt);
  if (tag.type !== "compound")
    throw new Error(`${snbt} isn't an SNBT compound`);

  // SNBT stores booleans as the bytes 1 and 0
  const parsed = Object.fromEntries(
    Object.entries(mojangson.simplify(tag)).map(([key, value]) => [
      key,
      typeof value === "boolean" ? Number(value) : value,
    ]),
  );

  snbtCache.set(snbt, parsed);
  return parsed;
}

// Every condition without a case is false for an item sitting in a slot
function condition(
  model: Extract<ItemModel, { type: "minecraft:condition" }>,
  item: ItemStack,
) {
  switch (model.property) {
    case "minecraft:has_component":
      return (
        model.component === "minecraft:dyed_color" && item.color !== undefined
      );

    case "minecraft:component": {
      if (model.predicate !== "minecraft:custom_data") return false;
      if (typeof model.value !== "string") {
        throw new TypeError(
          `${item.itemModel ?? item.id}'s custom_data condition isn't SNBT`,
        );
      }

      const expected = Object.entries(parseSnbt(model.value));
      if (expected.some(([, value]) => typeof value === "object")) {
        throw new TypeError(
          `${item.itemModel ?? item.id}'s custom_data condition compares a nested value`,
        );
      }

      return expected.every(([key, value]) => item.customData?.[key] === value);
    }

    case "minecraft:broken": {
      const durability = maxDamage(item.id);
      return (
        durability !== undefined &&
        !item.unbreakable &&
        (item.damage ?? 0) >= durability - 1
      );
    }

    default:
      return false;
  }
}

// Hypixel's items have none of these, so their selects take the fallback
const select = (model: Extract<ItemModel, { type: "minecraft:select" }>) =>
  model.property === "minecraft:display_context" ? "gui" : undefined;

const BUILTIN_GENERATED = "minecraft:builtin/generated";

const LEGACY_TURN: Transform = {
  rotation: [30, 225, 0],
  scale: [0.625, 0.625, 0.625],
};

export class ModelResolver {
  private models = new Map<string, Model>();
  private definitions = new Map<string, ItemModel>();

  public constructor(private stack: PackStack) {}

  public resolve(item: ItemStack): ItemLayer[] {
    return this.layers(this.definition(item.itemModel ?? item.id), item);
  }

  private definition(id: string) {
    const path = assetPath(id, "items", ".json");
    const cached = this.definitions.get(path);
    if (cached) return cached;

    const definition = this.stack.json<{ model: ItemModel }>(
      path,
      namespaceIds,
    );
    if (!definition)
      throw new Error(`${id} has no item model definition (${path})`);

    this.definitions.set(path, definition.model);
    return definition.model;
  }

  private model(id: string): Model {
    const cached = this.models.get(namespaced(id));
    if (cached) return cached;

    const chain: ModelFile[] = [];
    const legacy: boolean[] = [];
    let generated = false;

    for (let next: string | undefined = id; next; ) {
      if (namespaced(next) === BUILTIN_GENERATED) {
        generated = true;
        break;
      }

      const path = assetPath(next, "models", ".json");
      const file: ModelFile | undefined = this.stack.json(path);
      if (!file)
        throw new Error(
          `${id} needs the model ${next}, which isn't in the pack`,
        );

      chain.push(file);
      legacy.push(
        this.stack.packs.findLast(({ files }) => files.has(path))?.layout ===
          "legacy",
      );
      next = file.parent;
    }

    // Children override textures and display key by key but replace elements
    const root = chain.toReversed();

    const model: Model = {
      id: namespaced(id),
      generated,
      textures: resolveTextures(
        Object.assign({}, ...root.map((file) => file.textures)),
      ),
      elements: chain.find((file) => file.elements)?.elements ?? [],
      display: Object.assign({}, ...root.map((file) => file.display)),
      guiLight: chain.find((file) => file.gui_light)?.gui_light ?? "side",
    };

    // 1.8.9 turned every 3D item like a block before its gui transform
    const gui = chain.findIndex((file) => file.display?.gui);
    if (!generated && (gui === -1 ? legacy.includes(true) : legacy[gui])) {
      model.display.gui = composeTransforms(
        LEGACY_TURN,
        model.display.gui ?? {},
      );
    }

    this.models.set(model.id, model);
    return model;
  }

  // 1.8.9 drew block items through their own item model and gui transform
  private itemModel(item: ItemStack, selected: string) {
    if (!namespaced(selected).split(":")[1].startsWith("block/"))
      return selected;

    const [namespace, name] = namespaced(item.itemModel ?? item.id).split(":");
    const legacy = `${namespace}:item/${name}`;
    const legacyPath = assetPath(legacy, "models", ".json");
    const selectedPath = assetPath(selected, "models", ".json");

    const pack = this.stack.packs.findLast(
      ({ files }) => files.has(legacyPath) || files.has(selectedPath),
    );
    return pack?.layout === "legacy" && pack.files.has(legacyPath)
      ? legacy
      : selected;
  }

  private layers(model: ItemModel, item: ItemStack): ItemLayer[] {
    switch (model.type) {
      case "minecraft:model":
        return [
          {
            model: this.model(this.itemModel(item, model.model)),
            tints: model.tints ?? [],
          },
        ];

      case "minecraft:composite":
        return model.models.flatMap((child) => this.layers(child, item));

      case "minecraft:condition":
        return this.layers(
          condition(model, item) ? model.on_true : model.on_false,
          item,
        );

      case "minecraft:select": {
        const value = select(model);

        const match = model.cases.find(({ when }) =>
          Array.isArray(when) ? when.includes(value ?? "") : when === value,
        );

        const next = match?.model ?? model.fallback;
        if (!next)
          throw new Error(
            `${item.id} has no model for ${model.property} ${value}`,
          );

        return this.layers(next, item);
      }

      // Compasses, clocks and bows sit at their first frame
      case "minecraft:range_dispatch": {
        const next =
          model.entries.findLast(({ threshold }) => threshold <= 0)?.model ??
          model.fallback;
        if (!next)
          throw new Error(`${item.id} has no model for ${model.property} 0`);

        return this.layers(next, item);
      }

      case "minecraft:special":
        return [
          {
            model: this.model(model.base),
            tints: [],
            special: { ...model.model, transformation: model.transformation },
          },
        ];

      case "minecraft:empty":
      case "minecraft:bundle/selected_item":
        return [];
    }
  }
}

export function resolveTextures(textures: Record<string, TextureValue>) {
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

  const createStack = (files: Record<string, unknown>) =>
    new PackStack([
      {
        name: "test",
        hash: "test",
        layout: "modern",
        files: new Map(
          Object.entries(files).map(([path, json]) => [
            path,
            encoder.encode(JSON.stringify(json)),
          ]),
        ),
      },
    ]);

  describe("ModelResolver", () => {
    it("merges parents and resolves texture references", () => {
      const resolver = new ModelResolver(
        createStack({
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
            textures: {
              layer1: "#layer0",
              layer0: "minecraft:item/leather_boots",
            },
          },
          "assets/minecraft/models/item/base.json": {
            parent: "builtin/generated",
            textures: { layer0: "item/base", layer2: "#missing" },
            gui_light: "front",
          },
        }),
      );

      const [layer] = resolver.resolve({
        id: "minecraft:leather_boots",
        color: 0xff_00_00,
      });

      expect(layer.model).toMatchObject({
        id: "minecraft:item/dyed",
        generated: true,
        guiLight: "front",
        textures: {
          layer0: "minecraft:item/leather_boots",
          layer1: "minecraft:item/leather_boots",
        },
      });
      expect(layer.model.textures).not.toHaveProperty("layer2");
    });

    it("draws an item's own definition, whose ids may leave off their namespace", () => {
      const resolver = new ModelResolver(
        createStack({
          "assets/pack/items/dagger.json": {
            model: {
              type: "select",
              property: "display_context",
              cases: [
                {
                  when: "gui",
                  model: { type: "model", model: "pack:item/dagger" },
                },
              ],
              fallback: { type: "model", model: "pack:item/in_hand" },
            },
          },
          "assets/pack/models/item/dagger.json": {
            parent: "builtin/generated",
          },
        }),
      );

      const [layer] = resolver.resolve({
        id: "minecraft:golden_sword",
        itemModel: "pack:dagger",
      });
      expect(layer.model.id).toBe("pack:item/dagger");
    });
  });

  it("reads conditions from an item's custom data and wear", () => {
    const when = (
      property: string,
      fields?: Partial<Parameters<typeof condition>[0]>,
    ) =>
      ({
        type: "minecraft:condition",
        property,
        on_true: { type: "minecraft:empty" },
        on_false: { type: "minecraft:empty" },
        ...fields,
      }) as const;

    const mode = when("minecraft:component", {
      predicate: "minecraft:custom_data",
      value: "{mode:1}",
    });
    const broken = when("minecraft:broken");
    const dagger = { id: "minecraft:golden_sword" };
    const can = { id: "minecraft:carrot_on_a_stick" };

    expect(condition(mode, dagger)).toBe(false);
    expect(
      condition(mode, { ...dagger, customData: { id: "DAGGER", mode: 1 } }),
    ).toBe(true);
    expect(condition(mode, { ...dagger, customData: { mode: 3 } })).toBe(false);
    expect(condition(broken, { ...can, damage: 23 })).toBe(false);
    expect(condition(broken, { ...can, damage: 24 })).toBe(true);
    expect(condition(broken, { ...can, damage: 24, unbreakable: true })).toBe(
      false,
    );
  });

  it("reads SNBT compounds of plain values", () => {
    expect(parseSnbt("{ }")).toEqual({});
    expect(parseSnbt("{active:true, }")).toEqual({ active: 1 });
    expect(parseSnbt("{td_attune_mode:1}")).toEqual({ td_attune_mode: 1 });
    expect(
      parseSnbt('{ active:true, "a key":"b,c", level:2.5f, tier:-3b }'),
    ).toEqual({
      active: 1,
      "a key": "b,c",
      level: 2.5,
      tier: -3,
    });
    expect(parseSnbt("{nested:{a:1}}")).toEqual({ nested: { a: 1 } });
    expect(() => parseSnbt("td_attune_mode:1")).toThrow();
  });
}
