import { ratio } from '@statsify/math';
import { APIData } from '@statsify/util';
import { Field } from '../../../metadata';

export class QuakeMode {
  @Field()
  public wins: number;

  @Field()
  public kills: number;

  @Field()
  public deaths: number;

  @Field()
  public kdr: number;

  @Field()
  public headShots: number;

  @Field({ leaderboard: { enabled: false } })
  public hkr: number;

  @Field()
  public killstreaks: number;

  @Field()
  public shotsFired: number;

  @Field({ leaderboard: { enabled: false } })
  public distanceTraveled: number;

  @Field()
  public wkr: number;

  @Field({ leaderboard: { enabled: false } })
  public winRate: number;

  @Field({ leaderboard: { enabled: false } })
  public shotAccuracy: number;

  public constructor(data: APIData, mode: string) {
    mode = mode ? `_${mode}` : mode;

    this.wins = data[`wins${mode}`];
    this.kills = data[`kills${mode}`];
    this.deaths = data[`deaths${mode}`];
    this.headShots = data[`headshots${mode}`];
    this.killstreaks = data[`killstreaks${mode}`];
    this.shotsFired = data[`shots_fired${mode}`];
    this.distanceTraveled = data[`distance_travelled${mode}`];

    QuakeMode.applyRatios(this);
  }

  public static applyRatios(data: QuakeMode) {
    data.kdr = ratio(data.kills, data.deaths);
    data.wkr = ratio(data.wins, data.kills);
    data.hkr = ratio(data.headShots, data.kills);
    data.winRate = ratio(25, data.wkr);
    data.shotAccuracy = ratio(data.kills, data.shotsFired, 100);
  }
}
