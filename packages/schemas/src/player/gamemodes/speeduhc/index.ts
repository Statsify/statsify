import { APIData } from '@statsify/util';
import { Field } from '../../../decorators';
import { SpeedUHCMode } from './mode';
import { getLevelIndex, titleScores } from './util';

export class SpeedUHC {
  @Field()
  public overall: SpeedUHCMode;

  @Field()
  public solo: SpeedUHCMode;

  @Field()
  public teams: SpeedUHCMode;

  @Field()
  public coins: number;

  @Field()
  public score: number;

  @Field({ leaderboard: false })
  public level: number;

  @Field()
  public title: string;

  public constructor(data: APIData) {
    this.coins = data.coins;
    this.score = data.score ?? 0;

    const index = getLevelIndex(this.score);
    this.level = index + 1;
    this.title = titleScores[index].title;

    this.overall = new SpeedUHCMode(data, '');
    this.solo = new SpeedUHCMode(data, 'solo');
    this.teams = new SpeedUHCMode(data, 'team');
  }
}
