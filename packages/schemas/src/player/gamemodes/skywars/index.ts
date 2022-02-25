import { add, deepAdd } from '@statsify/math';
import { APIData } from '@statsify/util';
import { Color } from '../../../color';
import { Field } from '../../../decorators';
import { Progression } from '../../../progression';
import { SkyWarsGameMode, SkyWarsLabs, SkyWarsMode } from './mode';
import { getFormattedLevel, getLevel, getLevelProgress, getPresColor, parseKit } from './util';

export class SkyWars {
  @Field()
  public xp: number;

  @Field()
  public coins: number;

  @Field()
  public souls: number;

  @Field()
  public shards: number;

  @Field()
  public opals: number;

  @Field()
  public heads: number;

  @Field()
  public tokens: number;

  @Field()
  public lootChests: number;

  @Field({ default: '⋆' })
  public star: string;

  @Field({ getter: (target: SkyWars) => getLevel(target.xp) })
  public level: number;

  @Field()
  public levelFormatted: string;

  @Field({ getter: (target: SkyWars) => getFormattedLevel(getLevel(target.xp) + 1, target.star) })
  public nextLevelFormatted: string;

  @Field({ getter: (target: SkyWars) => getPresColor(getLevel(target.xp)) })
  public levelColor: Color;

  @Field({
    getter: (target: SkyWars) => {
      const { current, total } = getLevelProgress(target.xp);
      return new Progression(current, total);
    },
  })
  public levelProgression: Progression;

  @Field()
  public overall: SkyWarsMode;

  @Field()
  public solo: SkyWarsMode;

  @Field()
  public doubles: SkyWarsMode;

  @Field()
  public labs: SkyWarsLabs;

  public constructor(data: APIData) {
    this.xp = data.skywars_experience;
    this.coins = data.coins;
    this.souls = data.souls;
    this.shards = data.shard;
    this.opals = data.opals;
    this.heads = data.heads;
    this.tokens = data.cosmetic_tokens;

    this.lootChests = add(
      data.skywars_chests,
      data.skywars_easter_boxes,
      data.skywars_halloween_boxes,
      data.skywars_christmas_boxes,
      data.skywars_lunar_boxes,
      data.skywars_golden_boxes
    );

    this.star = (data.levelFormatted || '⋆').replace(/[0-9]|[a-f]|k|r|l|§/g, '');

    this.levelFormatted = getFormattedLevel(getLevel(this.xp), this.star);

    const normalKit = parseKit(data.activeKit_SOLO_random ? 'random' : data.activeKit_SOLO);
    const insaneKit = parseKit(data.activeKit_TEAMS_random ? 'random' : data.activeKit_TEAMS);

    this.overall = new SkyWarsMode(data, '');

    this.solo = new SkyWarsMode(data, 'solo');
    this.solo.insane.kit = insaneKit;
    this.solo.normal.kit = normalKit;

    this.doubles = new SkyWarsMode(data, 'team');
    this.doubles.insane.kit = insaneKit;
    this.doubles.normal.kit = normalKit;

    this.overall.insane = deepAdd(SkyWarsGameMode, this.solo.insane, this.doubles.insane);
    this.overall.insane.kit = insaneKit;

    SkyWarsGameMode.applyRatios(this.overall.insane);

    this.overall.normal = deepAdd(SkyWarsGameMode, this.solo.normal, this.doubles.normal);
    this.overall.normal.kit = normalKit;

    SkyWarsGameMode.applyRatios(this.overall.normal);

    this.labs = new SkyWarsLabs(data);
  }
}
