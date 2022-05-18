import { deepAdd } from '@statsify/math';
import { APIData } from '@statsify/util';
import { Field } from '../../../metadata';
import { ArenaBrawlMode } from './mode';

export class ArenaBrawl {
  @Field()
  public overall: ArenaBrawlMode;

  @Field()
  public solo: ArenaBrawlMode;

  @Field()
  public doubles: ArenaBrawlMode;

  @Field()
  public fours: ArenaBrawlMode;

  @Field()
  public magicalChests: number;

  @Field({ store: { default: 'none' } })
  public offensive: string;

  @Field({ store: { default: 'none' } })
  public utility: string;

  @Field({ store: { default: 'none' } })
  public ultimate: string;

  @Field({ store: { default: 'none' } })
  public support: string;

  @Field({ store: { default: 'none' } })
  public rune: string;

  @Field()
  public coins: number;

  @Field()
  public keys: number;

  public constructor(data: APIData) {
    this.solo = new ArenaBrawlMode(data, '1v1');
    this.doubles = new ArenaBrawlMode(data, '2v2');
    this.fours = new ArenaBrawlMode(data, '4v4');
    this.overall = deepAdd(this.solo, this.doubles, this.fours);

    ArenaBrawlMode.applyRatios(this.overall);

    this.offensive = data.offensive || 'none';
    this.utility = data.utility || 'none';
    this.ultimate = data.ultimate || 'none';
    this.support = data.support || 'none';
    this.rune = data.active_rune || 'none';
    this.keys = data.keys;
    this.magicalChests = data.magical_chest;
    this.coins = data.coins;
  }
}

export * from './mode';
