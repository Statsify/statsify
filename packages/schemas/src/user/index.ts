import { Field } from '../metadata';

export class User {
  @Field({ mongo: { index: true, unique: true } })
  public id: string;

  @Field({ mongo: { sparse: true }, store: { required: false } })
  public uuid?: string;

  @Field({ store: { required: false } })
  public verifiedAt?: number;

  @Field({ store: { required: false } })
  public unverifiedAt?: number;

  @Field({ store: { required: false } })
  public credits?: number;

  @Field({ store: { required: false } })
  public locale?: string;

  @Field({ store: { required: false } })
  public serverMember?: boolean;

  @Field({ store: { required: false } })
  public premium?: boolean;
}
