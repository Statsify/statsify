/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type ItemLayer, type Model, ModelResolver, type SpecialModel } from "./models.js";
import { type Quad, boxQuads, elementQuads, rasterize, transformQuads } from "./geometry.js";
import { context, createCanvas, createImageData, decodePng, hex } from "./canvas.js";
import { TextureLoader } from "./textures.js";
import type { IconCache } from "./icon-cache.js";
import type { ItemStack } from "./item-stack.js";
import { type PackStack, assetPath, namespaced } from "./pack.js";
import { tintColor } from "./tints.js";

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

// Heads without a skin, or whose skin doesn't load, get the default skin, as in game
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
  /** Multiplies the texture, channel by channel */
  tint: [number, number, number];
}

// 26.3: one pass tilted 10° at speed 0.5, at strength 0.75
function modernGlint(tick: number): Glint {
  const time = tick * 50 * 0.5 * 8;
  const scrollV = (time % 30_000) / 30_000;
  return { passes: [{ angle: Math.PI / 18, scrollU: -(time % 110_000) / 110_000, scrollV }], tint: [0.75, 0.75, 0.75] };
}

// 1.8 (RenderItem.renderEffect): its grey texture tinted 0x8040CC, in two passes at -50° and 10°
// that scroll over 3 and 4.873 seconds
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
  return canvas;
}

// Minecraft scrolls the glint over each sprite's eighth of the item atlas. Drawn as a pattern and
// masked by the icon, so the GPU adds it and no pixels are read back each tick
function drawGlint(ctx: OffscreenCanvasRenderingContext2D, glint: OffscreenCanvas, passes: GlintPass[]) {
  const { width, height } = ctx.canvas;
  const layer = createCanvas(width, height);
  const layerCtx = context(layer);
  layerCtx.globalCompositeOperation = "lighter";

  for (const { angle, scrollU, scrollV } of passes) {
    // A pixel centre c samples the texel at A·c + offset: rotated, an eighth of a texture per icon
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

function crossFade(from: OffscreenCanvas, to: OffscreenCanvas, blend: number) {
  const canvas = createCanvas(from.width, from.height);
  const ctx = context(canvas);
  ctx.drawImage(from, 0, 0);
  ctx.globalAlpha = blend;
  ctx.drawImage(to, 0, 0);

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
  /** Whether the top pack's glint is 1.8's, which 1.8 coloured and moved in its own way */
  private legacyGlint: boolean;
  private glint?: Promise<OffscreenCanvas>;

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
    drawGlint(ctx, await this.glint, passes);

    return canvas;
  }

  private async base(requested: ItemStack, scale: number, tick: number): Promise<OffscreenCanvas> {
    // A head whose skin doesn't load is drawn, and cached, as the default skin
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

    // Items that resolve to the same models and colours share an icon
    const key = [
      this.stack.hash,
      ...layers.map(({ model, colors, special }) =>
        [model.id, special?.type, special?.kind, special?.texture, ...colors.map(hex)]
          .filter(Boolean)
          .join(","),
      ),
      layers.some(({ special }) => special?.type === "minecraft:player_head") ? item.skin : undefined,
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

        const quads = layer.special
          ? await this.specialQuads(layer.special, item)
          : await this.elementQuads(layer, tick);

        return [{ pixels: rasterize(quads, layer.model.display.gui, layer.model.guiLight, scale) }];
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

  private async specialQuads(special: SpecialModel, item: ItemStack): Promise<Quad[]> {
    // ChestModel, closed, in block pixels. Ender and trapped chests are chests with
    // another texture
    if (special.type === "minecraft:chest" && special.texture) {
      const [namespace, name] = namespaced(special.texture).split(":");
      const texture = await this.textures.get(`${namespace}:entity/chest/${name}`);

      return transformQuads(
        [
          ...boxQuads([1, 0, 1], [14, 10, 14], [0, 19], texture),
          ...boxQuads([1, 9, 1], [14, 5, 14], [0, 0], texture),
          ...boxQuads([7, 7, 15], [2, 4, 1], [0, 0], texture),
        ],
        special.transformation,
      );
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

    // SkullModel: an 8 × 8 × 8 head with the hat a quarter pixel out from it
    const quads = boxQuads([-4, -8, -4], [8, 8, 8], [0, 0], texture);
    if (head.hat) quads.push(...boxQuads([-4, -8, -4], [8, 8, 8], [32, 0], texture, 0.25));

    return transformQuads(quads, special.transformation);
  }

  /** A skin's pixels, or undefined when it doesn't load, which the next call tries again */
  private skin(url: string) {
    let skin = this.skins.get(url);

    if (!skin) {
      skin = (async () => {
        const response = await fetch(url).catch(() => undefined);
        if (!response?.ok) {
          this.skins.delete(url);
          return;
        }

        const image = await decodePng(new Uint8Array(await response.arrayBuffer()));
        return context(image).getImageData(0, 0, image.width, image.height);
      })();

      this.skins.set(url, skin);
    }

    return skin;
  }
}
