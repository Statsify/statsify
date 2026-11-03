/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { existsSync } from "node:fs";
import { dirname, join } from "node:path";

let root: string | undefined;

/**
 * The monorepo root, found by walking up from the working directory like the bot
 * resolves `../../locales` and `../../assets`. Works from `apps/site` (pm2, `pnpm site start`)
 * and from the repo root (vitest).
 */
export function repoRoot(): string {
  if (root) return root;

  let directory = process.cwd();

  while (!existsSync(join(directory, "pnpm-workspace.yaml"))) {
    const parent = dirname(directory);
    if (parent === directory) throw new Error(`Could not find the repository root from ${process.cwd()}`);
    directory = parent;
  }

  root = directory;
  return root;
}
