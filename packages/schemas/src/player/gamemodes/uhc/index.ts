import { deepAdd } from '@statsify/math';
import { APIData } from '@statsify/util';
import { Field } from '../../../metadata';
import { UHCMode } from './mode';
import { getLevelIndex, titleScores } from './util';

export class UHC {
  @Field()
  public overall: UHCMode;

  @Field()
  public solo: UHCMode;

  @Field()
  public teams: UHCMode;

  @Field()
  public coins: number;

  @Field()
  public level: number;

  @Field()
  public levelFormatted: string;

  @Field()
  public score: number;

  @Field({ store: { default: 'none' } })
  public kit: string;

  @Field()
  public title: string;

  public constructor(data: APIData) {
    this.coins = data.coins;
    this.score = data.score;

    this.kit = data.equippedKit ?? 'none';

    const index = getLevelIndex(this.score);

    this.level = index + 1;
    this.levelFormatted = `§6[${this.level}✫]`;
    this.title = titleScores[index].title;

    this.solo = new UHCMode(data, 'solo');
    this.teams = new UHCMode(data, '');

    this.overall = deepAdd(
      this.solo,
      this.teams,
      new UHCMode(data, 'no diamonds'),
      new UHCMode(data, 'vanilla doubles'),
      new UHCMode(data, 'brawl'),
      new UHCMode(data, 'solo brawl'),
      new UHCMode(data, 'duo brawl')
    );

    UHCMode.applyRatios(this.overall);
  }
}

export * from './mode';
