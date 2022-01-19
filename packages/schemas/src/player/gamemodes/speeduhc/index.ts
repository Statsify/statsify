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

  @Field({ default: 'none' })
  public activeMastery: string;

  @Field({ getter: (target: SpeedUHC) => getLevelIndex(target.score) + 1 })
  public level: number;

  @Field({ getter: (target: SpeedUHC) => titleScores[getLevelIndex(target.score)].title })
  public title: string;

  public constructor(data: APIData) {
    this.coins = data.coins;
    this.score = data.score;
    this.activeMastery = data.activeMasterPerk;

    this.overall = new SpeedUHCMode(data, '');
    this.solo = new SpeedUHCMode(data, 'solo');
    this.teams = new SpeedUHCMode(data, 'team');
  }
}
