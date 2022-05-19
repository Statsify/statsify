import { deepAdd, ratio } from '@statsify/math';
import { APIData } from '@statsify/util';
import { Field } from '../../../metadata';

export class BedWarsModeAverages {
  @Field({ leaderboard: { enabled: false } })
  public kills: number;

  @Field({ leaderboard: { enabled: false } })
  public finalKills: number;

  @Field({ leaderboard: { enabled: false } })
  public bedsBroken: number;

  public constructor(kills: number, finalKills: number, bedsBroken: number, gamesPlayed: number) {
    this.kills = ratio(kills, gamesPlayed);
    this.finalKills = ratio(finalKills, gamesPlayed);
    this.bedsBroken = ratio(bedsBroken, gamesPlayed);
  }
}
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

  @Field({ docs: { description: 'Average stat per gamesPlayed' } })
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
    this.overall = deepAdd(this.doubles, this.fours);
    BedWarsMode.applyRatios(this.overall);
  }
}

export class DreamsBedWars {
  @Field()
  public armed: DreamsBedWarsMode;

  @Field()
  public castle: BedWarsMode;

  @Field()
  public lucky: DreamsBedWarsMode;

  @Field()
  public rush: DreamsBedWarsMode;

  @Field()
  public swap: DreamsBedWarsMode;
  @Field()
  public ultimate: DreamsBedWarsMode;

  @Field()
  public underworld: DreamsBedWarsMode;

  @Field()
  public voidless: DreamsBedWarsMode;

  public constructor(data: APIData) {
    this.armed = new DreamsBedWarsMode(data, 'armed');
    this.castle = new BedWarsMode(data, 'castle');
    this.lucky = new DreamsBedWarsMode(data, 'lucky');
    this.rush = new DreamsBedWarsMode(data, 'rush');
    this.swap = new DreamsBedWarsMode(data, 'swap');
    this.ultimate = new DreamsBedWarsMode(data, 'ultimate');
    this.underworld = new DreamsBedWarsMode(data, 'underworld');
    this.voidless = new DreamsBedWarsMode(data, 'voidless');
  }
}

export class ChallengesBedWars {
  @Field({ leaderboard: { enabled: false } })
  public uniqueChallenges: number;

  @Field()
  public totalChallenges: number;

  @Field()
  public renegade: number;

  @Field()
  public warmonger: number;

  @Field()
  public selfish: number;

  @Field()
  public minimumWage: number;

  @Field()
  public assassin: number;

  @Field()
  public regularShopper: number;

  @Field()
  public invisibleShop: number;

  @Field()
  public collector: number;

  @Field()
  public woodworker: number;

  @Field()
  public bridgingForDummies: number;

  @Field()
  public toxicRain: number;

  @Field()
  public defuser: number;

  @Field()
  public miningFatigue: number;

  @Field()
  public ultimateUHC: number;

  @Field()
  public sleightOfHand: number;

  @Field()
  public weightedItems: number;

  @Field()
  public socialDistancing: number;

  @Field()
  public swordless: number;

  @Field()
  public marksman: number;

  @Field()
  public patriot: number;

  @Field()
  public stamina: number;

  @Field()
  public oldMan: number;

  @Field()
  public cappedResources: number;

  @Field()
  public redLightGreenLight: number;

  @Field()
  public slowReflexes: number;

  @Field()
  public pacifist: number;

  @Field()
  public masterAssassin: number;

  @Field()
  public standingTall: number;

  @Field()
  public protectThePresident: number;

  @Field()
  public cantTouchThis: number;
  public constructor(data: APIData) {
    this.uniqueChallenges = data.bw_unique_challenges_completed;
    this.totalChallenges = data.total_challenges_completed;

    this.renegade = data.bw_challenge_no_team_upgrades; // Renegade, #1
    this.warmonger = data.bw_challenge_no_utilities; // Warmonger, #2
    this.selfish = data.bw_challenge_selfish; // Selfish, #3
    this.minimumWage = data.bw_challenge_slow_generator; // Minimum Wage, #4
    this.assassin = data.bw_challenge_assassin; // Assassin, #5
    this.regularShopper = data.bw_challenge_reset_armor; // Regular Shopper, #6
    this.invisibleShop = data.bw_challenge_invisible_shop; // Invisible Shop, #7
    this.collector = data.bw_challenge_collector; // Collector, #8
    this.woodworker = data.bw_challenge_woodworker; // Woodworker, #9
    this.bridgingForDummies = data.bw_challenge_sponge; // Bridging for Dummies, #10
    this.toxicRain = data.bw_challenge_toxic_rain; // Toxic Rain, #11
    this.defuser = data.bw_challenge_defuser; // Defuser, #12
    this.miningFatigue = data.bw_challenge_mining_fatigue; // Mining Fatigue, #13
    this.ultimateUHC = data.bw_challenge_no_healing; // Ultimate UHC, #14
    this.sleightOfHand = data.bw_challenge_hotbar; // Sleight of Hand, #15
    this.weightedItems = data.bw_challenge_weighted_items; // Weighted Items, #16
    this.socialDistancing = data.bw_challenge_knockback_stick_only; // Social Distancing, #17
    this.swordless = data.bw_challenge_no_swords; // Swordless, #18
    this.marksman = data.bw_challenge_archer_only; // Marksman, #19
    this.patriot = data.bw_challenge_patriot; // Patriot, #20
    this.stamina = data.bw_challenge_stamina; // Stamina, #21
    this.oldMan = data.bw_challenge_no_sprint; // Old man, #22
    this.cappedResources = data.bw_challenge_capped_resources; // Capped resources, #23
    this.redLightGreenLight = data.bw_challenge_stop_light; // Red Light, Green Light, #24
    this.slowReflexes = data.bw_challenge_delayed_hitting; // Slow Reflexes, #25
    this.pacifist = data.bw_challenge_no_hitting; // Pacifist, #26
    this.masterAssassin = data.bw_challenge_master_assassin; // Master Assassin, #27
    this.standingTall = data.bw_challenge_no_shift; // Standing Tall, #28
    this.protectThePresident = data.bw_challenge_protect_the_president; // Protect the President, #29
    this.cantTouchThis = data.bw_challenge_cant_touch_this; // Can't touch this, #30
  }
}
