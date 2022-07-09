/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Field } from "../metadata";
import { UserTheme } from "./theme";

export enum UserTier {
  NONE = 0,
  PREMIUM = 404,
  STAFF = 666,
  CORE = 999,
}

const tiers = Object.entries(UserTier);

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
  public serverMember?: boolean;

  @Field({ store: { required: false } })
  public nitroBooster?: boolean;

  @Field({ type: () => Number, store: { required: false } })
  public tier?: UserTier;

  @Field({ store: { required: false } })
  public hasBadge?: boolean;

  @Field({ type: () => String, store: { required: false } })
  public theme?: UserTheme;

  public static isPremium(user: User | null): boolean {
    const tier = user?.tier ?? UserTier.NONE;
    return tier >= UserTier.PREMIUM;
  }

  public static isStaff(user: User | null): boolean {
    const tier = user?.tier ?? UserTier.STAFF;
    return tier >= UserTier.STAFF;
  }

  public static isCore(user: User | null): boolean {
    const tier = user?.tier ?? UserTier.CORE;
    return tier >= UserTier.CORE;
  }

  public static getTierName(user: User | null): string;
  public static getTierName(tier: UserTier): string;
  public static getTierName(userOrTier: User | null | UserTier): string {
    const tier =
      typeof userOrTier === "number" ? userOrTier : userOrTier?.tier ?? UserTier.NONE;

    return tiers.find(([, value]) => value === tier)?.[0] ?? "NONE";
  }
}

export * from "./theme";
