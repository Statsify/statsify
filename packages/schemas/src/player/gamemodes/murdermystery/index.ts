import { add } from '@statsify/math';
import { APIData } from '@statsify/util';
import { Field } from '../../../decorators';
import { MurderMysteryMode } from './mode';

export class MurderMystery {
  @Field()
  public coins: number;

  @Field()
  public lootChests: number;

  @Field()
  public murdererWins: number;

  @Field()
  public detectiveWins: number;

  @Field()
  public heroWins: number;

  @Field()
  public overall: MurderMysteryMode;

  @Field()
  public classic: MurderMysteryMode;

  @Field()
  public assassins: MurderMysteryMode;

  @Field()
  public doubleUp: MurderMysteryMode;

  @Field()
  public infection: MurderMysteryMode;

  public constructor(data: APIData, ap: APIData) {
    this.coins = data.coins;

    this.lootChests = add(
      data.mm_chests,
      data.mm_easter_chests,
      data.mm_christmas_chests,
      data.mm_halloween_chests,
      data.mm_lunar_chests,
      data.mm_golden_chests
    );

    this.murdererWins = data.murderer_wins;
    this.detectiveWins = data.detective_wins;
    this.heroWins = ap.murdermystery_countermeasures;

    this.overall = new MurderMysteryMode(data, '');
    this.classic = new MurderMysteryMode(data, 'MURDER_CLASSIC');
    this.assassins = new MurderMysteryMode(data, 'MURDER_ASSASSINS');
    this.doubleUp = new MurderMysteryMode(data, 'MURDER_DOUBLE_UP');
    this.infection = new MurderMysteryMode(data, 'MURDER_INFECTION');
  }
}
