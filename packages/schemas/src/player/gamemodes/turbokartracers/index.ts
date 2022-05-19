import { add, ratio } from '@statsify/math';
import { APIData } from '@statsify/util';
import { Field } from '../../../metadata';
import { TurboKartRacersTrophies } from './trophy';

export class TurboKartRacers {
  @Field()
  public coins: number;

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

  @Field()
  public gamesPlayed: number;

  @Field({ leaderboard: { enabled: false } })
  public winRate: number;

  public constructor(data: APIData) {
    this.coins = data.coins;
    this.gamesPlayed = add(
      data.retro_plays,
      data.olympus_plays,
      data.canyon_plays,
      data.hypixelgp_plays,
      data.junglerush_plays
    );
    this.winRate = ratio(data.wins, this.gamesPlayed, 100);
    this.grandPrixTokens = data.grand_prix_tokens;
    this.lapsCompleted = data.laps_completed;
    this.boxesPickedUp = data.box_pickups;
    this.coinsPickedUp = data.coins_picked_up;

    this.trophies = new TurboKartRacersTrophies(data);
  }
}

export * from './trophy';
