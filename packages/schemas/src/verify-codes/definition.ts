/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { s } from "#definition/s";

export const VerifyCodeSchema = s.model("VerifyCode", {
  uuid: s.string().index({ unique: true }),
  code: s.string().index({ unique: true }),
  expireAt: s.date().defaultNow().index({ expires: 300 }),
});

export type VerifyCode = s.infer<typeof VerifyCodeSchema>;

export function verifyCode(uuid: string, code: string): s.input<typeof VerifyCodeSchema> {
  return { uuid, code };
}
