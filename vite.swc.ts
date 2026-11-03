/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

/**
 * Adapted from: https://github.com/egoist/unplugin-swc
 * because the module does not work with ESM
 *
 * Under its license:
 *
 * The MIT License (MIT)
 *
 * Copyright © 2021 EGOIST (https://github.com/sponsors/egoist)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
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

  return undefined;
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

  return undefined;
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
          oxc: false,
        };
      },
    },
    rollup: {
      async renderChunk(code: string, chunk: { fileName: string }) {
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
