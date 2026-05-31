/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Field } from "#metadata";

export enum UserLogo {
  DEFAULT = 0,
  IRON = 100,
  GOLD = 200,
  DIAMOND = 300,
  EMERALD = 400,
  VENOM = 401,
  PINK = 402,
  AMETHYST = 420,
  SCULK = 421,
  NETHERITE = 422,
  RUBY = 423,
}

export class UserFooter {
  @Field({ store: { required: false }, type: () => String })
  public message?: string | null;

  @Field({ store: { required: false }, type: () => Number })
  public icon?: UserLogo;
}
