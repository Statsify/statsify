import { add } from '@statsify/math';
import { APIData } from '@statsify/util';
import { Field } from '../../../metadata';
import { BowSpleef, PVPRun, TNTRun, TNTTag, Wizards } from './mode';

export class TNTGames {
  @Field()
  public coins: number;

  @Field()
  public wins: number;

  @Field()
  public blocksRan: number;

  @Field()
  public tntRun: TNTRun;

  @Field()
  public pvpRun: PVPRun;

  @Field()
  public bowSpleef: BowSpleef;

  @Field()
  public wizards: Wizards;

  @Field()
  public tntTag: TNTTag;

  public constructor(data: APIData, ap: APIData) {
    this.coins = data.coins;
    this.wins = add(data.wins, data.wins_pvprun);
    this.blocksRan = ap.tntgames_block_runner;

    this.tntRun = new TNTRun(data);
    this.pvpRun = new PVPRun(data);
    this.bowSpleef = new BowSpleef(data);
    this.wizards = new Wizards(data);
    this.tntTag = new TNTTag(data, ap);
  }
}

export * from './mode';
