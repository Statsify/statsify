import { add } from '@statsify/math';
import { APIData } from '@statsify/util';
import { Field } from '../../../metadata';

export class WarlordsClass {
  @Field()
  public wins: number;

  @Field()
  public damage: number;

  @Field()
  public prevent: number;

  @Field()
  public healing: number;

  @Field({ leaderboard: { enabled: false } })
  public total: number;

  public constructor(data: APIData, mode: string) {
    this.wins = data[`wins_${mode}`];

    this.damage = data[`damage_${mode}`];
    this.prevent = data[`damage_prevented_${mode}`];
    this.healing = data[`heal_${mode}`];

    this.total = add(this.damage, this.prevent, this.healing);
  }
}
