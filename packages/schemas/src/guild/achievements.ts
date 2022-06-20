/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData } from '@statsify/util';
import { Field } from '../metadata';

/**
 * Better names for the guild achievements
 */
export class GuildAchievements {
  @Field({ leaderboard: { enabled: false } })
  public maxOnlinePlayerCount: number;

  @Field()
  public dailyGuildWins: number;

  @Field()
  public dailyGexp: number;

  public constructor(data: APIData) {
    this.maxOnlinePlayerCount = data.ONLINE_PLAYERS;
    this.dailyGuildWins = data.WINNERS;
    this.dailyGexp = data.EXPERIENCE_KINGS;
  }
}
