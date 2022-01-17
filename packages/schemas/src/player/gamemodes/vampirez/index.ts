import { deepAdd } from '@statsify/math';
import { APIData } from '@statsify/util';
import { Field } from '../../../decorators';
import { VampireZLife } from './life';

export class VampireZ {
  @Field()
  public coins: number;

  public overall: VampireZLife;
  public human: VampireZLife;
  public vampire: VampireZLife;

  public constructor(data: APIData) {
    this.coins = data.coins;

    this.human = new VampireZLife(data, 'human');
    this.vampire = new VampireZLife(data, 'vampire');

    this.overall = deepAdd(this.human, this.vampire);
    VampireZLife.applyRatios(this.overall);
  }
}
