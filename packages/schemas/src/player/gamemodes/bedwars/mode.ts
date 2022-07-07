/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData } from "@statsify/util";
import { Field } from "../../../metadata";
import { deepAdd, ratio } from "@statsify/math";

export class BedWarsModeItemsCollected {
  @Field({ leaderboard: { limit: 50_000 } })
  public iron: number;

  @Field({ leaderboard: { limit: 50_000 } })
  public gold: number;

  @Field({ leaderboard: { limit: 50_000 } })
  public diamond: number;

  @Field({ leaderboard: { limit: 50_000 } })
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

  @Field({})
  public wins: number;

  @Field({})
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
  }
}

export class DreamsBedWarsMode extends BedWarsMode {
  public static new(data: APIData, mode: string) {
    const stats = deepAdd(
      new BedWarsMode(data, `eight_two_${mode}`),
      new BedWarsMode(data, `four_four_${mode}`)
    );

    BedWarsMode.applyRatios(stats);
    stats.winstreak = 0;
    return stats;
  }
}

export class ChallengesBedWars {
  @Field({ leaderboard: { enabled: false } })
  public uniqueChallenges: number;

  @Field({ leaderboard: { limit: 1000 } })
  public totalChallenges: number;

  @Field({ leaderboard: { limit: 1000 } })
  public renegade: number;

  @Field({ leaderboard: { limit: 1000 } })
  public warmonger: number;

  @Field({ leaderboard: { limit: 1000 } })
  public selfish: number;

  @Field({ leaderboard: { limit: 1000 } })
  public minimumWage: number;

  @Field({ leaderboard: { limit: 1000 } })
  public assassin: number;

  @Field({ leaderboard: { limit: 1000 } })
  public regularShopper: number;

  @Field({ leaderboard: { limit: 1000 } })
  public invisibleShop: number;

  @Field({ leaderboard: { limit: 1000 } })
  public collector: number;

  @Field({ leaderboard: { limit: 1000 } })
  public woodworker: number;

  @Field({ leaderboard: { limit: 1000 } })
  public bridgingForDummies: number;

  @Field({ leaderboard: { limit: 1000 } })
  public toxicRain: number;

  @Field({ leaderboard: { limit: 1000 } })
  public defuser: number;

  @Field({ leaderboard: { limit: 1000 } })
  public miningFatigue: number;

  @Field({ leaderboard: { limit: 1000 } })
  public ultimateUHC: number;

  @Field({ leaderboard: { limit: 1000 } })
  public sleightOfHand: number;

  @Field({ leaderboard: { limit: 1000 } })
  public weightedItems: number;

  @Field({ leaderboard: { limit: 1000 } })
  public socialDistancing: number;

  @Field({ leaderboard: { limit: 1000 } })
  public swordless: number;

  @Field({ leaderboard: { limit: 1000 } })
  public marksman: number;

  @Field({ leaderboard: { limit: 1000 } })
  public patriot: number;

  @Field({ leaderboard: { limit: 1000 } })
  public stamina: number;

  @Field({ leaderboard: { limit: 1000 } })
  public oldMan: number;

  @Field({ leaderboard: { limit: 1000 } })
  public cappedResources: number;

  @Field({ leaderboard: { limit: 1000 } })
  public redLightGreenLight: number;

  @Field({ leaderboard: { limit: 1000 } })
  public slowReflexes: number;

  @Field({ leaderboard: { limit: 1000 } })
  public pacifist: number;

  @Field({ leaderboard: { limit: 1000 } })
  public masterAssassin: number;

  @Field({ leaderboard: { limit: 1000 } })
  public standingTall: number;

  @Field({ leaderboard: { limit: 1000 } })
  public protectThePresident: number;

  @Field({ leaderboard: { limit: 1000 } })
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
