import { deepAdd } from '@statsify/math';
import { APIData } from '@statsify/util';
import { Field } from '../../../metadata';
import { QuakeMode } from './mode';

const indexes = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];

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

  @Field({ type: () => [String] })
  public trigger: string[];

  public constructor(data: APIData, ap: APIData) {
    this.solo = new QuakeMode(data, '');
    this.teams = new QuakeMode(data, 'teams');

    this.overall = deepAdd(this.solo, this.teams);

    QuakeMode.applyRatios(this.overall);

    this.coins = data.coins;
    this.highestKillstreaks = data.highest_killstreak;
    this.godLikes = ap.quake_godlikes;

    // NINE_POINT_ZERO becomes 9.0
    // ALWAYS in seconds
    this.trigger = data.trigger
      ?.toLowerCase()
      .split('_')
      // Converts string numbers to actually number && remove the 'point'
      .map((trigger: string) => (indexes.indexOf(trigger) > -1 ? indexes.indexOf(trigger) : '.'))
      .join('');
  }
}

export * from './mode';
