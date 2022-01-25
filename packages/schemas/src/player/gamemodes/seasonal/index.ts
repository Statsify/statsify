import { add } from '@statsify/math';
import { APIData } from '@statsify/util';
import { Field } from '../../../decorators';
import {
  EasterSimulator,
  GrinchSimulator,
  HalloweenSimulator,
  SantaSimulator,
  ScubaSimulator,
} from './mode';

export class Seasonal {
  @Field()
  public totalWins: number;

  @Field()
  public easterSimulator: EasterSimulator;

  @Field()
  public grinchSimulator: GrinchSimulator;

  @Field()
  public halloweenSimulator: HalloweenSimulator;

  @Field()
  public santaSimulator: SantaSimulator;

  @Field()
  public scubaSimulator: ScubaSimulator;

  public constructor(data: APIData) {
    this.easterSimulator = new EasterSimulator(data);
    this.grinchSimulator = new GrinchSimulator(data);
    this.halloweenSimulator = new HalloweenSimulator(data);
    this.santaSimulator = new SantaSimulator(data);
    this.scubaSimulator = new ScubaSimulator(data);

    this.totalWins = add(
      this.easterSimulator.wins,
      this.grinchSimulator.wins,
      this.halloweenSimulator.wins,
      this.santaSimulator.wins,
      this.scubaSimulator.wins
    );
  }
}
