import { APIData } from '@statsify/util';
import { Field } from '../../../metadata';
import { TurboKartRacersTrophies } from './trophy';

export class TurboKartRacers {
  @Field()
  public coins: number;

  @Field()
  public wins: number;

  @Field()
  public grandPrixTokens: number;

  @Field()
  public lapsCompleted: number;

  @Field()
  public boxesPickedUp: number;

  @Field()
  public coinsPickedUp: number;

  @Field()
  public trophies: TurboKartRacersTrophies;

  public constructor(data: APIData) {
    this.coins = data.coins;
    this.wins = data.wins;
    this.grandPrixTokens = data.grand_prix_tokens;
    this.lapsCompleted = data.laps_completed;
    this.boxesPickedUp = data.box_pickups;
    this.coinsPickedUp = data.coins_picked_up;

    this.trophies = new TurboKartRacersTrophies(data);
  }
}

export * from './trophy';
