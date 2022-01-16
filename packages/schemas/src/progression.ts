import { Field } from './decorators';

export class Progression {
  @Field({ leaderboard: false })
  public current: number;

  @Field({ leaderboard: false, required: false })
  public max?: number;

  @Field({ leaderboard: false })
  public percent: number;

  public constructor(current: number, max: number) {
    this.current = current;

    if (max) {
      this.max = max;
      this.percent = current / max;
    } else {
      this.percent = 1;
    }
  }
}
