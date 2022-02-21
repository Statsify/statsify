import { APIData } from '@statsify/util';
import { Field } from '../../../decorators';

export class Parkour {
  @Field({ sort: 'ASC' })
  public arcade: number;

  @Field({ sort: 'ASC' })
  public bedwars: number;

  @Field({ sort: 'ASC' })
  public blitzsg: number;

  @Field({ sort: 'ASC' })
  public buildbattle: number;

  @Field({ sort: 'ASC' })
  public classic: number;

  @Field({ sort: 'ASC' })
  public copsandcrims: number;

  @Field({ sort: 'ASC' })
  public duels: number;

  @Field({ sort: 'ASC' })
  public housing: number;

  @Field({ sort: 'ASC' })
  public mainLobby: number;

  @Field({ sort: 'ASC' })
  public megawalls: number;

  @Field({ sort: 'ASC' })
  public murdermystery: number;

  @Field({ sort: 'ASC' })
  public proto: number;

  @Field({ sort: 'ASC' })
  public skywars: number;

  @Field({ sort: 'ASC' })
  public smashheroes: number;

  @Field({ sort: 'ASC' })
  public tntgames: number;

  @Field({ sort: 'ASC' })
  public tourney: number;
  @Field({ sort: 'ASC' })
  public uhc: number;

  @Field({ sort: 'ASC' })
  public warlords: number;

  public constructor(data: APIData) {
    const getTime = (key: string): number =>
      data[key]?.sort?.((a: any, b: any) => a.timeTook - b.timeTook)[0]?.timeTook;

    this.arcade = getTime('ArcadeGames');
    this.bedwars = getTime('Bedwars');
    this.blitzsg = getTime('BlitzLobby');
    this.buildbattle = getTime('BuildBattle');
    this.classic = getTime('Legacy');
    this.copsandcrims = getTime('CopsnCrims');
    this.duels = getTime('Duels');
    this.housing = getTime('Housing');
    this.mainLobby = getTime('mainLobby2017');
    this.megawalls = getTime('MegaWalls');
    this.murdermystery = getTime('MurderMystery');
    this.proto = getTime('Prototype');
    this.skywars = getTime('SkywarsAug2017');
    this.smashheroes = getTime('SuperSmash');
    this.tntgames = getTime('TNT');
    this.tourney = getTime('Tourney');
    this.uhc = getTime('uhc');
    this.warlords = getTime('Warlords');
  }
}
