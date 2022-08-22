/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData, formatTime } from "@statsify/util";
import {
  EasterSimulator,
  GrinchSimulator,
  HalloweenSimulator,
  ScubaSimulator,
} from "./seasonal-mode";
import { Field } from "../../../metadata";
import { add, deepAdd, ratio } from "@statsify/math";

export class BlockingDead {
  @Field()
  public wins: number;

  @Field()
  public kills: number;

  @Field({ leaderboard: { enabled: false } })
  public headshots: number;

  public constructor(data: APIData) {
    this.wins = data.wins_dayone;
    this.kills = data.kills_dayone;
    this.headshots = data.headshots_dayone;
  }
}

export class BountyHunters {
  @Field()
  public wins: number;

  @Field()
  public kills: number;

  @Field()
  public bowKills: number;

  @Field()
  public swordKills: number;

  @Field()
  public deaths: number;

  @Field()
  public kdr: number;

  @Field()
  public bountyKills: number;

  public constructor(data: APIData) {
    this.wins = data.wins_oneinthequiver;
    this.kills = data.kills_oneinthequiver;
    this.bowKills = data.bow_kills_oneinthequiver;
    this.swordKills = data.sword_kills_oneinthequiver;
    this.deaths = data.deaths_oneinthequiver;
    this.kdr = ratio(this.kills, this.deaths);
    this.bountyKills = data.bounty_kills_oneinthequiver;
  }
}
export class CaptureTheWool {
  @Field()
  public kills: number;

  @Field()
  public captures: number;

  public constructor(ap: APIData) {
    this.kills = ap.arcade_ctw_slayer;
    this.captures = ap.arcade_ctw_oh_sheep;
  }
}

export class CreeperAttack {
  @Field()
  public maxWave: number;

  public constructor(data: APIData) {
    this.maxWave = data.max_wave;
  }
}

export class DragonWars {
  @Field()
  public wins: number;

  @Field()
  public kills: number;

  @Field()
  public mounts: number;

  public constructor(data: APIData, ap: APIData) {
    this.wins = data.wins_dragonwars2;
    this.kills = data.kills_dragonwars2;
    this.mounts = ap.arcade_dw_dragonborn;
  }
}

export class EnderSpleef {
  @Field()
  public wins: number;

  @Field({ store: { default: "none" } })
  public trail: string;

  @Field()
  public blocksBroken: number;

  @Field()
  public tripleShot: number;

  @Field()
  public bigShot: number;

  @Field({ leaderboard: { enabled: false } })
  public powerupActivations: number;

  public constructor(data: APIData) {
    this.wins = data.wins_ender;
    this.trail = data.enderspleef_trail || "none";
    this.blocksBroken = data.blocks_destroyed_ender;

    this.powerupActivations = data.powerup_activations_ender;
    this.bigShot = data.bigshot_powerup_activations_ender;
    this.tripleShot = data.tripleshot_powerup_activations_ender;
  }
}

export class FarmHunt {
  @Field()
  public wins: number;

  @Field()
  public animalWins: number;

  @Field()
  public hunterWins: number;

  @Field()
  public kills: number;

  @Field()
  public animalKills: number;

  @Field()
  public hunterKills: number;

  @Field()
  public tauntsUsed: number;

  @Field()
  public poopCollected: number;

  public constructor(data: APIData) {
    this.wins = data.wins_farm_hunt;
    this.animalWins = data.animal_wins_farm_hunt;
    this.hunterWins = data.hunter_wins_farm_hunt;
    this.kills = data.kills_farm_hunt;
    this.animalKills = data.animal_kills_farm_hunt;
    this.hunterKills = data.hunter_kills_farm_hunt;
    this.poopCollected = add(data.poop_collected, data.poop_collected_farm_hunt);
    this.tauntsUsed = data.taunts_used_farm_hunt;
  }
}

export class Football {
  @Field()
  public wins: number;

  @Field()
  public goals: number;

  @Field()
  public kicks: number;

  @Field()
  public powerKicks: number;

  public constructor(data: APIData) {
    this.wins = data.wins_soccer;
    this.goals = data.goals_soccer;
    this.kicks = data.kicks_soccer;
    this.powerKicks = data.powerkicks_soccer;
  }
}

export class GalaxyWars {
  @Field()
  public wins: number;

  @Field()
  public kills: number;

  @Field()
  public deaths: number;

  @Field()
  public kdr: number;

  @Field()
  public empireKills: number;

  @Field()
  public rebelKills: number;

  public constructor(data: APIData) {
    this.wins = data.sw_game_wins;
    this.kills = data.sw_kills;
    this.deaths = data.sw_deaths;
    this.kdr = ratio(this.kills, this.deaths);
    this.empireKills = data.sw_empire_kills;
    this.rebelKills = data.sw_rebel_kills;
  }
}

export class HideAndSeekMode {
  @Field({ leaderboard: { additionalFields: ["this.seekerWins", "this.hiderWins"] } })
  public wins: number;

  @Field({ leaderboard: { additionalFields: ["this.wins"] } })
  public seekerWins: number;

  @Field({ leaderboard: { additionalFields: ["this.wins"] } })
  public hiderWins: number;

  public constructor(data: APIData, mode: string) {
    this.seekerWins = data[`${mode}_seeker_wins_hide_and_seek`];
    this.hiderWins = data[`${mode}_hider_wins_hide_and_seek`];

    this.wins = add(this.seekerWins, this.hiderWins);
  }
}

export class HideAndSeek {
  @Field()
  public overall: HideAndSeekMode;

  @Field()
  public propHunt: HideAndSeekMode;

  @Field()
  public partyPooper: HideAndSeekMode;

  @Field()
  public kills: number;

  @Field()
  public objectivesCompleted: number;

  public constructor(data: APIData, ap: APIData) {
    this.propHunt = new HideAndSeekMode(data, "prop_hunt");
    this.partyPooper = new HideAndSeekMode(data, "party_pooper");
    this.overall = deepAdd(this.propHunt, this.partyPooper);

    this.kills = ap.arcade_hide_and_seek_hider_kills;
    this.objectivesCompleted = ap.arcade_hide_and_seek_master_hider;
  }
}

export class HoleInTheWall {
  @Field({
    leaderboard: {
      additionalFields: ["this.highestScoreQualifications", "this.highestScoreFinals"],
    },
  })
  public wins: number;

  @Field()
  public wallsFaced: number;

  @Field({
    leaderboard: { name: "Highest Score - Qualifications", fieldName: "Qualifiers PB" },
  })
  public highestScoreQualifications: number;

  @Field({
    leaderboard: { name: "Highest Score - Finals", fieldName: "Finals PB" },
  })
  public highestScoreFinals: number;

  public constructor(data: APIData) {
    this.wins = data.wins_hole_in_the_wall;
    this.wallsFaced = data.rounds_hole_in_the_wall;
    this.highestScoreQualifications = data.hitw_record_q;
    this.highestScoreFinals = data.hitw_record_f;
  }
}

export class HypixelSays {
  @Field()
  public points: number;

  @Field()
  public roundsWon: number;

  @Field({ leaderboard: { additionalFields: ["this.roundsWon", "this.points"] } })
  public wins: number;

  @Field()
  public maxScore: number;

  public constructor(data: APIData) {
    this.points = add(data.rounds_simon_says, data.rounds_santa_says);
    this.roundsWon = add(data.round_wins_simon_says, data.round_wins_santa_says);
    this.wins = add(data.wins_simon_says, data.wins_santa_says);
    this.maxScore = Math.max(
      data.top_score_simon_says ?? 0,
      data.top_score_santa_says ?? 0
    );
  }
}

export class MiniWalls {
  @Field({ store: { default: "soldier" } })
  public kit: string;

  @Field()
  public wins: number;

  @Field()
  public kills: number;

  @Field()
  public deaths: number;

  @Field()
  public kdr: number;

  @Field()
  public finalKills: number;

  @Field()
  public witherDamage: number;

  @Field()
  public witherKills: number;

  public constructor(data: APIData) {
    this.kit = data.miniwalls_activeKit || "soldier";
    this.wins = data.wins_mini_walls;
    this.kills = data.kills_mini_walls;
    this.deaths = data.deaths_mini_walls;
    this.kdr = ratio(this.kills, this.deaths);
    this.finalKills = data.final_kills_mini_walls;
    this.witherDamage = data.wither_damage_mini_walls;
    this.witherKills = data.wither_kills_mini_walls;
  }
}

export class PartyGames {
  @Field({ leaderboard: { additionalFields: ["this.roundsWon", "this.starsEarned"] } })
  public wins: number;

  @Field({ leaderboard: { additionalFields: ["this.roundsWon", "this.wins"] } })
  public starsEarned: number;

  @Field({ leaderboard: { additionalFields: ["this.starsEarned", "this.wins"] } })
  public roundsWon: number;

  @Field()
  public animalSlaughterWins: number;

  @Field()
  public anvilSpleefWins: number;

  @Field()
  public bombardmentWins: number;

  @Field()
  public chickenRingsWins: number;

  @Field()
  public diveWins: number;

  @Field()
  public highGroundWins: number;

  @Field()
  public hoeHoeHoeWins: number;

  @Field()
  public jigsawRushWins: number;

  @Field()
  public jungleJumpWins: number;

  @Field()
  public labEscapeWins: number;

  @Field()
  public lawnMoowerWins: number;

  @Field()
  public minecartRacingWins: number;

  @Field()
  public rpg16Wins: number;

  @Field()
  public spiderMazeWins: number;

  @Field()
  public theFloorIsLavaWins: number;

  @Field()
  public avalancheWins: number;

  @Field()
  public volcanoWins: number;

  @Field()
  public pigFishingWins: number;

  @Field()
  public trampolinioWins: number;

  @Field()
  public pigJoustingWins: number;

  @Field()
  public workshopWins: number;

  @Field()
  public shootingRangeWins: number;

  @Field()
  public frozenFloorWins: number;

  @Field()
  public cannonPaintingWins: number;

  @Field()
  public fireLeapersWins: number;

  @Field()
  public superSheepWins: number;

  public constructor(data: APIData) {
    this.wins = add(data.wins_party, data.wins_party_2, data.wins_party_3);
    this.starsEarned = data.total_stars_party;
    this.roundsWon = data.round_wins_party;

    this.animalSlaughterWins = data?.animal_slaughter_round_wins_party;

    this.anvilSpleefWins = data?.anvil_spleef_round_wins_party;

    this.bombardmentWins = data?.bombardment_round_wins_party;

    this.chickenRingsWins = data?.chicken_rings_round_wins_party;

    this.diveWins = data?.dive_round_wins_party;

    this.highGroundWins = data?.high_ground_round_wins_party;

    this.hoeHoeHoeWins = data?.hoe_hoe_hoe_round_wins_party;

    this.jungleJumpWins = data?.jungle_jump_round_wins_party;

    this.labEscapeWins = data?.lab_escape_round_wins_party;

    this.lawnMoowerWins = data?.lawn_moower_round_wins_party;

    this.minecartRacingWins = data?.minecart_racing_round_wins_party;

    this.rpg16Wins = data?.rpg_16_round_wins_party;

    this.spiderMazeWins = data?.spider_maze_round_wins_party;

    this.theFloorIsLavaWins = data?.the_floor_is_lava_round_wins_party;

    this.avalancheWins = data?.avalanche_round_wins_party;

    this.volcanoWins = data?.volcano_round_wins_party;

    this.pigFishingWins = data?.pig_fishing_round_wins_party;

    this.pigJoustingWins = data?.pig_jousting_round_wins_party;

    this.trampolinioWins = data?.trampolinio_round_wins_party;

    this.workshopWins = data?.workshop_round_wins_party;

    this.shootingRangeWins = data?.shooting_range_round_wins_party;

    this.frozenFloorWins = data?.frozen_floor_round_wins_party;

    this.cannonPaintingWins = data?.cannon_painting_round_wins_party;

    this.fireLeapersWins = data?.fire_leapers_round_wins_party;

    this.superSheepWins = data?.super_sheep_round_wins_party;
  }
}

export class PixelPainters {
  @Field()
  public wins: number;

  public constructor(data: APIData) {
    this.wins = data.wins_draw_their_thing;
  }
}
export class Seasonal {
  @Field()
  public totalWins: number;

  @Field()
  public easterSimulator: EasterSimulator;

  @Field()
  public grinchSimulator: GrinchSimulator;

  @Field()
  public halloweenSimulator: HalloweenSimulator;

  @Field()
  public scubaSimulator: ScubaSimulator;

  public constructor(data: APIData) {
    this.easterSimulator = new EasterSimulator(data);
    this.grinchSimulator = new GrinchSimulator(data);
    this.halloweenSimulator = new HalloweenSimulator(data);
    this.scubaSimulator = new ScubaSimulator(data);

    this.totalWins = add(
      this.easterSimulator.wins,
      this.grinchSimulator.wins,
      this.halloweenSimulator.wins,
      this.scubaSimulator.wins
    );
  }
}

export class ThrowOut {
  @Field()
  public wins: number;

  @Field()
  public kills: number;

  @Field()
  public deaths: number;

  @Field()
  public kdr: number;

  public constructor(data: APIData) {
    this.wins = data.wins_throw_out;
    this.kills = data.kills_throw_out;
    this.deaths = data.deaths_throw_out;
    this.kdr = ratio(this.kills, this.deaths);
  }
}

export class ZombiesMap {
  @Field({ leaderboard: { additionalFields: ["this.fastestWin"] } })
  public wins: number;

  @Field({
    leaderboard: { sort: "ASC", formatter: formatTime, additionalFields: ["this.wins"] },
  })
  public fastestWin: number;

  @Field({ leaderboard: { enabled: false } })
  public kills: number;

  @Field({ leaderboard: { enabled: false } })
  public deaths: number;

  @Field({ leaderboard: { enabled: false } })
  public bestRound: number;

  public constructor(data: APIData, map?: string) {
    map = map ? `_${map}` : "";

    this.wins = data[`wins_zombies${map}`];
    this.fastestWin =
      (data[`fastest_time_30_zombies${map ? `${map}_normal` : ""}`] ?? 0) * 1000;
    this.kills = data[`zombie_kills_zombies${map}`];
    this.deaths = data[`deaths_zombies${map}`];
    this.bestRound = data[`best_round_zombies${map}`];
  }
}

export class Zombies {
  @Field()
  public overall: ZombiesMap;

  @Field()
  public deadEnd: ZombiesMap;

  @Field()
  public badBlood: ZombiesMap;

  @Field()
  public alienArcadium: ZombiesMap;

  public constructor(data: APIData) {
    this.overall = new ZombiesMap(data);
    this.deadEnd = new ZombiesMap(data, "deadend");
    this.badBlood = new ZombiesMap(data, "badblood");
    this.alienArcadium = new ZombiesMap(data, "alienarcadium");
  }
}
