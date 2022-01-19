import { APIData } from '@statsify/util';
import { Field } from '../../../decorators';

export class PaintballPerks {
  @Field()
  public godfather: number;

  @Field()
  public endurance: number;

  @Field()
  public superluck: number;

  @Field()
  public fortune: number;

  @Field()
  public adrenaline: number;

  @Field()
  public transfusion: number;

  @Field()
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
