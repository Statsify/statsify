import { APIData } from '@statsify/util';
import { Field } from '../decorators';

export class Guild {
  @Field()
  public id: string;

  @Field()
  public name: string;

  @Field()
  public nameToLower: string;

  public constructor(data: APIData) {
    this.id = data._id;
    this.name = data.name;
    this.nameToLower = this.name.toLowerCase();
  }
}
