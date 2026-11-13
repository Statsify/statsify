/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { prettify } from "@statsify/util";
import { s } from "#definition/s";

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
  RUBY = 423
}

export enum UserFont {
  DEFAULT = "default",
  HD = "hd",
  FPACK = "fpack"
}

export enum UserPalette {
  DEFAULT = "default",
  LIGHT = "light",
  DARK = "dark",
  NO_BACKGROUNDS = "no-backgrounds"
}

export enum UserBoxes {
  DEFAULT = "default",
  HD = "hd",
  UHD = "uhd"
}

const UserThemeSchema = s.object({
  font: s.string<UserFont>().optional(),
  palette: s.string<UserPalette>().optional(),
  boxes: s.string<UserBoxes>().optional(),
});

export type UserTheme = s.infer<typeof UserThemeSchema>;

const UserFooterSchema = s.object({
  message: s.string().optional().nullable(),
  icon: s.number().optional(),
});

export type UserFooter = s.infer<typeof UserFooterSchema>;

export const UserSchema = s.model("User", {
  id: s.string().index({ unique: true }),
  uuid: s.string().optional().index({ sparse: true }),
  verifiedAt: s.number().optional(),
  unverifiedAt: s.number().optional(),
  serverMember: s.boolean().optional(),
  serverBooster: s.boolean().optional(),
  patreon: s.boolean().optional(),
  tier: s.number().optional(),
  hasBadge: s.boolean().optional(),
  extrudedSkins: s.boolean().optional(),
  theme: UserThemeSchema.optional(),
  footer: UserFooterSchema.optional(),
  locale: s.string().optional().nullable(),
});

export type User = s.infer<typeof UserSchema>;

const TIER_LOGOS: Record<UserTier, UserLogo> = {
  [UserTier.NONE]: UserLogo.DEFAULT,
  [UserTier.IRON]: UserLogo.IRON,
  [UserTier.GOLD]: UserLogo.GOLD,
  [UserTier.DIAMOND]: UserLogo.DIAMOND,
  [UserTier.EMERALD]: UserLogo.EMERALD,
  [UserTier.NETHERITE]: UserLogo.NETHERITE,
  [UserTier.STAFF]: UserLogo.AMETHYST,
  [UserTier.CORE]: UserLogo.RUBY,
};

export const hasTier = (user: User | null, tier: UserTier) => (user?.tier ?? UserTier.NONE) >= tier;

export const hasExtrudedSkins = (user: User | null) =>
  hasTier(user, UserTier.GOLD) && (user?.extrudedSkins ?? false);

export const getTierLogo = (tier: UserTier) => TIER_LOGOS[tier];

/** The footer icon the user picked, if their tier unlocks it, or else their tier's own */
export function getUserLogo(user: User | null): UserLogo {
  if (user?.footer?.icon && (user.tier ?? 0) >= user.footer.icon) return user.footer.icon;
  return getTierLogo(user?.tier || UserTier.NONE);
}

export function getTierName(userOrTier: User | null | UserTier): string {
  const tier = typeof userOrTier === "number" ? userOrTier : userOrTier?.tier ?? UserTier.NONE;
  return prettify(UserTier[tier] ?? "NONE");
}
