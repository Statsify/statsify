import { ratio } from '@statsify/math';
import { APIData } from '@statsify/util';
import { Field } from '../../../metadata';

export class BowSpleef {
  @Field()
  public wins: number;

  @Field()
  public hits: number;

  @Field({ leaderboard: { enabled: false } })
  public losses: number;

  @Field()
  public wlr: number;

  public constructor(data: APIData) {
    this.wins = data.wins_bowspleef;
    this.hits = data.tags_bowspleef;
    this.losses = data.deaths_bowspleef;
    this.wlr = ratio(this.wins, this.losses);
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

  @Field({ leaderboard: { enabled: false } })
  public deaths: number;

  public constructor(data: APIData) {
    this.wins = data.wins_pvprun;
    this.kills = data.kills_pvprun;
    this.deaths = data.deaths_pvprun;
    this.wlr = ratio(this.wins, this.deaths);
  }
}

export class TNTRun {
  @Field()
  public wins: number;

  @Field({ leaderboard: { enabled: false } })
  public losses: number;

  @Field()
  public wlr: number;

  @Field()
  public record: number;

  public constructor(data: APIData) {
    this.wins = data.wins_tntrun;
    this.losses = data.losses_tntrun;
    this.wlr = ratio(this.wins, this.losses);
    this.record = data.record_tntrun * 1000;
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
  public deaths: number;

  @Field()
  public kdr: number;

  public constructor(data: APIData) {
    this.wins = data.wins_capture;
    this.kills = data.kills_capture;
    this.deaths = data.deaths_capture;
    this.kdr = ratio(this.kills, this.deaths);
  }
}
