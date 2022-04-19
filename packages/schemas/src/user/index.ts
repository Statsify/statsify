import { Field } from '../metadata';

export class User {
  @Field({ mongo: { index: true, unique: true } })
  public id: string;

  @Field({ mongo: { sparse: true }, store: { required: false } })
  public uuid?: string;

  @Field()
  public credits?: number;

  @Field()
  public locale: string;
}
