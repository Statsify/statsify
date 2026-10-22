/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

/**
 * Removes files from dist whose source in src no longer exists. It runs as each package's
 * turbo clean task, before both builds and cache restores, which add files to dist but
 * never delete any. Only orphans are removed, so dist stays usable during build:watch.
 *
 * Usage: node ../../apps/scripts/src/clean-dist.ts
 */

import { existsSync, readdirSync, rmSync, rmdirSync } from "node:fs";
import { join, relative } from "node:path";

const DIST = "dist";
const SRC = "src";

// swc keeps each file's path and only changes its extension, so a dist file has a source
// when a src file has the same path once .map and both extensions are removed
const stem = (path: string) => path.replace(/\.map$/, "").replace(/\.[^./\\]+$/, "");

function entries(dir: string) {
  return readdirSync(dir, { recursive: true, withFileTypes: true });
}

function files(dir: string) {
  return entries(dir)
    .filter((entry) => entry.isFile())
    .map((entry) => relative(dir, join(entry.parentPath, entry.name)));
}

if (existsSync(DIST)) {
  const sources = new Set(files(SRC).map(stem));
  const orphans = files(DIST).filter((file) => !sources.has(stem(file)));

  for (const orphan of orphans) rmSync(join(DIST, orphan));

  // Deepest first, so a folder emptied by removing its subfolders is removed too
  const folders = entries(DIST)
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(entry.parentPath, entry.name))
    .sort((a, b) => b.length - a.length);

  for (const folder of folders) {
    if (readdirSync(folder).length === 0) rmdirSync(folder);
  }

  if (orphans.length > 0) console.log(`Removed ${orphans.length} orphaned files from dist`);
}
