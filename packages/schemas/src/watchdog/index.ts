import { deepAdd } from '@statsify/math';
import { APIData } from '@statsify/util';
import { Field } from '../decorators';
import { WatchdogMode } from './mode';

export class Watchdog {
  @Field()
  public overall: WatchdogMode;

  @Field()
  public watchdog: WatchdogMode;

  @Field()
  public staff: WatchdogMode;

  public constructor(data: APIData) {
    this.watchdog = new WatchdogMode(data, 'watchdog');
    this.staff = new WatchdogMode(data, 'staff');
    this.overall = deepAdd(WatchdogMode, this.watchdog, this.staff);
  }
}
