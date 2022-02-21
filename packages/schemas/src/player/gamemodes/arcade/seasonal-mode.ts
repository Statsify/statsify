import { APIData } from '@statsify/util';
import { Field } from '../../../decorators';

export class EasterSimulator {
  @Field()
  public wins: number;

  @Field()
  public eggsFound: number;

  public constructor(data: APIData) {
    this.wins = data.wins_scuba_simulator;
    this.eggsFound = data.eggs_found_easter_simulator;
  }
}

export class GrinchSimulator {
  @Field()
  public wins: number;

  @Field()
  public giftsFound: number;

  public constructor(data: APIData) {
    this.wins = data.wins_grinch_simulator_v2;
    this.giftsFound = data.gifts_grinch_simulator_v2;
  }
}

export class HalloweenSimulator {
  @Field()
  public wins: number;

  @Field()
  public candyFound: number;

  public constructor(data: APIData) {
    this.wins = data.wins_halloween_simulator;
    this.candyFound = data.candy_found_halloween_simulator;
  }
}

export class SantaSimulator {
  @Field()
  public wins: number;

  @Field()
  public delivered: number;

  public constructor(data: APIData) {
    this.wins = data.wins_santa_simulator;
    this.delivered = data.delivered_santa_simulator;
  }
}

export class ScubaSimulator {
  @Field()
  public wins: number;

  @Field()
  public points: number;

  @Field()
  public itemsFound: number;

  public constructor(data: APIData) {
    this.wins = data.wins_scuba_simulator;
    this.points = data.total_points_scuba_simulator;
    this.itemsFound = data.items_found_scuba_simulator;
  }
}
