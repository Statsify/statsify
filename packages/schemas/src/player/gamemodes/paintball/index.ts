import { ratio } from '@statsify/math';
import { APIData } from '@statsify/util';
import { Field } from '../../../metadata';
import { PaintballPerks } from './perks';

export const PAINTBALL_MODES = ['overall'] as const;

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

  @Field({ store: { default: 'none' } })
  public hat: string;

  @Field()
  public wins: number;

  @Field()
  public kdr: number;

  @Field({ leaderboard: { enabled: false } })
  public shotAccuracy: number;

  @Field()
  public perks: PaintballPerks;

  public constructor(data: APIData) {
    this.coins = data.coins;
    this.forceFieldTime = data.forcefieldTime;
    this.kills = data.kills;
    this.deaths = data.deaths;
    this.killstreaks = data.killstreaks;
    this.shotsFired = data.shots_fired;
    this.wins = data.wins;
    this.hat = data.hat;
    this.kdr = ratio(this.kills, this.deaths);
    this.shotAccuracy = ratio(this.kills, this.shotsFired, 100);
    this.perks = new PaintballPerks(data);
  }
}

export * from './perks';
