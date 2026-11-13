/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ItemRenderer, PackStack, loadPack, setCanvasBackend } from "@statsify/textures";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { existsSync } from "node:fs";
import { getAssetPath } from "./index.js";
import { mkdir, mkdtemp, open, readFile, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import { skiaCanvas } from "@statsify/textures/node";
import { unzipSync } from "fflate";

const ROOT = getAssetPath("resource-packs", "public");

const HYPIXEL_PACKS = "https://api.hypixel.net/v2/resources/packs";
const MOJANG_VERSIONS = "https://piston-meta.mojang.com/mc/game/version_manifest_v2.json";

// The client and pack format @statsify/textures draws
const MINECRAFT_VERSION = "26.3";
const PACK_FORMAT = 97;

const HYPIXEL_PACK = "SkyBlock";

// Hypixel's pack LICENSE (v1.0, 2026-07-07) by sha256. A pack under any other license is held
// until someone reviews it and updates this
const REVIEWED_LICENSE = "22d27db6dc242dbdfdb0bac60ee16a488a8791d724be1734eedc23d85ad8068c";

const ACTIVE = "active.json";
const PREVIOUS = "previous.json";
const HELD = "held.json";
const LOCK = "update.lock";

// An update takes a minute or two, so a lock this old was left by one that crashed
const STALE_LOCK = 30 * 60 * 1000;

interface HypixelPacks {
  packs: {
    id: string;
    deployId: string;
    lastUpdated: number;
    versions: { packFormat: number; hash: string; url: string }[];
  }[];
}

interface VersionManifest {
  versions: { id: string; url: string; sha1: string }[];
}

interface VersionMetadata {
  downloads: { client: { url: string; sha1: string; size: number } };
}

/** Pack archives under the cache folder, lowest priority first */
interface Generation {
  packs: string[];
}

export type PackUpdate =
  | { status: "activated"; stack: PackStack }
  | { status: "unchanged" | "running" }
  | { status: "held"; license: string };

const hash = (algorithm: "sha1" | "sha256", data: Uint8Array) => createHash(algorithm).update(data).digest("hex");

async function get(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: ${response.status} ${response.statusText}`);
  return new Uint8Array(await response.arrayBuffer());
}

const getJson = async <T>(url: string) => JSON.parse(Buffer.from(await get(url)).toString()) as T;

async function download(url: string, sha1: string, size?: number) {
  const data = await get(url);

  if (hash("sha1", data) !== sha1 || (size !== undefined && data.length !== size)) {
    throw new Error(`${url} doesn't match the sha1 it's listed with, ${sha1}`);
  }

  return data;
}

/** Writes a pack's folder beside the cache and renames it into place whole, so a folder that exists is complete */
async function store(folder: string, files: Record<string, Uint8Array | string>) {
  const staging = await mkdtemp(join(ROOT, ".staging-"));

  try {
    await Promise.all(Object.entries(files).map(([name, data]) => writeFile(join(staging, name), data)));
    await mkdir(dirname(join(ROOT, folder)), { recursive: true });
    await rename(staging, join(ROOT, folder));
  } catch (error) {
    await rm(staging, { recursive: true, force: true });
    throw error;
  }
}

/** A Minecraft version's client jar, through Mojang's version manifest and that version's metadata */
async function mojangClient(version: string) {
  const cached = existsSync(join(ROOT, "mojang"))
    ? (await readdir(join(ROOT, "mojang"))).find((folder) => folder.startsWith(`${version}-`))
    : undefined;

  if (cached) return `mojang/${cached}/client.jar`;

  const manifest = await getJson<VersionManifest>(MOJANG_VERSIONS);
  const listed = manifest.versions.find(({ id }) => id === version);
  if (!listed) throw new Error(`Minecraft ${version} isn't in Mojang's version manifest`);

  const metadata = await download(listed.url, listed.sha1);
  const { client } = (JSON.parse(Buffer.from(metadata).toString()) as VersionMetadata).downloads;
  const jar = await download(client.url, client.sha1, client.size);

  const folder = `mojang/${version}-${client.sha1}`;
  await store(folder, { "client.jar": jar, "version.json": metadata });

  return `${folder}/client.jar`;
}

/** Hypixel's pack in the format the renderer reads, with its LICENSE and listing beside it */
async function hypixelPack() {
  const { packs } = await getJson<HypixelPacks>(HYPIXEL_PACKS);
  const pack = packs.find(({ id }) => id === HYPIXEL_PACK);
  const version = pack?.versions.find(({ packFormat }) => packFormat === PACK_FORMAT);
  if (!pack || !version) throw new Error(`Hypixel lists no ${HYPIXEL_PACK} pack in format ${PACK_FORMAT}`);

  const folder = `hypixel/${pack.id.toLowerCase()}-${pack.deployId}-${PACK_FORMAT}-${version.hash}`;

  if (!existsSync(join(ROOT, folder))) {
    const zip = await download(version.url, version.hash);
    const { LICENSE: license } = unzipSync(zip, { filter: ({ name }) => name === "LICENSE" });
    if (!license) throw new Error(`${version.url} has no LICENSE`);

    const listing = JSON.stringify({ ...pack, fetchedAt: new Date().toISOString() });
    await store(folder, { "pack.zip": zip, LICENSE: license, "listing.json": listing });
  }

  return `${folder}/pack.zip`;
}

async function readGeneration(name: string): Promise<Generation | undefined> {
  const path = join(ROOT, name);
  return existsSync(path) ? JSON.parse(await readFile(path, "utf8")) : undefined;
}

/** Replaces a generation file with one rename, so a reader sees the old one or the new one whole */
async function writeGeneration(name: string, generation: Generation) {
  const temporary = join(ROOT, `.${name}`);
  await writeFile(temporary, JSON.stringify(generation));
  await rename(temporary, join(ROOT, name));
}

const loadStack = async ({ packs }: Generation) =>
  new PackStack(await Promise.all(packs.map(async (path) => loadPack(await readFile(join(ROOT, path)), path))));

/** Draws every item definition the packs above the first add, so a pack the renderer can't fully draw never goes live */
async function probe(stack: PackStack) {
  setCanvasBackend(skiaCanvas);
  const renderer = new ItemRenderer(stack);

  const ids = stack.packs.slice(1).flatMap(({ files }) =>
    [...files.keys()].flatMap((path) => {
      const definition = /^assets\/([^/]+)\/items\/(.+)\.json$/.exec(path);
      return definition ? [`${definition[1]}:${definition[2]}`] : [];
    }),
  );

  if (ids.length === 0) throw new Error(`${stack.hash} adds no item definitions`);

  const draws = await Promise.allSettled(ids.map((id) => renderer.render({ id: "minecraft:paper", itemModel: id }, 1)));
  const failed = ids.filter((_, index) => draws[index].status === "rejected");

  if (failed.length > 0) {
    throw new Error(`${stack.hash} can't draw ${failed.length} of ${ids.length} items: ${failed.slice(0, 10).join(", ")}`);
  }
}

/** Deletes pack folders no kept generation names */
async function prune(kept: Generation[]) {
  const folders = new Set(kept.flatMap(({ packs }) => packs.map((path) => dirname(path))));

  await Promise.all(
    ["mojang", "hypixel"].map(async (source) => {
      if (!existsSync(join(ROOT, source))) return;

      const unused = (await readdir(join(ROOT, source))).filter((folder) => !folders.has(`${source}/${folder}`));
      await Promise.all(unused.map((folder) => rm(join(ROOT, source, folder), { recursive: true, force: true })));
    }),
  );
}

async function lock() {
  const path = join(ROOT, LOCK);

  try {
    return await open(path, "wx");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
    if (Date.now() - (await stat(path)).mtimeMs < STALE_LOCK) return;

    await rm(path, { force: true });
    return open(path, "wx");
  }
}

/** The packs icons draw from, or undefined until an update first activates them */
export async function loadResourcePacks() {
  const active = await readGeneration(ACTIVE);
  return active && loadStack(active);
}

/**
 * Downloads Minecraft's client jar and Hypixel's SkyBlock pack, checks them, and activates them. One update runs
 * at a time, and the last working packs stay active when anything fails or a pack's license changes.
 */
export async function updateResourcePacks(): Promise<PackUpdate> {
  await mkdir(ROOT, { recursive: true });

  const handle = await lock();
  if (!handle) return { status: "running" };

  try {
    const generation = { packs: [await mojangClient(MINECRAFT_VERSION), await hypixelPack()] };
    const active = await readGeneration(ACTIVE);
    if (active?.packs.join() === generation.packs.join()) return { status: "unchanged" };

    const license = join(ROOT, dirname(generation.packs[1]), "LICENSE");

    if (hash("sha256", await readFile(license)) !== REVIEWED_LICENSE) {
      await writeGeneration(HELD, generation);
      return { status: "held", license };
    }

    const stack = await loadStack(generation);
    await probe(stack);

    if (active) await writeGeneration(PREVIOUS, active);
    await writeGeneration(ACTIVE, generation);
    await rm(join(ROOT, HELD), { force: true });

    // Another process may have loaded the previous packs just before the switch
    await prune(active ? [generation, active] : [generation]);

    return { status: "activated", stack };
  } finally {
    await handle.close();
    await rm(join(ROOT, LOCK), { force: true });
  }
}
