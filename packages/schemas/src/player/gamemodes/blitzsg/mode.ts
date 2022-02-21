import { add, ratio } from '@statsify/math';
import { APIData } from '@statsify/util';
import { Field } from '../../../decorators';

export class BlitzSGMode {
  @Field()
  public wins: number;

  @Field()
  public kills: number;

  public constructor(data: APIData, mode: string) {
    mode = mode ? `_${mode}` : mode;

    this.wins = data[`wins${mode}`];
    this.kills = data[`kills${mode}`];
  }
}

export class BlitzSGOverall {
  @Field()
  public wins: number;

  @Field()
  public kills: number;

  @Field()
  public deaths: number;

  @Field()
  public kdr: number;

  public constructor(data: APIData) {
    this.wins = add(data.wins, data.wins_teams_normal);
    this.kills = data.kills;
    this.deaths = data.deaths;
    this.kdr = ratio(this.kills, this.deaths);
  }
}
