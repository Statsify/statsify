/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  Atlas,
  type AtlasData,
  type AtlasRect,
  CHEST_SCREEN,
  DEFAULT_SKIN,
  GLINT,
  type ItemLayer,
  ItemRenderer,
  type ItemStack,
  LEGACY_GLINT,
  ModelResolver,
  PATTERN_FOLDERS,
  PackStack,
  assetPath,
  loadNames,
  nameKeys,
  namespaced,
  setCanvasBackend,
} from "@statsify/textures";
import { loadPackFolder, skiaCanvas } from "@statsify/textures/node";
import { mkdir, readdir, unlink, writeFile } from "node:fs/promises";
import { Canvas } from "skia-canvas";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { parseArgs } from "node:util";
import potpack from "potpack";

// Each atlas's minecraft-textures folders, lowest priority first
const ATLASES: Record<string, string[]> = {
  "vanilla-26.3": ["26.3"],
  "vanilla-1.8.9": ["26.3", "1.8.9"],
};

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    scales: { type: "string", default: "2,3" },
    textures: {
      type: "string",
      default: fileURLToPath(
        new URL("../../../assets/private/minecraft-textures", import.meta.url),
      ),
    },
  },
});

const names = positionals.length > 0 ? positionals : Object.keys(ATLASES);
const scales = values.scales
  .split(",")
  .map(Number)
  .toSorted((a, b) => a - b);

const unknown = names.filter((name) => !(name in ATLASES));
if (unknown.length > 0)
  throw new Error(
    `${unknown.join(", ")} aren't atlases: pick from ${Object.keys(ATLASES).join(", ")}`,
  );

const versions = [...new Set(names.flatMap((name) => ATLASES[name]))];
const missing = versions
  .map((version) => join(values.textures, version))
  .filter((folder) => !existsSync(folder));

if (missing.length > 0)
  throw new Error(
    `${missing.join(", ")} don't exist: atlases are drawn from the private assets' minecraft-textures folders`,
  );

const OUT = new URL("../atlas/", import.meta.url);
const ITEM_FILE = /^assets\/([^/]+)\/items\/(.+)\.json$/;

// These items' tints and models read the stack, so the browser draws them
const STACK_TINTS = new Set(["minecraft:dye", "minecraft:potion"]);
const STACK_MODELS = new Set([
  "minecraft:player_head",
  ...Object.keys(PATTERN_FOLDERS),
]);

// Banners and shields draw any of their folder's patterns over their base
const patternFolders: Record<string, string | undefined> = PATTERN_FOLDERS;

const drawsFromModels = (resolved: ItemLayer[]) =>
  resolved.some(
    ({ tints, special }) =>
      tints.some(({ type }) => STACK_TINTS.has(type)) ||
      (special !== undefined && STACK_MODELS.has(special.type)),
  );

const sprite = (id: string, canvas: OffscreenCanvas) => ({
  id,
  canvas,
  x: 0,
  y: 0,
  w: canvas.width,
  h: canvas.height,
});
const toRect = ({ x, y, w, h }: ReturnType<typeof sprite>): AtlasRect => [
  x,
  y,
  w,
  h,
];

const pixels = (canvas: OffscreenCanvas) =>
  canvas.getContext("2d")!.getImageData(0, 0, canvas.width, canvas.height).data;

setCanvasBackend(skiaCanvas);

const packs = new Map(
  await Promise.all(
    versions.map(
      async (version) =>
        [
          version,
          await loadPackFolder(join(values.textures, version)),
        ] as const,
    ),
  ),
);

async function generate(name: string) {
  const stack = new PackStack(
    ATLASES[name].map((version) => packs.get(version)!),
  );

  const renderer = new ItemRenderer(stack);
  const models = new ModelResolver(stack);
  const files = [
    ...new Set(stack.packs.flatMap((pack) => [...pack.files.keys()])),
  ];

  const ids = files
    .map((path) => ITEM_FILE.exec(path))
    .filter((match) => match !== null)
    .map(([, namespace, path]) => `${namespace}:${path}`)
    .toSorted();

  const drawn = await Promise.all(
    ids.map(async (id) => {
      try {
        const resolved = models.resolve({ id });

        // Any whole scale draws a flat icon's 16-pixel textures exactly
        const flat = resolved.every(
          ({ model, special }) => model.generated && !special,
        );
        const drawnAt = await Promise.all(
          (flat ? [1] : scales).map((scale) => renderer.render({ id }, scale)),
        );
        return { id, resolved, branches: models.branches(id), drawnAt };
      } catch (error) {
        return { id, error: (error as Error).message };
      }
    }),
  );

  const icons = new Map<string, OffscreenCanvas[]>();
  const layers: AtlasData["layers"] = {};
  const textureIds = new Set(
    [
      CHEST_SCREEN,
      renderer.legacyGlint ? LEGACY_GLINT : GLINT,
      DEFAULT_SKIN,
    ].map(namespaced),
  );
  const skipped: string[] = [];

  for (const result of drawn) {
    if ("error" in result) {
      skipped.push(`${result.id}: ${result.error}`);
      continue;
    }

    const { id, resolved, branches, drawnAt } = result;
    icons.set(id, drawnAt);

    const variants = branches
      ? [branches.on_true, branches.on_false]
      : [resolved];
    if (!variants.some(drawsFromModels)) continue;
    layers[id] = branches ?? resolved;

    for (const { model, special } of variants.flat()) {
      if (!special)
        for (const texture of Object.values(model.textures))
          textureIds.add(namespaced(texture));

      const folder = special && patternFolders[special.type];
      if (!folder) continue;

      const patterns = assetPath(`entity/${folder}/`, "textures", "");

      for (const path of files) {
        if (path.startsWith(patterns) && path.endsWith(".png")) {
          textureIds.add(
            `minecraft:${path.slice("assets/minecraft/textures/".length, -".png".length)}`,
          );
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

  const iconSprites = [...icons].flatMap(([id, drawnAt]) =>
    drawnAt.map((canvas) => sprite(id, canvas)),
  );
  const textureSprites = [...textures].map(([id, canvas]) =>
    sprite(id, canvas),
  );
  const sprites = [...iconSprites, ...textureSprites];

  const size = potpack(sprites);
  const image = new Canvas(size.w, size.h);
  const ctx = image.getContext("2d");

  for (const { canvas, x, y } of sprites)
    ctx.drawImage(canvas as unknown as Canvas, x, y);

  const iconRects: Record<string, AtlasRect[]> = {};
  for (const icon of iconSprites)
    (iconRects[icon.id] ??= []).push(toRect(icon));

  const textureRects = Object.fromEntries(
    textureSprites.map((texture) => [texture.id, toRect(texture)]),
  );

  const png = await image.toBuffer("png");
  const hash = createHash("sha256").update(png).digest("hex").slice(0, 16);

  const lang = loadNames(stack);
  const itemNames: Record<string, string> = {};

  for (const key of ids.flatMap(nameKeys)) {
    if (lang[key]) itemNames[key] = lang[key];
  }

  const data: AtlasData = {
    image: `${name}.${hash}.png`,
    hash,
    scales,
    legacyGlint: renderer.legacyGlint,
    icons: iconRects,
    layers,
    textures: textureRects,
    names: itemNames,
  };

  // Reading the image back as a page does catches misplaced or missing icons
  const atlas = new Atlas(data, await skiaCanvas.decodePng(png));

  for (const { id, canvas } of iconSprites) {
    const expected = pixels(canvas);
    if (
      !pixels(atlas.icon(id, canvas.width / 16)).every(
        (value, i) => value === expected[i],
      )
    ) {
      throw new Error(`${id}'s icon came back different from the atlas`);
    }
  }

  const patterns = [...textureIds]
    .filter(
      (id) =>
        id.startsWith("minecraft:entity/banner/") &&
        !id.endsWith("/base") &&
        !id.endsWith("/banner_base"),
    )
    .map((id) => ({
      pattern: id.replace("entity/banner/", ""),
      color: "red" as const,
    }));

  const inBrowser = new ItemRenderer(atlas);

  await Promise.all([
    atlas.inventoryRenderer(),
    ...Object.keys(layers).map((id) => {
      const item: ItemStack = {
        id,
        enchanted: true,
        color: 0xff_00_00,
        effects: [{ id: "minecraft:speed" }],
        patterns,
        baseColor: "blue",
      };
      return inBrowser.render(item, scales.at(-1)!);
    }),
  ]);

  await mkdir(OUT, { recursive: true });

  const stale = (await readdir(OUT)).filter(
    (file) =>
      file.startsWith(`${name}.`) &&
      /^[\da-f]{16}\.png$/.test(file.slice(name.length + 1)) &&
      file !== data.image,
  );
  await Promise.all(stale.map((file) => unlink(new URL(file, OUT))));

  await writeFile(new URL(data.image, OUT), png);
  await writeFile(new URL(`${name}.json`, OUT), `${JSON.stringify(data)}\n`);

  console.log(
    `${data.image}: ${size.w} × ${size.h}, ${png.length} bytes, ${icons.size} icons, ` +
      `${Object.keys(layers).length} drawn from models, ${textures.size} textures`,
  );
  if (skipped.length > 0)
    console.log(`Skipped ${skipped.length}:\n${skipped.join("\n")}`);
}

await Promise.all(names.map(generate));
