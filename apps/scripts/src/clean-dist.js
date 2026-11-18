/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

// swc and turbo cache restores only add files to dist. Deleting just the orphans,
// not all of dist, keeps dist usable while build:watch runs.

import { existsSync, readdirSync, rmSync, rmdirSync } from "node:fs";
import { join, relative } from "node:path";

const DIST = "dist";
const SRC = "src";

// src/a.ts builds to dist/a.js and dist/a.js.map, which all share the stem "a"
const stem = (path) => path.replace(/\.map$/, "").replace(/\.[^./\\]+$/, "");

const entries = (dir) => readdirSync(dir, { recursive: true, withFileTypes: true });

const files = (dir) =>
  entries(dir)
    .filter((entry) => entry.isFile())
    .map((entry) => relative(dir, join(entry.parentPath, entry.name)));

if (existsSync(DIST)) {
  const sources = new Set(files(SRC).map(stem));
  const orphans = files(DIST).filter((file) => !sources.has(stem(file)));

  for (const orphan of orphans) rmSync(join(DIST, orphan));

  const foldersDeepestFirst = entries(DIST)
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(entry.parentPath, entry.name))
    .sort((a, b) => b.length - a.length);

  for (const folder of foldersDeepestFirst) {
    if (readdirSync(folder).length === 0) rmdirSync(folder);
  }

  if (orphans.length > 0) console.log(`Removed ${orphans.length} orphaned files from dist`);
}
