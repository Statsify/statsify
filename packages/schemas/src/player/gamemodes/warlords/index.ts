import { ratio } from '@statsify/math';
import { APIData } from '@statsify/util';
import { Field } from '../../../decorators';
import { WarlordsClass } from './class';

export class Warlords {
  @Field()
  public mage: WarlordsClass;

  @Field()
  public warrior: WarlordsClass;

  @Field()
  public paladin: WarlordsClass;

  @Field()
  public shaman: WarlordsClass;

  @Field({ default: 'warrior' })
  public class: string;

  @Field()
  public coins: number;

  @Field()
  public wins: number;

  @Field()
  public losses: number;

  @Field()
  public wlr: number;

  @Field()
  public kills: number;

  @Field()
  public deaths: number;

  @Field()
  public kdr: number;

  @Field()
  public assists: number;

  public constructor(data: APIData) {
    this.mage = new WarlordsClass(data, 'mage');
    this.warrior = new WarlordsClass(data, 'warrior');
    this.paladin = new WarlordsClass(data, 'paladin');
    this.shaman = new WarlordsClass(data, 'shaman');

    this.class = data.chosen_class || 'warrior';
    this.coins = data.coins;
    this.wins = data.wins;
    this.losses = data.losses;
    this.wlr = ratio(this.wins, this.losses);
    this.kills = data.kills;
    this.deaths = data.deaths;
    this.kdr = ratio(this.kills, this.deaths);
    this.assists = data.assists;
  }
}
