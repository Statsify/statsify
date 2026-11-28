/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

// Its own entry, so importing @statsify/skyblock doesn't load skia-canvas.
import { LRUCache } from "lru-cache";
import { TEXTURE_PATHS } from "#data";
import { createCanvas, loadImage } from "@statsify/rendering";
import { getMinecraftTexturePath } from "@statsify/assets";
import type { Canvas, CanvasRenderingContext2D, Image } from "skia-canvas";
import type { ItemTexture } from "#types";

interface IconOptions {
  size?: number;
}

type HeadSource = (hash: string) => Promise<Buffer | Image | undefined>;

export const SKIN_URL = "https://textures.minecraft.net/texture/";

const BASE_SIZE = 16;
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

let headSource: HeadSource = (hash) => loadImage(`${SKIN_URL}${hash}`);

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
        .then((data) => (Buffer.isBuffer(data) ? loadImage(data) : data))
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

const icons = new LRUCache<string, Promise<Canvas | undefined>>({
  max: CACHE_SIZE,
});

const getCacheKey = (texture: ItemTexture, size: number) => {
  if (texture.kind === "head") return `${texture.skin}:${size}`;
  return `${texture.id}:${texture.damage}:${texture.color ?? ""}:${size}`;
};

async function drawIcon(texture: ItemTexture, size: number, key: string) {
  const plan = getPlan(texture);
  if (!plan) return undefined;

  const base = await drawBase(plan, key);
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(base, 0, 0, size, size);

  return canvas;
}

export function getItemIcon(
  texture: ItemTexture,
  { size = BASE_SIZE }: IconOptions = {},
): Promise<Canvas | undefined> {
  const key = getCacheKey(texture, size);
  let icon = icons.get(key);

  if (!icon) {
    icon = drawIcon(texture, size, key);
    icon.catch(() => icons.delete(key));
    icons.set(key, icon);
  }

  return icon;
}
