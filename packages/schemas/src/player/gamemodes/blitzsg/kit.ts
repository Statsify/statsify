import { add, ratio, sub } from '@statsify/math';
import { APIData, findScoreIndex } from '@statsify/util';
import { Field } from '../../../decorators';

export class BlitzSGKit {
  @Field()
  public gamesPlayed: number;

  @Field({ leaderboard: false })
  public level: number;

  @Field()
  public exp: number;

  @Field({ leaderboard: false })
  public prestige: number;

  @Field()
  public kills: number;

  @Field()
  public deaths: number;

  @Field()
  public kdr: number;

  @Field()
  public wins: number;

  @Field()
  public losses: number;

  @Field()
  public wlr: number;

  @Field({ required: false })
  public playTime?: number;

  public constructor(data: APIData, kit: string) {
    this.gamesPlayed = data[`games_played_${kit}`];

    this.exp = data[`exp_${kit}`];
    this.prestige = data[`p${kit}`];

    this.wins = add(data[`wins_${kit}`], data[`wins_teams_${kit}`]);
    this.losses = this.deaths;
    this.wlr = ratio(this.wins, this.losses);

    this.kills = data[`kills_${kit}`];
    this.deaths = sub(this.gamesPlayed, this.wins);
    this.kdr = ratio(this.kills, this.deaths);

    this.playTime = data[`time_played_${kit}`];

    const defaultKits = [
      'archer',
      'meatmaster',
      'speleologist',
      'baker',
      'knight',
      'guardian',
      'scout',
      'hunter',
      'hype train',
      'fisherman',
      'armorer',
    ];

    const specialKits = ['donkeytamer', 'warrior', 'ranger', 'phoenix', 'milkman'];

    if (kit in data) {
      this.level = data[kit] + 1;
    } else if (defaultKits.includes(kit) && this.exp > 0) {
      this.level = 1;
    } else if (specialKits.includes(kit)) {
      const prestiges = [1, 100, 250, 500, 1000, 1500, 2000, 2500, 5000, 10000];

      this.level =
        findScoreIndex(
          prestiges.map((n) => ({ req: n })),
          this.exp
        ) + 1;
    }
  }
}
