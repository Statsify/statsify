import { ratio } from '@statsify/math';
import { Field } from './metadata';
export class Progression {
  @Field({ leaderboard: { enabled: false } })
  public current: number;

  @Field({ leaderboard: { enabled: false } })
  public max?: number;

  @Field({ leaderboard: { enabled: false } })
  public percent: number;

  public constructor(current: number, max: number) {
    this.current = current;

    if (max) {
      this.max = max;
      this.percent = ratio(current, max);
    } else {
      this.percent = 1;
    }
  }
}
