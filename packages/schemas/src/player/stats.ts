import type { APIData } from '@statsify/util';
import { Field } from '../decorators';
import { Arcade } from './gamemodes/arcade';
import { BedWars } from './gamemodes/bedwars';
import { BlitzSG } from './gamemodes/blitzsg';
import { General } from './gamemodes/general';
import { SkyWars } from './gamemodes/skywars';

export class PlayerStats {
  @Field()
  public arcade: Arcade;

  @Field()
  public bedwars: BedWars;

  @Field()
  public blitzsg: BlitzSG;

  @Field()
  public general: General;

  @Field()
  public skywars: SkyWars;
  public constructor(data: APIData = {}) {
    this.arcade = new Arcade(data?.stats?.Arcade ?? {}, data?.achievements ?? {});
    this.bedwars = new BedWars(data?.stats?.Bedwars ?? {});
    this.blitzsg = new BlitzSG(data?.stats?.HungerGames ?? {});
    this.general = new General(data);
    this.skywars = new SkyWars(data?.stats?.SkyWars ?? {});
  }
}
