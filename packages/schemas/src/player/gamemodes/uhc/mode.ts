import { ratio } from '@statsify/math';
import { APIData } from '@statsify/util';
import { Field } from '../../../metadata';

export class UHCMode {
  @Field()
  public wins: number;

  @Field()
  public kills: number;

  @Field()
  public deaths: number;

  @Field()
  public kdr: number;

  @Field()
  public headsEaten: number;

  @Field({ leaderboard: { enabled: false }})
  public ultimatesCrafted: number;

  @Field({ leaderboard: { enabled: false } })
  public extraUltimates: number;

  public constructor(data: APIData, mode: string) {
    mode = mode ? `_${mode}` : mode;

    this.wins = data[`wins${mode}`];
    this.kills = data[`kills${mode}`];
    this.deaths = data[`deaths${mode}`];
    this.headsEaten = data[`heads_eaten${mode}`];
    this.extraUltimates = data[`extra_ultimates_crafted${mode}`];
    this.ultimatesCrafted = data[`ultimates_crafted${mode}`];

    UHCMode.applyRatios(this);
  }

  public static applyRatios(data: UHCMode) {
    data.kdr = ratio(data.kills, data.deaths);
  }
}
