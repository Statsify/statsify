import { deepAdd } from '@statsify/math';
import { APIData } from '@statsify/util';
import { Field } from '../../../metadata';
import { QuakeMode } from './mode';

export class Quake {
  @Field()
  public overall: QuakeMode;

  @Field()
  public solo: QuakeMode;

  @Field()
  public teams: QuakeMode;

  @Field()
  public coins: number;

  @Field()
  public highestKillstreaks: number;

  @Field()
  public godLikes: number;

  public constructor(data: APIData, ap: APIData) {
    this.solo = new QuakeMode(data, '');
    this.teams = new QuakeMode(data, 'teams');

    this.overall = deepAdd(this.solo, this.teams);

    QuakeMode.applyRatios(this.overall);

    this.coins = data.coins;
    this.highestKillstreaks = data.highest_killstreak;
    this.godLikes = ap.quake_godlikes;
  }
}

export * from './mode';
