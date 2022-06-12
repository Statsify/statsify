import { APIData, formatTime } from '@statsify/util';
import { Field } from '../../../metadata';

export const PARKOUR_MODES = ['overall'] as const;
export type ParkourModes = typeof PARKOUR_MODES;

const fieldOptions = { sort: 'ASC', formatter: formatTime };

export class Parkour {
  @Field({ leaderboard: { ...fieldOptions, fieldName: 'Arcade Lobby' } })
  public arcade: number;

  @Field({ leaderboard: { ...fieldOptions, fieldName: 'BedWars Lobby' } })
  public bedwars: number;

  @Field({ leaderboard: { ...fieldOptions, fieldName: 'BlitzSG Lobby' } })
  public blitzsg: number;

  @Field({ leaderboard: { ...fieldOptions, fieldName: 'Build Battle Lobby' } })
  public buildbattle: number;

  @Field({ leaderboard: { ...fieldOptions, fieldName: 'Classic Lobby' } })
  public classic: number;

  @Field({ leaderboard: { ...fieldOptions, fieldName: 'Cops and Crims Lobby' } })
  public copsandcrims: number;

  @Field({ leaderboard: { ...fieldOptions, fieldName: 'Duels Lobby' } })
  public duels: number;

  @Field({ leaderboard: { ...fieldOptions, fieldName: 'Housing Lobby' } })
  public housing: number;

  @Field({ leaderboard: { ...fieldOptions, fieldName: 'Main Lobby' } })
  public mainLobby: number;

  @Field({ leaderboard: { ...fieldOptions, fieldName: 'MegaWalls Lobby' } })
  public megawalls: number;

  @Field({ leaderboard: { ...fieldOptions, fieldName: 'Murder Mystery Lobby' } })
  public murdermystery: number;

  @Field({ leaderboard: { ...fieldOptions, fieldName: 'Prototype Lobby' } })
  public proto: number;

  @Field({ leaderboard: { ...fieldOptions, fieldName: 'SkyWars Lobby' } })
  public skywars: number;

  @Field({ leaderboard: { ...fieldOptions, fieldName: 'Smash Heroes Lobby' } })
  public smashheroes: number;

  @Field({ leaderboard: { ...fieldOptions, fieldName: 'TNT Games Lobby' } })
  public tntgames: number;

  @Field({ leaderboard: { ...fieldOptions, fieldName: 'Tournament Lobby' } })
  public tourney: number;

  @Field({ leaderboard: { ...fieldOptions, fieldName: 'UHC Lobby' } })
  public uhc: number;

  @Field({ leaderboard: { ...fieldOptions, fieldName: 'Warlords Lobby' } })
  public warlords: number;

  @Field({ leaderboard: { ...fieldOptions, fieldName: 'WoolWars Lobby' } })
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
