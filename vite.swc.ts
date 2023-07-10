/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Options as SwcOptions, transform } from "@swc/core";
import { createFilter } from "@rollup/pluginutils";
import { createUnplugin } from "unplugin";
import { dirname, join, resolve } from "node:path";
import { existsSync } from "node:fs";
import { stat } from "node:fs/promises";

const RESOLVE_EXTENSIONS = [".tsx", ".ts", ".jsx", ".js", ".mjs", ".cjs"];

const resolveFile = (resolved: string, index = false) => {
  for (const ext of RESOLVE_EXTENSIONS) {
    const file = index ? join(resolved, `index${ext}`) : `${resolved}${ext}`;
    if (existsSync(file)) return file;
  }
};

export const resolveId = async (importee: string, importer?: string) => {
  if (importer && importee[0] === ".") {
    const absolutePath = resolve(importer ? dirname(importer) : process.cwd(), importee);
    let resolved = resolveFile(absolutePath);

    if (
      !resolved &&
      existsSync(absolutePath) &&
      (await stat(absolutePath).then((stat) => stat.isDirectory()))
    ) {
      resolved = resolveFile(absolutePath, true);
    }

    return resolved;
  }
};

export const swc = createUnplugin(({ minify, ...options }: SwcOptions = {}) => {
  const filter = createFilter(/\.[jt]sx?$/, /node_modules/);

  if (options.jsc?.transform?.optimizer?.globals?.vars) {
    delete options.jsc.transform.optimizer.globals.vars["import.meta.vitest"];
  }

  return {
    name: "swc",
    resolveId,
    async transform(code, id) {
      if (!filter(id)) return null;

      const result = await transform(code, {
        filename: id,
        ...options,
      });

      return {
        code: result.code,
        map: result.map && JSON.parse(result.map),
      };
    },
    vite: {
      config() {
        return {
          esbuild: false,
        };
      },
    },
    rollup: {
      async renderChunk(code, chunk) {
        if (minify) {
          const result = await transform(code, {
            sourceMaps: true,
            minify: true,
            filename: chunk.fileName,
          });
          return {
            code: result.code,
            map: result.map,
          };
        }
        return null;
      },
    },
  };
});
