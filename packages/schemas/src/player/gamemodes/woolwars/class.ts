import { ratio, sub } from '@statsify/math';
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
  public wlr: number;

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

  public constructor(data: APIData = {}) {
    this.wins = data.wins;
    this.gamesPlayed = data.games_played;
    this.losses = sub(this.gamesPlayed - this.wins);
    this.wlr = ratio(this.wins, this.losses);

    this.kills = data.kills;
    this.deaths = data.deaths;
    this.kdr = ratio(this.kills, this.deaths);

    this.assists = data.assists;

    this.powerups = data.powerups_gotten;
    this.blocksBroken = data.blocks_broken;
    this.woolPlaced = data.wool_placed;
  }
}
