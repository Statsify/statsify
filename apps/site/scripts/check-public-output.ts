/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

/**
 * Fails the build if anything in the site's public output is byte-identical to a file in the
 * private assets submodule (the 380 blurred backgrounds, textures, …). Runs after `vite build`.
 * Private files are only hashed when their size matches an output file, so the check stays fast.
 */

import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const site = join(import.meta.dirname, "..");
const output = join(site, ".output", "public");
const privateAssets = join(site, "..", "..", "assets", "private");

function walk(directory: string): string[] {
  const files: string[] = [];

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walk(path));
    else if (entry.isFile()) files.push(path);
  }

  return files;
}

const sha256 = (file: string) => createHash("sha256").update(readFileSync(file)).digest("hex");

if (!existsSync(output)) {
  console.error(`check-public-output: ${relative(site, output)} does not exist; run \`vite build\` first.`);
  process.exit(1);
}

if (!existsSync(join(privateAssets, "package.json"))) {
  console.log("check-public-output: private assets are not checked out, nothing to compare against.");
  process.exit(0);
}

const privateBySize = new Map<number, string[]>();

for (const file of walk(privateAssets)) {
  const { size } = statSync(file);
  const files = privateBySize.get(size);
  if (files) files.push(file);
  else privateBySize.set(size, [file]);
}

const leaks: string[] = [];
let compared = 0;

for (const file of walk(output)) {
  const candidates = privateBySize.get(statSync(file).size);
  if (!candidates) continue;

  const hash = sha256(file);

  for (const candidate of candidates) {
    compared++;
    if (sha256(candidate) === hash) leaks.push(`${relative(site, file)} is ${relative(privateAssets, candidate)}`);
  }
}

if (leaks.length > 0) {
  console.error(`check-public-output: ${leaks.length} private asset(s) in the public output:`);
  for (const leak of leaks) console.error(`  ${leak}`);
  process.exit(1);
}

console.log(`check-public-output: no private assets in ${relative(site, output)} (${compared} same-size files compared).`);
