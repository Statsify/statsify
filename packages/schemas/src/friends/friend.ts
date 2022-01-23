import { APIData } from '@statsify/util';
import { Field } from '../decorators';

export class Friend {
  @Field()
  public uuid: string;

  @Field({ required: false })
  public displayName?: string;

  @Field()
  public createdAt: number;

  @Field()
  public expiresAt: number;

  public constructor(uuid: string, data: APIData) {
    this.uuid = data.uuidSender === uuid ? data.uuidReceiver : data.uuidSender;
    this.createdAt = data.started;
  }
}
