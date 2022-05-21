import { add } from '@statsify/math';
import { APIData } from '@statsify/util';
import { Field } from '../../../metadata';

export class TurboKartRacersTrophies {
  @Field()
  public gold: number;

  @Field()
  public silver: number;

  @Field()
  public bronze: number;

  @Field()
  public total: number;

  public constructor(data: APIData) {
    this.bronze = data.bronze_trophy;
    this.silver = data.silver_trophy;
    this.gold = data.gold_trophy;
    this.total = add(this.gold, this.silver, this.bronze);
  }
}
