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

export default mergeConfig(await config(join(import.meta.dirname, "../../.swcrc")), {
  resolve: {
    alias: { "~": join(import.meta.dirname, "src") },
  },
});
