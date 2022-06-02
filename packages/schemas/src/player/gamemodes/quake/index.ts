import { deepAdd } from '@statsify/math';
import { APIData } from '@statsify/util';
import { Field } from '../../../metadata';
import { QuakeMode } from './mode';

export const QUAKE_MODES = ['overall', 'solo', 'teams'] as const;
export type QuakeModes = typeof QUAKE_MODES;

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
  public highestKillstreak: number;

  @Field()
  public godlikes: number;

  @Field({ leaderboard: { enabled: false }, store: { default: 1.3 } })
  public trigger: number;

  public constructor(data: APIData, ap: APIData) {
    this.solo = new QuakeMode(data, '');
    this.teams = new QuakeMode(data, 'teams');

    this.overall = deepAdd(this.solo, this.teams);

    QuakeMode.applyRatios(this.overall);

    this.coins = data.coins;
    this.highestKillstreak = data.highest_killstreak;
    this.godlikes = ap.quake_godlikes;

    // NINE_POINT_ZERO becomes 9.0
    // ALWAYS in seconds
    this.trigger =
      +data.trigger
        ?.toLowerCase()
        .split('_')
        // Converts string numbers to actually number && remove the 'point'
        .map((trigger: string) => (indexes.indexOf(trigger) > -1 ? indexes.indexOf(trigger) : '.'))
        .join('') || 1.3;
  }
}

export * from './mode';
