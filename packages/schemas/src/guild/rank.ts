import { APIData } from '@statsify/util';
import { Field } from '../metadata';

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
