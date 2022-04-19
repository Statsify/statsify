import { ratio } from '@statsify/math';
import { APIData } from '@statsify/util';
import { Field } from '../../../metadata';

export class BowSpleef {
  @Field()
  public wins: number;

  @Field()
  public losses: number;

  @Field()
  public wlr: number;

  @Field()
  public hits: number;

  public constructor(data: APIData) {
    this.wins = data.wins_bowspleef;
    this.losses = data.deaths_bowspleef;
    this.wlr = ratio(this.wins, this.losses);
    this.hits = data.tags_bowspleef;
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

  @Field()
  public deaths: number;

  @Field()
  public kdr: number;

  @Field()
  public record: number;

  public constructor(data: APIData) {
    this.record = data.record_pvprun;
    this.wins = data.wins_pvprun;
    this.losses = data.deaths_pvprun;
    this.kills = data.kills_pvprun;
    this.deaths = data.deaths_pvprun;
    this.kdr = ratio(this.kills, this.deaths);
    this.wlr = ratio(this.wins, this.losses);
  }
}

export class TNTRun {
  @Field()
  public wins: number;

  @Field()
  public losses: number;

  @Field()
  public wlr: number;

  @Field()
  public record: number;

  public constructor(data: APIData) {
    this.wins = data.wins_tntrun;
    this.losses = data.deaths_tntrun;
    this.wlr = ratio(this.wins, this.losses);
    this.record = data.record_tntrun;
  }
}

export class TNTTag {
  @Field()
  public wins: number;

  @Field()
  public kills: number;

  @Field({ store: { default: 1 } })
  public speed: number;

  @Field()
  public tags: number;

  public constructor(data: APIData, ap: APIData) {
    this.wins = data.wins_tntag;
    this.kills = data.kills_tntag;
    this.speed = data.new_tntag_speedy || 1;
    this.tags = ap?.tntgames_clinic;
  }
}

export class Wizards {
  @Field()
  public wins: number;

  @Field()
  public kills: number;

  @Field()
  public deaths: number;

  @Field()
  public kdr: number;

  @Field()
  public points: number;

  @Field()
  public assists: number;

  public constructor(data: APIData) {
    this.wins = data.wins_capture;
    this.kills = data.kills_capture;
    this.deaths = data.deaths_capture;
    this.kdr = ratio(this.kills, this.deaths);
    this.points = data.points_capture;
    this.assists = data.assists_capture;
  }
}
