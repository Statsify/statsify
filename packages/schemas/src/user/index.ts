import { Field } from '../decorators';

export class User {
  @Field({ index: true, unique: true })
  public id: string;

  @Field({ required: false, sparse: true })
  public uuid?: string;

  @Field()
  public credits?: number;

  @Field()
  public locale: string;
}
