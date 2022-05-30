import { APIData } from '@statsify/util';
import { Field } from '../../../metadata';

export const PARKOUR_MODES = ['overall'] as const;
export type ParkourModes = typeof PARKOUR_MODES;

export class Parkour {
  @Field({ leaderboard: { sort: 'ASC' } })
  public arcade: number;

  @Field({ leaderboard: { sort: 'ASC' } })
  public bedwars: number;

  @Field({ leaderboard: { sort: 'ASC' } })
  public blitzsg: number;

  @Field({ leaderboard: { sort: 'ASC' } })
  public buildbattle: number;

  @Field({ leaderboard: { sort: 'ASC' } })
  public classic: number;

  @Field({ leaderboard: { sort: 'ASC' } })
  public copsandcrims: number;

  @Field({ leaderboard: { sort: 'ASC' } })
  public duels: number;

  @Field({ leaderboard: { sort: 'ASC' } })
  public housing: number;

  @Field({ leaderboard: { sort: 'ASC' } })
  public mainLobby: number;

  @Field({ leaderboard: { sort: 'ASC' } })
  public megawalls: number;

  @Field({ leaderboard: { sort: 'ASC' } })
  public murdermystery: number;

  @Field({ leaderboard: { sort: 'ASC' } })
  public proto: number;

  @Field({ leaderboard: { sort: 'ASC' } })
  public skywars: number;

  @Field({ leaderboard: { sort: 'ASC' } })
  public smashheroes: number;

  @Field({ leaderboard: { sort: 'ASC' } })
  public tntgames: number;

  @Field({ leaderboard: { sort: 'ASC' } })
  public tourney: number;

  @Field({ leaderboard: { sort: 'ASC' } })
  public uhc: number;

  @Field({ leaderboard: { sort: 'ASC' } })
  public warlords: number;

  @Field({ leaderboard: { sort: 'ASC' } })
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
