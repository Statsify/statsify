import type { APIData } from '@statsify/util';
import { Field } from '../decorators';
import { BedWars } from './gamemodes/bedwars';
import { General } from './gamemodes/general';

export class PlayerStats {
  @Field()
  public bedwars: BedWars;

  @Field()
  public general: General;
  public constructor(data: APIData = {}) {
    this.bedwars = new BedWars(data?.stats?.Bedwars ?? {});
    this.general = new General(data);
  }
}
