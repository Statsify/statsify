import { APIData } from '@statsify/util';
import { Field } from '../metadata';

export class RankedSkyWars {
  @Field()
  public uuid: string;

  @Field()
  public displayName: string;

  @Field()
  public position: number;

  @Field()
  public rating: number;

  public constructor(data: APIData) {
    this.position = data.position;
    this.rating = data.score;
  }
}
