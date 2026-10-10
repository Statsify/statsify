/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

/**
 * Removes files from `dist` whose source file in `src` no longer exists.
 *
 * Runs in a package directory as its turbo `clean` task, which `build` depends on, so it
 * runs before both a real build and a cache restore. A cache restore writes outputs on
 * top of `dist` without deleting anything, so this is what keeps deleted or renamed
 * sources from leaving orphaned files behind.
 *
 * Only orphans are removed, so `dist` is never empty while `pnpm build:watch` rebuilds
 * and running apps keep their files.
 *
 * Usage: node ../../apps/scripts/src/clean-dist.ts
 */

import { existsSync, readdirSync, rmSync, rmdirSync } from "node:fs";
import { join } from "node:path";

const DIST = "dist";
const SRC = "src";

// swc compiles each of these to a .js file with the same base name
const SOURCE_EXTENSIONS = [".ts", ".tsx", ".mts", ".cts", ".js", ".jsx"];

/**
 * @param file path relative to dist
 */
function hasSource(file: string): boolean {
  const base = file.replace(/\.js(\.map)?$/, "");

  // Files that swc copies as is with --copy-files
  if (base === file) return existsSync(join(SRC, file));

  // swc doesn't compile declaration files, so a .d.js output is always an orphan
  if (base.endsWith(".d")) return false;

  return SOURCE_EXTENSIONS.some((extension) =>
    existsSync(join(SRC, `${base}${extension}`)),
  );
}

/**
 * @param dir path relative to dist
 * @returns the number of orphaned files removed
 */
function prune(dir: string): number {
  let removed = 0;

  for (const entry of readdirSync(join(DIST, dir), { withFileTypes: true })) {
    const path = join(dir, entry.name);

    if (entry.isDirectory()) {
      removed += prune(path);
    } else if (!hasSource(path)) {
      rmSync(join(DIST, path), { force: true });
      removed++;
    }
  }

  if (dir && readdirSync(join(DIST, dir)).length === 0)
    rmdirSync(join(DIST, dir));

  return removed;
}

if (existsSync(DIST)) {
  const removed = prune("");
  if (removed > 0) console.log(`Removed ${removed} orphaned files from dist`);
}
