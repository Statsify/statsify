import { APIData, formatTime } from '@statsify/util';
import { Field } from '../../../metadata';

export const PARKOUR_MODES = ['overall'] as const;
export type ParkourModes = typeof PARKOUR_MODES;

const fieldOptions = { leaderboard: { sort: 'ASC', formatter: formatTime } };

export class Parkour {
  @Field(fieldOptions)
  public arcade: number;

  @Field(fieldOptions)
  public bedwars: number;

  @Field(fieldOptions)
  public blitzsg: number;

  @Field(fieldOptions)
  public buildbattle: number;

  @Field(fieldOptions)
  public classic: number;

  @Field(fieldOptions)
  public copsandcrims: number;

  @Field(fieldOptions)
  public duels: number;

  @Field(fieldOptions)
  public housing: number;

  @Field(fieldOptions)
  public mainLobby: number;

  @Field(fieldOptions)
  public megawalls: number;

  @Field(fieldOptions)
  public murdermystery: number;

  @Field(fieldOptions)
  public proto: number;

  @Field(fieldOptions)
  public skywars: number;

  @Field(fieldOptions)
  public smashheroes: number;

  @Field(fieldOptions)
  public tntgames: number;

  @Field(fieldOptions)
  public tourney: number;

  @Field(fieldOptions)
  public uhc: number;

  @Field(fieldOptions)
  public warlords: number;

  @Field(fieldOptions)
  public woolwars: number;

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
    this.woolwars = getTime('WoolGames');
  }
}
