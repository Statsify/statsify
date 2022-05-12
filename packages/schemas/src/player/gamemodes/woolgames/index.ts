import { APIData } from '@statsify/util';
import { Color, ColorCode } from '../../../color';
import { Field } from '../../../metadata';
import { Progression } from '../../../progression';
import { WoolWarsStats } from './class';
import { getExpReq, getFormattedLevel, getLevel } from './util';

export class WoolGames {
  @Field()
  public coins: number;

  @Field({ leaderboard: { enabled: false } })
  public layers: number;

  @Field()
  public exp: number;

  @Field({ leaderboard: { enabled: false } })
  public level: number;

  @Field()
  public levelFormatted: string;

  @Field()
  public levelColor: Color;

  @Field()
  public levelProgression: Progression;

  @Field()
  public nextLevelFormatted: string;

  @Field()
  public WoolWars: WoolWarsStats;

  public constructor(data: APIData) {
    this.coins = data?.coins ?? 0;
    this.layers = data?.progression?.available_layers ?? 0;
    this.exp = data?.progression?.experience ?? 0;

    this.level = +getLevel(this.exp).toFixed(2);
    this.levelFormatted = getFormattedLevel(this.level);
    this.nextLevelFormatted = getFormattedLevel(this.level + 1);

    this.levelColor =
      this.levelFormatted[1] === '7' && this.level > 1000
        ? new Color(`§${this.levelFormatted[4]}` as ColorCode)
        : new Color(`§${this.levelFormatted[1]}` as ColorCode);

    const flooredLevel = Math.floor(this.level);
    let exp = this.exp;

    for (let i = 0; i < flooredLevel; i++) {
      exp -= getExpReq(i);
    }

    this.levelProgression = new Progression(exp, getExpReq(flooredLevel + 1));

    this.WoolWars = new WoolWarsStats(data?.wool_wars?.stats ?? {});
  }
}
