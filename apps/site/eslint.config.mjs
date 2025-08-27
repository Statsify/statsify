/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { FlatCompat } from "@eslint/eslintrc";
import { defineConfig } from "../../eslint.config.js";
import { globalIgnores } from "eslint/config";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

export default [
  globalIgnores(["next-env.d.ts"]),
  ...defineConfig({ tsconfigDirName: import.meta.dirname }),
  ...compat.extends("next/core-web-vitals"),
];

