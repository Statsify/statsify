/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Field } from "../metadata";

export class VerifyCode {
  @Field({ mongo: { unique: true } })
  public uuid: string;

  @Field({ mongo: { unique: true } })
  public code: string;

  @Field({ mongo: { expires: 300, default: Date.now } })
  public expireAt: Date;

  public constructor(uuid: string, code: string) {
    this.uuid = uuid;
    this.code = code;
  }
}
