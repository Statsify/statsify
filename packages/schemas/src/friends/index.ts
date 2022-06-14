import { APIData } from '@statsify/util';
import { Field } from '../metadata';
import { Friend } from './friend';

export class Friends {
  @Field({ type: () => [Friend] })
  public friends: Friend[];

  @Field({ mongo: { index: true, unique: true } })
  public uuid: string;

  @Field()
  public displayName: string;

  @Field({ leaderboard: { enabled: false } })
  public expiresAt: number;

  @Field({ store: { store: false } })
  public cached?: boolean;

  public constructor(data: APIData = {}) {
    const records = Object.entries(data);
    this.friends = records.map(([uuid, friend]) => new Friend(uuid, friend));
  }
}
