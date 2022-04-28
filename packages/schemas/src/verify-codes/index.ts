import { Field } from '../metadata';

export class VerifyCode {
  @Field({ mongo: { unique: true } })
  public uuid: string;

  @Field({ mongo: { unique: true } })
  public code: string;

  @Field({ mongo: { expires: 300, default: Date.now } })
  public expireAt: Date;

  public constructor(uuid: string, code: string) {
    this.uuid = uuid;
    this.code = code;
  }
}
