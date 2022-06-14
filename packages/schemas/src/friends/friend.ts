import { APIData } from '@statsify/util';
import { Field } from '../metadata';

export class Friend {
  @Field()
  public uuid: string;

  @Field({ store: { required: false } })
  public displayName?: string;

  @Field({ leaderboard: { enabled: false } })
  public createdAt: number;

  public constructor(uuid: string, data: APIData) {
    this.uuid = uuid;
    this.displayName = data.display;
    this.createdAt = data.time;
  }
}
