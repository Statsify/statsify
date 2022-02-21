import { APIData } from '@statsify/util';
import { Field } from '../../../decorators';

export class PaintballPerks {
  @Field({ leaderboard: false })
  public adrenaline: number;

  @Field({ leaderboard: false })
  public endurance: number;

  @Field({ leaderboard: false })
  public fortune: number;

  @Field({ leaderboard: false })
  public godfather: number;

  @Field({ leaderboard: false })
  public headstart: number;
  @Field({ leaderboard: false })
  public superluck: number;

  @Field({ leaderboard: false })
  public transfusion: number;

  public constructor(data: APIData) {
    this.adrenaline = data.adrenaline;
    this.endurance = data.endurance;
    this.fortune = data.fortune;
    this.godfather = data.godfather;
    this.headstart = data.headstart;
    this.superluck = data.superluck;
    this.transfusion = data.transfusion;
  }
}
