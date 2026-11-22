/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { context, createCanvas, decodePng } from "./canvas.js";
import { type ComponentBranches, type ItemLayer, hasComponent } from "./models.js";
import type { ItemStack } from "./item-stack.js";
import { namespaced } from "./pack.js";

export type AtlasRect = [x: number, y: number, width: number, height: number];

/** The map `pnpm atlas` writes beside its image */
export interface AtlasData {
  /** The image's file name, next to the map */
  image: string;
  /** The image's content hash, which icon cache keys start with */
  hash: string;
  /** Screen pixels per GUI pixel that 3D icons are drawn at, each once. Flat icons are 16 pixels */
  scales: number[];
  legacyGlint: boolean;
  /** Every item's icon as a plain stack, unenchanted, at its first animation frame, smallest first */
  icons: Record<string, AtlasRect[]>;
  /** The models of items whose look depends on their stack (dyes, potions, banners, shields, heads), both branches of a component check */
  layers: Record<string, ItemLayer[] | ComponentBranches>;
  /** Their sprites, the glint and the chest screen, by namespaced texture id */
  textures: Record<string, AtlasRect>;
  /** The pack's English names for its items, keyed as `tooltipLines` reads them */
  names: Record<string, string>;
}

/** A pack's icons drawn ahead of time, which stand in for the pack in the renderers */
export class Atlas {
  private icons = new Map<string, OffscreenCanvas>();
  private sprites = new Map<string, ImageData>();

  /** Atlas icons don't animate, so every texture is still */
  public readonly textures = {
    get: async (id: string) => this.sprite(id),
    frame: () => undefined,
  };

  public readonly models = {
    resolve: (item: ItemStack) => {
      const layers = this.data.layers[item.id] ?? [];
      if (Array.isArray(layers)) return layers;
      return hasComponent(item, layers.component) ? layers.on_true : layers.on_false;
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

  /** Whether the item is drawn from its models rather than its icon, since its stack changes how it looks */
  public drawsFromModels(id: string) {
    return id in this.data.layers;
  }

  /** An item's icon, 16 × scale pixels square. A 3D icon at a scale the atlas lacks is resized from its largest */
  public icon(id: string, scale: number) {
    const key = `${id}/${scale}`;
    let icon = this.icons.get(key);

    if (!icon) {
      const rects = rectOf(this.data.icons, id);
      const [x, y, width, height] = rects.find(([, , width]) => width === 16 * scale) ?? rects.at(-1)!;
      icon = createCanvas(16 * scale, 16 * scale);
      context(icon).drawImage(this.image, x, y, width, height, 0, 0, icon.width, icon.height);
      this.icons.set(key, icon);
    }

    return icon;
  }

  /** A texture as a canvas of its own */
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
      sprite = context(this.image).getImageData(...rectOf(this.data.textures, key));
      this.sprites.set(key, sprite);
    }

    return sprite;
  }
}

function rectOf<T>(rects: Record<string, T>, id: string) {
  const rect = rects[id];
  if (!rect) throw new Error(`${id} isn't in the atlas`);
  return rect;
}

/** Loads an atlas from its map's URL, with the image beside it */
export async function loadAtlas(url: string | URL) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: ${response.status} ${response.statusText}`);
  const data = (await response.json()) as AtlasData;

  const imageUrl = new URL(data.image, response.url);
  const image = await fetch(imageUrl);
  if (!image.ok) throw new Error(`${imageUrl}: ${image.status} ${image.statusText}`);

  return new Atlas(data, await decodePng(new Uint8Array(await image.arrayBuffer())));
}
