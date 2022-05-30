import { APIData } from '@statsify/util';
import { Field } from '../../../metadata';
import { BridgeDuels, MultiDuelsGameMode, SingleDuelsGameMode, UHCDuels } from './mode';

export const DUELS_MODES = [
  'overall',
  'arena',
  'blitzsg',
  'bow',
  'bowSpleef',
  'boxing',
  'bridge',
  'classic',
  'combo',
  'megawalls',
  'nodebuff',
  'op',
  'parkour',
  'skywars',
  'sumo',
  'uhc',
] as const;
export type DuelsModes = typeof DUELS_MODES;

export class Duels {
  @Field({ store: { default: 300 }, leaderboard: { enabled: false } })
  public pingRange: number;

  @Field()
  public coins: number;

  @Field()
  public lootChests: number;

  @Field()
  public overall: SingleDuelsGameMode;

  @Field()
  public arena: SingleDuelsGameMode;

  @Field()
  public blitzsg: SingleDuelsGameMode;

  @Field()
  public bow: SingleDuelsGameMode;

  @Field()
  public bowSpleef: SingleDuelsGameMode;

  @Field()
  public boxing: SingleDuelsGameMode;

  @Field()
  public bridge: BridgeDuels;

  @Field()
  public classic: SingleDuelsGameMode;

  @Field()
  public combo: SingleDuelsGameMode;

  @Field()
  public megawalls: MultiDuelsGameMode;

  @Field()
  public nodebuff: SingleDuelsGameMode;

  @Field()
  public op: MultiDuelsGameMode;

  @Field()
  public parkour: SingleDuelsGameMode;

  @Field()
  public skywars: MultiDuelsGameMode;

  @Field()
  public sumo: SingleDuelsGameMode;

  @Field()
  public uhc: UHCDuels;

  public constructor(data: APIData) {
    this.overall = new SingleDuelsGameMode(data, '', '');
    this.arena = new SingleDuelsGameMode(data, 'Arena', 'duel_arena');

    this.blitzsg = new SingleDuelsGameMode(data, 'Blitz', 'blitz_duel');
    this.bow = new SingleDuelsGameMode(data, 'Bow', 'bow_duel');
    this.bowSpleef = new SingleDuelsGameMode(data, 'TNT', 'bowspleef_duel');
    this.boxing = new SingleDuelsGameMode(data, 'Boxing', 'boxing_duel');

    this.bridge = new BridgeDuels(data);
    this.classic = new SingleDuelsGameMode(data, 'Classic', 'classic_duel');
    this.combo = new SingleDuelsGameMode(data, 'Combo', 'combo_duel');
    this.megawalls = new MultiDuelsGameMode(data, 'MW', 'mw', 'mega_walls');
    this.nodebuff = new SingleDuelsGameMode(data, 'NoDebuff', 'potion_duel');
    this.op = new MultiDuelsGameMode(data, 'OP', 'op', 'op');

    this.parkour = new SingleDuelsGameMode(data, 'Parkour', 'parkour_eight');
    this.skywars = new MultiDuelsGameMode(data, 'SkyWars', 'sw', 'skywars');
    this.sumo = new SingleDuelsGameMode(data, 'Sumo', 'sumo_duel');
    this.uhc = new UHCDuels(data);

    this.pingRange = data?.pingPreference ?? 300;
    this.coins = data.coins;
    this.lootChests = data.duels_chests;
  }
}

export * from './mode';
