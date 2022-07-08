/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Field } from "../metadata";

export class Commands {
  @Field({ mongo: { unique: true, index: true } })
  public name: string;

  @Field({ type: () => Object })
  public usage: Record<string, number>;
}
