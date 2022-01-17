import { ratio } from '@statsify/math';
import { APIData } from '@statsify/util';
import { Field } from '../../../decorators';

export class Paintball {
  @Field()
  public coins: number;

  @Field()
  public forceFieldTime: number;

  @Field()
  public kills: number;

  @Field()
  public deaths: number;

  @Field()
  public killstreaks: number;

  @Field()
  public shotsFired: number;

  @Field()
  public wins: number;

  @Field()
  public kdr: number;

  @Field({ leaderboard: false })
  public skr: number;

  public constructor(data: APIData) {
    this.coins = data.coins;
    this.forceFieldTime = data.forcefieldTime;
    this.kills = data.kills;
    this.deaths = data.deaths;
    this.killstreaks = data.killstreaks;
    this.shotsFired = data.shots_fired;
    this.wins = data.wins;
    this.kdr = ratio(this.kills, this.deaths);
    this.skr = ratio(this.shotsFired, this.kills);
  }
}
