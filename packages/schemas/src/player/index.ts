import { Field } from '../decorators';

export class Player {
  @Field()
  public uuid: string;

  @Field()
  public username: string;
}
