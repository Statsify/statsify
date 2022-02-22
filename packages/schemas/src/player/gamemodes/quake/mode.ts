import { ratio } from '@statsify/math';
import { APIData } from '@statsify/util';
import { Field } from '../../../decorators';

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

  @Field({ leaderboard: false })
  public hkr: number;

  @Field()
  public killstreaks: number;

  @Field()
  public shotsFired: number;

  @Field()
  public distanceTraveled: number;

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
    data.hkr = ratio(data.headShots, data.kills);
  }
}
