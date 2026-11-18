/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

// Its own entry, so importing @statsify/skyblock doesn't load skia-canvas.
import textures from "../generated/textures-1.8.json" with { type: "json" };
import { Canvas, type CanvasRenderingContext2D, type Image, loadImage } from "skia-canvas";
import { getMinecraftTexturePath } from "@statsify/assets";
import type { ItemTexture } from "#types";

export interface IconOptions {
  /** Width and height in pixels; 16 is the game's own size. */
  size?: number;
}

/** A head's skin PNG by its texture hash; undefined when it has none. */
export type HeadSource = (hash: string) => Promise<Buffer | undefined>;

const TEXTURES: Record<string, string | undefined> = textures.textures;
const BASE_SIZE = 16;
const CACHE_SIZE = 2000;
const HEAD_TIMEOUT = 5000;

const GRASS = 2;
const LEAVES = 18;
const LEAVES_2 = 161;
const TALL_GRASS = 31;
const DOUBLE_PLANT = 175;
const VINE = 106;
const LILY_PAD = 111;
const LEATHER = new Set([298, 299, 300, 301]);
const POTION = 373;
const SPAWN_EGG = 383;
const SKULL = 397;
const FIREWORK_CHARGE = 402;
const BANNER = 425;
const CHESTS = new Set([54, 130, 146]);

// 1.8's colors for undyed leather, a water bottle, a firework star with no colors, and the item colors of the blocks
// that don't read the colormaps.
const LEATHER_COLOR = 0xa0_65_40;
const WATER_COLOR = 0x38_5d_c6;
const FIREWORK_COLOR = 0x8a_8a_8a;
const PINE_COLOR = 0x61_99_61;
const BIRCH_COLOR = 0x80_a7_55;
const VINE_COLOR = 0x48_b5_18;
const LILY_PAD_COLOR = 0x71_c3_5c;

// 1.8 potions keep their effect in Damage's low four bits.
const POTION_EFFECTS = [
  undefined, "regeneration", "moveSpeed", "fireResistance", "poison", "heal", "nightVision", undefined,
  "weakness", "damageBoost", "moveSlowdown", "jump", "harm", "waterBreathing", "invisibility", undefined,
];
const SPLASH = 0x40_00;

type Tint = number | "grass" | "foliage";

interface Layer {
  path: string;
  tint?: Tint;
}

/** What one texture draws: pack textures bottom first, a crop of an entity texture, or a head's skin. */
type Plan =
  | { kind: "layers"; layers: Layer[] }
  | { kind: "chest" | "banner" | "face"; path: string }
  | { kind: "head"; skin: string };

const blockTint = (id: number, damage: number): Tint | undefined => {
  if (id === LEAVES) return [undefined, PINE_COLOR, BIRCH_COLOR][damage & 3] ?? "foliage";
  if (id === LEAVES_2) return "foliage";
  if ((id === TALL_GRASS && damage > 0) || (id === DOUBLE_PLANT && (damage === 2 || damage === 3))) return "grass";
  if (id === VINE) return VINE_COLOR;
  if (id === LILY_PAD) return LILY_PAD_COLOR;
  return undefined;
};

function planOf(texture: ItemTexture): Plan | undefined {
  if (texture.kind === "head") return { kind: "head", skin: texture.skin };

  const { id, damage, color } = texture;
  const path = TEXTURES[`${id}:${damage}`] ?? TEXTURES[id];
  if (!path) return undefined;

  if (LEATHER.has(id)) return { kind: "layers", layers: [{ path, tint: color ?? LEATHER_COLOR }, { path: `${path}_overlay` }] };
  if (CHESTS.has(id)) return { kind: "chest", path };
  if (id === BANNER) return { kind: "banner", path };
  if (id === SKULL) return { kind: "face", path };

  if (id === POTION) {
    const effect = POTION_EFFECTS[damage & 15];
    const splash = (damage & SPLASH) !== 0;
    if (effect) return { kind: "layers", layers: [{ path: `items/potion_bottle_${splash ? "splash_" : ""}${effect}` }] };
    return { kind: "layers", layers: [{ path: "items/potion_overlay", tint: WATER_COLOR }, { path: `items/potion_bottle_${splash ? "splash" : "drinkable"}` }] };
  }

  // Without 1.8's egg colors, eggs draw white, as the game draws one for an entity it has no colors for.
  if (id === SPAWN_EGG) return { kind: "layers", layers: [{ path }, { path: "items/spawn_egg_overlay" }] };
  if (id === FIREWORK_CHARGE) return { kind: "layers", layers: [{ path }, { path: "items/fireworks_charge_overlay", tint: FIREWORK_COLOR }] };
  if (id === GRASS) return { kind: "layers", layers: [{ path }, { path: "blocks/grass_side_overlay", tint: "grass" }] };

  return { kind: "layers", layers: [{ path, tint: blockTint(id, damage) }] };
}

// Raster, like @statsify/rendering's createCanvas.
const createCanvas = (width: number, height: number) => new Canvas(width, height, { gpu: false });

const images = new Map<string, Promise<Image>>();
const loadTexture = (path: string) => {
  let image = images.get(path);
  if (!image) images.set(path, (image = loadImage(getMinecraftTexturePath(`textures/${path}.png`))));
  return image;
};

const colormaps = new Map<string, Promise<number>>();

/** The colormap's color at temperature 0.5 and rainfall 1.0, where 1.8 colors grass and leaves in inventories. */
const colormapColor = (name: "grass" | "foliage") => {
  let color = colormaps.get(name);
  if (!color) {
    color = loadTexture(`colormap/${name}`).then((image) => {
      const canvas = createCanvas(image.width, image.height);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(image, 0, 0);
      const [red, green, blue] = ctx.getImageData(127, 127, 1, 1).data;
      return (red << 16) | (green << 8) | blue;
    });
    colormaps.set(name, color);
  }
  return color;
};

const hex = (color: number) => `#${color.toString(16).padStart(6, "0")}`;

/** One 16 px layer: the texture's first animation frame, multiplied by its tint. */
async function drawLayer({ path, tint }: Layer) {
  const image = await loadTexture(path);
  const layer = createCanvas(BASE_SIZE, BASE_SIZE);
  const ctx = layer.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(image, 0, 0, image.width, image.width, 0, 0, BASE_SIZE, BASE_SIZE);

  if (tint !== undefined) {
    ctx.globalCompositeOperation = "multiply";
    ctx.fillStyle = hex(typeof tint === "number" ? tint : await colormapColor(tint));
    ctx.fillRect(0, 0, BASE_SIZE, BASE_SIZE);
    ctx.globalCompositeOperation = "destination-in";
    ctx.drawImage(image, 0, 0, image.width, image.width, 0, 0, BASE_SIZE, BASE_SIZE);
  }

  return layer;
}

/** A head's face with its hat layer, from a skin or a 64 × 32 mob texture. */
const drawFace = (ctx: CanvasRenderingContext2D, skin: Image, hat = true) => {
  ctx.drawImage(skin, 8, 8, 8, 8, 0, 0, BASE_SIZE, BASE_SIZE);
  if (hat) ctx.drawImage(skin, 40, 8, 8, 8, 0, 0, BASE_SIZE, BASE_SIZE);
};

/** 1.8 drops the hat layer when the skin's top-right 32 × 32 has no transparent pixel, as on old skins that filled it. */
const hasHat = (skin: Image) => {
  const corner = createCanvas(32, 32);
  const ctx = corner.getContext("2d");
  ctx.drawImage(skin, 32, 0, 32, 32, 0, 0, 32, 32);
  return ctx.getImageData(0, 0, 32, 32).data.some((value, index) => index % 4 === 3 && value < 128);
};

let headSource: HeadSource = async (hash) => {
  const response = await fetch(`https://textures.minecraft.net/texture/${hash}`, { signal: AbortSignal.timeout(HEAD_TIMEOUT) });
  if (!response.ok) throw new Error(`textures.minecraft.net answered ${response.status} for ${hash}`);
  return Buffer.from(await response.arrayBuffer());
};

/** Offline previews pass saved skins instead of fetching them. */
export function setHeadSource(source: HeadSource) {
  headSource = source;
  icons.clear();
}

/** The 16 px icon. A head whose skin didn't load draws Steve, as the game does, and isn't cached. */
async function drawBase(plan: Plan, key: string) {
  const canvas = createCanvas(BASE_SIZE, BASE_SIZE);
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  switch (plan.kind) {
    case "layers": {
      for (const layer of await Promise.all(plan.layers.map(drawLayer))) ctx.drawImage(layer, 0, 0);
      break;
    }

    case "head": {
      const skin = await headSource(plan.skin)
        .then((data) => data && loadImage(data))
        .catch(() => undefined);
      if (!skin) icons.delete(key);
      const image = skin ?? (await loadTexture("entity/steve"));
      drawFace(ctx, image, hasHat(image));
      break;
    }

    case "face": {
      drawFace(ctx, await loadTexture(plan.path));
      break;
    }

    // The chest's front: the base, then the lid and its latch, from the 64 × 64 entity texture.
    case "chest": {
      const image = await loadTexture(plan.path);
      ctx.drawImage(image, 14, 33, 14, 10, 1, 5, 14, 10);
      ctx.drawImage(image, 14, 14, 14, 5, 1, 1, 14, 5);
      ctx.drawImage(image, 1, 1, 2, 4, 7, 4, 2, 4);
      break;
    }

    // The cloth's front, untinted: a banner's base color and patterns aren't drawn.
    case "banner": {
      ctx.drawImage(await loadTexture(plan.path), 1, 1, 20, 40, 4, 0, 8, 16);
      break;
    }
  }

  return canvas;
}

const icons = new Map<string, Promise<Canvas | undefined>>();

const cacheKey = (texture: ItemTexture, size: number) =>
  `${texture.kind === "head" ? texture.skin : `${texture.id}:${texture.damage}:${texture.color ?? ""}`}:${size}`;

async function drawIcon(texture: ItemTexture, size: number, key: string) {
  const plan = planOf(texture);
  if (!plan) return undefined;

  const base = await drawBase(plan, key);
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(base, 0, 0, size, size);

  return canvas;
}

/** undefined when the 1.8 pack has no texture for the item (a barrier). */
export function getItemIcon(texture: ItemTexture, { size = BASE_SIZE }: IconOptions = {}): Promise<Canvas | undefined> {
  const key = cacheKey(texture, size);
  let icon = icons.get(key);

  if (icon) {
    icons.delete(key);
  } else {
    icon = drawIcon(texture, size, key);
    icon.catch(() => icons.delete(key));
  }

  icons.set(key, icon);
  if (icons.size > CACHE_SIZE) icons.delete(icons.keys().next().value!);
  return icon;
}
