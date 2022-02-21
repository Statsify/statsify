import { ratio } from '@statsify/math';
import { APIData } from '@statsify/util';
import { Field } from '../../../decorators';
import { MegaWallsKit } from './kit';

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

  @Field({ required: false })
  public arcanist?: MegaWallsKit;

  @Field({ required: false })
  public assassin?: MegaWallsKit;

  @Field({ required: false })
  public automaton?: MegaWallsKit;

  @Field({ required: false })
  public blaze?: MegaWallsKit;

  @Field({ required: false })
  public cow?: MegaWallsKit;

  @Field({ required: false })
  public creeper?: MegaWallsKit;

  @Field({ required: false })
  public dreadlord?: MegaWallsKit;

  @Field({ required: false })
  public enderman?: MegaWallsKit;

  @Field({ required: false })
  public golem?: MegaWallsKit;

  @Field({ required: false })
  public herobrine?: MegaWallsKit;

  @Field({ required: false })
  public hunter?: MegaWallsKit;

  @Field({ required: false })
  public moleman?: MegaWallsKit;

  @Field({ required: false })
  public phoenix?: MegaWallsKit;

  @Field({ required: false })
  public pigman?: MegaWallsKit;

  @Field({ required: false })
  public pirate?: MegaWallsKit;

  @Field({ required: false })
  public renegade?: MegaWallsKit;

  @Field({ required: false })
  public shaman?: MegaWallsKit;

  @Field({ required: false })
  public shark?: MegaWallsKit;

  @Field({ required: false })
  public skeleton?: MegaWallsKit;

  @Field({ required: false })
  public snowman?: MegaWallsKit;
  @Field({ required: false })
  public spider?: MegaWallsKit;

  @Field({ required: false })
  public squid?: MegaWallsKit;

  @Field({ required: false })
  public werewolf?: MegaWallsKit;

  @Field({ required: false })
  public zombie?: MegaWallsKit;

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

    this.arcanist = new MegaWallsKit(data, 'arcanist');
    this.assassin = new MegaWallsKit(data, 'assassin');
    this.automaton = new MegaWallsKit(data, 'automaton');
    this.blaze = new MegaWallsKit(data, 'blaze');
    this.cow = new MegaWallsKit(data, 'cow');
    this.creeper = new MegaWallsKit(data, 'creeper');
    this.dreadlord = new MegaWallsKit(data, 'dreadlord');
    this.enderman = new MegaWallsKit(data, 'enderman');
    this.golem = new MegaWallsKit(data, 'golem');
    this.herobrine = new MegaWallsKit(data, 'herobrine');
    this.hunter = new MegaWallsKit(data, 'hunter');
    this.moleman = new MegaWallsKit(data, 'moleman');
    this.phoenix = new MegaWallsKit(data, 'phoenix');
    this.pigman = new MegaWallsKit(data, 'pigman');
    this.pirate = new MegaWallsKit(data, 'pirate');
    this.renegade = new MegaWallsKit(data, 'renegade');
    this.shaman = new MegaWallsKit(data, 'shaman');
    this.shark = new MegaWallsKit(data, 'shark');
    this.skeleton = new MegaWallsKit(data, 'skeleton');
    this.snowman = new MegaWallsKit(data, 'snowman');
    this.spider = new MegaWallsKit(data, 'spider');
    this.squid = new MegaWallsKit(data, 'squid');
    this.werewolf = new MegaWallsKit(data, 'werewolf');
    this.zombie = new MegaWallsKit(data, 'zombie');
  }
}
