import { ratio } from '@statsify/math';
import { APIData } from '@statsify/util';
import { Field } from '../../../metadata';

export class WoolWarsClass {
  @Field()
  public wins: number;

  @Field()
  public gamesPlayed: number;

  @Field()
  public losses: number;

  @Field()
  public kills: number;

  @Field()
  public deaths: number;

  @Field()
  public kdr: number;

  @Field()
  public assists: number;

  @Field()
  public powerups: number;

  @Field()
  public blocksBroken: number;

  @Field()
  public woolPlaced: number;

  public constructor(data: APIData) {
    this.wins = data?.wins ?? 0;
    this.gamesPlayed = data?.games_played ?? 0;
    this.losses = this.gamesPlayed - this.wins;

    this.kills = data?.kills ?? 0;
    this.deaths = data?.deaths ?? 0;
    this.kdr = ratio(this.kills, this.deaths);

    this.assists = data?.assists ?? 0;

    this.powerups = data?.powerups_gotten ?? 0;
    this.blocksBroken = data?.blocks_broken ?? 0;
    this.woolPlaced = data?.wool_placed ?? 0;
  }
}
