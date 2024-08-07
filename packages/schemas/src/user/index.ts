/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Field } from "#metadata";
import { UserFooter, UserLogo } from "./footer.js";
import { UserTheme } from "./theme.js";
import { prettify } from "@statsify/util";

export enum UserTier {
  NONE = 0,
  IRON = 101,
  GOLD = 202,
  DIAMOND = 303,
  EMERALD = 404,
  NETHERITE = 505,
  STAFF = 666,
  CORE = 999
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
  public serverBooster?: boolean;

  @Field({ store: { required: false } })
  public patreon?: boolean;

  @Field({ type: () => Number, store: { required: false } })
  public tier?: UserTier;

  @Field({ store: { required: false } })
  public hasBadge?: boolean;

  @Field({ type: () => String, store: { required: false } })
  public theme?: UserTheme;

  @Field({ store: { required: false } })
  public footer?: UserFooter;

  @Field({ store: { required: false }, type: () => String })
  public locale?: string | null;

  public static isIron(user: User | null): boolean {
    return this.isTier(user, UserTier.IRON);
  }

  public static isGold(user: User | null): boolean {
    return this.isTier(user, UserTier.GOLD);
  }

  public static isDiamond(user: User | null): boolean {
    return this.isTier(user, UserTier.DIAMOND);
  }

  public static isEmerald(user: User | null): boolean {
    return this.isTier(user, UserTier.EMERALD);
  }

  public static isNetherite(user: User | null): boolean {
    return this.isTier(user, UserTier.NETHERITE);
  }

  public static isStaff(user: User | null): boolean {
    return this.isTier(user, UserTier.STAFF);
  }

  public static isCore(user: User | null): boolean {
    return this.isTier(user, UserTier.CORE);
  }

  public static getLogo(user: User | null) {
    if (!user) return this.tierToLogo(UserTier.NONE);
    if (user.footer?.icon && (user.tier ?? 0) >= user.footer.icon)
      return user.footer.icon;
    if (user.tier) return this.tierToLogo(user.tier);
    return this.tierToLogo(UserTier.NONE);
  }

  public static tierToLogo(tier: UserTier): UserLogo {
    switch (tier) {
      case UserTier.NONE:
        return UserLogo.DEFAULT;

      case UserTier.IRON:
        return UserLogo.IRON;

      case UserTier.GOLD:
        return UserLogo.GOLD;

      case UserTier.DIAMOND:
        return UserLogo.DIAMOND;

      case UserTier.EMERALD:
        return UserLogo.EMERALD;

      case UserTier.NETHERITE:
        return UserLogo.NETHERITE;

      case UserTier.STAFF:
        return UserLogo.AMETHYST;

      case UserTier.CORE:
        return UserLogo.RUBY;
    }
  }

  public static getTierName(user: User | null): string;
  public static getTierName(tier: UserTier): string;
  public static getTierName(userOrTier: User | null | UserTier): string {
    const tier =
      typeof userOrTier === "number" ? userOrTier : userOrTier?.tier ?? UserTier.NONE;

    return prettify(tiers.find(([, value]) => value === tier)?.[0] ?? "NONE");
  }

  private static isTier(user: User | null, tier: UserTier): boolean {
    const userTier = user?.tier ?? UserTier.NONE;
    return userTier >= tier;
  }
}

export * from "./theme.js";
export * from "./footer.js";
