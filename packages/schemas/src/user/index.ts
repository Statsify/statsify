/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Field } from "../metadata";

export enum UserTheme {
  DEFAULT = "default",
  HD = "hd",
}

export enum UserTier {
  NONE = 0,
  PREMIUM = 404,
  CORE = 999,
}

export class User {
  @Field({ mongo: { index: true, unique: true } })
  public id: string;

  @Field({ mongo: { sparse: true }, store: { required: false } })
  public uuid?: string;

  @Field({ store: { required: false } })
  public verifiedAt?: number;

  @Field({ store: { required: false } })
  public unverifiedAt?: number;

  @Field({ store: { required: false } })
  public credits?: number;

  @Field({ store: { required: false } })
  public locale?: string;

  @Field({ store: { required: false } })
  public serverMember?: boolean;

  @Field({ type: () => Number, store: { required: false } })
  public tier?: UserTier;

  @Field({ store: { required: false } })
  public hasBadge?: boolean;

  @Field({ type: () => String, store: { required: false } })
  public theme?: UserTheme;

  public static isPremium(tier = UserTier.NONE): boolean {
    return tier >= UserTier.PREMIUM;
  }
}
