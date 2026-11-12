/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type ItemLayer, type Model, ModelResolver, type SpecialModel } from "./models.js";
import { type Quad, type Transformation, boxQuads, elementQuads, rasterize, transformQuads } from "./geometry.js";
import { context, createCanvas, createImageData, decodePng, hex } from "./canvas.js";
import { TextureLoader } from "./textures.js";
import type { IconCache } from "./icon-cache.js";
import type { BannerLayer, ItemStack } from "./item-stack.js";
import { type PackStack, assetPath, namespaced } from "./pack.js";
import { dyeColor, tintColor } from "./tints.js";

const SIZE = 16;

interface TintedLayer extends ItemLayer {
  colors: number[];
}

// Mob heads by their special model kind. Zombies have a hat layer, like players
const HEADS: Record<string, { texture: string; hat: boolean }> = {
  skeleton: { texture: "entity/skeleton/skeleton", hat: false },
  wither_skeleton: { texture: "entity/skeleton/wither_skeleton", hat: false },
  creeper: { texture: "entity/creeper/creeper", hat: false },
  zombie: { texture: "entity/zombie/zombie", hat: true },
};

const DEFAULT_SKIN = "entity/player/wide/steve";

// A banner in a slot has its flag at the start of its wave
const FLAG_TILT = (-0.0125 + 0.01) * Math.PI;
const FLAG_POSE: Transformation = {
  left_rotation: [Math.sin(FLAG_TILT / 2), 0, 0, Math.cos(FLAG_TILT / 2)],
  translation: [0, -44 / 16, 0],
};

const PATTERNED = new Set(["minecraft:banner", "minecraft:shield"]);

const entityTexture = (folder: string, id: string) => {
  const [namespace, name] = namespaced(id).split(":");
  return `${namespace}:entity/${folder}/${name}`;
};

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

function drawSprite(ctx: OffscreenCanvasRenderingContext2D, pixels: ImageData, color?: number) {
  const sprite = createCanvas(pixels.width, pixels.height);
  context(sprite).putImageData(color === undefined ? pixels : tinted(pixels, color), 0, 0);
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
  const time = tick * 50 * 0.5 * 8;
  const scrollV = (time % 30_000) / 30_000;
  return { passes: [{ angle: Math.PI / 18, scrollU: -(time % 110_000) / 110_000, scrollV }], tint: [0.75, 0.75, 0.75] };
}

function legacyGlint(tick: number): Glint {
  const ms = tick * 50;
  return {
    passes: [
      { angle: (-5 * Math.PI) / 18, scrollU: (ms % 3000) / 3000, scrollV: 0 },
      { angle: Math.PI / 18, scrollU: -(ms % 4873) / 4873, scrollV: 0 },
    ],
    tint: [0x80 / 255, 0x40 / 255, 0xcc / 255],
  };
}

/** The glint texture tinted and squared, so adding it with "lighter" is Minecraft's src² + dst */
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

// "lighter" adds alpha too, which would make translucent icons more opaque, so those add the glint
// to their pixels' colors one by one
function addGlint(ctx: OffscreenCanvasRenderingContext2D, glint: ImageData, passes: GlintPass[]) {
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

        for (let channel = 0; channel < 3; channel++) pixels.data[out + channel] += glint.data[texel + channel];
      }
    }
  }

  ctx.putImageData(pixels, 0, 0);
}

// A canvas pattern avoids reading pixels back for each tick
function drawGlint(ctx: OffscreenCanvasRenderingContext2D, glint: OffscreenCanvas, passes: GlintPass[]) {
  const { width, height } = ctx.canvas;
  const layer = createCanvas(width, height);
  const layerCtx = context(layer);
  layerCtx.globalCompositeOperation = "lighter";

  for (const { angle, scrollU, scrollV } of passes) {
    // A pixel center c samples the texel at A·c + offset: rotated, an eighth of a texture per icon
    const a11 = (glint.width * Math.cos(angle)) / (8 * width);
    const a12 = (-glint.width * Math.sin(angle)) / (8 * height);
    const a21 = (glint.height * Math.sin(angle)) / (8 * width);
    const a22 = (glint.height * Math.cos(angle)) / (8 * height);
    const offsetX = scrollU * glint.width;
    const offsetY = scrollV * glint.height;

    // The pattern's transform goes the other way, from texels to pixels
    const determinant = a11 * a22 - a12 * a21;
    const a = a22 / determinant;
    const b = -a21 / determinant;
    const c = -a12 / determinant;
    const d = a11 / determinant;

    const pattern = layerCtx.createPattern(glint, "repeat")!;
    pattern.setTransform({ a, b, c, d, e: -(a * offsetX + c * offsetY), f: -(b * offsetX + d * offsetY) });
    layerCtx.fillStyle = pattern;
    layerCtx.fillRect(0, 0, width, height);
  }

  layerCtx.globalCompositeOperation = "destination-in";
  layerCtx.drawImage(ctx.canvas, 0, 0);

  ctx.globalCompositeOperation = "lighter";
  ctx.drawImage(layer, 0, 0);
}

// Mixed pixel by pixel like the texels, since drawing one icon over the other at an alpha isn't a
// linear blend: two identical translucent icons would come out more opaque
function crossFade(from: OffscreenCanvas, to: OffscreenCanvas, blend: number) {
  const pixels = context(from).getImageData(0, 0, from.width, from.height);
  const next = context(to).getImageData(0, 0, to.width, to.height);

  for (let i = 0; i < pixels.data.length; i++) {
    pixels.data[i] = pixels.data[i] * (1 - blend) + next.data[i] * blend;
  }

  const canvas = createCanvas(from.width, from.height);
  context(canvas).putImageData(pixels, 0, 0);
  return canvas;
}

function faceTexture(model: Model, reference: string) {
  const id = reference.startsWith("#") ? model.textures[reference.slice(1)] : reference;
  if (!id) throw new Error(`${model.id} has no texture for ${reference}`);
  return id;
}

/** The pack sprites a layer draws: layer0, layer1, … when generated, or its faces' textures */
function textureIds({ model, special }: ItemLayer) {
  if (special) return [];

  if (model.generated) {
    const ids: string[] = [];
    for (let layer = 0; model.textures[`layer${layer}`]; layer++) ids.push(model.textures[`layer${layer}`]);
    return ids;
  }

  const faces = model.elements.flatMap((element) => Object.values(element.faces));
  return [...new Set(faces.map((face) => faceTexture(model, face.texture)))];
}

export class ItemRenderer {
  private models: ModelResolver;
  private textures: TextureLoader;
  private icons = new Map<string, Promise<OffscreenCanvas>>();
  private skins = new Map<string, Promise<ImageData | undefined>>();
  private legacyGlint: boolean;
  private glint?: Promise<ReturnType<typeof squaredGlint>>;
  private translucentIcons = new WeakMap<OffscreenCanvas, boolean>();

  public constructor(
    private stack: PackStack,
    private cache?: IconCache,
  ) {
    this.models = new ModelResolver(stack);
    this.textures = new TextureLoader(stack);

    const legacy = assetPath(LEGACY_GLINT, "textures", ".png");
    this.legacyGlint =
      stack.packs.findLast(({ files }) => files.has(legacy) || files.has(assetPath(GLINT, "textures", ".png")))
        ?.files.has(legacy) ?? false;
  }

  /** Whether an item's icon changes over time, from an animated texture or the glint */
  public animates(item: ItemStack) {
    return (
      Boolean(item.enchanted) ||
      this.models
        .resolve(item)
        .flatMap(textureIds)
        .some((id) => this.textures.frame(id, 0))
    );
  }

  /** Draws an item 16 × scale pixels square, at a game tick for animated textures and the glint */
  public async render(item: ItemStack, scale: number, tick = 0): Promise<OffscreenCanvas> {
    const icon = await this.base(item, scale, tick);
    if (!item.enchanted) return icon;

    // The glint moves every tick, so it goes over the cached icon rather than into it
    const canvas = createCanvas(icon.width, icon.height);
    const ctx = context(canvas);
    ctx.drawImage(icon, 0, 0);
    const { passes, tint } = this.legacyGlint ? legacyGlint(tick) : modernGlint(tick);
    this.glint ??= this.textures.get(this.legacyGlint ? LEGACY_GLINT : GLINT).then((texture) => squaredGlint(texture, tint));
    const glint = await this.glint;

    if (!this.translucentIcons.has(icon)) this.translucentIcons.set(icon, translucent(icon));

    if (this.translucentIcons.get(icon)) addGlint(ctx, glint.pixels, passes);
    else drawGlint(ctx, glint.canvas, passes);

    return canvas;
  }

  private async base(requested: ItemStack, scale: number, tick: number): Promise<OffscreenCanvas> {
    // Failed skins share the default head's cache entry
    const item =
      requested.skin && !(await this.skin(requested.skin)) ? { ...requested, skin: undefined } : requested;

    const resolved = this.models.resolve(item);

    const animated = resolved
      .flatMap(textureIds)
      .map((id) => this.textures.frame(id, tick))
      .filter((frame) => frame !== undefined);

    // Blending two frames' texels blends the icons drawn from them, so when every texture fades
    // between the same two ticks, the frame is a cross-fade of those two cached icons
    const [first] = animated;
    const fades =
      first !== undefined &&
      animated.every(({ blend, start, end }) => blend > 0 && start === first.start && end === first.end);

    if (fades) {
      const [from, to] = await Promise.all([this.base(item, scale, first.start), this.base(item, scale, first.end)]);
      return crossFade(from, to, first.blend);
    }

    const grass = resolved.some(({ tints }) => tints.some(({ type }) => type === "minecraft:grass"))
      ? await this.textures.get("colormap/grass")
      : undefined;

    const layers = resolved.map((layer) => ({
      ...layer,
      colors: layer.tints.map((tint) => tintColor(tint, item, grass)),
    }));

    // Textures blending on different timings change every tick, so they're drawn fresh each time
    if (animated.some(({ blend }) => blend > 0)) {
      return this.draw(layers, item, scale, tick);
    }

    const frames = animated.map(({ index }) => index);

    // Items that resolve to the same models and colors share an icon
    const key = [
      this.stack.hash,
      ...layers.map(({ model, colors, special }) =>
        [model.id, special?.type, special?.kind, special?.texture, special?.color, ...colors.map(hex)]
          .filter(Boolean)
          .join(","),
      ),
      layers.some(({ special }) => special?.type === "minecraft:player_head") ? item.skin : undefined,
      layers.some(({ special }) => special && PATTERNED.has(special.type))
        ? [item.baseColor, ...(item.patterns ?? []).map(({ pattern, color }) => `${pattern}:${color}`)].join(",")
        : undefined,
      frames.length > 0 ? frames.join(",") : undefined,
      scale,
    ]
      .filter((part) => part !== undefined)
      .join("/");

    let icon = this.icons.get(key);

    if (!icon) {
      icon = this.load(key, layers, item, scale, tick);
      this.icons.set(key, icon);
    }

    return icon;
  }

  private async load(key: string, layers: TintedLayer[], item: ItemStack, scale: number, tick: number) {
    const cached = await this.cache?.get(key);
    if (cached) return cached;

    const icon = await this.draw(layers, item, scale, tick);
    void this.cache?.set(key, icon).catch(console.error);

    return icon;
  }

  private async draw(layers: TintedLayer[], item: ItemStack, scale: number, tick: number) {
    const canvas = createCanvas(SIZE * scale, SIZE * scale);
    const ctx = context(canvas);

    const drawings = await Promise.all(
      layers.map(async (layer): Promise<{ pixels: ImageData; color?: number }[]> => {
        if (layer.model.generated && !layer.special) return this.sprites(layer, tick);

        const passes = layer.special
          ? await this.specialPasses(layer.special, item)
          : [await this.elementQuads(layer, tick)];

        return passes.map((quads) => ({
          pixels: rasterize(quads, layer.model.display.gui, layer.model.guiLight, scale),
        }));
      }),
    );

    for (const { pixels, color } of drawings.flat()) drawSprite(ctx, pixels, color);

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
        textureIds(layer).map(async (id) => [id, await this.textures.get(id, tick)] as const),
      ),
    );

    return model.elements.flatMap((element) =>
      elementQuads(element, (face) => ({
        texture: textures.get(faceTexture(model, face.texture))!,
        tint: face.tintindex === undefined ? undefined : colors[face.tintindex],
      })),
    );
  }

  /** A special model's quads, in passes drawn one over the other */
  private async specialPasses(special: SpecialModel, item: ItemStack): Promise<Quad[][]> {
    const place = (quads: Quad[]) => transformQuads(quads, special.transformation);

    // Ender and trapped chests are chests with another texture
    if (special.type === "minecraft:chest" && special.texture) {
      const texture = await this.textures.get(entityTexture("chest", special.texture));

      return [
        place([
          ...boxQuads([1, 0, 1], [14, 10, 14], [0, 19], texture),
          ...boxQuads([1, 9, 1], [14, 5, 14], [0, 0], texture),
          ...boxQuads([7, 7, 15], [2, 4, 1], [0, 0], texture),
        ]),
      ];
    }

    if (special.type === "minecraft:shulker_box" && special.texture) {
      const texture = await this.textures.get(entityTexture("shulker", special.texture));

      return [
        place([
          ...boxQuads([-8, 16, -8], [16, 8, 16], [0, 28], texture),
          ...boxQuads([-8, 8, -8], [16, 12, 16], [0, 0], texture),
        ]),
      ];
    }

    if (special.type === "minecraft:banner" && special.color) {
      const texture = await this.textures.get("entity/banner/banner_base");
      const flag = (layer: ImageData) =>
        place(transformQuads(boxQuads([-10, 0, -2], [20, 40, 1], [0, 0], layer), FLAG_POSE));

      return [
        [
          ...place([
            ...boxQuads([-1, -42, -1], [2, 42, 2], [44, 0], texture),
            ...boxQuads([-10, -44, -1], [20, 2, 2], [0, 42], texture),
          ]),
          ...flag(texture),
        ],
        ...(await this.patternPasses(flag, "banner", special.color, item.patterns ?? [])),
      ];
    }

    // A shield with only patterns has a white base under them
    if (special.type === "minecraft:shield") {
      const patterned = item.baseColor !== undefined || Boolean(item.patterns?.length);
      const texture = await this.textures.get(
        patterned ? "entity/shield/shield_base" : "entity/shield/shield_base_nopattern",
      );
      const plate = (layer: ImageData) => place(boxQuads([-6, -11, -2], [12, 22, 1], [0, 0], layer));

      return [
        [...place(boxQuads([-1, -3, -1], [2, 6, 6], [26, 0], texture)), ...plate(texture)],
        ...(patterned ? await this.patternPasses(plate, "shield", item.baseColor ?? "white", item.patterns ?? []) : []),
      ];
    }

    const head =
      special.type === "minecraft:player_head"
        ? { texture: undefined, hat: true }
        : special.type === "minecraft:head"
          ? HEADS[special.kind ?? ""]
          : undefined;

    if (!head) {
      const name = special.kind ? `${special.kind} ${special.type}` : special.type;
      throw new Error(`${item.id} uses a ${name} model, which isn't supported yet`);
    }

    const skin = !head.texture && item.skin ? await this.skin(item.skin) : undefined;
    const texture = skin ?? (await this.textures.get(head.texture ?? DEFAULT_SKIN));

    const quads = boxQuads([-4, -8, -4], [8, 8, 8], [0, 0], texture);
    if (head.hat) quads.push(...boxQuads([-4, -8, -4], [8, 8, 8], [32, 0], texture, 0.25));

    return [place(quads)];
  }

  // Each pattern is its own pass, since at its part's exact depth it would lose depth ties and stripe
  private async patternPasses(
    part: (texture: ImageData) => Quad[],
    folder: "banner" | "shield",
    base: string,
    patterns: BannerLayer[],
  ) {
    const layers = [{ pattern: "minecraft:base", color: base }, ...patterns];

    return Promise.all(
      layers.map(async ({ pattern, color }) => {
        const texture = await this.textures.get(entityTexture(folder, pattern));
        const tint = dyeColor(color);
        return part(texture).map((quad) => ({ ...quad, tint }));
      }),
    );
  }

  /** A skin's pixels; failed loads return undefined and are retried */
  private skin(url: string) {
    let skin = this.skins.get(url);

    if (!skin) {
      skin = (async () => {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`${url}: ${response.status} ${response.statusText}`);

        const image = await decodePng(new Uint8Array(await response.arrayBuffer()));
        return context(image).getImageData(0, 0, image.width, image.height);
      })().catch(() => {
        this.skins.delete(url);
        return undefined;
      });

      this.skins.set(url, skin);
    }

    return skin;
  }
}
