/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type Unzipped, unzip } from "fflate";

/** A pack zip, or a client jar, as bytes or a URL to fetch */
export type PackSource = Blob | ArrayBuffer | Uint8Array | string;

/**
 * modern: item model definitions in items/ (1.21.4+)
 * flattened: textures/item, textures/block (1.13 to 1.21.3)
 * legacy: textures/items, textures/blocks (1.8.9)
 */
export type PackLayout = "modern" | "flattened" | "legacy";

export interface Pack {
  name: string;
  hash: string;
  layout: PackLayout;
  /** Paths from the pack root, like "assets/minecraft/items/stone.json" */
  files: ReadonlyMap<string, Uint8Array>;
}

type Format = [major: number, minor: number];

// 26.3's resource pack format, used to pick which of a pack's overlays apply
const TARGET_FORMAT: Format = [97, 1];

// Item model definitions arrived in format 46 (1.21.4), flattened names in format 4 (1.13)
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

const toFormat = (value: FormatValue): Format =>
  typeof value === "number" ? [value, 0] : [value[0], value[1] ?? 0];

const compareFormats = (a: Format, b: Format) => a[0] - b[0] || a[1] - b[1];

type OverlayEntry = NonNullable<PackMeta["overlays"]>["entries"][number];

function overlayApplies(entry: OverlayEntry) {
  let min: Format;
  let max: Format;

  if (entry.min_format !== undefined && entry.max_format !== undefined) {
    min = toFormat(entry.min_format);
    max = toFormat(entry.max_format);
  } else if (typeof entry.formats === "number") {
    min = max = [entry.formats, 0];
  } else if (Array.isArray(entry.formats)) {
    min = [entry.formats[0], 0];
    max = [entry.formats[1] ?? entry.formats[0], Infinity];
  } else if (entry.formats) {
    min = [entry.formats.min_inclusive, 0];
    max = [entry.formats.max_inclusive, Infinity];
  } else {
    return false;
  }

  return compareFormats(min, TARGET_FORMAT) <= 0 && compareFormats(TARGET_FORMAT, max) <= 0;
}

function layoutOf(meta: PackMeta | undefined, files: ReadonlyMap<string, Uint8Array>): PackLayout {
  const pack = meta?.pack;
  const format = pack?.min_format === undefined ? pack?.pack_format : toFormat(pack.min_format)[0];

  if (format !== undefined) {
    if (format >= MODERN_FORMAT) return "modern";
    if (format >= FLATTENED_FORMAT) return "flattened";
    return "legacy";
  }

  // Client jars have no pack.mcmeta
  const paths = [...files.keys()];
  if (paths.some((path) => path.startsWith("assets/minecraft/items/"))) return "modern";
  if (paths.some((path) => path.startsWith("assets/minecraft/textures/items/"))) return "legacy";
  return "flattened";
}

const unzipAssets = (data: Uint8Array) =>
  new Promise<Unzipped>((resolve, reject) => {
    unzip(
      data,
      { filter: ({ name }) => name.includes("assets/") || name.endsWith("pack.mcmeta") },
      (error, files) => {
        if (error) reject(error);
        else resolve(files);
      },
    );
  });

const decoder = new TextDecoder();

const parseJson = <T>(file: Uint8Array, reviver?: (key: string, value: unknown) => unknown) =>
  JSON.parse(decoder.decode(file), reviver) as T;

async function readSource(source: PackSource): Promise<Uint8Array> {
  if (typeof source === "string") {
    const response = await fetch(source);
    if (!response.ok) throw new Error(`${source}: ${response.status} ${response.statusText}`);
    return new Uint8Array(await response.arrayBuffer());
  }

  if (source instanceof Blob) return new Uint8Array(await source.arrayBuffer());
  return source instanceof Uint8Array ? source : new Uint8Array(source);
}

function sourceName(source: PackSource) {
  if (typeof source === "string") return decodeURIComponent(source.split("/").at(-1) ?? source);
  if (source instanceof File) return source.name;
  return "pack";
}

async function sha256(data: Uint8Array<ArrayBuffer>) {
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function loadPack(source: PackSource, name = sourceName(source)): Promise<Pack> {
  const data = (await readSource(source)) as Uint8Array<ArrayBuffer>;
  const [hash, entries] = await Promise.all([sha256(data), unzipAssets(data)]);

  // Packs are often zipped with their folder, so pack.mcmeta sits one level down
  const metaPath = Object.keys(entries)
    .filter((path) => path.endsWith("pack.mcmeta"))
    .toSorted((a, b) => a.length - b.length)
    .at(0);

  const root = metaPath?.slice(0, -"pack.mcmeta".length) ?? "";
  const meta = metaPath ? parseJson<PackMeta>(entries[metaPath]) : undefined;

  const directories = [
    "",
    ...(meta?.overlays?.entries.filter(overlayApplies).map(({ directory }) => `${directory}/`) ?? []),
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

  return { name, hash, layout: layoutOf(meta, files), files };
}

/** Packs layered the way Minecraft layers them, lowest priority first */
export class PackStack {
  public readonly hash: string;

  public constructor(public readonly packs: readonly Pack[]) {
    const legacy = packs.find((pack) => pack.layout === "legacy");
    if (legacy) throw new Error(`${legacy.name} is a 1.8.9 pack, which isn't supported yet`);

    this.hash = packs.map((pack) => pack.hash.slice(0, 16)).join("+");
  }

  public get(path: string) {
    return this.packs.findLast((pack) => pack.files.has(path))?.files.get(path);
  }

  public json<T>(path: string, reviver?: (key: string, value: unknown) => unknown) {
    const file = this.get(path);
    return file ? parseJson<T>(file, reviver) : undefined;
  }
}

/** A namespaced id with or without its namespace, like "item/stick" or "minecraft:item/stick" */
export const namespaced = (id: string) => (id.includes(":") ? id : `minecraft:${id}`);

/** A JSON reviver for item model definitions and fonts, where every "type" is an id with an optional namespace */
export const namespaceTypes = (key: string, value: unknown) =>
  key === "type" && typeof value === "string" ? namespaced(value) : value;

export function assetPath(id: string, folder: string, extension: string) {
  const [namespace, path] = namespaced(id).split(":");
  return `assets/${namespace}/${folder}/${path}${extension}`;
}
