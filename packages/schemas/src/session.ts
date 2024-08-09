/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData } from "@statsify/util";
import { Field } from "#metadata";

export class Session {
  @Field({ mongo: { index: true } })
  public id: string;

  @Field()
  public uuid: string;

  @Field({ docs: { description: "The name of the session" } })
  public name: string;

  @Field()
  public player: APIData;

  @Field({
    leaderboard: { enabled: false },
    docs: { description: "The time the player's session stats last reset" },
  })
  public resetAt: number;

  public constructor(data: APIData) {
    this.player = data;
  }
}
