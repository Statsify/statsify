import { ratio } from '@statsify/math';
import { APIData } from '@statsify/util';
import { Field } from '../../../metadata';

export class MurderMysteryMode {
  @Field()
  public wins: number;

  @Field()
  public gamesPlayed: number;

  @Field()
  public kills: number;

  @Field()
  public deaths: number;

  @Field()
  public kdr: number;
  public constructor(data: APIData, mode: string) {
    mode = mode ? `_${mode}` : mode;

    this.wins = data[`wins${mode}`];
    this.gamesPlayed = data[`games${mode}`];
    this.kills = data[`kills${mode}`];
    this.deaths = data[`deaths${mode}`];
    this.kdr = ratio(this.kills, this.deaths);
  }
}
