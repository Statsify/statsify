/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

// Packs go lowest priority first. Writes atlas/<name>.json and atlas/<name>.<hash>.png, and removes
// that name's older images

import {
  Atlas,
  type AtlasData,
  type AtlasRect,
  CHEST_SCREEN,
  DEFAULT_SKIN,
  GLINT,
  InventoryRenderer,
  type ItemLayer,
  ItemRenderer,
  type ItemStack,
  LEGACY_GLINT,
  ModelResolver,
  PackStack,
  assetPath,
  loadPack,
  namespaced,
  setCanvasBackend,
} from "@statsify/inventory";
import { basename } from "node:path";
import { createHash } from "node:crypto";
import { parseArgs } from "node:util";
import { mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises";
import { Canvas } from "skia-canvas";
import { skiaCanvas } from "@statsify/inventory/node";

const { values, positionals } = parseArgs({ allowPositionals: true, options: { scale: { type: "string", default: "3" } } });
const [name, ...packPaths] = positionals;
const scale = Number(values.scale);
if (!name || packPaths.length === 0) throw new Error("Usage: pnpm atlas <name> <pack> [<pack> …] [--scale 3]");

const OUT = new URL("../atlas/", import.meta.url);
const ITEM_FILE = /^assets\/([^/]+)\/items\/(.+)\.json$/;

// Tints and models that read the stack, so these items are drawn in the browser from their models
const STACK_TINTS = new Set(["minecraft:dye", "minecraft:potion"]);
const STACK_MODELS = new Set(["minecraft:player_head", "minecraft:banner", "minecraft:shield"]);

// Banners and shields draw any of their folder's patterns over their base
const PATTERN_FOLDERS: Record<string, string> = {
  "minecraft:banner": "assets/minecraft/textures/entity/banner/",
  "minecraft:shield": "assets/minecraft/textures/entity/shield/",
};

setCanvasBackend(skiaCanvas);

const stack = new PackStack(
  await Promise.all(packPaths.map(async (path) => loadPack(await readFile(path), basename(path)))),
);

const renderer = new ItemRenderer(stack);
const models = new ModelResolver(stack);
const files = [...new Set(stack.packs.flatMap((pack) => [...pack.files.keys()]))];

const ids = files
  .map((path) => ITEM_FILE.exec(path))
  .filter((match) => match !== null)
  .map(([, namespace, path]) => `${namespace}:${path}`)
  .toSorted();

const drawsInClient = (resolved: ItemLayer[]) =>
  resolved.some(
    ({ tints, special }) =>
      tints.some(({ type }) => STACK_TINTS.has(type)) || (special !== undefined && STACK_MODELS.has(special.type)),
  );

const drawn = await Promise.all(
  ids.map(async (id) => {
    try {
      const resolved = models.resolve({ id });

      // A flat icon is its 16-pixel textures, which any whole scale draws exactly
      const flat = resolved.every(({ model, special }) => model.generated && !special);
      return { id, resolved, icon: await renderer.render({ id }, flat ? 1 : scale) };
    } catch (error) {
      return { id, error: (error as Error).message };
    }
  }),
);

const icons = new Map<string, OffscreenCanvas>();
const layers: Record<string, ItemLayer[]> = {};
const textureIds = new Set([CHEST_SCREEN, renderer.legacyGlint ? LEGACY_GLINT : GLINT, DEFAULT_SKIN].map(namespaced));
const skipped: string[] = [];

for (const result of drawn) {
  if ("error" in result) {
    skipped.push(`${result.id}: ${result.error}`);
    continue;
  }

  const { id, resolved, icon } = result;
  icons.set(id, icon);

  if (!drawsInClient(resolved)) continue;
  layers[id] = resolved;

  for (const { model, special } of resolved) {
    if (!special) for (const texture of Object.values(model.textures)) textureIds.add(namespaced(texture));

    const folder = special && PATTERN_FOLDERS[special.type];
    if (!folder) continue;

    for (const path of files) {
      if (path.startsWith(folder) && path.endsWith(".png")) {
        textureIds.add(`minecraft:${path.slice("assets/minecraft/textures/".length, -".png".length)}`);
      }
    }
  }
}

const textures = new Map(
  await Promise.all(
    [...textureIds].map(async (id) => {
      const file = stack.get(assetPath(id, "textures", ".png"));
      if (!file) throw new Error(`The texture ${id} isn't in the pack`);
      return [id, await skiaCanvas.decodePng(file)] as const;
    }),
  ),
);

interface Sprite {
  id: string;
  canvas: OffscreenCanvas;
  rects: Record<string, AtlasRect>;
}

/** Shelf-packs the sprites into a roughly square atlas, writing each one's rect */
function packSprites(sprites: Sprite[]) {
  const area = sprites.reduce((total, { canvas }) => total + canvas.width * canvas.height, 0);
  const width = Math.max(...sprites.map(({ canvas }) => canvas.width), Math.ceil(Math.sqrt(area) / 16) * 16);
  const sorted = sprites.toSorted((a, b) => b.canvas.height - a.canvas.height || b.canvas.width - a.canvas.width);

  const shelf = { y: 0, height: 0, x: width };
  const column = { x: 0, y: 0, width: 0 };

  for (const sprite of sorted) {
    const { width: w, height: h } = sprite.canvas;

    if (w > column.width || column.y + h > shelf.y + shelf.height) {
      if (shelf.x + w > width) Object.assign(shelf, { y: shelf.y + shelf.height, height: h, x: 0 });
      Object.assign(column, { x: shelf.x, y: shelf.y, width: w });
      shelf.x += w;
    }

    sprite.rects[sprite.id] = [column.x, column.y, w, h];
    column.y += h;
  }

  return { width, height: shelf.y + shelf.height };
}

const iconRects: Record<string, AtlasRect> = {};
const textureRects: Record<string, AtlasRect> = {};

const sprites: Sprite[] = [
  ...[...icons].map(([id, canvas]) => ({ id, canvas, rects: iconRects })),
  ...[...textures].map(([id, canvas]) => ({ id, canvas, rects: textureRects })),
];

const size = packSprites(sprites);
const image = new Canvas(size.width, size.height);
const ctx = image.getContext("2d");

for (const { id, canvas, rects } of sprites) {
  const [x, y] = rects[id];
  ctx.drawImage(canvas as unknown as Canvas, x, y);
}

const png = await image.toBuffer("png");
const hash = createHash("sha256").update(png).digest("hex").slice(0, 16);

const lang = stack.json<Record<string, string>>("assets/minecraft/lang/en_us.json") ?? {};
const names: Record<string, string> = {};

for (const id of icons.keys()) {
  const path = id.replace(/^minecraft:/, "");
  for (const key of [`item.minecraft.${path}`, `block.minecraft.${path}`]) {
    if (lang[key]) names[key] = lang[key];
  }
}

const data: AtlasData = {
  image: `${name}.${hash}.png`,
  hash,
  scale,
  legacyGlint: renderer.legacyGlint,
  icons: iconRects,
  layers,
  textures: textureRects,
  names,
};

// Reads the image back the way a page does, so a misplaced icon or a missing texture fails here
const atlas = new Atlas(data, await skiaCanvas.decodePng(png));

const pixels = (canvas: OffscreenCanvas) => canvas.getContext("2d")!.getImageData(0, 0, canvas.width, canvas.height).data;

for (const [id, icon] of icons) {
  const expected = pixels(icon);
  if (!pixels(atlas.icon(id, icon.width / 16)).every((value, i) => value === expected[i])) {
    throw new Error(`${id}'s icon came back different from the atlas`);
  }
}

const patterns = [...textureIds]
  .filter((id) => id.startsWith("minecraft:entity/banner/") && !id.endsWith("/base") && !id.endsWith("/banner_base"))
  .map((id) => ({ pattern: id.replace("entity/banner/", ""), color: "red" as const }));

const inBrowser = new ItemRenderer(atlas);

await Promise.all([
  InventoryRenderer.load(atlas),
  ...Object.keys(layers).map((id) => {
    const item: ItemStack = { id, enchanted: true, color: 0xff_00_00, effects: [{ id: "minecraft:speed" }], patterns, baseColor: "blue" };
    return inBrowser.render(item, scale);
  }),
]);

await mkdir(OUT, { recursive: true });

const stale = (await readdir(OUT)).filter((file) => file.startsWith(`${name}.`) && file.endsWith(".png") && file !== data.image);
await Promise.all(stale.map((file) => unlink(new URL(file, OUT))));

await writeFile(new URL(data.image, OUT), png);
await writeFile(new URL(`${name}.json`, OUT), `${JSON.stringify(data)}\n`);

console.log(
  `${data.image}: ${size.width} × ${size.height}, ${png.length} bytes, ${icons.size} icons, ` +
    `${Object.keys(layers).length} drawn from models, ${textures.size} textures`,
);
if (skipped.length > 0) console.log(`Skipped ${skipped.length}:\n${skipped.join("\n")}`);
