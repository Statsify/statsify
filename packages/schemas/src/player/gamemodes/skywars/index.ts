import { add } from '@statsify/math';
import { APIData } from '@statsify/util';
import { Color } from '../../../color';
import { Field } from '../../../metadata';
import { Progression } from '../../../progression';
import { SkyWarsLabs, SkyWarsMode } from './mode';
import { getFormattedLevel, getLevel, getLevelProgress, getPresColor, parseKit } from './util';

export const SKYWARS_MODES = ['overall', 'solo', 'doubles', 'labs'] as const;
export type SkyWarsModes = typeof SKYWARS_MODES;

export class SkyWars {
  @Field({
    leaderboard: {
      fieldName: 'Level',
      hidden: true,
      additionalFields: [
        'stats.skywars.overall.wins',
        'stats.skywars.overall.kills',
        'stats.skywars.overall.kdr',
      ],
    },
  })
  public exp: number;

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
  public progression: Progression;

  @Field()
  public overall: SkyWarsMode;

  @Field()
  public solo: SkyWarsMode;

  @Field()
  public doubles: SkyWarsMode;

  @Field()
  public labs: SkyWarsLabs;

  public constructor(data: APIData) {
    this.exp = data.skywars_experience ?? 0;
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
    this.level = getLevel(this.exp);
    this.levelFormatted = getFormattedLevel(this.level, this.star);
    this.levelColor = getPresColor(this.level);

    const { current, total } = getLevelProgress(this.exp);
    this.progression = new Progression(current, total);

    this.nextLevelFormatted = getFormattedLevel(this.level + 1, this.star);

    const normalKit = parseKit(data.activeKit_SOLO_random ? 'random' : data.activeKit_SOLO);
    const insaneKit = parseKit(data.activeKit_TEAMS_random ? 'random' : data.activeKit_TEAMS);

    const soloInsaneWins = data[`wins_solo_insane`];
    const soloNormalWins = data[`wins_solo_normal`];
    const doublesInsaneWins = data[`wins_team_insane`];
    const doublesNormalWins = data[`wins_team_normal`];

    const chooseKit = (insane = 0, normal = 0) => (insane > normal ? insaneKit : normalKit);

    this.overall = new SkyWarsMode(data, '');

    this.solo = new SkyWarsMode(data, 'solo');
    this.solo.kit = chooseKit(soloInsaneWins, soloNormalWins);

    this.doubles = new SkyWarsMode(data, 'team');
    this.doubles.kit = chooseKit(doublesInsaneWins, doublesNormalWins);

    this.overall.kit = chooseKit(
      add(soloInsaneWins, doublesInsaneWins),
      add(soloNormalWins, doublesNormalWins)
    );

    this.labs = new SkyWarsLabs(data);
  }
}

export * from './mode';
