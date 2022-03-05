import { APIData } from '@statsify/util';
import { Field } from '../../../decorators';
import { SpeedUHCMastery } from './mastery';
import { SpeedUHCMode } from './mode';
import { getLevelIndex, titleScores } from './util';

export class SpeedUHC {
  @Field()
  public overall: SpeedUHCMode;

  @Field()
  public solo: SpeedUHCMode;

  @Field()
  public teams: SpeedUHCMode;

  @Field()
  public coins: number;

  @Field()
  public score: number;

  @Field({ default: 'none' })
  public activeMastery: string;

  @Field({ getter: (target: SpeedUHC) => getLevelIndex(target.score) + 1 })
  public level: number;

  @Field()
  public levelFormatted: string;

  @Field({ getter: (target: SpeedUHC) => titleScores[getLevelIndex(target.score)].title })
  public title: string;

  @Field()
  public wildSpecialist: SpeedUHCMastery;

  @Field()
  public guardian: SpeedUHCMastery;

  @Field()
  public sniper: SpeedUHCMastery;

  @Field()
  public berserk: SpeedUHCMastery;

  @Field()
  public masterBaker: SpeedUHCMastery;

  @Field()
  public invigorate: SpeedUHCMastery;

  @Field()
  public huntsman: SpeedUHCMastery;

  @Field()
  public fortune: SpeedUHCMastery;

  @Field()
  public vampirism: SpeedUHCMastery;

  public constructor(data: APIData) {
    this.coins = data.coins;
    this.score = data.score;
    this.activeMastery = data.activeMasterPerk;

    this.overall = new SpeedUHCMode(data, '');
    this.solo = new SpeedUHCMode(data, 'solo');
    this.teams = new SpeedUHCMode(data, 'team');

    this.wildSpecialist = new SpeedUHCMastery(data, 'wild_specialist');
    this.guardian = new SpeedUHCMastery(data, 'guardian');
    this.sniper = new SpeedUHCMastery(data, 'sniper');
    this.berserk = new SpeedUHCMastery(data, 'berserk');
    this.masterBaker = new SpeedUHCMastery(data, 'master_baker');
    this.invigorate = new SpeedUHCMastery(data, 'invigorate');
    this.huntsman = new SpeedUHCMastery(data, 'huntsman');
    this.fortune = new SpeedUHCMastery(data, 'huntsman');
    this.vampirism = new SpeedUHCMastery(data, 'vampirism');

    this.levelFormatted = `§d[${getLevelIndex(this.score) + 1}❋]`;
  }
}
