import type { APIData } from '@statsify/util';
import { Field } from '../decorators';
import { General } from './gamemodes/general';

export class PlayerStats {
  @Field()
  public general: General;
  public constructor(data: APIData = {}) {
    this.general = new General(data);
  }
}
