import { deepAdd, ratio } from '@statsify/math';
import { APIData } from '@statsify/util';
import { Field } from '../../../decorators';

export class BedWarsModeItemsCollected {
  @Field()
  public iron: number;

  @Field()
  public gold: number;

  @Field()
  public diamond: number;

  @Field()
  public emerald: number;

  public constructor(data: APIData, mode: string) {
    this.iron = data[`${mode}iron_resources_collected_bedwars`];
    this.gold = data[`${mode}gold_resources_collected_bedwars`];
    this.diamond = data[`${mode}diamond_resources_collected_bedwars`];
    this.emerald = data[`${mode}emerald_resources_collected_bedwars`];
  }
}

export class BedWarsModeAverages {
  @Field({ leaderboard: false })
  public kills: number;

  @Field({ leaderboard: false })
  public finalKills: number;

  @Field({ leaderboard: false })
  public bedsBroken: number;

  public constructor(kills: number, finalKills: number, bedsBroken: number, gamesPlayed: number) {
    this.kills = ratio(kills, gamesPlayed);
    this.finalKills = ratio(finalKills, gamesPlayed);
    this.bedsBroken = ratio(bedsBroken, gamesPlayed);
  }
}

export class BedWarsMode {
  @Field()
  public winstreak: number;

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
  public kdr: number;

  @Field()
  public finalKills: number;

  @Field()
  public finalDeaths: number;

  @Field()
  public fkdr: number;

  @Field()
  public bedsBroken: number;

  @Field()
  public bedsLost: number;

  @Field()
  public bblr: number;

  @Field({ description: 'Average stat per gamesPlayed' })
  public averages: BedWarsModeAverages;

  @Field()
  public itemsCollected: BedWarsModeItemsCollected;

  public constructor(data: APIData, mode: string) {
    mode = mode ? `${mode}_` : mode;

    this.winstreak = data[`${mode}winstreak`];
    this.gamesPlayed = data[`${mode}games_played_bedwars`];
    this.kills = data[`${mode}kills_bedwars`];
    this.deaths = data[`${mode}deaths_bedwars`];
    this.wins = data[`${mode}wins_bedwars`];
    this.losses = data[`${mode}losses_bedwars`];
    this.finalKills = data[`${mode}final_kills_bedwars`];
    this.finalDeaths = data[`${mode}final_deaths_bedwars`];
    this.bedsBroken = data[`${mode}beds_broken_bedwars`];
    this.bedsLost = data[`${mode}beds_lost_bedwars`];

    this.itemsCollected = new BedWarsModeItemsCollected(data, mode);

    BedWarsMode.applyRatios(this);
  }

  public static applyRatios(data: BedWarsMode) {
    data.wlr = ratio(data.wins, data.losses);
    data.kdr = ratio(data.kills, data.deaths);
    data.fkdr = ratio(data.finalKills, data.finalDeaths);
    data.bblr = ratio(data.bedsBroken, data.bedsLost);

    data.averages = new BedWarsModeAverages(
      data.kills,
      data.finalKills,
      data.bedsBroken,
      data.gamesPlayed
    );
  }
}

export class DreamsBedWarsMode {
  @Field()
  public overall: BedWarsMode;

  @Field()
  public doubles: BedWarsMode;

  @Field()
  public fours: BedWarsMode;

  public constructor(data: APIData, mode: string) {
    this.doubles = new BedWarsMode(data, `eight_two_${mode}`);
    this.fours = new BedWarsMode(data, `four_four_${mode}`);
    this.overall = deepAdd(BedWarsMode, this.doubles, this.fours);
    BedWarsMode.applyRatios(this.overall);
  }
}

export class DreamsBedWars {
  @Field()
  public castle: BedWarsMode;

  @Field()
  public ultimate: DreamsBedWarsMode;

  @Field()
  public rush: DreamsBedWarsMode;

  @Field()
  public voidless: DreamsBedWarsMode;

  @Field()
  public lucky: DreamsBedWarsMode;

  @Field()
  public armed: DreamsBedWarsMode;

  @Field()
  public underworld: DreamsBedWarsMode;

  @Field()
  public swap: DreamsBedWarsMode;

  public constructor(data: APIData) {
    this.castle = new BedWarsMode(data, 'castle');
    this.ultimate = new DreamsBedWarsMode(data, 'ultimate');
    this.rush = new DreamsBedWarsMode(data, 'rush');
    this.voidless = new DreamsBedWarsMode(data, 'voidless');
    this.lucky = new DreamsBedWarsMode(data, 'lucky');
    this.armed = new DreamsBedWarsMode(data, 'armed');
    this.underworld = new DreamsBedWarsMode(data, 'underworld');
    this.swap = new DreamsBedWarsMode(data, 'swap');
  }
}
