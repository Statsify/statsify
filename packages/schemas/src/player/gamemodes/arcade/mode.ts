import { add, deepAdd, ratio } from '@statsify/math';
import { APIData, formatTime } from '@statsify/util';
import { Field } from '../../../metadata';
import {
  EasterSimulator,
  GrinchSimulator,
  HalloweenSimulator,
  ScubaSimulator,
} from './seasonal-mode';

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

  public constructor(data: APIData) {
    this.wins = data.wins_dragonwars2;
    this.kills = data.kills_dragonwars2;
  }
}

export class EnderSpleef {
  @Field()
  public wins: number;

  @Field({ store: { default: 'none' } })
  public trail: string;

  @Field({ leaderboard: { enabled: false } })
  public powerupActivations: number;

  @Field({ leaderboard: { enabled: false } })
  public blocksBroken: number;

  public constructor(data: APIData) {
    this.wins = data.wins_ender;
    this.trail = data.enderspleef_trail || 'none';
    this.powerupActivations = data.powerup_activations_ender;
    this.blocksBroken = data.blocks_destroyed_ender;
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

  @Field({ leaderboard: { enabled: false } })
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
  @Field()
  public wins: number;

  @Field()
  public seekerWins: number;

  @Field()
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

  public constructor(data: APIData) {
    this.propHunt = new HideAndSeekMode(data, 'prop_hunt');
    this.partyPooper = new HideAndSeekMode(data, 'party_pooper');
    this.overall = deepAdd(this.propHunt, this.partyPooper);
  }
}

export class HoleInTheWall {
  @Field()
  public wins: number;

  @Field()
  public wallsFaced: number;

  @Field()
  public highestScoreQualifications: number;

  @Field()
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

  @Field()
  public wins: number;

  public constructor(data: APIData) {
    this.points = add(data.rounds_simon_says, data.rounds_santa_says);
    this.roundsWon = add(data.round_wins_simon_says, data.round_wins_santa_says);
    this.wins = add(data.wins_simon_says, data.wins_santa_says);
  }
}

export class MiniWalls {
  @Field({ store: { default: 'soldier' } })
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
    this.kit = data.miniwalls_activeKit || 'soldier';
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
  @Field()
  public wins: number;

  @Field()
  public starsEarned: number;

  @Field()
  public roundsWon: number;

  public constructor(data: APIData) {
    this.wins = add(data.wins_party, data.wins_party_2, data.wins_party_3);
    this.starsEarned = data.total_stars_party;
    this.roundsWon = data.round_wins_party;
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
  @Field()
  public wins: number;

  @Field({ leaderboard: { sort: 'ASC', formatter: formatTime } })
  public fastestWin: number;

  @Field({ leaderboard: { enabled: false } })
  public kills: number;

  @Field({ leaderboard: { enabled: false } })
  public deaths: number;

  @Field({ leaderboard: { enabled: false } })
  public bestRound: number;

  public constructor(data: APIData, map?: string) {
    map = map ? `_${map}` : '';

    this.wins = data[`wins_zombies${map}`];
    this.fastestWin = (data[`fastest_time_30_zombies${map ? `${map}_normal` : ''}`] ?? 0) * 1000;
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
    this.deadEnd = new ZombiesMap(data, 'deadend');
    this.badBlood = new ZombiesMap(data, 'badblood');
    this.alienArcadium = new ZombiesMap(data, 'alienarcadium');
  }
}
