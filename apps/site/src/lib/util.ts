/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { extendTailwindMerge, validators } from "tailwind-merge";

export const cn = extendTailwindMerge({
  extend: {
    classGroups: {
      // `text-mc-2` sets the Minecraft font and size, so a later `text-mc-1.5` or `text-16` must win.
      // Without the plain `text-<n>` entry, tailwind-merge reads `text-16` as a color and drops it next to `text-mc-gray`.
      "font-size": [{ "text-mc": [validators.isNumber] }, { text: [validators.isNumber] }],
    },
  },
});
