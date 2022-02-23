import { add, deepSub } from '@statsify/math';
import { APIData } from '@statsify/util';
import { Color, ColorCode } from '../../../color';
import { Field } from '../../../decorators';
import { Progression } from '../../../progression';
import { BedWarsMode, DreamsBedWars } from './mode';
import { getExpReq, getFormattedLevel, getLevel } from './util';

export class BedWars {
  @Field()
  public coins: number;

  @Field()
  public lootChests: number;

  @Field({
    name: 'EXP',
    additionalFields: [
      'stats.bedwars.overall.wins',
      'stats.bedwars.overall.finalKills',
      'stats.bedwars.overall.fkdr',
    ],
  })
  public exp: number;

  @Field({ leaderboard: false })
  public level: number;

  @Field()
  public levelFormatted: string;

  @Field({
    getter: (target: BedWars) => {
      const formatted = getFormattedLevel(target.level);

      return formatted[1] === '7' && target.level > 1000
        ? new Color(`§${formatted[4]}` as ColorCode)
        : new Color(`§${formatted[1]}` as ColorCode);
    },
  })
  public levelColor: Color;

  @Field({
    getter: (target: BedWars) => {
      const flooredLevel = Math.floor(target.level);
      let exp = target.exp;

      for (let i = 0; i < flooredLevel; i++) {
        exp -= getExpReq(i);
      }

      return new Progression(exp, getExpReq(flooredLevel + 1));
    },
  })
  public levelProgression: Progression;

  @Field({
    getter: (target: BedWars) => getFormattedLevel(target.level + 1),
  })
  public nextLevelFormatted: string;

  @Field()
  public overall: BedWarsMode;

  @Field()
  public solo: BedWarsMode;

  @Field()
  public doubles: BedWarsMode;

  @Field()
  public threes: BedWarsMode;

  @Field()
  public fours: BedWarsMode;

  @Field()
  public core: BedWarsMode;

  @Field()
  public '4v4': BedWarsMode;

  @Field()
  public dreams: DreamsBedWars;

  public constructor(data: APIData = {}) {
    this.coins = data.coins;
    this.exp = data.Experience || 0;
    this.level = +getLevel(this.exp).toFixed(2);
    this.levelFormatted = getFormattedLevel(this.level);

    this.lootChests = add(
      data.bedwars_boxes,
      data.bedwars_christmas_boxes,
      data.bedwars_halloween_boxes,
      data.bedwars_lunar_boxes,
      data.bedwars_golden_boxes,
      data.bedwars_easter_boxes
    );

    this.overall = new BedWarsMode(data, '');
    this.solo = new BedWarsMode(data, 'eight_one');
    this.doubles = new BedWarsMode(data, 'eight_two');
    this.threes = new BedWarsMode(data, 'four_three');
    this.fours = new BedWarsMode(data, 'four_four');
    this['4v4'] = new BedWarsMode(data, 'two_four');
    this.core = deepSub(BedWarsMode, this.overall, this['4v4']);
    BedWarsMode.applyRatios(this.core);

    this.dreams = new DreamsBedWars(data);
  }
}
