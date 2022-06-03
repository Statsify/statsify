import { add, ratio } from '@statsify/math';
import { APIData } from '@statsify/util';
import { Field } from '../../../metadata';
import { TurboKartRacersTrophies } from './trophy';

export const TURBO_KART_RACERS_MODES = ['overall'] as const;
export type TurboKartRacersModes = typeof TURBO_KART_RACERS_MODES;

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
  public trophyRate: number;

  @Field({ leaderboard: { enabled: false } })
  public goldRate: number;

  public constructor(data: APIData) {
    this.coins = data.coins;
    this.gamesPlayed = add(
      data.retro_plays,
      data.olympus_plays,
      data.canyon_plays,
      data.hypixelgp_plays,
      data.junglerush_plays
    );
    this.trophyRate = ratio(data.wins, this.gamesPlayed, 100);
    this.grandPrixTokens = data.grand_prix_tokens;
    this.lapsCompleted = data.laps_completed;
    this.boxesPickedUp = data.box_pickups;
    this.coinsPickedUp = data.coins_picked_up;

    this.trophies = new TurboKartRacersTrophies(data);
    this.goldRate = ratio(this.trophies.gold, this.gamesPlayed, 100);
  }
}

export * from './trophy';
