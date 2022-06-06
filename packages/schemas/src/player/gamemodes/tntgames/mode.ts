import { ratio } from '@statsify/math';
import { APIData } from '@statsify/util';
import { Field } from '../../../metadata';

export class BowSpleef {
  @Field()
  public wins: number;

  @Field()
  public hits: number;

  @Field()
  public wlr: number;

  public constructor(data: APIData) {
    this.wins = data.wins_bowspleef;
    this.hits = data.tags_bowspleef;
    this.wlr = ratio(this.wins, data.hits_bowspleef);
  }
}

export class PVPRun {
  @Field()
  public wins: number;

  @Field()
  public losses: number;

  @Field()
  public wlr: number;

  @Field()
  public kills: number;

  public constructor(data: APIData) {
    this.wins = data.wins_pvprun;
    this.kills = data.kills_pvprun;
    this.wlr = ratio(this.wins, data.deaths_pvprun);
  }
}

export class TNTRun {
  @Field()
  public wins: number;

  @Field()
  public wlr: number;

  @Field()
  public record: number;

  public constructor(data: APIData) {
    this.wins = data.wins_tntrun;
    this.wlr = ratio(this.wins, data.deaths_tntrun);
    this.record = data.record_tntrun;
  }
}

export class TNTTag {
  @Field()
  public wins: number;

  @Field()
  public kills: number;

  @Field()
  public tags: number;

  public constructor(data: APIData, ap: APIData) {
    this.wins = data.wins_tntag;
    this.kills = data.kills_tntag;
    this.tags = ap?.tntgames_clinic;
  }
}

export class Wizards {
  @Field()
  public wins: number;

  @Field()
  public kills: number;

  @Field()
  public kdr: number;

  public constructor(data: APIData) {
    this.wins = data.wins_capture;
    this.kills = data.kills_capture;
    this.kdr = ratio(this.kills, data.deaths_capture);
  }
}
