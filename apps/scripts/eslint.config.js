/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import globals from "globals";
import { defineConfig } from "../../eslint.config.js";

export default [
  { languageOptions: { globals: globals.node } },
  ...defineConfig({ tsconfigDirName: import.meta.dirname }),
];
