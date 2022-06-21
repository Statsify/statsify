/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData } from "@statsify/util";
import { Field } from "../metadata";

export class Friend {
  @Field()
  public uuid: string;

  @Field({ store: { required: false } })
  public displayName?: string;

  @Field({ leaderboard: { enabled: false } })
  public createdAt: number;

  public constructor(uuid: string, data: APIData) {
    this.uuid = uuid;
    this.displayName = data.display;
    this.createdAt = data.time;
  }
}
