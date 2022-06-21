/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData } from "@statsify/util";
import { Field } from "../metadata";

export class GuildRank {
  @Field()
  public name: string;

  @Field({ store: { required: false } })
  public tag?: string;

  @Field({ leaderboard: { enabled: false } })
  public priority: number;

  @Field({ store: { default: false } })
  public default: boolean;

  public constructor(data: APIData) {
    this.name = data.name;
    this.default = data.default;
    this.tag = data.tag;
    this.priority = data.priority;
  }
}
