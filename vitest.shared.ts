/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { defineConfig } from "vitest/config";
import { readFile } from "node:fs/promises";
import { swc } from "./vite.swc.js";

async function getSwcrc(path?: string) {
  const config = await readFile(path ?? "./.swcrc", "utf8").then(JSON.parse);
  delete config["$schema"];
  return config;
}

export async function config(path?: string) {
  const swcrc = await getSwcrc(path);

  return defineConfig({
    optimizeDeps: {
      disabled: true,
    },
    envPrefix: "VITEST",
    test: {
      environment: "node",
      includeSource: ["./src/**/*.ts", "./src/**/*.tsx"],
      globals: false,
      passWithNoTests: true,
    },
    plugins: [swc.vite(swcrc)],
  });
}
