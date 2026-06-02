/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: ["./apps/*/vitest.config.ts", "./packages/*/vitest.config.ts"],
  },
});
