import { add, ratio } from '@statsify/math';
import { APIData } from '@statsify/util';
import { Field } from '../../../metadata';

export class SkyWarsGameModeAverages {
  @Field({ leaderboard: { enabled: false } })
  public kills: number;

  public constructor(kills: number, gamesPlayed: number) {
    this.kills = ratio(kills, gamesPlayed);
  }
}

export class SkyWarsGameMode {
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
  public gamesPlayed: number;

  @Field()
  public assists: number;

  @Field()
  public playtime: number;

  @Field()
  public averages: SkyWarsGameModeAverages;

  @Field({ store: { required: false } })
  public kit?: string;

  public constructor(data: APIData, mode: string) {
    mode = mode ? `_${mode}` : mode;

    this.wins = data[`wins${mode}`];
    this.losses = data[`losses${mode}`];
    this.kills = data[`kills${mode}`];
    this.deaths = data[`deaths${mode}`];
    this.gamesPlayed = add(this.wins, this.losses);
    this.assists = data[`assists${mode}`];
    this.playtime = data[`time_played${mode}`];

    SkyWarsGameMode.applyRatios(this);
  }

  public static applyRatios(data: SkyWarsGameMode) {
    data.kdr = ratio(data.kills, data.deaths);
    data.wlr = ratio(data.wins, data.losses);
    data.averages = new SkyWarsGameModeAverages(data.kills, data.gamesPlayed);
  }
}

export class SkyWarsLabSubMode {
  @Field()
  public wins: number;

  public constructor(wins: number) {
    this.wins = wins;
  }
}

export class SkyWarsLabMode {
  @Field()
  public overall: SkyWarsLabSubMode;

  @Field()
  public solo: SkyWarsLabSubMode;

  @Field()
  public doubles: SkyWarsLabSubMode;

  public constructor(data: APIData, mode: string) {
    this.overall = new SkyWarsLabSubMode(data[`lab_win_${mode}_lab`]);
    this.solo = new SkyWarsLabSubMode(data[`lab_win_${mode}_lab_solo`]);
    this.doubles = new SkyWarsLabSubMode(data[`lab_win_${mode}_lab_team`]);
  }
}

export class SkyWarsLabs {
  @Field()
  public overall: SkyWarsGameMode;

  @Field()
  public solo: SkyWarsGameMode;

  @Field()
  public doubles: SkyWarsGameMode;

  @Field()
  public tntMadness: SkyWarsLabMode;

  @Field()
  public lucky: SkyWarsLabMode;

  @Field()
  public rush: SkyWarsLabMode;

  @Field()
  public slime: SkyWarsLabMode;

  public constructor(data: APIData) {
    this.overall = new SkyWarsGameMode(data, 'lab');
    this.solo = new SkyWarsGameMode(data, 'lab_solo');
    this.doubles = new SkyWarsGameMode(data, 'lab_team');
    this.tntMadness = new SkyWarsLabMode(data, 'tnt_madness');
    this.lucky = new SkyWarsLabMode(data, 'lucky_blocks');
    this.rush = new SkyWarsLabMode(data, 'rush');
    this.slime = new SkyWarsLabMode(data, 'slime');
  }
}

export class SkyWarsMode {
  @Field()
  public overall: SkyWarsGameMode;

  @Field()
  public insane: SkyWarsGameMode;

  @Field()
  public normal: SkyWarsGameMode;

  public constructor(data: APIData, mode: string) {
    this.overall = new SkyWarsGameMode(data, mode);
    this.insane = new SkyWarsGameMode(data, `${mode}_insane`);
    this.normal = new SkyWarsGameMode(data, `${mode}_normal`);
  }
}
