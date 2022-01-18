import { APIData } from '@statsify/util';
import { Field } from '../../../decorators';

export class Parkour {
  @Field({ sort: 'ASC' })
  public bedwars: number;

  @Field({ sort: 'ASC' })
  public skywars: number;

  @Field({ sort: 'ASC' })
  public murdermystery: number;

  @Field({ sort: 'ASC' })
  public copsandcrims: number;

  @Field({ sort: 'ASC' })
  public bltizsg: number;

  @Field({ sort: 'ASC' })
  public housing: number;

  @Field({ sort: 'ASC' })
  public arcade: number;

  @Field({ sort: 'ASC' })
  public buildbattle: number;

  @Field({ sort: 'ASC' })
  public duels: number;

  @Field({ sort: 'ASC' })
  public proto: number;

  @Field({ sort: 'ASC' })
  public uhc: number;

  @Field({ sort: 'ASC' })
  public tntgames: number;

  @Field({ sort: 'ASC' })
  public classic: number;

  @Field({ sort: 'ASC' })
  public megawalls: number;

  @Field({ sort: 'ASC' })
  public smashheroes: number;

  @Field({ sort: 'ASC' })
  public warlords: number;

  @Field({ sort: 'ASC' })
  public mainLobby: number;

  @Field({ sort: 'ASC' })
  public tourney: number;
  public constructor(data: APIData) {
    const getTime = (key: string): number =>
      data[key].sort((a: any, b: any) => a.timeTook - b.timeTook)[0]?.timeTook;

    this.bedwars = getTime('Bedwars');
    this.skywars = getTime('SkywarsAug2017');
    this.murdermystery = getTime('MurderMystery');
    this.copsandcrims = getTime('CopsnCrims');
    this.bltizsg = getTime('BlitzLobby');
    this.housing = getTime('Housing');
    this.arcade = getTime('ArcadeGames');
    this.buildbattle = getTime('BuildBattle');
    this.duels = getTime('Duels');
    this.proto = getTime('Prototype');
    this.uhc = getTime('uhc');
    this.tntgames = getTime('TNT');
    this.classic = getTime('Legacy');
    this.megawalls = getTime('MegaWalls');
    this.smashheroes = getTime('SuperSmash');
    this.warlords = getTime('Warlords');
    this.mainLobby = getTime('mainLobby2017');
    this.tourney = getTime('Tourney');
  }
}
