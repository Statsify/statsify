import { APIData } from '@statsify/util';
import { Field } from '../decorators';

export class GuildRank {
  @Field()
  public name: string;

  @Field({ required: false })
  public tag?: string;

  @Field()
  public priority: number;

  @Field({ default: false })
  public default: boolean;

  public constructor(data: APIData) {
    this.name = data.name;
    this.default = data.default;
    this.tag = data.tag;
    this.priority = data.priority;
  }
}
