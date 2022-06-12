import { add, ratio } from '@statsify/math';
import { APIData, formatTime } from '@statsify/util';
import { Field } from '../../../metadata';

export class SkyWarsMode {
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

  @Field({ leaderboard: { formatter: formatTime } })
  public playtime: number;

  //Kit gets applied in the main class
  @Field({ store: { default: 'none' } })
  public kit: string;

  public constructor(data: APIData, mode: string) {
    mode = mode ? `_${mode}` : mode;

    this.wins = data[`wins${mode}`];
    this.losses = data[`losses${mode}`];
    this.kills = data[`kills${mode}`];
    this.deaths = data[`deaths${mode}`];
    this.gamesPlayed = add(this.wins, this.losses);
    this.assists = data[`assists${mode}`];

    //Convert to milliseconds
    this.playtime = (data[`time_played${mode}`] ?? 0) * 1000;

    SkyWarsMode.applyRatios(this);
  }

  public static applyRatios(data: SkyWarsMode) {
    data.kdr = ratio(data.kills, data.deaths);
    data.wlr = ratio(data.wins, data.losses);
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
  public tntMadness: SkyWarsLabMode;

  @Field()
  public lucky: SkyWarsLabMode;

  @Field()
  public rush: SkyWarsLabMode;

  @Field()
  public slime: SkyWarsLabMode;

  public constructor(data: APIData) {
    this.tntMadness = new SkyWarsLabMode(data, 'tnt_madness');
    this.lucky = new SkyWarsLabMode(data, 'lucky_blocks');
    this.rush = new SkyWarsLabMode(data, 'rush');
    this.slime = new SkyWarsLabMode(data, 'slime');
  }
}
