/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Field } from "../metadata";

export enum UserFont {
  DEFAULT = "default",
  HD = "hd",
}

export enum UserPallet {
  DEFAULT = "default",
  LIGHT = "light",
  DARK = "dark",
}

export enum UserBoxes {
  DEFAULT = "default",
  HD = "hd",
  UHD = "uhd",
}

export class UserTheme {
  @Field({ type: () => String })
  public font?: UserFont;

  @Field({ type: () => String })
  public pallet?: UserPallet;

  @Field({ type: () => String })
  public boxes?: UserBoxes;
}
