import { deepAdd } from '@statsify/math';
import { APIData } from '@statsify/util';
import { Field } from '../../../metadata';
import { VampireZLife } from './life';

export const VAMPIREZ_MODES = ['overall', 'human', 'vampire'] as const;

export class VampireZ {
  @Field()
  public coins: number;

  @Field()
  public overall: VampireZLife;

  @Field()
  public human: VampireZLife;

  @Field()
  public vampire: VampireZLife;

  public constructor(data: APIData) {
    this.coins = data.coins;

    this.human = new VampireZLife(data, 'human');
    this.vampire = new VampireZLife(data, 'vampire');

    this.overall = deepAdd(this.human, this.vampire);
    VampireZLife.applyRatios(this.overall);
  }
}

export * from './life';
