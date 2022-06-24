/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Field } from "../metadata";
import { RecentGame } from "./recentgame";

export class RecentGames {
  @Field()
  public uuid: string;

  @Field()
  public displayName: string;

  @Field()
  public prefixName: string;

  @Field()
  public games: RecentGame[];
}

export * from "./recentgame";
