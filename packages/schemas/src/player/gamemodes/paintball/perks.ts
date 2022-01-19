import { APIData } from '@statsify/util';
import { Field } from '../../../decorators';

export class PaintballPerks {
  @Field({ leaderboard: false })
  public godfather: number;

  @Field({ leaderboard: false })
  public endurance: number;

  @Field({ leaderboard: false })
  public superluck: number;

  @Field({ leaderboard: false })
  public fortune: number;

  @Field({ leaderboard: false })
  public adrenaline: number;

  @Field({ leaderboard: false })
  public transfusion: number;

  @Field({ leaderboard: false })
  public headstart: number;

  public constructor(data: APIData) {
    this.godfather = data.godfather;
    this.endurance = data.endurance;
    this.superluck = data.superluck;
    this.fortune = data.fortune;
    this.adrenaline = data.adrenaline;
    this.transfusion = data.transfusion;
    this.headstart = data.headstart;
  }
}
