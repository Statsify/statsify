/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { config } from "../../vitest.shared.js";
import { mergeConfig } from "vitest/config";
import { resolve } from "node:path";

export default mergeConfig(await config("./.swcrc"), {
  resolve: {
    alias: {
      "#colors": resolve(import.meta.dirname, "src/colors/index.ts"),
      "#font": resolve(import.meta.dirname, "src/font/index.ts"),
      "#hooks": resolve(import.meta.dirname, "src/hooks/index.ts"),
      "#intrinsics": resolve(import.meta.dirname, "src/intrinsics/index.ts"),
      "#jsx": resolve(import.meta.dirname, "src/jsx/index.ts"),
    },
  },
});
