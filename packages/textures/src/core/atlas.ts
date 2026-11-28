/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { CHEST_SCREEN, InventoryRenderer } from "./inventory.js";
import {
  type ComponentBranches,
  type ItemLayer,
  hasComponent,
} from "./models.js";
import {
  ItemRenderer,
  type ItemSource,
  type SkinLoader,
} from "./item-renderer.js";
import { context, createCanvas, decodePng } from "./canvas.js";
import type { IconCache } from "./icon-cache.js";
import type { ItemStack } from "./item-stack.js";
import { namespaced } from "./pack.js";

export type AtlasRect = [x: number, y: number, width: number, height: number];

export interface AtlasData {
  image: string;
  hash: string;
  scales: number[];
  legacyGlint: boolean;
  icons: Record<string, AtlasRect[]>;
  layers: Record<string, ItemLayer[] | ComponentBranches>;
  textures: Record<string, AtlasRect>;
  names: Record<string, string>;
}

export class Atlas implements ItemSource {
  private icons = new Map<string, OffscreenCanvas>();
  private sprites = new Map<string, ImageData>();

  // Atlas icons don't animate, so every texture is still
  public readonly textures = {
    get: async (id: string) => this.sprite(id),
    frame: () => undefined,
  };

  public readonly models = {
    resolve: (item: ItemStack) => {
      const layers = this.data.layers[item.id] ?? [];
      if (Array.isArray(layers)) return layers;
      return hasComponent(item, layers.component)
        ? layers.on_true
        : layers.on_false;
    },
  };

  public constructor(
    private data: AtlasData,
    private image: OffscreenCanvas,
  ) {}

  public get hash() {
    return this.data.hash;
  }

  public get legacyGlint() {
    return this.data.legacyGlint;
  }

  public get names() {
    return this.data.names;
  }

  // An atlas has no font, so the page draws the title, counts and tooltips
  public inventoryRenderer(cache?: IconCache, loadSkin?: SkinLoader) {
    return new InventoryRenderer(
      new ItemRenderer(this, cache, loadSkin),
      undefined,
      this.names,
      this.texture(CHEST_SCREEN),
    );
  }

  public drawsFromModels(id: string) {
    return id in this.data.layers;
  }

  // A 3D icon at a scale the atlas lacks is resized from its largest
  public icon(id: string, scale: number) {
    const key = `${id}/${scale}`;
    let icon = this.icons.get(key);

    if (!icon) {
      const rects = findRect(this.data.icons, id);
      // An item's icons are smallest first, so the last is the largest
      const [x, y, width, height] =
        rects.find(([, , width]) => width === 16 * scale) ?? rects.at(-1)!;
      icon = createCanvas(16 * scale, 16 * scale);
      context(icon).drawImage(
        this.image,
        x,
        y,
        width,
        height,
        0,
        0,
        icon.width,
        icon.height,
      );
      this.icons.set(key, icon);
    }

    return icon;
  }

  public texture(id: string) {
    const pixels = this.sprite(id);
    const canvas = createCanvas(pixels.width, pixels.height);
    context(canvas).putImageData(pixels, 0, 0);
    return canvas;
  }

  private sprite(id: string) {
    const key = namespaced(id);
    let sprite = this.sprites.get(key);

    if (!sprite) {
      sprite = context(this.image).getImageData(
        ...findRect(this.data.textures, key),
      );
      this.sprites.set(key, sprite);
    }

    return sprite;
  }
}

function findRect<T>(rects: Record<string, T>, id: string) {
  const rect = rects[id];
  if (!rect) throw new Error(`${id} isn't in the atlas`);
  return rect;
}

export async function loadAtlas(url: string | URL) {
  const response = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  if (!response.ok)
    throw new Error(`${url}: ${response.status} ${response.statusText}`);
  const data = (await response.json()) as AtlasData;

  const imageUrl = new URL(data.image, response.url);
  const image = await fetch(imageUrl, { signal: AbortSignal.timeout(60_000) });
  if (!image.ok)
    throw new Error(`${imageUrl}: ${image.status} ${image.statusText}`);

  return new Atlas(
    data,
    await decodePng(new Uint8Array(await image.arrayBuffer())),
  );
}
