/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  type ItemLayer,
  type Model,
  ModelResolver,
  type SpecialModel,
} from "./models.js";
import {
  type Quad,
  boxQuads,
  elementQuads,
  rasterize,
  transformQuads,
} from "./geometry.js";
import {
  context,
  createCanvas,
  createImageData,
  decodePng,
  hex,
} from "./canvas.js";
import { TextureLoader, mixPixels } from "./textures.js";
import type { IconCache } from "./icon-cache.js";
import type { ItemStack } from "./item-stack.js";
import { LRUCache } from "lru-cache";
import { type PackStack, assetPath, namespaced } from "./pack.js";
import { tintColor } from "./tints.js";

const SIZE = 16;

export const MS_PER_TICK = 50;

const CACHE_LIMIT = 2000;

function promiseCache<T extends NonNullable<unknown>>() {
  return new LRUCache<string, T, () => Promise<T>>({
    max: CACHE_LIMIT,
    // Without it, an evicted load that's still running rejects as aborted
    ignoreFetchAbort: true,
    fetchMethod: (_key, _stale, { context }) => context(),
  });
}

interface TintedLayer extends ItemLayer {
  colors: number[];
}

const HEADS: Record<string, { texture: string; hat: boolean }> = {
  skeleton: { texture: "entity/skeleton/skeleton", hat: false },
  wither_skeleton: { texture: "entity/skeleton/wither_skeleton", hat: false },
  creeper: { texture: "entity/creeper/creeper", hat: false },
  zombie: { texture: "entity/zombie/zombie", hat: true },
};

const DEFAULT_SKIN = "entity/player/wide/steve";

const GLINT = "misc/enchanted_glint_item";
const LEGACY_GLINT = "misc/enchanted_item_glint";

function tinted(pixels: ImageData, color: number) {
  const red = (color >> 16) & 0xff;
  const green = (color >> 8) & 0xff;
  const blue = color & 0xff;
  const out = createImageData(pixels.width, pixels.height);
  const { data } = out;
  data.set(pixels.data);

  for (let i = 0; i < data.length; i += 4) {
    data[i] = (data[i] * red) / 255;
    data[i + 1] = (data[i + 1] * green) / 255;
    data[i + 2] = (data[i + 2] * blue) / 255;
  }

  return out;
}

function drawSprite(
  ctx: OffscreenCanvasRenderingContext2D,
  pixels: ImageData,
  color?: number,
) {
  const sprite = createCanvas(pixels.width, pixels.height);
  context(sprite).putImageData(
    color === undefined ? pixels : tinted(pixels, color),
    0,
    0,
  );
  ctx.drawImage(sprite, 0, 0, ctx.canvas.width, ctx.canvas.height);
}

interface GlintPass {
  angle: number;
  scrollU: number;
  scrollV: number;
}

interface Glint {
  passes: GlintPass[];
  tint: [number, number, number];
}

function modernGlint(tick: number): Glint {
  const time = tick * MS_PER_TICK * 0.5 * 8;
  const scrollV = (time % 30_000) / 30_000;
  return {
    passes: [
      { angle: Math.PI / 18, scrollU: -(time % 110_000) / 110_000, scrollV },
    ],
    tint: [0.75, 0.75, 0.75],
  };
}

function legacyGlint(tick: number): Glint {
  const ms = tick * MS_PER_TICK;
  return {
    passes: [
      { angle: (-5 * Math.PI) / 18, scrollU: (ms % 3000) / 3000, scrollV: 0 },
      { angle: Math.PI / 18, scrollU: -(ms % 4873) / 4873, scrollV: 0 },
    ],
    tint: [0x80 / 255, 0x40 / 255, 0xcc / 255],
  };
}

// Squared, so adding it with "lighter" matches the game's src² + dst
function squaredGlint(texture: ImageData, tint: Glint["tint"]) {
  const squared = createImageData(texture.width, texture.height);

  for (let i = 0; i < texture.data.length; i += 4) {
    for (let channel = 0; channel < 3; channel++) {
      const strength = (texture.data[i + channel] / 255) * tint[channel];
      squared.data[i + channel] = strength * strength * 255;
    }

    squared.data[i + 3] = 255;
  }

  const canvas = createCanvas(texture.width, texture.height);
  context(canvas).putImageData(squared, 0, 0);
  return { pixels: squared, canvas };
}

const translucent = (icon: OffscreenCanvas) =>
  context(icon)
    .getImageData(0, 0, icon.width, icon.height)
    .data.some((value, i) => i % 4 === 3 && value > 0 && value < 255);

// "lighter" adds alpha too, so translucent icons add the glint per pixel
function addGlint(
  ctx: OffscreenCanvasRenderingContext2D,
  glint: ImageData,
  passes: GlintPass[],
) {
  const { width, height } = ctx.canvas;
  const pixels = ctx.getImageData(0, 0, width, height);

  for (const { angle, scrollU, scrollV } of passes) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const out = (y * width + x) * 4;
        if (pixels.data[out + 3] === 0) continue;

        const u = (x + 0.5) / width / 8;
        const v = (y + 0.5) / height / 8;
        const gu = u * cos - v * sin + scrollU;
        const gv = u * sin + v * cos + scrollV;
        const gx = Math.floor((gu - Math.floor(gu)) * glint.width);
        const gy = Math.floor((gv - Math.floor(gv)) * glint.height);
        const texel = (gy * glint.width + gx) * 4;

        for (let channel = 0; channel < 3; channel++)
          pixels.data[out + channel] += glint.data[texel + channel];
      }
    }
  }

  ctx.putImageData(pixels, 0, 0);
}

// A canvas pattern avoids reading pixels back for each tick
function drawGlint(
  ctx: OffscreenCanvasRenderingContext2D,
  glint: OffscreenCanvas,
  passes: GlintPass[],
) {
  const { width, height } = ctx.canvas;
  const layer = createCanvas(width, height);
  const layerCtx = context(layer);
  layerCtx.globalCompositeOperation = "lighter";

  for (const { angle, scrollU, scrollV } of passes) {
    const a11 = (glint.width * Math.cos(angle)) / (8 * width);
    const a12 = (-glint.width * Math.sin(angle)) / (8 * height);
    const a21 = (glint.height * Math.sin(angle)) / (8 * width);
    const a22 = (glint.height * Math.cos(angle)) / (8 * height);
    const offsetX = scrollU * glint.width;
    const offsetY = scrollV * glint.height;

    const determinant = a11 * a22 - a12 * a21;
    const a = a22 / determinant;
    const b = -a21 / determinant;
    const c = -a12 / determinant;
    const d = a11 / determinant;

    const pattern = layerCtx.createPattern(glint, "repeat")!;
    pattern.setTransform({
      a,
      b,
      c,
      d,
      e: -(a * offsetX + c * offsetY),
      f: -(b * offsetX + d * offsetY),
    });
    layerCtx.fillStyle = pattern;
    layerCtx.fillRect(0, 0, width, height);
  }

  layerCtx.globalCompositeOperation = "destination-in";
  layerCtx.drawImage(ctx.canvas, 0, 0);

  ctx.globalCompositeOperation = "lighter";
  ctx.drawImage(layer, 0, 0);
}

// Drawing one icon over the other at an alpha isn't a linear blend
function crossFade(from: OffscreenCanvas, to: OffscreenCanvas, blend: number) {
  const pixels = context(from).getImageData(0, 0, from.width, from.height);
  mixPixels(pixels, context(to).getImageData(0, 0, to.width, to.height), blend);

  const canvas = createCanvas(from.width, from.height);
  context(canvas).putImageData(pixels, 0, 0);
  return canvas;
}

function faceTexture(model: Model, reference: string) {
  const id = reference.startsWith("#")
    ? model.textures[reference.slice(1)]
    : reference;
  if (!id) throw new Error(`${model.id} has no texture for ${reference}`);
  return id;
}

function textureIds({ model, special }: ItemLayer) {
  if (special) return [];

  if (model.generated) {
    const ids: string[] = [];
    for (let layer = 0; model.textures[`layer${layer}`]; layer++)
      ids.push(model.textures[`layer${layer}`]);
    return ids;
  }

  const faces = model.elements.flatMap((element) =>
    Object.values(element.faces),
  );
  return [...new Set(faces.map((face) => faceTexture(model, face.texture)))];
}

// The renderer never fetches skins, so the caller picks where they come from
export type SkinLoader = (url: string) => Promise<Uint8Array>;

export class ItemRenderer {
  private models: ModelResolver;
  private textures: TextureLoader;
  private icons = promiseCache<OffscreenCanvas>();
  private legacyGlint: boolean;
  private glint?: Promise<ReturnType<typeof squaredGlint>>;
  private translucentIcons = new WeakMap<OffscreenCanvas, boolean>();

  public constructor(
    private stack: PackStack,
    private cache?: IconCache,
    private loadSkin?: SkinLoader,
  ) {
    this.models = new ModelResolver(stack);
    this.textures = new TextureLoader(stack);

    const legacy = assetPath(LEGACY_GLINT, "textures", ".png");
    this.legacyGlint =
      stack.packs
        .findLast(
          ({ files }) =>
            files.has(legacy) ||
            files.has(assetPath(GLINT, "textures", ".png")),
        )
        ?.files.has(legacy) ?? false;
  }

  public async render(
    item: ItemStack,
    scale: number,
    tick = 0,
  ): Promise<OffscreenCanvas> {
    const icon = await this.base(item, scale, tick);
    if (!item.enchanted) return icon;

    // The glint moves every tick, so it's drawn over the cached icon
    const canvas = createCanvas(icon.width, icon.height);
    const ctx = context(canvas);
    ctx.drawImage(icon, 0, 0);
    const { passes, tint } = this.legacyGlint
      ? legacyGlint(tick)
      : modernGlint(tick);
    this.glint ??= this.textures
      .get(this.legacyGlint ? LEGACY_GLINT : GLINT)
      .then((texture) => squaredGlint(texture, tint));
    const glint = await this.glint;

    if (!this.translucentIcons.has(icon))
      this.translucentIcons.set(icon, translucent(icon));

    if (this.translucentIcons.get(icon)) addGlint(ctx, glint.pixels, passes);
    else drawGlint(ctx, glint.canvas, passes);

    return canvas;
  }

  private async base(
    item: ItemStack,
    scale: number,
    tick: number,
  ): Promise<OffscreenCanvas> {
    const resolved = this.models.resolve(item);

    const animated = resolved
      .flatMap(textureIds)
      .map((id) => this.textures.frame(id, tick))
      .filter((frame) => frame !== undefined);

    // Fading between the same two ticks is a cross-fade of two cached icons
    const [first] = animated;
    const fades =
      first !== undefined &&
      animated.every(
        ({ blend, start, end }) =>
          blend > 0 && start === first.start && end === first.end,
      );

    if (fades) {
      const [from, to] = await Promise.all([
        this.base(item, scale, first.start),
        this.base(item, scale, first.end),
      ]);
      return crossFade(from, to, first.blend);
    }

    const grass = resolved.some(({ tints }) =>
      tints.some(({ type }) => type === "minecraft:grass"),
    )
      ? await this.textures.get("colormap/grass")
      : undefined;

    const layers = resolved.map((layer) => ({
      ...layer,
      colors: layer.tints.map((tint) => tintColor(tint, item, grass)),
    }));

    // Textures blending on different timings are drawn fresh every tick
    if (animated.some(({ blend }) => blend > 0)) {
      return this.draw(layers, item, scale, tick);
    }

    const frames = animated.map(({ index }) => index);

    const key = [
      this.stack.hash,
      ...layers.map(({ model, colors, special }) =>
        [
          model.id,
          special?.type,
          special?.kind,
          special?.texture,
          ...colors.map(hex),
        ]
          .filter(Boolean)
          .join(","),
      ),
      layers.some(({ special }) => special?.type === "minecraft:player_head")
        ? item.skin
        : undefined,
      frames.length > 0 ? frames.join(",") : undefined,
      scale,
    ]
      .filter((part) => part !== undefined)
      .join("/");

    return this.icons.forceFetch(key, {
      context: () => this.load(key, layers, item, scale, tick),
    });
  }

  private async load(
    key: string,
    layers: TintedLayer[],
    item: ItemStack,
    scale: number,
    tick: number,
  ) {
    const cached = await this.cache?.get(this.stack.hash, key);
    if (cached) return cached;

    const icon = await this.draw(layers, item, scale, tick);
    void this.cache?.set(this.stack.hash, key, icon).catch(console.error);

    return icon;
  }

  private async draw(
    layers: TintedLayer[],
    item: ItemStack,
    scale: number,
    tick: number,
  ) {
    const canvas = createCanvas(SIZE * scale, SIZE * scale);
    const ctx = context(canvas);

    const drawings = await Promise.all(
      layers.map(
        async (layer): Promise<{ pixels: ImageData; color?: number }[]> => {
          if (layer.model.generated && !layer.special)
            return this.sprites(layer, tick);

          const quads = layer.special
            ? await this.specialQuads(layer.special, item)
            : await this.elementQuads(layer, tick);

          return [
            {
              pixels: rasterize(
                quads,
                layer.model.display.gui,
                layer.model.guiLight,
                scale,
              ),
            },
          ];
        },
      ),
    );

    for (const { pixels, color } of drawings.flat())
      drawSprite(ctx, pixels, color);

    return canvas;
  }

  private sprites(layer: TintedLayer, tick: number) {
    return Promise.all(
      textureIds(layer).map(async (id, index) => ({
        pixels: await this.textures.get(id, tick),
        color: layer.colors[index],
      })),
    );
  }

  private async elementQuads(layer: TintedLayer, tick: number) {
    const { model, colors } = layer;

    const textures = new Map(
      await Promise.all(
        textureIds(layer).map(
          async (id) => [id, await this.textures.get(id, tick)] as const,
        ),
      ),
    );

    return model.elements.flatMap((element) =>
      elementQuads(element, (face) => ({
        texture: textures.get(faceTexture(model, face.texture))!,
        tint: face.tintindex === undefined ? undefined : colors[face.tintindex],
      })),
    );
  }

  private async specialQuads(
    special: SpecialModel,
    item: ItemStack,
  ): Promise<Quad[]> {
    if (special.type === "minecraft:chest" && special.texture) {
      const [namespace, name] = namespaced(special.texture).split(":");
      const texture = await this.textures.get(
        `${namespace}:entity/chest/${name}`,
      );

      return transformQuads(
        [
          ...boxQuads([1, 0, 1], [14, 10, 14], [0, 19], texture),
          ...boxQuads([1, 9, 1], [14, 5, 14], [0, 0], texture),
          ...boxQuads([7, 7, 15], [2, 4, 1], [0, 0], texture),
        ],
        special.transformation,
      );
    }

    let head: { texture?: string; hat: boolean } | undefined;
    if (special.type === "minecraft:player_head") head = { hat: true };
    else if (special.type === "minecraft:head")
      head = HEADS[special.kind ?? ""];

    if (!head) {
      const name = special.kind
        ? `${special.kind} ${special.type}`
        : special.type;
      throw new Error(
        `${item.id} uses a ${name} model, which isn't supported yet`,
      );
    }

    const texture =
      !head.texture && item.skin
        ? await this.skin(item.skin)
        : await this.textures.get(head.texture ?? DEFAULT_SKIN);

    const quads = boxQuads([-4, -8, -4], [8, 8, 8], [0, 0], texture);
    if (head.hat)
      quads.push(...boxQuads([-4, -8, -4], [8, 8, 8], [32, 0], texture, 0.25));

    return transformQuads(quads, special.transformation);
  }

  private async skin(url: string) {
    if (!this.loadSkin)
      throw new Error(
        `Drawing ${url} needs the ItemRenderer to have a skin loader`,
      );

    const image = await decodePng(await this.loadSkin(url));
    return context(image).getImageData(0, 0, image.width, image.height);
  }
}

if (import.meta.vitest) {
  const { expect, it } = import.meta.vitest;

  it("keeps the most recently used promises and retries rejected ones", async () => {
    const cache = promiseCache<number>();
    const get = (key: string, load: () => Promise<number>) =>
      cache.forceFetch(key, { context: load });

    await expect(
      get("a", () => Promise.reject(new Error("failed"))),
    ).rejects.toThrow();
    expect(
      await Promise.all([get("a", async () => 1), get("a", async () => 2)]),
    ).toEqual([1, 1]);
    expect(await get("a", async () => 3)).toBe(1);

    await Promise.all(
      Array.from({ length: CACHE_LIMIT - 1 }, (_, key) =>
        get(`${key + 1}`, async () => key),
      ),
    );
    expect(await get("a", async () => 4)).toBe(1);

    await get("b", async () => 0);
    expect(await get("1", async () => 5)).toBe(5);
  });
}
