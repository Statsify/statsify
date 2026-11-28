/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

// Builds and the runtime never fetch src/generated/, so run this by hand and commit the output. Units or sources (neu,
// hypixel, textures) after the sha resync only those: node scripts/sync-data.ts <full NEU-REPO commit sha> [unit…]
import { HYPIXEL_UNITS } from "./sync/hypixel.ts";
import {
  MINECRAFT_DATA,
  MINECRAFT_DATA_SHA,
  TEXTURE_UNITS,
  fetchOk,
} from "./sync/textures.ts";
import { NEU_BEFORE_REMOVAL, NEU_REPO, NEU_UNITS } from "./sync/neu.ts";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";

export interface SyncContext {
  /** NEU-REPO at the sha, unpacked; empty when only textures run. */
  neu: string;
  readJson: <T>(path: string) => Promise<T>;
  write: (file: string, data: unknown) => Promise<void>;
  setBoards: (
    kind: "collections" | "bestiary",
    list: { key: string; name: string }[],
  ) => void;
}

interface Source {
  minecraftData: { repo: string; sha: string };
  repo: string;
  sha: string;
  skills: { url: string; version: string };
  collections: { url: string; version: string };
  syncedAt: string;
}

type Unit = (
  sync: SyncContext,
) => Promise<Pick<Source, "skills" | "collections"> | void>;

const SOURCES: Record<string, Record<string, Unit>> = {
  neu: NEU_UNITS,
  hypixel: HYPIXEL_UNITS,
  textures: TEXTURE_UNITS,
};
const UNITS: Record<string, Unit> = Object.assign(
  {},
  ...Object.values(SOURCES),
);

const out = new URL("../src/generated/", import.meta.url);
const boardsFile = new URL(
  "../../schemas/src/skyblock/boards.json",
  import.meta.url,
);

const [sha = "", ...names] = process.argv.slice(2);
if (!/^[\da-f]{40}$/.test(sha))
  throw new Error("usage: node scripts/sync-data.ts <full commit sha> [unit…]");

const picked = new Set(
  names.length === 0
    ? Object.keys(UNITS)
    : names.flatMap((name) => {
        if (Object.hasOwn(SOURCES, name)) return Object.keys(SOURCES[name]);
        if (Object.hasOwn(UNITS, name)) return [name];
        throw new Error(
          `no unit or source "${name}": ${[...new Set([...Object.keys(SOURCES), ...Object.keys(UNITS)])].join(", ")}`,
        );
      }),
);
const full = picked.size === Object.keys(UNITS).length;

// A partial run keeps every other file as the recorded pins built it
const recorded = JSON.parse(
  await readFile(new URL("source.json", out), "utf8"),
) as Source;
if (
  !full &&
  (sha !== recorded.sha || MINECRAFT_DATA_SHA !== recorded.minecraftData.sha)
) {
  throw new Error(
    `a partial run takes the recorded pins: NEU-REPO ${recorded.sha}, minecraft-data ${recorded.minecraftData.sha}`,
  );
}

/** Sorts object keys at every depth, so a resync only diffs real changes. */
const sorted = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(sorted);
  if (value === null || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value)
      .toSorted(([a], [b]) => a.localeCompare(b))
      .map(([key, child]) => [key, sorted(child)]),
  );
};

// Held until every unit has run, so a failed run leaves src/generated/ as it was
const pending = new Map<string, string>();
const write = (file: string, data: unknown) => {
  pending.set(file, `${JSON.stringify(sorted(data), null, 2)}\n`);
  return Promise.resolve();
};

// A shared key merges two boards, and a dropped one restarts its board empty with the old scores left behind
function checkBoards(kind: string, old: string[][], next: string[][]) {
  const keys = next.map(([key]) => key);
  const shared = [
    ...new Set(keys.filter((key, index) => keys.indexOf(key) !== index)),
  ];
  if (shared.length > 0)
    throw new Error(`${kind} boards share keys: ${shared.join(", ")}`);

  const removed = old.map(([key]) => key).filter((key) => !keys.includes(key));
  if (removed.length > 0 && process.env.ALLOW_REMOVED_BOARDS !== "1") {
    throw new Error(
      `${kind} boards removed: ${removed.join(", ")}. Rerun with ALLOW_REMOVED_BOARDS=1 to drop them anyway.`,
    );
  }
}

const notice = (
  { minecraftData, repo, sha, skills, collections }: Source,
  license: string,
) =>
  `textures-1.8.json takes 1.8's block and item ids, names and variants from minecraft-data (${minecraftData.repo}) at ${minecraftData.sha}, which its README licenses as MIT.\n\nThe skill XP tables in leveling.json and the skill stats in stats.json come from Hypixel's SkyBlock skills resource (${skills.url}), version ${skills.version}. collections.json comes from Hypixel's SkyBlock collections resource (${collections.url}), version ${collections.version}.\n\nThe other JSON files here, and the slayer and pet score tables in stats.json, are derived from NEU-REPO (${repo}) at ${sha}. sblevels.json, the level colors in leveling.json and the base table in stats.json are derived from it at ${NEU_BEFORE_REMOVAL}, before it removed them. All of it is under NEU-REPO's MIT license:\n\n${license}`;

const dir = await mkdtemp(join(tmpdir(), "neu-repo-"));

try {
  if ([...picked].some((name) => !Object.hasOwn(TEXTURE_UNITS, name))) {
    const response = await fetchOk(
      `https://codeload.github.com/${NEU_REPO}/tar.gz/${sha}`,
    );
    await writeFile(
      join(dir, "repo.tar.gz"),
      Buffer.from(await response.arrayBuffer()),
    );
    execFileSync("tar", ["-xzf", "repo.tar.gz", "--strip-components=1"], {
      cwd: dir,
    });
  }

  const readJson = async <T>(path: string): Promise<T> =>
    JSON.parse(await readFile(join(dir, path), "utf8")) as T;

  // Each key is a Mongo path and a Redis key, so one that changes here leaves its old board behind
  const boards = JSON.parse(await readFile(boardsFile, "utf8"));
  let boardsSet = false;
  const setBoards: SyncContext["setBoards"] = (kind, list) => {
    const next = list.map(({ key, name }) => [key, name]);
    checkBoards(kind, boards[kind], next);
    boards[kind] = next;
    boardsSet = true;
  };

  const sync: SyncContext = { neu: dir, readJson, write, setBoards };
  const versions = (
    await Promise.all([...picked].map((name) => UNITS[name](sync)))
  ).find(Boolean);
  if (boardsSet)
    await writeFile(boardsFile, `${JSON.stringify(boards, null, 2)}\n`);

  if (versions) {
    const source: Source = full
      ? {
          minecraftData: {
            repo: `https://github.com/${MINECRAFT_DATA}`,
            sha: MINECRAFT_DATA_SHA,
          },
          repo: `https://github.com/${NEU_REPO}`,
          sha,
          ...versions,
          syncedAt: new Date().toISOString(),
        }
      : { ...recorded, ...versions };

    await write("source.json", source);
    pending.set(
      "NOTICE.md",
      notice(source, await readFile(join(dir, "LICENSE"), "utf8")),
    );
  }

  await Promise.all(
    Array.from(pending, ([file, text]) => writeFile(new URL(file, out), text)),
  );

  console.log(`synced ${sha}: ${[...picked].join(", ")}`);
} finally {
  await rm(dir, { recursive: true, force: true });
}
