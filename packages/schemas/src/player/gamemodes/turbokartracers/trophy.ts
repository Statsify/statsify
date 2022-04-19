import { APIData } from '@statsify/util';
import { Field } from '../../../metadata';

export class TurboKartRacersTrophies {
  @Field()
  public gold: number;

  @Field()
  public silver: number;

  @Field()
  public bronze: number;

  public constructor(data: APIData) {
    this.bronze = data.bronze_trophy;
    this.silver = data.silver_trophy;
    this.gold = data.gold_trophy;
  }
}
