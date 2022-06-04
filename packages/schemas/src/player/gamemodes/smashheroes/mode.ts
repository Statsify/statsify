import { ratio } from '@statsify/math';
import { APIData } from '@statsify/util';
import { Field } from '../../../metadata';

export class SmashHeroesMode {
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

  public constructor(data: APIData, mode: string) {
    mode = mode ? `_${mode}` : mode;

    this.wins = data[`wins${mode}`];
    this.losses = data[`losses${mode}`];
    this.kills = data[`kills${mode}`];
    this.deaths = data[`deaths${mode}`];

    this.wlr = ratio(this.wins, this.losses);
    this.kdr = ratio(this.kills, this.deaths);
  }
}

export class SmashHeroesKit {
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

  public constructor(kit: string, data: APIData = {}) {
    this.wins = data[kit]?.wins;
    this.losses = data[kit]?.losses;
    this.kills = data[kit]?.kills;
    this.deaths = data[kit]?.deaths;

    this.wlr = ratio(this.wins, this.losses);
    this.kdr = ratio(this.kills, this.deaths);
  }
}
