import { APIData } from '@statsify/util';
import { Field } from '../../../decorators';
import { BridgeDuels, MultiDuelsGameMode, SingleDuelsGameMode, UHCDuels } from './mode';

export class Duels {
  @Field()
  public overall: SingleDuelsGameMode;

  @Field()
  public blitzsg: SingleDuelsGameMode;

  @Field()
  public bow: SingleDuelsGameMode;

  @Field()
  public bowSpleef: SingleDuelsGameMode;

  @Field()
  public classic: SingleDuelsGameMode;

  @Field()
  public combo: SingleDuelsGameMode;

  @Field()
  public nodebuff: SingleDuelsGameMode;

  @Field()
  public sumo: SingleDuelsGameMode;

  @Field()
  public parkour: SingleDuelsGameMode;

  @Field()
  public boxing: SingleDuelsGameMode;

  @Field()
  public arena: SingleDuelsGameMode;

  @Field()
  public megawalls: MultiDuelsGameMode;

  @Field()
  public op: MultiDuelsGameMode;

  @Field()
  public skywars: MultiDuelsGameMode;

  @Field()
  public bridge: BridgeDuels;

  @Field()
  public uhc: UHCDuels;

  public constructor(data: APIData) {
    this.overall = new SingleDuelsGameMode(data, '', '');
    this.blitzsg = new SingleDuelsGameMode(data, 'Blitz', 'blitz_duel');
    this.bow = new SingleDuelsGameMode(data, 'Bow', 'bow_duel');
    this.bowSpleef = new SingleDuelsGameMode(data, 'TNT', 'bowspleef_duel');
    this.classic = new SingleDuelsGameMode(data, 'Classic', 'classic_duel');
    this.combo = new SingleDuelsGameMode(data, 'Combo', 'combo_duel');
    this.nodebuff = new SingleDuelsGameMode(data, 'NoDebuff', 'potion_duel');
    this.sumo = new SingleDuelsGameMode(data, 'Sumo', 'sumo_duel');
    this.parkour = new SingleDuelsGameMode(data, 'Parkour', 'parkour_eight');
    this.boxing = new SingleDuelsGameMode(data, 'Boxing', 'boxing_duel');

    this.arena = new SingleDuelsGameMode(data, 'Arena', 'duel_arena');

    this.megawalls = new MultiDuelsGameMode(data, 'MW', 'mw', 'mega_walls');
    this.skywars = new MultiDuelsGameMode(data, 'SkyWars', 'sw', 'skywars');
    this.op = new MultiDuelsGameMode(data, 'OP', 'op', 'op');

    this.bridge = new BridgeDuels(data);
    this.uhc = new UHCDuels(data);
  }
}
