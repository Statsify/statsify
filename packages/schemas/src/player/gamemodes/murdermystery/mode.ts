import { ratio } from '@statsify/math';
import { APIData } from '@statsify/util';
import { Field } from '../../../decorators';

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

  @Field()
  public bowKills: number;

  @Field()
  public knifeKills: number;

  @Field()
  public thrownKnifeKills: number;

  public constructor(data: APIData, mode: string) {
    mode = mode ? `_${mode}` : mode;

    this.wins = data[`wins${mode}`];
    this.gamesPlayed = data[`games${mode}`];
    this.kills = data[`kills${mode}`];
    this.deaths = data[`deaths${mode}`];
    this.kdr = ratio(this.kills, this.deaths);
    this.bowKills = data[`bow_kills${mode}`];
    this.knifeKills = data[`knife_kills${mode}`];
    this.thrownKnifeKills = data[`thrown_knife_kills${mode}`];
  }
}
