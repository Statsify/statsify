import { APIData } from '@statsify/util';
import { Field } from '../metadata';
import { Friend } from './friend';

export class Friends {
  @Field({ mongo: { index: true, unique: true }, store: { required: true } })
  public uuid: string;

  @Field({ type: () => [Friend] })
  public friends: Friend[];

  @Field()
  public length: number;

  @Field({ store: { store: false } })
  public displayName: string;

  public constructor(data: APIData) {
    this.uuid = data.uuid;
    this.friends = (data?.records ?? []).map((friend: APIData) => new Friend(this.uuid, friend));
    this.length = this.friends.length;
  }
}
