/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import minecraftData from "../../data/minecraft-data.json" with { type: "json" };
import { type Unzipped, unzip } from "fflate";
import { pngSize } from "./canvas.js";

export type PackSource = Blob | ArrayBuffer | Uint8Array | string;

// legacy is 1.8.9, flattened 1.13 to 1.21.3, modern 1.21.4 and later
export type PackLayout = "modern" | "flattened" | "legacy";

export interface Pack {
  name: string;
  hash: string;
  layout: PackLayout;
  files: Map<string, Uint8Array>;
}

type Format = [major: number, minor: number];

// 26.3's pack format picks which of a pack's overlays apply
const TARGET_FORMAT: Format = [97, 1];

// Item model definitions arrived in format 46 (1.21.4)
// and flattened names in format 4 (1.13)
const MODERN_FORMAT = 46;
const FLATTENED_FORMAT = 4;

type FormatValue = number | number[];

interface PackMeta {
  pack?: {
    pack_format?: number;
    min_format?: FormatValue;
    max_format?: FormatValue;
  };
  overlays?: {
    entries: {
      directory: string;
      formats?: FormatValue | { min_inclusive: number; max_inclusive: number };
      min_format?: FormatValue;
      max_format?: FormatValue;
    }[];
  };
}

// A format without a minor is minor 0 as a lower bound, any minor as upper
const toFormat = (value: FormatValue, minor = 0): Format =>
  typeof value === "number" ? [value, minor] : [value[0], value[1] ?? minor];

const compareFormats = (a: Format, b: Format) => a[0] - b[0] || a[1] - b[1];

type OverlayEntry = NonNullable<PackMeta["overlays"]>["entries"][number];

function overlayApplies(entry: OverlayEntry) {
  let min: Format;
  let max: Format;

  if (entry.min_format !== undefined && entry.max_format !== undefined) {
    min = toFormat(entry.min_format);
    max = toFormat(entry.max_format, Infinity);
  } else if (typeof entry.formats === "number") {
    min = [entry.formats, 0];
    max = [entry.formats, Infinity];
  } else if (Array.isArray(entry.formats)) {
    min = [entry.formats[0], 0];
    max = [entry.formats[1] ?? entry.formats[0], Infinity];
  } else if (entry.formats) {
    min = [entry.formats.min_inclusive, 0];
    max = [entry.formats.max_inclusive, Infinity];
  } else {
    return false;
  }

  return (
    compareFormats(min, TARGET_FORMAT) <= 0 &&
    compareFormats(TARGET_FORMAT, max) <= 0
  );
}

function detectLayout(
  meta: PackMeta | undefined,
  files: Map<string, Uint8Array>,
): PackLayout {
  const pack = meta?.pack;
  const format =
    pack?.min_format === undefined
      ? pack?.pack_format
      : toFormat(pack.min_format)[0];

  if (format !== undefined) {
    if (format >= MODERN_FORMAT) return "modern";
    if (format >= FLATTENED_FORMAT) return "flattened";
    return "legacy";
  }

  // Client jars have no pack.mcmeta
  const paths = [...files.keys()];
  if (paths.some((path) => path.startsWith("assets/minecraft/items/")))
    return "modern";
  if (paths.some((path) => path.startsWith("assets/minecraft/textures/items/")))
    return "legacy";
  return "flattened";
}

const unzipAssets = (data: Uint8Array) =>
  new Promise<Unzipped>((resolve, reject) => {
    unzip(
      data,
      {
        filter: ({ name }) =>
          name.includes("assets/") || name.endsWith("pack.mcmeta"),
      },
      (error, files) => {
        if (error) reject(error);
        else resolve(files);
      },
    );
  });

const decoder = new TextDecoder();

const parseJson = <T>(
  file: Uint8Array,
  reviver?: (key: string, value: unknown) => unknown,
) => JSON.parse(decoder.decode(file), reviver) as T;

const encoder = new TextEncoder();

export type LegacyTexture =
  | string
  | null
  | { texture: string; position: number };

interface Upgrade {
  textures: Record<string, LegacyTexture>;
  models: Record<string, string>;
  drop: string[];
}

const UPGRADES: Partial<Record<PackLayout, Upgrade>> = {
  legacy: {
    textures: minecraftData.legacyTextures,
    models: minecraftData.legacyModels,
    // 1.8's banner patterns are opaque masks, where 26.3's use alpha
    drop: [
      "assets/minecraft/blockstates/",
      "assets/minecraft/textures/entity/banner/",
    ],
  },
};

const TEXTURE_FILE = /^assets\/minecraft\/textures\/(.+)\.png(\.mcmeta)?$/;
const MODEL_FILE = /^assets\/minecraft\/models\/(.+)\.json$/;

interface OlderModel {
  parent?: string;
  textures?: Record<string, string>;
}

function upgradeModel(file: Uint8Array, { textures, models }: Upgrade) {
  const model = parseJson<OlderModel>(file);
  const parent = model.parent && withoutNamespace(model.parent);

  // 26.3 draws chests, heads and banners in code
  if (parent === "builtin/entity") return;

  const renamed: Record<string, string> = {};

  for (const [key, value] of Object.entries(model.textures ?? {})) {
    const id = withoutNamespace(value);
    const target =
      value.startsWith("#") || !(id in textures) ? value : textures[id];
    if (target === null) return;

    renamed[key] = typeof target === "string" ? target : target.texture;
  }

  return encoder.encode(
    JSON.stringify({
      ...model,
      parent: parent && (models[parent] ?? parent),
      textures: renamed,
    }),
  );
}

function upgrade(files: Map<string, Uint8Array>, layoutUpgrade: Upgrade) {
  const upgraded = new Map<string, Uint8Array>();
  const { textures, models, drop } = layoutUpgrade;

  for (const [path, file] of files) {
    if (drop.some((folder) => path.startsWith(folder))) continue;

    const model = MODEL_FILE.exec(path);

    if (model) {
      const upgradedModel = upgradeModel(file, layoutUpgrade);
      if (upgradedModel)
        upgraded.set(
          assetPath(models[model[1]] ?? model[1], "models", ".json"),
          upgradedModel,
        );
      continue;
    }

    const texture = TEXTURE_FILE.exec(path);

    if (!texture) {
      upgraded.set(path, file);
      continue;
    }

    const target = texture[1] in textures ? textures[texture[1]] : texture[1];

    if (typeof target === "string") {
      upgraded.set(
        assetPath(target, "textures", `.png${texture[2] ?? ""}`),
        file,
      );
    } else if (target && !texture[2]) {
      // This mcmeta holds the one frame a slot shows
      const { width, height } = pngSize(file);
      const frames = Math.max(1, Math.floor(height / width));
      const animation = {
        animation: { frames: [Math.floor(target.position * frames)] },
      };
      upgraded.set(assetPath(target.texture, "textures", ".png"), file);
      upgraded.set(
        assetPath(target.texture, "textures", ".png.mcmeta"),
        encoder.encode(JSON.stringify(animation)),
      );
    }
  }

  return upgraded;
}

export const DOWNLOAD_TIMEOUT = 60_000;

async function readSource(source: PackSource): Promise<Uint8Array> {
  if (typeof source === "string") {
    const response = await fetch(source, {
      signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT),
    });
    if (!response.ok)
      throw new Error(`${source}: ${response.status} ${response.statusText}`);
    return new Uint8Array(await response.arrayBuffer());
  }

  if (source instanceof Blob) return new Uint8Array(await source.arrayBuffer());
  return source instanceof Uint8Array ? source : new Uint8Array(source);
}

function sourceName(source: PackSource) {
  if (typeof source === "string")
    return decodeURIComponent(source.split("/").at(-1) ?? source);
  if (source instanceof File) return source.name;
  return "pack";
}

async function sha256(data: Uint8Array<ArrayBuffer>) {
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function loadPack(
  source: PackSource,
  name = sourceName(source),
): Promise<Pack> {
  const data = (await readSource(source)) as Uint8Array<ArrayBuffer>;
  const [hash, entries] = await Promise.all([sha256(data), unzipAssets(data)]);

  // Packs zipped with their folder have pack.mcmeta one level down
  const metaPath = Object.keys(entries)
    .filter((path) => path.endsWith("pack.mcmeta"))
    .toSorted((a, b) => a.length - b.length)
    .at(0);

  const root = metaPath?.slice(0, -"pack.mcmeta".length) ?? "";
  const meta = metaPath ? parseJson<PackMeta>(entries[metaPath]) : undefined;

  const directories = [
    "",
    ...(meta?.overlays?.entries
      .filter(overlayApplies)
      .map(({ directory }) => `${directory}/`) ?? []),
  ];

  const files = new Map<string, Uint8Array>();

  // Later overlays replace files from earlier ones and from the pack itself
  for (const directory of directories) {
    const prefix = `${root}${directory}assets/`;

    for (const [path, file] of Object.entries(entries)) {
      if (path.startsWith(prefix) && !path.endsWith("/")) {
        files.set(`assets/${path.slice(prefix.length)}`, file);
      }
    }
  }

  if (files.size === 0) throw new Error(`${name} has no assets folder`);

  const layout = detectLayout(meta, files);
  const layoutUpgrade = UPGRADES[layout];

  return {
    name,
    hash,
    layout,
    files: layoutUpgrade ? upgrade(files, layoutUpgrade) : files,
  };
}

// Packs are layered as the game layers them, lowest priority first
export class PackStack {
  public readonly hash: string;

  public constructor(public readonly packs: Pack[]) {
    // Only 26.3 packs have item model definitions, so older ones only retexture
    if (!packs.some((pack) => pack.layout === "modern")) {
      throw new Error(
        `${packs.map((pack) => pack.name).join(", ")} need a 26.3 pack in the stack`,
      );
    }

    this.hash = packs.map((pack) => pack.hash.slice(0, 16)).join("+");
  }

  public get(path: string) {
    return this.packs.findLast((pack) => pack.files.has(path))?.files.get(path);
  }

  public json<T>(
    path: string,
    reviver?: (key: string, value: unknown) => unknown,
  ) {
    const file = this.get(path);
    return file ? parseJson<T>(file, reviver) : undefined;
  }
}

export const namespaced = (id: string) =>
  id.includes(":") ? id : `minecraft:${id}`;

export const withoutNamespace = (id: string) => id.replace(/^minecraft:/, "");

export const namespaceTypes = (key: string, value: unknown) =>
  key === "type" && typeof value === "string" ? namespaced(value) : value;

export function assetPath(id: string, folder: string, extension: string) {
  const [namespace, path] = namespaced(id).split(":");
  return `assets/${namespace}/${folder}/${path}${extension}`;
}

if (import.meta.vitest) {
  const { expect, it } = import.meta.vitest;

  const applies = (format: Omit<OverlayEntry, "directory">) =>
    overlayApplies({ directory: "overlay", ...format });

  it("applies an overlay whose upper format leaves off the minor to every minor", () => {
    expect(applies({ formats: 97 })).toBe(true);
    expect(applies({ min_format: 97, max_format: 97 })).toBe(true);
    expect(applies({ min_format: [97], max_format: [97] })).toBe(true);
    expect(applies({ min_format: 96, max_format: [97, 0] })).toBe(false);
    expect(applies({ min_format: [97, 2], max_format: 98 })).toBe(false);
  });
}
