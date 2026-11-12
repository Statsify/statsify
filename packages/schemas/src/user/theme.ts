/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Field } from "#metadata";

export const UserFont = {
  DEFAULT: "default",
  HD: "hd",
  FPACK: "fpack",
} as const;

export type UserFont = (typeof UserFont)[keyof typeof UserFont];

export const UserPalette = {
  DEFAULT: "default",
  LIGHT: "light",
  DARK: "dark",
  NO_BACKGROUNDS: "no-backgrounds",
} as const;

export type UserPalette = (typeof UserPalette)[keyof typeof UserPalette];

export const UserBoxes = {
  DEFAULT: "default",
  HD: "hd",
  UHD: "uhd",
} as const;

export type UserBoxes = (typeof UserBoxes)[keyof typeof UserBoxes];

export class UserTheme {
  @Field({ store: { required: false }, type: () => String })
  public font?: UserFont;

  @Field({ store: { required: false }, type: () => String })
  public palette?: UserPalette;

  @Field({ store: { required: false }, type: () => String })
  public boxes?: UserBoxes;
}
