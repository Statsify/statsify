/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

// Builds never fetch the sources, so run this by hand and commit the output.
import {
  MINECRAFT_DATA,
  MINECRAFT_DATA_SHA,
  TEXTURE_UNITS,
} from "./sync/textures.ts";
import { fetchOk } from "./sync/fetch.ts";
import { NEU_BEFORE_REMOVAL, NEU_REPO, NEU_UNITS } from "./sync/neu.ts";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { HYPIXEL_UNITS } from "./sync/hypixel.ts";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { tmpdir } from "node:os";

export interface SyncContext {
  neu: string; // NEU-REPO's checkout, empty when only textures run
  readJson: <T>(path: string) => Promise<T>;
  write: (file: string, data: unknown) => void;
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

// A source name picks every unit it has.
function pickUnits(names: string[]) {
  if (names.length === 0) return new Set(Object.keys(UNITS));

  const picked = new Set<string>();
  for (const name of names) {
    if (Object.hasOwn(SOURCES, name)) {
      for (const unit of Object.keys(SOURCES[name])) picked.add(unit);
    } else if (Object.hasOwn(UNITS, name)) {
      picked.add(name);
    } else {
      const known = new Set([...Object.keys(SOURCES), ...Object.keys(UNITS)]);
      throw new Error(`no unit or source "${name}": ${[...known].join(", ")}`);
    }
  }

  return picked;
}

// It runs on a full NEU-REPO commit SHA, so NOTICE.md pins what it read.
const [sha = "", ...names] = process.argv.slice(2);
if (!/^[\da-f]{40}$/.test(sha)) {
  throw new Error(
    "usage: node scripts/sync-data.ts <full NEU-REPO commit sha> [unit or source…]",
  );
}

const picked = pickUnits(names);
const full = picked.size === Object.keys(UNITS).length;

// A partial run keeps every other file, so it must use the recorded pins.
const recorded = JSON.parse(
  await readFile(new URL("source.json", out), "utf8"),
) as Source;
const repinned =
  sha !== recorded.sha || MINECRAFT_DATA_SHA !== recorded.minecraftData.sha;
if (!full && repinned) {
  throw new Error(
    `a partial run takes the recorded pins: NEU-REPO ${recorded.sha}, minecraft-data ${recorded.minecraftData.sha}`,
  );
}

// Sorted keys at every depth keep a resync's diff to real changes.
const sorted = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(sorted);
  if (value === null || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value)
      .toSorted(([a], [b]) => a.localeCompare(b))
      .map(([key, child]) => [key, sorted(child)]),
  );
};

// Files wait for every unit, so a failed run leaves src/generated alone.
const pending = new Map<string, string>();
const write = (file: string, data: unknown) => {
  pending.set(file, `${JSON.stringify(sorted(data), null, 2)}\n`);
};

// A shared key merges two boards, and a dropped one keeps its old scores.
function checkBoards(kind: string, old: string[][], next: string[][]) {
  const keys = next.map(([key]) => key);
  const shared = [
    ...new Set(keys.filter((key, index) => keys.indexOf(key) !== index)),
  ];
  if (shared.length > 0) {
    throw new Error(`${kind} boards share keys: ${shared.join(", ")}`);
  }

  const removed = old.map(([key]) => key).filter((key) => !keys.includes(key));
  if (removed.length > 0 && process.env.ALLOW_REMOVED_BOARDS !== "1") {
    throw new Error(
      `${kind} boards removed: ${removed.join(", ")}. Rerun with ALLOW_REMOVED_BOARDS=1 to drop them anyway.`,
    );
  }
}

function formatNotice(source: Source, license: string) {
  const { minecraftData, repo, sha, skills, collections } = source;
  return `textures-1.8.json takes 1.8's block and item ids, names and variants from minecraft-data (${minecraftData.repo}) at ${minecraftData.sha}, which its README licenses as MIT.\n\nThe skill XP tables in leveling.json and the skill stats in stats.json come from Hypixel's SkyBlock skills resource (${skills.url}), version ${skills.version}. collections.json comes from Hypixel's SkyBlock collections resource (${collections.url}), version ${collections.version}.\n\nThe other JSON files here, and the slayer and pet score tables in stats.json, are derived from NEU-REPO (${repo}) at ${sha}. sblevels.json, the level colors in leveling.json and the base table in stats.json are derived from it at ${NEU_BEFORE_REMOVAL}, before it removed them. All of it is under NEU-REPO's MIT license:\n\n${license}`;
}

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

  // Each key is a Mongo path and a Redis key, so a changed one strands a board.
  const boards = JSON.parse(await readFile(boardsFile, "utf8"));
  let boardsChanged = false;
  const setBoards: SyncContext["setBoards"] = (kind, list) => {
    const next = list.map(({ key, name }) => [key, name]);
    checkBoards(kind, boards[kind], next);
    boards[kind] = next;
    boardsChanged = true;
  };

  const sync: SyncContext = { neu: dir, readJson, write, setBoards };
  const results = await Promise.all(
    [...picked].map((name) => UNITS[name](sync)),
  );
  const versions = results.find(Boolean);
  if (boardsChanged) {
    await writeFile(boardsFile, `${JSON.stringify(boards, null, 2)}\n`);
  }

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

    write("source.json", source);
    const license = await readFile(join(dir, "LICENSE"), "utf8");
    pending.set("NOTICE.md", formatNotice(source, license));
  }

  await Promise.all(
    Array.from(pending, ([file, text]) => writeFile(new URL(file, out), text)),
  );

  console.log(`synced ${sha}: ${[...picked].join(", ")}`);
} finally {
  await rm(dir, { recursive: true, force: true });
}
