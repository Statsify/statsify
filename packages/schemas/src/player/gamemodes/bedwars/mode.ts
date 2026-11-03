/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Field } from "#metadata";
import { deepAdd, ratio } from "@statsify/math";
import type { APIData } from "@statsify/util";

export class BedWarsModeItemsCollected {
  @Field({ leaderboard: { limit: 100_000 } })
  public iron: number;

  @Field({ leaderboard: { limit: 100_000 } })
  public gold: number;

  @Field({ leaderboard: { limit: 100_000 } })
  public diamond: number;

  @Field({ leaderboard: { limit: 100_000 } })
  public emerald: number;

  public constructor(data: APIData, mode: string) {
    this.iron = data[`${mode}iron_resources_collected_bedwars`];
    this.gold = data[`${mode}gold_resources_collected_bedwars`];
    this.diamond = data[`${mode}diamond_resources_collected_bedwars`];
    this.emerald = data[`${mode}emerald_resources_collected_bedwars`];
  }
}

export class BedWarsMode {
  @Field({ historical: { enabled: false } })
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
      new BedWarsMode(data, `four_four_${mode}`),
    );

    BedWarsMode.applyRatios(stats);
    stats.winstreak = 0;
    return stats;
  }
}

export class BedWarsModeChallenges {
  @Field({ leaderboard: { enabled: false } })
  public uniqueChallenges?: number;

  @Field()
  public totalChallenges?: number;

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

  @Field({ leaderboard: { fieldName: "Ultimate UHC" } })
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

  @Field({ leaderboard: { fieldName: "Can't Touch This" } })
  public cantTouchThis: number;

  @Field()
  public woolWarrior: number;

  @Field()
  public anchor: number;

  @Field()
  public noDreaming: number;

  @Field()
  public quickMaths: number;

  @Field()
  public blockrepellentBeds: number;

  @Field()
  public midnight: number;

  @Field({ leaderboard: { fieldName: "Beds & Bloodlust" } })
  public bedsAndBloodlust: number;

  @Field({ leaderboard: { fieldName: "Beg & Barter" } })
  public begAndBarter: number;

  @Field({ leaderboard: { fieldName: "Halved & Doubled" } })
  public halvedAndDoubled: number;

  public constructor(data: APIData) {
    this.uniqueChallenges = data.bw_unique_challenges_completed;
    this.totalChallenges = data.total_challenges_completed;

    this.renegade = data.bw_challenge_no_team_upgrades;
    this.warmonger = data.bw_challenge_no_utilities;
    this.selfish = data.bw_challenge_selfish;
    this.minimumWage = data.bw_challenge_slow_generator;
    this.assassin = data.bw_challenge_assassin;
    this.regularShopper = data.bw_challenge_reset_armor;
    this.invisibleShop = data.bw_challenge_invisible_shop;
    this.collector = data.bw_challenge_collector;
    this.woodworker = data.bw_challenge_woodworker;
    this.bridgingForDummies = data.bw_challenge_sponge;
    this.toxicRain = data.bw_challenge_toxic_rain;
    this.defuser = data.bw_challenge_defuser;
    this.miningFatigue = data.bw_challenge_mining_fatigue;
    this.ultimateUHC = data.bw_challenge_no_healing;
    this.sleightOfHand = data.bw_challenge_hotbar;
    this.weightedItems = data.bw_challenge_weighted_items;
    this.socialDistancing = data.bw_challenge_knockback_stick_only;
    this.swordless = data.bw_challenge_no_swords;
    this.marksman = data.bw_challenge_archer_only;
    this.patriot = data.bw_challenge_patriot;
    this.stamina = data.bw_challenge_stamina;
    this.oldMan = data.bw_challenge_no_sprint;
    this.cappedResources = data.bw_challenge_capped_resources;
    this.redLightGreenLight = data.bw_challenge_stop_light;
    this.slowReflexes = data.bw_challenge_delayed_hitting;
    this.pacifist = data.bw_challenge_no_hitting;
    this.masterAssassin = data.bw_challenge_master_assassin;
    this.standingTall = data.bw_challenge_no_shift;
    this.protectThePresident = data.bw_challenge_protect_the_president;
    this.cantTouchThis = data.bw_challenge_cant_touch_this;

    // Challenges from Dreamfest update
    this.woolWarrior = data.bw_challenge_wool_warrior;
    this.anchor = data.bw_challenge_anchor;
    this.noDreaming = data.bw_challenge_no_dreaming;
    this.quickMaths = data.bw_challenge_quick_maths;
    this.blockrepellentBeds = data.bw_challenge_block_repellent_beds;

    // TODO(jacobk999): these fields are unconfirmed
    this.midnight = data.bw_challenge_midnight;
    this.bedsAndBloodlust = data.bw_challenge_beds_and_bloodlust;
    this.begAndBarter = data.bw_challenge_beg_and_barter;
    this.halvedAndDoubled = data.bw_challenge_halved_and_doubled;
  }
}
