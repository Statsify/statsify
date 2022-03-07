import { Field } from '../decorators';
import { IOneTimeAchievement } from './iachievement';

export class OneTimeAchievement {
  @Field()
  public name: string;

  @Field()
  public description: string;

  @Field()
  public points: number;

  @Field()
  public percentUnlocked: number;

  @Field()
  public legacy: boolean;

  @Field()
  public unlocked: boolean;

  public constructor(ach: IOneTimeAchievement, unlocked: boolean) {
    this.name = ach.name;
    this.description = ach.description;
    this.points = ach.points;
    this.percentUnlocked = Math.round(ach.gamePercentUnlocked);
    this.legacy = ach.legacy ?? false;
    this.unlocked = unlocked;
  }
}
