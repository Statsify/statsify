import { add, deepAdd, ratio } from '@statsify/math';
import { APIData } from '@statsify/util';
import { Field } from '../../../decorators';

export class MiniWalls {
  @Field()
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
  public arrowsShot: number;

  @Field()
  public arrowsHit: number;

  @Field()
  public bowAccuracy: number;

  @Field()
  public witherDamage: number;

  @Field()
  public witherKills: number;
  public constructor(data: APIData) {
    this.kit = data.miniwalls_activeKit || 'None';
    this.wins = data.wins_mini_walls;
    this.kills = data.kills_mini_walls;
    this.deaths = data.deaths_mini_walls;
    this.kdr = ratio(this.kills, this.deaths);
    this.arrowsShot = data.arrows_shot_mini_walls;
    this.arrowsHit = data.arrows_hit_mini_walls;
    this.bowAccuracy = ratio(this.arrowsHit, this.arrowsShot);
    this.finalKills = data.final_kills_mini_walls;
    this.witherDamage = data.wither_damage_mini_walls;
    this.witherKills = data.wither_kills_mini_walls;
  }
}

export class BountyHunters {
  @Field()
  public wins: number;

  @Field()
  public kills: number;

  @Field()
  public deaths: number;

  @Field()
  public kdr: number;

  @Field()
  public bountyKills: number;

  public constructor(data: APIData) {
    this.wins = data.wins_oneinthequiver;
    this.kills = data.kills_oneinthequiver;
    this.deaths = data.deaths_oneinthequiver;
    this.kdr = ratio(this.kills, this.deaths);
    this.bountyKills = data.bounty_kills_oneinthequiver;
  }
}

export class DragonWars {
  @Field()
  public wins: number;

  @Field()
  public kills: number;

  public constructor(data: APIData) {
    this.wins = data.wins_dragonwars2;
    this.kills = data.kills_dragonwars2;
  }
}

export class EnderSpleef {
  @Field()
  public wins: number;

  @Field({ default: 'none' })
  public trail: string;

  public constructor(data: APIData) {
    this.wins = data.wins_ender;
    this.trail = data.enderspleef_trail || 'none';
  }
}

export class FarmHunt {
  @Field()
  public wins: number;

  @Field()
  public poopCollected: number;

  public constructor(data: APIData) {
    this.wins = data.wins_farm_hunt;
    this.poopCollected = add(data.poop_collected, data.poop_collected_farm_hunt);
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

  @Field()
  public shotsFired: number;

  public constructor(data: APIData) {
    this.wins = data.sw_game_wins;
    this.kills = data.sw_kills;
    this.deaths = data.sw_deaths;
    this.kdr = ratio(this.kills, this.deaths);
    this.empireKills = data.sw_empire_kills;
    this.rebelKills = data.sw_rebel_kills;
    this.shotsFired = data.sw_shots_fired;
  }
}

export class HoleInTheWall {
  @Field()
  public wins: number;

  @Field()
  public gamesPlayed: number;

  @Field()
  public highestScoreQualifications: number;

  @Field()
  public highestScoreFinals: number;

  public constructor(data: APIData) {
    this.wins = data.wins_hole_in_the_wall;
    this.gamesPlayed = data.rounds_hole_in_the_wall;
    this.highestScoreQualifications = data.hitw_record_q;
    this.highestScoreFinals = data.hitw_record_f;
  }
}

export class HideAndSeekMode {
  @Field()
  public wins: number;

  @Field()
  public partyPooperWins: number;

  public constructor(data: APIData, mode: string) {
    this.wins = data[`${mode}_wins_hide_and_seek`];
    this.partyPooperWins = data[`party_pooper_${mode}_wins_hide_and_seek`];
  }
}

export class HideAndSeek {
  @Field()
  public overall: HideAndSeekMode;

  @Field()
  public seeker: HideAndSeekMode;

  @Field()
  public hider: HideAndSeekMode;

  public constructor(data: APIData) {
    this.seeker = new HideAndSeekMode(data, 'seeker');
    this.hider = new HideAndSeekMode(data, 'hider');
    this.overall = deepAdd(this.seeker, this.hider);
  }
}

export class HypixelSays {
  @Field()
  public gamesPlayed: number;

  @Field()
  public wins: number;

  public constructor(data: APIData) {
    this.gamesPlayed = add(data.rounds_simon_says, data.rounds_santa_says);
    this.wins = add(data.wins_simon_says, data.wins_santa_says);
  }
}

export class PartyGames {
  @Field()
  public wins: number;

  public constructor(data: APIData) {
    this.wins = add(data.wins_party, data.wins_party_2, data.wins_party_3);
  }
}

export class PixelPainters {
  @Field()
  public wins: number;

  public constructor(data: APIData) {
    this.wins = data.wins_draw_their_thing;
  }
}

export class ThrowOut {
  public wins: number;
  public kills: number;
  public deaths: number;
  public kdr: number;

  public constructor(data: APIData) {
    this.wins = data.wins_throw_out;
    this.kills = data.kills_throw_out;
    this.deaths = data.deaths_throw_out;
    this.kdr = ratio(this.kills, this.deaths);
  }
}

export class BlockingDead {
  @Field()
  public wins: number;

  @Field()
  public kills: number;

  @Field()
  public headshots: number;

  public constructor(data: APIData) {
    this.wins = data.wins_dayone;
    this.kills = data.kills_dayone;
    this.headshots = data.headshots_dayone;
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

export class Zombies {
  @Field()
  public downs: number;

  @Field()
  public playersRevived: number;

  @Field()
  public doorsOpened: number;

  @Field()
  public windowsRepaired: number;

  @Field()
  public kills: number;

  @Field()
  public deaths: number;

  @Field()
  public kdr: number;

  @Field({ leaderboard: false })
  public bestRound: number;

  @Field()
  public aliens: number;

  public constructor(data: APIData) {
    this.downs = data.times_knocked_down_zombies;
    this.playersRevived = data.players_revived_zombies;
    this.doorsOpened = data.doors_opened_zombies;
    this.windowsRepaired = data.windows_repaired_zombies;
    this.kills = data.zombie_kills_zombies;
    this.deaths = data.deaths_zombies;
    this.kdr = ratio(this.kills, this.deaths);
    this.bestRound = data.best_round_zombies;
    this.aliens = data.best_round_zombies_alienarcadium;
  }
}
