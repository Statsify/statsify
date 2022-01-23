import { APIData } from '@statsify/util';
import { Field } from '../decorators';
import { Friend } from './friend';

export class Friends {
  @Field({ index: true, unique: true, required: true })
  public uuid: string;

  @Field(() => [Friend])
  public friends: Friend[];

  @Field()
  public length: number;

  @Field({ store: false })
  public displayName: string;

  public constructor(data: APIData) {
    this.uuid = data.uuid;
    this.friends = (data?.records ?? []).map((friend: APIData) => new Friend(this.uuid, friend));
    this.length = this.friends.length;
  }
}
