import { APIData } from '@statsify/util';
import { Field } from '../../../decorators';
import { SmashHeroesMode } from './mode';

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

  @Field({ leaderboard: false })
  public level: number;

  @Field({ default: 'none' })
  public kit: string;

  public constructor(data: APIData) {
    this.overall = new SmashHeroesMode(data, '');
    this.solo = new SmashHeroesMode(data, 'normal');
    this.doubles = new SmashHeroesMode(data, '2v2');
    this.teams = new SmashHeroesMode(data, 'teams');

    this.coins = data.coins;
    this.level = data.smashLevel;
    this.kit = data.active_class ?? 'none';
  }
}
