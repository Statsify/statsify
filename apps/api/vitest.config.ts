/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { config } from "../../vitest.shared.js";
import { join } from "node:path";
import { mergeConfig } from "vitest/config";
import { readFile } from "node:fs/promises";
import type { Plugin } from "vite";

const directory = import.meta.dirname;
const source = join(directory, "src");

const { imports } = JSON.parse(await readFile(join(directory, "package.json"), "utf8")) as {
  imports: Record<string, { types: string }>;
};

/**
 * Resolves the API's own `#module` aliases from `src` instead of `dist`, so tests never run against a
 * stale build. Only for importers under `src`: other packages (`@statsify/schemas`) have a `#player` too.
 */
const sourceAliases: Plugin = {
  name: "statsify:api-source-aliases",
  enforce: "pre",
  resolveId(id, importer) {
    const alias = imports[id];
    return alias && importer?.startsWith(source) ? join(directory, alias.types) : null;
  },
};

export default mergeConfig(await config(join(directory, "../../.swcrc")), { plugins: [sourceAliases] });
