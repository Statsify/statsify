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
import { type PackStack, namespaced } from "./pack.js";
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

// Heads without a skin get the default skin, as in game
const DEFAULT_SKIN = "entity/player/wide/steve";

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

// Minecraft scrolls the glint over each sprite's eighth of the item atlas, tilted 10° at speed 0.5,
// and adds it as src² + dst at strength 0.75
function drawGlint(ctx: OffscreenCanvasRenderingContext2D, glint: ImageData, tick: number) {
  const { width, height } = ctx.canvas;
  const pixels = ctx.getImageData(0, 0, width, height);
  const cos = Math.cos(Math.PI / 18);
  const sin = Math.sin(Math.PI / 18);

  const time = tick * 50 * 0.5 * 8;
  const scrollU = -(time % 110_000) / 110_000;
  const scrollV = (time % 30_000) / 30_000;

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

      for (let channel = 0; channel < 3; channel++) {
        const strength = (glint.data[texel + channel] / 255) * 0.75;
        pixels.data[out + channel] += strength * strength * 255;
      }
    }
  }

  ctx.putImageData(pixels, 0, 0);
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
  private skins = new Map<string, Promise<ImageData>>();

  public constructor(
    private stack: PackStack,
    private cache?: IconCache,
  ) {
    this.models = new ModelResolver(stack);
    this.textures = new TextureLoader(stack);
  }

  /** Draws an item 16 × scale pixels square, at a game tick for animated textures and the glint */
  public async render(item: ItemStack, scale: number, tick = 0): Promise<OffscreenCanvas> {
    const icon = await this.base(item, scale, tick);
    if (!item.enchanted) return icon;

    // The glint moves every tick, so it goes over the cached icon rather than into it
    const canvas = createCanvas(icon.width, icon.height);
    const ctx = context(canvas);
    ctx.drawImage(icon, 0, 0);
    drawGlint(ctx, await this.textures.get("misc/enchanted_glint_item"), tick);

    return canvas;
  }

  private async base(item: ItemStack, scale: number, tick: number): Promise<OffscreenCanvas> {
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

    const texture = head.texture
      ? await this.textures.get(head.texture)
      : item.skin
        ? await this.skin(item.skin)
        : await this.textures.get(DEFAULT_SKIN);

    // SkullModel: an 8 × 8 × 8 head with the hat a quarter pixel out from it
    const quads = boxQuads([-4, -8, -4], [8, 8, 8], [0, 0], texture);
    if (head.hat) quads.push(...boxQuads([-4, -8, -4], [8, 8, 8], [32, 0], texture, 0.25));

    return transformQuads(quads, special.transformation);
  }

  private skin(url: string) {
    let skin = this.skins.get(url);

    if (!skin) {
      skin = (async () => {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`The skin ${url} didn't load: ${response.status}`);

        const image = await decodePng(new Uint8Array(await response.arrayBuffer()));
        return context(image).getImageData(0, 0, image.width, image.height);
      })();

      this.skins.set(url, skin);
    }

    return skin;
  }
}
