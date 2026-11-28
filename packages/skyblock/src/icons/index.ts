/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

// Its own entry, so importing @statsify/skyblock doesn't load skia-canvas.
import {
  ItemRenderer,
  type ItemStack,
  type PackStack,
  legacyItem,
  setCanvasBackend,
} from "@statsify/textures";
import { createCanvas, downloadImage, loadImage } from "@statsify/rendering";
import { Canvas } from "skia-canvas";
import { LRUCache } from "lru-cache";
import { TEXTURE_PATHS } from "#data";
import { getMinecraftTexturePath } from "@statsify/assets";
import { skiaCanvas } from "@statsify/textures/node";
import type { CanvasRenderingContext2D, Image } from "skia-canvas";
import type { ItemTexture } from "#types";

setCanvasBackend(skiaCanvas);

interface IconOptions {
  // A multiple of 16, the game's own size.
  size?: number;
  // The glint is drawn at its first frame, as a still inventory shows it.
  glint?: boolean;
}

// The pack renderer decodes the PNG itself, so a source returns its bytes.
type HeadSource = (hash: string) => Promise<Buffer | undefined>;

export const SKIN_URL = "https://textures.minecraft.net/texture/";

const BASE_SIZE = 16;
const GLINT = "misc/enchanted_item_glint";
// 1.8 tints the glint 0x8040CC and draws it at -50° and 10°, at 1/8 scale.
const GLINT_TINT = [0x80 / 255, 0x40 / 255, 0xcc / 255];
const GLINT_ANGLES = [(-5 * Math.PI) / 18, Math.PI / 18];
const CACHE_SIZE = 2000;

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

const LEATHER_COLOR = 0xa0_65_40;
const WATER_COLOR = 0x38_5d_c6;
const FIREWORK_COLOR = 0x8a_8a_8a;
const PINE_COLOR = 0x61_99_61;
const BIRCH_COLOR = 0x80_a7_55;
const VINE_COLOR = 0x48_b5_18;
const LILY_PAD_COLOR = 0x71_c3_5c;

// 1.8 potions keep their effect in Damage's low four bits.
const POTION_EFFECTS = [
  undefined,
  "regeneration",
  "moveSpeed",
  "fireResistance",
  "poison",
  "heal",
  "nightVision",
  undefined,
  "weakness",
  "damageBoost",
  "moveSlowdown",
  "jump",
  "harm",
  "waterBreathing",
  "invisibility",
  undefined,
];
const SPLASH = 0x40_00;

type Tint = number | "grass" | "foliage";

interface Layer {
  path: string;
  tint?: Tint;
}

type Plan =
  | { kind: "layers"; layers: Layer[] }
  | { kind: "chest" | "banner" | "face"; path: string }
  | { kind: "head"; skin: string };

const getBlockTint = (id: number, damage: number): Tint | undefined => {
  if (id === LEAVES)
    return [undefined, PINE_COLOR, BIRCH_COLOR][damage & 3] ?? "foliage";
  if (id === LEAVES_2) return "foliage";
  if (
    (id === TALL_GRASS && damage > 0) ||
    (id === DOUBLE_PLANT && (damage === 2 || damage === 3))
  )
    return "grass";
  if (id === VINE) return VINE_COLOR;
  if (id === LILY_PAD) return LILY_PAD_COLOR;
  return undefined;
};

function getPlan(texture: ItemTexture): Plan | undefined {
  if (texture.kind === "head") return { kind: "head", skin: texture.skin };

  const { id, damage, color } = texture;
  const path = TEXTURE_PATHS[`${id}:${damage}`] ?? TEXTURE_PATHS[id];
  if (!path) return undefined;

  if (LEATHER.has(id))
    return {
      kind: "layers",
      layers: [
        { path, tint: color ?? LEATHER_COLOR },
        { path: `${path}_overlay` },
      ],
    };
  if (CHESTS.has(id)) return { kind: "chest", path };
  if (id === BANNER) return { kind: "banner", path };
  if (id === SKULL) return { kind: "face", path };

  if (id === POTION) {
    const effect = POTION_EFFECTS[damage & 15];
    const splash = (damage & SPLASH) !== 0;
    if (effect)
      return {
        kind: "layers",
        layers: [
          { path: `items/potion_bottle_${splash ? "splash_" : ""}${effect}` },
        ],
      };
    return {
      kind: "layers",
      layers: [
        { path: "items/potion_overlay", tint: WATER_COLOR },
        { path: `items/potion_bottle_${splash ? "splash" : "drinkable"}` },
      ],
    };
  }

  // Eggs draw white, as the game does for an entity with no egg colors.
  if (id === SPAWN_EGG)
    return {
      kind: "layers",
      layers: [{ path }, { path: "items/spawn_egg_overlay" }],
    };
  if (id === FIREWORK_CHARGE)
    return {
      kind: "layers",
      layers: [
        { path },
        { path: "items/fireworks_charge_overlay", tint: FIREWORK_COLOR },
      ],
    };
  if (id === GRASS)
    return {
      kind: "layers",
      layers: [{ path }, { path: "blocks/grass_side_overlay", tint: "grass" }],
    };

  return {
    kind: "layers",
    layers: [{ path, tint: getBlockTint(id, damage) }],
  };
}

const images = new Map<string, Promise<Image>>();
const loadTexture = (path: string) => {
  let image = images.get(path);
  if (!image) {
    image = loadImage(getMinecraftTexturePath(`textures/${path}.png`));
    images.set(path, image);
  }
  return image;
};

const colormaps = new Map<string, Promise<number>>();

// 1.8 colors inventory grass and leaves at temperature 0.5 and rainfall 1.0.
const getColormapColor = (name: "grass" | "foliage") => {
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

async function drawLayer({ path, tint }: Layer) {
  const image = await loadTexture(path);
  const layer = createCanvas(BASE_SIZE, BASE_SIZE);
  const ctx = layer.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  // An animated texture stacks its frames, so this draws only the first.
  ctx.drawImage(
    image,
    0,
    0,
    image.width,
    image.width,
    0,
    0,
    BASE_SIZE,
    BASE_SIZE,
  );

  if (tint !== undefined) {
    const color =
      typeof tint === "number" ? tint : await getColormapColor(tint);
    ctx.globalCompositeOperation = "multiply";
    ctx.fillStyle = `#${color.toString(16).padStart(6, "0")}`;
    ctx.fillRect(0, 0, BASE_SIZE, BASE_SIZE);
    ctx.globalCompositeOperation = "destination-in";
    ctx.drawImage(
      image,
      0,
      0,
      image.width,
      image.width,
      0,
      0,
      BASE_SIZE,
      BASE_SIZE,
    );
  }

  return layer;
}

const drawFace = (ctx: CanvasRenderingContext2D, skin: Image, hat = true) => {
  ctx.drawImage(skin, 8, 8, 8, 8, 0, 0, BASE_SIZE, BASE_SIZE);
  if (hat) ctx.drawImage(skin, 40, 8, 8, 8, 0, 0, BASE_SIZE, BASE_SIZE);
};

// 1.8 drops the hat when the skin's top-right corner has no transparency.
const hasHat = (skin: Image) => {
  const corner = createCanvas(32, 32);
  const ctx = corner.getContext("2d");
  ctx.drawImage(skin, 32, 0, 32, 32, 0, 0, 32, 32);
  return ctx
    .getImageData(0, 0, 32, 32)
    .data.some((value, index) => index % 4 === 3 && value < 128);
};

let headSource: HeadSource = (hash) => downloadImage(`${SKIN_URL}${hash}`);

export function setHeadSource(source: HeadSource) {
  headSource = source;
  icons.clear();
}

async function drawBase(plan: Plan, key: string) {
  const canvas = createCanvas(BASE_SIZE, BASE_SIZE);
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  switch (plan.kind) {
    case "layers": {
      for (const layer of await Promise.all(plan.layers.map(drawLayer)))
        ctx.drawImage(layer, 0, 0);
      break;
    }

    case "head": {
      const skin = await headSource(plan.skin)
        .then((data) => data && loadImage(data))
        .catch(() => undefined);
      // A skin that fails draws Steve, as the game does, and isn't cached.
      if (!skin) icons.delete(key);
      const image = skin ?? (await loadTexture("entity/steve"));
      drawFace(ctx, image, hasHat(image));
      break;
    }

    case "face": {
      drawFace(ctx, await loadTexture(plan.path));
      break;
    }

    // The chest's front is its base, lid and latch from the entity texture.
    case "chest": {
      const image = await loadTexture(plan.path);
      ctx.drawImage(image, 14, 33, 14, 10, 1, 5, 14, 10);
      ctx.drawImage(image, 14, 14, 14, 5, 1, 1, 14, 5);
      ctx.drawImage(image, 1, 1, 2, 4, 7, 4, 2, 4);
      break;
    }

    // Banners draw untinted, without their base color or patterns.
    case "banner": {
      ctx.drawImage(await loadTexture(plan.path), 1, 1, 20, 40, 4, 0, 8, 16);
      break;
    }
  }

  return canvas;
}

let glintTexture: Promise<Canvas> | undefined;

// Squared, so adding it with "lighter" gives the game's src² + dst.
const getGlintTexture = () => {
  glintTexture ??= loadTexture(GLINT).then((image) => {
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0);
    const pixels = ctx.getImageData(0, 0, image.width, image.height);

    for (let i = 0; i < pixels.data.length; i += 4) {
      for (let channel = 0; channel < 3; channel++) {
        const strength = (pixels.data[i + channel] / 255) * GLINT_TINT[channel];
        pixels.data[i + channel] = strength * strength * 255;
      }
      pixels.data[i + 3] = 255;
    }

    ctx.putImageData(pixels, 0, 0);
    return canvas;
  });
  return glintTexture;
};

async function drawGlint(icon: Canvas) {
  const glint = await getGlintTexture();
  const { width, height } = icon;
  const layer = createCanvas(width, height);
  const ctx = layer.getContext("2d");
  ctx.globalCompositeOperation = "lighter";

  for (const angle of GLINT_ANGLES) {
    // The pattern's transform is the inverse of the pixel-to-texel matrix.
    const a11 = (glint.width * Math.cos(angle)) / (8 * width);
    const a12 = (-glint.width * Math.sin(angle)) / (8 * height);
    const a21 = (glint.height * Math.sin(angle)) / (8 * width);
    const a22 = (glint.height * Math.cos(angle)) / (8 * height);
    const determinant = a11 * a22 - a12 * a21;

    const pattern = ctx.createPattern(glint, "repeat")!;
    pattern.setTransform(
      a22 / determinant,
      -a21 / determinant,
      -a12 / determinant,
      a11 / determinant,
      0,
      0,
    );
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, width, height);
  }

  ctx.globalCompositeOperation = "destination-in";
  ctx.drawImage(icon, 0, 0);

  const iconCtx = icon.getContext("2d");
  iconCtx.globalCompositeOperation = "lighter";
  iconCtx.drawImage(layer, 0, 0);
}

const icons = new LRUCache<string, Promise<Canvas | undefined>>({
  max: CACHE_SIZE,
});

const getCacheKey = (texture: ItemTexture, size: number, glint: boolean) => {
  if (texture.kind === "head") return `${texture.skin}:${size}:${glint}`;
  const { id, damage, color = "" } = texture;
  return `${id}:${damage}:${color}:${size}:${glint}`;
};

async function drawIcon(
  texture: ItemTexture,
  size: number,
  glint: boolean,
  key: string,
) {
  const plan = getPlan(texture);
  if (!plan) return undefined;

  const base = await drawBase(plan, key);
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(base, 0, 0, size, size);
  // 1.8 never draws the glint on heads, chests or banners.
  if (glint && plan.kind === "layers") await drawGlint(canvas);

  return canvas;
}

function getLegacyIcon(texture: ItemTexture, size: number, glint: boolean) {
  const key = getCacheKey(texture, size, glint);
  let icon = icons.get(key);

  if (!icon) {
    icon = drawIcon(texture, size, glint, key);
    icon.catch(() => icons.delete(key));
    icons.set(key, icon);
  }

  return icon;
}

let packs: ItemRenderer | undefined;

const loadSkin = async (url: string) => {
  const skin = await headSource(url.slice(SKIN_URL.length));
  if (!skin) throw new Error(`${url} has no skin`);
  return skin;
};

// Undefined draws every icon from the 1.8 textures again.
export function setResourcePacks(stack: PackStack | undefined) {
  packs = stack && new ItemRenderer(stack, undefined, loadSkin);
}

function toItemStack(texture: ItemTexture, glint: boolean) {
  const { model: itemModel, customData } = texture;
  if (texture.kind === "head") {
    const skin = `${SKIN_URL}${texture.skin}`;
    const head: ItemStack = {
      id: "minecraft:player_head",
      itemModel,
      skin,
      enchanted: glint,
    };
    return head;
  }

  const item = legacyItem(texture.id, texture.damage);
  if (!item) return undefined;

  const stack: ItemStack = {
    ...item,
    itemModel,
    customData,
    color: texture.color,
    enchanted: glint,
  };
  return stack;
}

export function getItemIcon(
  texture: ItemTexture,
  { size = BASE_SIZE, glint = false }: IconOptions = {},
): Promise<Canvas | undefined> {
  const renderer = packs;
  const item = toItemStack(texture, glint);
  if (!renderer || !item) return getLegacyIcon(texture, size, glint);

  // The 1.8 icon stands in for an item the packs can't draw yet, like a banner.
  return renderer.render(item, size / BASE_SIZE).then(
    (icon) => {
      if (icon instanceof Canvas) return icon;
      throw new TypeError("The pack renderer didn't draw a skia-canvas Canvas");
    },
    () => getLegacyIcon(texture, size, glint),
  );
}
