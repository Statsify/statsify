import { add, deepAdd } from '@statsify/math';
import { APIData } from '@statsify/util';
import { Color } from '../../../color';
import { Field } from '../../../metadata';
import { Progression } from '../../../progression';
import { SkyWarsGameMode, SkyWarsLabs, SkyWarsMode } from './mode';
import { getFormattedLevel, getLevel, getLevelProgress, getPresColor, parseKit } from './util';

export const SKYWARS_MODES = ['overall', 'solo', 'doubles'] as const;

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

  @Field({ store: { default: '⋆' } })
  public star: string;

  @Field({ leaderboard: { enabled: false } })
  public level: number;

  @Field()
  public levelFormatted: string;

  @Field()
  public nextLevelFormatted: string;

  @Field()
  public levelColor: Color;

  @Field()
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
    this.xp = data.skywars_experience ?? 0;
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
    this.level = getLevel(this.xp);
    this.levelFormatted = getFormattedLevel(this.level, this.star);
    this.levelColor = getPresColor(this.level);

    const { current, total } = getLevelProgress(this.xp);
    this.levelProgression = new Progression(current, total);

    this.nextLevelFormatted = getFormattedLevel(this.level + 1, this.star);

    const normalKit = parseKit(data.activeKit_SOLO_random ? 'random' : data.activeKit_SOLO);
    const insaneKit = parseKit(data.activeKit_TEAMS_random ? 'random' : data.activeKit_TEAMS);
    const chooseKit = (insane: number, normal: number) => (insane > normal ? insaneKit : normalKit);

    this.overall = new SkyWarsMode(data, '');

    this.solo = new SkyWarsMode(data, 'solo');
    this.solo.insane.kit = insaneKit;
    this.solo.normal.kit = normalKit;
    this.solo.overall.kit = chooseKit(this.solo.insane.wins, this.solo.normal.wins);

    this.doubles = new SkyWarsMode(data, 'team');
    this.doubles.insane.kit = insaneKit;
    this.doubles.normal.kit = normalKit;
    this.doubles.overall.kit = chooseKit(this.doubles.insane.wins, this.doubles.normal.wins);

    this.overall.insane = deepAdd(this.solo.insane, this.doubles.insane);
    this.overall.insane.kit = insaneKit;
    SkyWarsGameMode.applyRatios(this.overall.insane);

    this.overall.normal = deepAdd(this.solo.normal, this.doubles.normal);
    this.overall.normal.kit = normalKit;
    SkyWarsGameMode.applyRatios(this.overall.normal);

    this.overall.overall.kit = chooseKit(this.overall.insane.wins, this.overall.normal.wins);

    this.labs = new SkyWarsLabs(data);
  }
}

export * from './mode';
