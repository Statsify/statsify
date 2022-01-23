import { APIData } from '@statsify/util';
import { Field } from '../decorators';

export class WatchdogMode {
  @Field()
  public bans: number;

  @Field()
  public lastMinute: number;

  @Field()
  public lastDay: number;

  public constructor(data: APIData, mode: string) {
    this.bans = data[`${mode}_total`];
    this.lastMinute = data[`${mode}_lastMinute`];
    this.lastDay = data[`${mode}_rollingDaily`];
  }
}
