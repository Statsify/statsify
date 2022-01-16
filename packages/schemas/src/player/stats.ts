import type { APIData } from '@statsify/util';
import { Field } from '../decorators';
import { BedWars } from './gamemodes/bedwars';
import { General } from './gamemodes/general';
import { SkyWars } from './gamemodes/skywars';

export class PlayerStats {
  @Field()
  public bedwars: BedWars;

  @Field()
  public general: General;

  @Field()
  public skywars: SkyWars;
  public constructor(data: APIData = {}) {
    this.bedwars = new BedWars(data?.stats?.Bedwars ?? {});
    this.general = new General(data);
    this.skywars = new SkyWars(data?.stats?.SkyWars ?? {});
  }
}
