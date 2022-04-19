import { APIData } from '@statsify/util';
import { Field } from '../../../metadata';

export class PaintballPerks {
  @Field({ leaderboard: { enabled: false } })
  public adrenaline: number;

  @Field({ leaderboard: { enabled: false } })
  public endurance: number;

  @Field({ leaderboard: { enabled: false } })
  public fortune: number;

  @Field({ leaderboard: { enabled: false } })
  public godfather: number;

  @Field({ leaderboard: { enabled: false } })
  public headstart: number;
  @Field({ leaderboard: { enabled: false } })
  public superluck: number;

  @Field({ leaderboard: { enabled: false } })
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
