/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData } from "@statsify/util";
import { Field } from "../metadata";

export class Summer {
  @Field({ leaderboard: { enabled: false } })
  public exp: number;

  @Field({ leaderboard: { enabled: false }, store: { default: 1 } })
  public level: number;

  public constructor(data: APIData = {}) {
    this.exp = data["2022"]?.levelling?.experience ?? 0;
    this.level = Math.min(100, Math.floor(this.exp / 25_000) + 1);
  }
}

export class PlayerEvents {
  @Field()
  public summer: Summer;

  @Field({ leaderboard: { enabled: false } })
  public silver: number;

  public constructor(data: APIData = {}) {
    this.summer = new Summer(data.summer);
    this.silver = data.silver;
  }
}
