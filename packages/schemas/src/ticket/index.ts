/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Field } from "../metadata";

export class Ticket {
  @Field({ mongo: { unique: true } })
  public channel: string;

  @Field({ mongo: { unique: true, index: true } })
  public owner: string;

  @Field()
  public username: string;
}
