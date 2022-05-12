import { ratio } from '@statsify/math';
import { APIData } from '@statsify/util';
import { Field } from '../../../metadata';

export class WoolWarsClass {
  @Field()
  public wins: number;

  @Field()
  public gamesPlayed: number;

  @Field()
  public losses: number;

  @Field()
  public kills: number;

  @Field()
  public deaths: number;

  @Field()
  public kdr: number;

  @Field()
  public assists: number;

  @Field()
  public powerups: number;

  @Field()
  public blocksBroken: number;

  @Field()
  public woolPlaced: number;

  public constructor(data: APIData) {
    this.wins = data?.wins ?? 0;
    this.gamesPlayed = data?.games_played ?? 0;
    this.losses = this.gamesPlayed - this.wins;

    this.kills = data?.kills ?? 0;
    this.deaths = data?.deaths ?? 0;
    this.kdr = ratio(this.kills, this.deaths);

    this.assists = data?.assists ?? 0;

    this.powerups = data?.powerups_gotten ?? 0;
    this.blocksBroken = data?.blocks_broken ?? 0;
    this.woolPlaced = data?.wool_placed ?? 0;
  }
}

export class WoolWarsStats {
  @Field()
  public overall: WoolWarsClass;

  @Field()
  public tank: WoolWarsClass;

  @Field()
  public archer: WoolWarsClass;

  @Field()
  public builder: WoolWarsClass;

  @Field()
  public swordsman: WoolWarsClass;

  @Field()
  public engineer: WoolWarsClass;

  @Field()
  public golem: WoolWarsClass;

  @Field()
  public assault: WoolWarsClass;

  public constructor(data: APIData) {
    this.overall = new WoolWarsClass(data);

    this.tank = new WoolWarsClass(data?.classes?.tank);
    this.archer = new WoolWarsClass(data?.classes?.archer);
    this.builder = new WoolWarsClass(data?.classes?.builder);
    this.swordsman = new WoolWarsClass(data?.classes?.swordsman);
    this.engineer = new WoolWarsClass(data?.classes?.engineer);
    this.golem = new WoolWarsClass(data?.classes?.golem);
    this.assault = new WoolWarsClass(data?.classes?.assult);
  }
}
