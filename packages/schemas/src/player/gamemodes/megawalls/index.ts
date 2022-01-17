import { ratio } from '@statsify/math';
import { APIData } from '@statsify/util';
import { Field } from '../../../decorators';

export class MegaWalls {
  @Field()
  public coins: number;

  @Field({ default: 'none' })
  public class: string;

  @Field({ default: 'none' })
  public warCry: string;

  @Field()
  public gamesPlayed: number;

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
  public assists: number;

  @Field()
  public kdr: number;

  @Field()
  public finalKills: number;

  @Field()
  public finalAssists: number;

  @Field()
  public finalDeaths: number;

  @Field()
  public fkdr: number;

  @Field()
  public witherDamage: number;

  @Field()
  public witherKills: number;

  public constructor(data: APIData) {
    this.coins = data.coins;
    this.class = data.chosen_class ?? 'none';
    this.warCry = data.war_cry ?? 'none';
    this.gamesPlayed = data.games_played;
    this.wins = data.wins;
    this.losses = data.losses;
    this.wlr = ratio(this.wins, this.losses);
    this.kills = data.kills;
    this.assists = data.assists;
    this.deaths = data.deaths;
    this.kdr = ratio(this.kills, this.deaths);
    this.finalKills = data.final_kills;
    this.finalAssists = data.final_assists;
    this.finalDeaths = data.final_deaths;
    this.fkdr = ratio(this.finalKills, this.finalDeaths);
    this.witherDamage = data.wither_damage;
    this.witherKills = data.wither_kills;
  }
}
