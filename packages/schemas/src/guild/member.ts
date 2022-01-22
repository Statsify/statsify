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

  @Field({ leaderboard: false })
  public expiresAt: number;

  public constructor(data: APIData) {
    this.rank = data.rank;
    this.uuid = data.uuid;
    this.joinTime = data.joined;
    this.questParticipation = data.questParticipation;

    this.expHistory = Object.entries(data.expHistory)
      .sort()
      .map((d) => d[1] as number);
  }
}
