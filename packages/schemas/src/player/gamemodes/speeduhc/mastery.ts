import { ratio } from '@statsify/math';
import { APIData } from '@statsify/util';
import { Field } from '../../../decorators';

export class SpeedUHCMastery {
  @Field()
  public wins: number;

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

  public constructor(data: APIData, mastery: string) {
    mastery = `_mastery_${mastery}`;

    this.wins = data[`wins${mastery}`];
    this.losses = data[`losses${mastery}`];
    this.kills = data[`kills${mastery}`];
    this.deaths = data[`deaths${mastery}`];

    this.wlr = ratio(this.wins, this.losses);
    this.kdr = ratio(this.kills, this.deaths);
  }
}
