import { add, deepSub, roundTo } from '@statsify/math';
import { APIData } from '@statsify/util';
import { Color, ColorCode } from '../../../color';
import { Field } from '../../../metadata';
import { Progression } from '../../../progression';
import { BedWarsMode, DreamsBedWars } from './mode';
import { getExpReq, getFormattedLevel, getLevel } from './util';

export class BedWars {
  @Field()
  public coins: number;

  @Field()
  public lootChests: number;

  @Field({
    leaderboard: {
      name: 'EXP',
      additionalFields: [
        'stats.bedwars.overall.wins',
        'stats.bedwars.overall.finalKills',
        'stats.bedwars.overall.fkdr',
      ],
    },
  })
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
    this.level = roundTo(getLevel(this.exp));
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

    this.core = deepSub(this.overall, this['4v4']);
    BedWarsMode.applyRatios(this.core);

    this.core.winstreak = this.overall.winstreak;

    this.dreams = new DreamsBedWars(data);
  }
}

export * from './mode';
