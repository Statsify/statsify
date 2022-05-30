import { APIData } from '@statsify/util';
import { Field } from '../../../metadata';
import { SmashHeroesMode } from './mode';

export const SMASH_HEROES_MODES = ['overall', 'solo', 'teams'] as const;
export type SmashHeroesModes = typeof SMASH_HEROES_MODES;

export class SmashHeroes {
  @Field()
  public overall: SmashHeroesMode;

  @Field()
  public solo: SmashHeroesMode;

  @Field()
  public doubles: SmashHeroesMode;

  @Field()
  public teams: SmashHeroesMode;

  @Field()
  public coins: number;

  @Field({ leaderboard: { enabled: false } })
  public level: number;

  @Field()
  public levelFormatted: string;

  @Field({ store: { default: 'none' } })
  public kit: string;

  public constructor(data: APIData) {
    this.overall = new SmashHeroesMode(data, '');
    this.solo = new SmashHeroesMode(data, 'normal');
    this.doubles = new SmashHeroesMode(data, '2v2');
    this.teams = new SmashHeroesMode(data, 'teams');

    this.coins = data.coins;
    this.level = data.smashLevel;
    this.kit = data.active_class ?? 'none';
    this.levelFormatted = `§b${this.level}§6✶`;
  }
}

export * from './mode';
