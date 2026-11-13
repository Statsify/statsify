/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { s } from "#definition/s";
import type { UserBoxes, UserFont, UserPalette } from "./theme.js";

const UserThemeSchema = s.object({
  font: s.string<UserFont>().optional(),
  palette: s.string<UserPalette>().optional(),
  boxes: s.string<UserBoxes>().optional(),
});

const UserFooterSchema = s.object({
  message: s.string().optional().nullable(),
  icon: s.number().optional(),
});

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
