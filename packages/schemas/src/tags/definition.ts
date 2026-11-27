/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { s } from "#definition/s";

export const TagSchema = s.model("Tag", {
  name: s.string().index({ unique: true }),
  id: s.string().index({ unique: true }),
  content: s.string(),
  attachment: s.string().optional(),
});

export type Tag = s.infer<typeof TagSchema>;
