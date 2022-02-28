import { APIData } from '@statsify/util';
import { Field } from '../decorators';

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

  @Field(() => [Number])
  public expHistory: number[];

  @Field(() => [String])
  public expHistoryDays: string[];

  @Field()
  public weekly: number;

  @Field()
  public monthly: number;

  @Field({ leaderboard: false })
  public expiresAt: number;

  public constructor(data: APIData) {
    this.rank = data.rank;
    this.uuid = data.uuid;
    this.joinTime = data.joined;
    this.questParticipation = data.questParticipation;

    this.expHistory = [];
    this.expHistoryDays = [];

    Object.entries(data.expHistory as Record<string, number>).forEach(([day, exp], index) => {
      this.expHistory[index] = exp;
      this.expHistoryDays[index] = day;
    });
  }
}
