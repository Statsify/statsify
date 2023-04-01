/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { minecraftColors as colors } from "./";

export type ColorCode = (typeof colors)[number]["code"];

export type ColorHex = (typeof colors)[number]["hex"];

/**
 * The name of the color in all caps
 */
export type ColorId = (typeof colors)[number]["id"];

export class Color {
  public code: ColorCode;
  public hex: ColorHex;
  public id: ColorId;

  public constructor(code: ColorCode | ColorHex | ColorId) {
    const color = colors.find((c) => c.code === code || c.hex === code || c.id === code)!;

    this.code = color?.code;
    this.hex = color?.hex;
    this.id = color?.id;
  }

  public toString() {
    return this.code;
  }
}
