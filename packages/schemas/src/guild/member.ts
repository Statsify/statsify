import { APIData } from '@statsify/util';
import { Field } from '../decorators';

export class GuildMember {
  @Field()
  public rank: string;

  @Field()
  public uuid: string;

  @Field()
  public joinTime: number;

  @Field()
  public questParticipation: number;

  @Field()
  public expHistory: number[];

  public constructor(data: APIData) {
    this.rank = data.rank;
    this.uuid = data.uuid;
    this.joinTime = data.joined;
    this.questParticipation = data.questParticipation;

    this.expHistory = Object.entries(data.expHistory)
      .sort()
      .map((d) => Number(d[1]));
  }
}
