/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData } from '@statsify/util';
import { Field } from '../metadata';

export class GuildMember {
  @Field()
  public rank: string;

  @Field()
  public uuid: string;

  @Field()
  public displayName?: string;

  @Field()
  public username?: string;

  @Field()
  public joinTime: number;

  @Field()
  public questParticipation: number;

  @Field({ type: () => [Number] })
  public expHistory: number[];

  @Field({ type: () => [String] })
  public expHistoryDays: string[];

  @Field()
  public daily: number;

  @Field()
  public weekly: number;

  @Field()
  public monthly: number;

  @Field({ leaderboard: { enabled: false } })
  public expiresAt: number;

  @Field()
  public guildId?: string;

  public constructor(data: APIData) {
    this.rank = data.rank;
    this.uuid = data.uuid;
    this.joinTime = data.joined;
    this.questParticipation = data.questParticipation ?? 0;

    this.expHistory = [];
    this.expHistoryDays = [];

    this.daily = 0;
    this.weekly = 0;
    this.monthly = 0;

    Object.entries(data.expHistory as Record<string, number>).forEach(([day, exp], index) => {
      this.expHistory[index] = exp;
      this.expHistoryDays[index] = day;
      if (index === 0) this.daily = exp;
      this.weekly += exp;
    });
  }
}
