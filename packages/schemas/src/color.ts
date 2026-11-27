/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { minecraftColors as colors } from "@statsify/util";

export type ColorCode = (typeof colors)[number]["code"];

export type ColorHex = (typeof colors)[number]["hex"];

/**
 * The name of the color in all caps
 */
export type ColorId = (typeof colors)[number]["id"];
