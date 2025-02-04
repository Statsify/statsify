/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type APIData, formatRaceTime, formatTime } from "@statsify/util";
import {
  EasterSimulator,
  GrinchSimulator,
  HalloweenSimulator,
  ScubaSimulator,
} from "./seasonal-mode.js";
import { Field } from "#metadata";
import { add, deepAdd, deepSub, ratio, sub } from "@statsify/math";

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

export class CreeperAttack {
  @Field({ historical: { enabled: false } })
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

export class DropperMap {
  @Field()
  public completions: number;

  @Field({ leaderboard: { formatter: formatRaceTime, sort: "ASC" } })
  public bestTime: number;

  public constructor(map: APIData = {}) {
    this.bestTime = map.best_time;
    this.completions = map.completions;
  }
}

export class DropperMaps {
  @Field({ leaderboard: { name: "§cAtlantis§f" } })
  public atlantis: DropperMap;

  @Field({ leaderboard: { name: "§aBalloons§f" } })
  public balloons: DropperMap;

  @Field({ leaderboard: { name: "§aBBQ§f" } })
  public bbq: DropperMap;

  @Field({ leaderboard: { name: "§eBeanstalk§f" } })
  public beanstalk: DropperMap;

  @Field({ leaderboard: { name: "§cBirdcage§f" } })
  public birdcage: DropperMap;

  @Field({ leaderboard: { name: "§aBoard Games§f" } })
  public boardGames: DropperMap;

  @Field({ leaderboard: { name: "§aBridges§f" } })
  public bridges: DropperMap;

  @Field({ leaderboard: { name: "§eButterflies§f" } })
  public butterflies: DropperMap;

  @Field({ leaderboard: { name: "§eCabin§f" } })
  public cabin: DropperMap;

  @Field({ leaderboard: { name: "§eCastle§f" } })
  public castle: DropperMap;

  @Field({ leaderboard: { name: "§eCity§f" } })
  public city: DropperMap;

  @Field({ leaderboard: { name: "§aDistance§f" } })
  public distance: DropperMap;

  @Field({ leaderboard: { name: "§aDistortion§f" } })
  public distortion: DropperMap;

  @Field({ leaderboard: { name: "§aDrainage§f" } })
  public drainage: DropperMap;

  @Field({ leaderboard: { name: "§eEmoji§f" } })
  public emoji: DropperMap;

  @Field({ leaderboard: { name: "§cFactory§f" } })
  public factory: DropperMap;

  @Field({ leaderboard: { name: "§eFloating Islands§f" } })
  public floatingIslands: DropperMap;

  @Field({ leaderboard: { name: "§cFlytrap§f" } })
  public flytrap: DropperMap;

  @Field({ leaderboard: { name: "§cFrogspawn§f" } })
  public frogspawn: DropperMap;

  @Field({ leaderboard: { name: "§cGears§f" } })
  public gears: DropperMap;

  @Field({ leaderboard: { name: "§eGeometry§f" } })
  public geometry: DropperMap;

  @Field({ leaderboard: { name: "§eGlacier§f" } })
  public glacier: DropperMap;

  @Field({ leaderboard: { name: "§cHell Gate§f" } })
  public hellGate: DropperMap;

  @Field({ leaderboard: { name: "§cIllusion§f" } })
  public illusion: DropperMap;

  @Field({ leaderboard: { name: "§cIris§f" } })
  public iris: DropperMap;

  @Field({ leaderboard: { name: "§aKingdom Mines§f" } })
  public kingdomMines: DropperMap;

  @Field({ leaderboard: { name: "§aKing's Pass§f" } })
  public kingsPass: DropperMap;

  @Field({ leaderboard: { name: "§aKraken§f" } })
  public kraken: DropperMap;

  @Field({ leaderboard: { name: "§eLaunch Zone§f" } })
  public launchZone: DropperMap;

  @Field({ leaderboard: { name: "§eLavafall§f" } })
  public lavafall: DropperMap;

  @Field({ leaderboard: { name: "§aLily§f" } })
  public lily: DropperMap;

  @Field({ leaderboard: { name: "§eMaelstrom§f" } })
  public maelstrom: DropperMap;

  @Field({ leaderboard: { name: "§aMainframe§f" } })
  public mainframe: DropperMap;

  @Field({ leaderboard: { name: "§aMicroscope§f" } })
  public microscope: DropperMap;

  @Field({ leaderboard: { name: "§eMineshaft§f" } })
  public mineshaft: DropperMap;

  @Field({ leaderboard: { name: "§aMushroom§f" } })
  public mushroom: DropperMap;

  @Field({ leaderboard: { name: "§eNightlife§f" } })
  public nightlife: DropperMap;

  @Field({ leaderboard: { name: "§cOcean§f" } })
  public ocean: DropperMap;

  @Field({ leaderboard: { name: "§eOvergrown§f" } })
  public overgrown: DropperMap;

  @Field({ leaderboard: { name: "§ePainted§f" } })
  public painted: DropperMap;

  @Field({ leaderboard: { name: "§eParadigm§f" } })
  public paradigm: DropperMap;

  @Field({ leaderboard: { name: "§aRaindrops§f" } })
  public raindrops: DropperMap;

  @Field({ leaderboard: { name: "§eRavine§f" } })
  public ravine: DropperMap;

  @Field({ leaderboard: { name: "§eRetro§f" } })
  public retro: DropperMap;

  @Field({ leaderboard: { name: "§aRevolve§f" } })
  public revolve: DropperMap;

  @Field({ leaderboard: { name: "§cSandworm§f" } })
  public sandworm: DropperMap;

  @Field({ leaderboard: { name: "§aSewer§f" } })
  public sewer: DropperMap;

  @Field({ leaderboard: { name: "§aSpace§f" } })
  public space: DropperMap;

  @Field({ leaderboard: { name: "§eStratocumulus§f" } })
  public stratocumulus: DropperMap;

  @Field({ leaderboard: { name: "§eSweets§f" } })
  public sweets: DropperMap;

  @Field({ leaderboard: { name: "§aTangle§f" } })
  public tangle: DropperMap;

  @Field({ leaderboard: { name: "§aTime§f" } })
  public time: DropperMap;

  @Field({ leaderboard: { name: "§eUFO§f" } })
  public ufo: DropperMap;

  @Field({ leaderboard: { name: "§aUpside Down§f" } })
  public upsideDown: DropperMap;

  @Field({ leaderboard: { name: "§aVintage§f" } })
  public vintage: DropperMap;

  @Field({ leaderboard: { name: "§cVortex§f" } })
  public vortex: DropperMap;

  @Field({ leaderboard: { name: "§aWarp§f" } })
  public warp: DropperMap;

  @Field({ leaderboard: { name: "§eWarportal§f" } })
  public warportal: DropperMap;

  @Field({ leaderboard: { name: "§aWell§f" } })
  public well: DropperMap;

  @Field({ leaderboard: { name: "§eWestern§f" } })
  public western: DropperMap;

  public constructor(mapStats: APIData = {}) {
    this.atlantis = new DropperMap(mapStats?.atlantis);
    this.balloons = new DropperMap(mapStats?.balloons);
    this.bbq = new DropperMap(mapStats?.bbq);
    this.beanstalk = new DropperMap(mapStats?.beanstalk);
    this.birdcage = new DropperMap(mapStats?.birdcage);
    this.boardGames = new DropperMap(mapStats?.boardgames);
    this.bridges = new DropperMap(mapStats?.bridges);
    this.butterflies = new DropperMap(mapStats?.butterflies);
    this.cabin = new DropperMap(mapStats?.cabin);
    this.castle = new DropperMap(mapStats?.castle);
    this.city = new DropperMap(mapStats?.city);
    this.distance = new DropperMap(mapStats?.distance);
    this.distortion = new DropperMap(mapStats?.distortion);
    this.drainage = new DropperMap(mapStats?.drainage);
    this.emoji = new DropperMap(mapStats?.emoji);
    this.factory = new DropperMap(mapStats?.factory);
    this.floatingIslands = new DropperMap(mapStats?.floatingislands);
    this.flytrap = new DropperMap(mapStats?.flytrap);
    this.frogspawn = new DropperMap(mapStats?.frogspawn);
    this.gears = new DropperMap(mapStats?.gears);
    this.geometry = new DropperMap(mapStats?.geometry);
    this.glacier = new DropperMap(mapStats?.glacier);
    this.hellGate = new DropperMap(mapStats?.hellgate);
    this.illusion = new DropperMap(mapStats?.illusion);
    this.iris = new DropperMap(mapStats?.iris);
    this.kingdomMines = new DropperMap(mapStats?.kingdommines);
    this.kingsPass = new DropperMap(mapStats?.kingspass);
    this.kraken = new DropperMap(mapStats?.kraken);
    this.launchZone = new DropperMap(mapStats?.launchzone);
    this.lavafall = new DropperMap(mapStats?.lavafall);
    this.lily = new DropperMap(mapStats?.lily);
    this.maelstrom = new DropperMap(mapStats?.maelstrom);
    this.mainframe = new DropperMap(mapStats?.mainframe);
    this.microscope = new DropperMap(mapStats?.microscope);
    this.mineshaft = new DropperMap(mapStats?.mineshaft);
    this.mushroom = new DropperMap(mapStats?.mushroom);
    this.nightlife = new DropperMap(mapStats?.nightlife);
    this.ocean = new DropperMap(mapStats?.ocean);
    this.overgrown = new DropperMap(mapStats?.overgrown);
    this.painted = new DropperMap(mapStats?.painted);
    this.paradigm = new DropperMap(mapStats?.paradigm);
    this.raindrops = new DropperMap(mapStats?.raindrops);
    this.ravine = new DropperMap(mapStats?.ravine);
    this.retro = new DropperMap(mapStats?.retro);
    this.revolve = new DropperMap(mapStats?.revolve);
    this.sandworm = new DropperMap(mapStats?.sandworm);
    this.sewer = new DropperMap(mapStats?.sewer);
    this.space = new DropperMap(mapStats?.space);
    this.stratocumulus = new DropperMap(mapStats?.stratocumulus);
    this.sweets = new DropperMap(mapStats?.sweets);
    this.tangle = new DropperMap(mapStats?.tangle);
    this.time = new DropperMap(mapStats?.time);
    this.ufo = new DropperMap(mapStats?.ufo);
    this.upsideDown = new DropperMap(mapStats?.upsidedown);
    this.vintage = new DropperMap(mapStats?.vintage);
    this.vortex = new DropperMap(mapStats?.vortex);
    this.warp = new DropperMap(mapStats?.warp);
    this.warportal = new DropperMap(mapStats?.warportal);
    this.well = new DropperMap(mapStats?.well);
    this.western = new DropperMap(mapStats?.western);
  }
}

export class Dropper {
  @Field()
  public wins: number;

  @Field()
  public fails: number;

  @Field()
  public mapsCompleted: number;

  @Field()
  public gamesPlayed: number;

  @Field()
  public gamesFinished: number;

  @Field()
  public flawlessGames: number;

  @Field({ leaderboard: { formatter: formatTime, sort: "ASC" } })
  public bestTime: number;

  @Field({ leaderboard: { name: "Maps:" } })
  public maps: DropperMaps;

  public constructor(dropper: APIData = {}) {
    this.wins = dropper.wins;
    this.fails = dropper.fails;
    this.mapsCompleted = dropper.maps_completed;

    this.gamesPlayed = dropper.games_played;
    this.gamesFinished = dropper.games_finished;
    this.flawlessGames = dropper.flawless_games;
    this.bestTime = dropper.fastest_game;

    this.maps = new DropperMaps(dropper.map_stats);
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
    historical: {
      additionalFields: [],
    },
  })
  public wins: number;

  @Field()
  public wallsFaced: number;

  @Field({
    leaderboard: {
      name: "Highest Score - Qualifications",
      fieldName: "Qualifiers PB",
    },
    historical: { enabled: false },
  })
  public highestScoreQualifications: number;

  @Field({
    leaderboard: {
      name: "Highest Score - Finals",
      fieldName: "Finals PB",
    },
    historical: { enabled: false },
  })
  public highestScoreFinals: number;

  public constructor(data: APIData) {
    this.wins = data.wins_hole_in_the_wall;
    this.wallsFaced = data.rounds_hole_in_the_wall;
    this.highestScoreQualifications = data.hitw_record_q;
    this.highestScoreFinals = data.hitw_record_f;
  }
}

export class HypixelSaysMode {
  @Field()
  public points: number;

  @Field()
  public roundsWon: number;

  @Field({ leaderboard: { additionalFields: ["this.roundsWon", "this.points"] } })
  public wins: number;

  @Field({ historical: { enabled: false } })
  public maxScore: number;

  public constructor(data: APIData, mode: "simon" | "santa") {
    this.points = data[`rounds_${mode}_says`];
    this.roundsWon = data[`round_wins_${mode}_says`];
    this.wins = data[`wins_${mode}_says`];
    this.maxScore = data[`top_score_${mode}_says`] ?? 0;
  }
}

export class HypixelSays {
  @Field()
  public points: number;

  @Field()
  public roundsWon: number;

  @Field({ leaderboard: { additionalFields: ["this.roundsWon", "this.points"] } })
  public wins: number;

  @Field({ historical: { enabled: false } })
  public maxScore: number;

  @Field()
  public simonSays: HypixelSaysMode;

  @Field({ leaderboard: { enabled: false } })
  public santaSays: HypixelSaysMode;

  public constructor(data: APIData) {
    this.simonSays = new HypixelSaysMode(data, "simon");
    this.santaSays = new HypixelSaysMode(data, "santa");

    this.points = add(this.simonSays.points, this.santaSays.points);
    this.roundsWon = add(this.simonSays.roundsWon, this.santaSays.roundsWon);
    this.wins = add(this.simonSays.wins, this.santaSays.wins);
    this.maxScore = Math.max(
      this.simonSays.maxScore,
      this.santaSays.maxScore
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
  public avalancheWins: number;

  @Field()
  public bombardmentWins: number;

  @Field()
  public cannonPaintingWins: number;

  @Field()
  public chickenRingsWins: number;

  @Field()
  public diveWins: number;

  @Field()
  public fireLeapersWins: number;

  @Field()
  public frozenFloorWins: number;

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
  public pigFishingWins: number;

  @Field()
  public pigJoustingWins: number;

  @Field()
  public rpg16Wins: number;

  @Field()
  public shootingRangeWins: number;

  @Field()
  public spiderMazeWins: number;

  @Field()
  public superSheepWins: number;

  @Field()
  public theFloorIsLavaWins: number;

  @Field()
  public trampolinioWins: number;

  @Field()
  public volcanoWins: number;

  @Field()
  public workshopWins: number;

  // The goal of anvil spleef is to live the longest not the shortest so we sort in descending order
  @Field({ leaderboard: { formatter: formatRaceTime } })
  public anvilSpleefBestTime: number;

  @Field({ leaderboard: { formatter: formatRaceTime, sort: "ASC" } })
  public labEscapeBestTime: number;

  @Field({ leaderboard: { formatter: formatRaceTime, sort: "ASC" } })
  public jigsawRushBestTime: number;

  @Field({ leaderboard: { formatter: formatRaceTime, sort: "ASC" } })
  public theFloorIsLavaBestTime: number;

  @Field({ leaderboard: { formatter: formatRaceTime, sort: "ASC" } })
  public chickenRingsBestTime: number;

  @Field({ leaderboard: { formatter: formatRaceTime, sort: "ASC" } })
  public jungleJumpBestTime: number;

  // The goal of bombardment is to live the longest not the shortest so we sort in descending order
  @Field({ leaderboard: { formatter: formatRaceTime } })
  public bombardmentBestTime: number;

  @Field({ leaderboard: { formatter: formatRaceTime, sort: "ASC" } })
  public minecartRacingBestTime: number;

  @Field({ leaderboard: { formatter: formatRaceTime, sort: "ASC" } })
  public spiderMazeBestTime: number;

  @Field()
  public animalSlaughterBestScore: number;

  @Field()
  public diveBestScore: number;

  @Field()
  public highGroundBestScore: number;

  @Field()
  public hoeHoeHoeBestScore: number;

  @Field()
  public lawnMoowerBestScore: number;

  @Field()
  public rpg16BestScore: number;

  public constructor(data: APIData) {
    this.wins = add(data.wins_party, data.wins_party_2, data.wins_party_3);
    this.starsEarned = data.total_stars_party;
    this.roundsWon = data.round_wins_party;

    this.animalSlaughterWins = data?.animal_slaughter_round_wins_party;
    this.anvilSpleefWins = data?.anvil_spleef_round_wins_party;
    this.avalancheWins = data?.avalanche_round_wins_party;
    this.bombardmentWins = data?.bombardment_round_wins_party;
    this.cannonPaintingWins = data?.cannon_painting_round_wins_party;
    this.chickenRingsWins = data?.chicken_rings_round_wins_party;
    this.diveWins = data?.dive_round_wins_party;
    this.fireLeapersWins = data?.fire_leapers_round_wins_party;
    this.frozenFloorWins = data?.frozen_floor_round_wins_party;
    this.highGroundWins = data?.high_ground_round_wins_party;
    this.hoeHoeHoeWins = data?.hoe_hoe_hoe_round_wins_party;
    this.jigsawRushWins = data?.jigsaw_rush_round_wins_party;
    this.jungleJumpWins = data?.jungle_jump_round_wins_party;
    this.labEscapeWins = data?.lab_escape_round_wins_party;
    this.lawnMoowerWins = data?.lawn_moower_round_wins_party;
    this.minecartRacingWins = data?.minecart_racing_round_wins_party;
    this.pigFishingWins = data?.pig_fishing_round_wins_party;
    this.pigJoustingWins = data?.pig_jousting_round_wins_party;
    this.rpg16Wins = data?.rpg_16_round_wins_party;
    this.shootingRangeWins = data?.shooting_range_round_wins_party;
    this.spiderMazeWins = data?.spider_maze_round_wins_party;
    this.superSheepWins = data?.super_sheep_round_wins_party;
    this.theFloorIsLavaWins = data?.the_floor_is_lava_round_wins_party;
    this.trampolinioWins = data?.trampolinio_round_wins_party;
    this.volcanoWins = data?.volcano_round_wins_party;
    this.workshopWins = data?.workshop_round_wins_party;

    this.anvilSpleefBestTime = data?.anvil_spleef_best_time_party;
    this.labEscapeBestTime = data?.lab_escape_best_time_party;
    this.jigsawRushBestTime = data?.jigsaw_rush_best_time_party;
    this.theFloorIsLavaBestTime = data?.the_floor_is_lava_best_time_party;
    this.chickenRingsBestTime = data?.chicken_rings_best_time_party;
    this.jungleJumpBestTime = data?.jungle_jump_best_time_party;
    this.bombardmentBestTime = data?.bombardment_best_time_party;
    this.minecartRacingBestTime = data?.minecart_racing_best_time_party;
    this.spiderMazeBestTime = data?.spider_maze_best_time_party;

    this.animalSlaughterBestScore = data?.animal_slaughter_best_score_party;
    this.diveBestScore = data?.dive_best_score_party;
    this.highGroundBestScore = data?.high_ground_best_score_party;
    this.hoeHoeHoeBestScore = data?.hoe_hoe_hoe_best_score_party;
    this.lawnMoowerBestScore = data?.lawn_moower_mowed_best_score_party;
    this.rpg16BestScore = data?.rpg_16_kills_best_score_party;
  }
}

export class PixelPainters {
  @Field()
  public wins: number;

  public constructor(data: APIData) {
    this.wins = data.wins_draw_their_thing;
  }
}

export class PixelPartyMode {
  @Field()
  public wins: number;

  @Field()
  public gamesPlayed: number;

  @Field()
  public losses: number;

  @Field()
  public wlr: number;

  public constructor(data: APIData, mode?: string) {
    mode = mode ? `_${mode}` : "";

    this.wins = data.pixel_party?.[`wins${mode}`];
    this.gamesPlayed = data.pixel_party?.[`games_played${mode}`];
    this.losses = sub(this.gamesPlayed, this.wins);
    PixelPartyMode.applyRatios(this);
  }

  public static applyRatios(mode: PixelPartyMode) {
    mode.wlr = ratio(mode.wins, mode.losses);
  }
}

export class PixelParty {
  @Field()
  public overall: PixelPartyMode;

  @Field()
  public normal: PixelPartyMode;

  @Field()
  public hyper: PixelPartyMode;

  @Field()
  public roundsCompleted: number;

  @Field()
  public powerupsCollected: number;

  public constructor(data: APIData) {
    this.overall = new PixelPartyMode(data);
    this.hyper = new PixelPartyMode(data, "hyper");

    this.normal = deepSub(this.overall, this.hyper);
    PixelPartyMode.applyRatios(this.normal);

    this.roundsCompleted = data.pixel_party?.rounds_completed;
    this.powerupsCollected = data.pixel_party?.power_ups_collected;
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

export class ZombiesMapDifficulty {
  @Field({
    leaderboard: { additionalFields: ["this.fastestWin"] },
    historical: { enabled: false },
  })
  public wins: number;

  @Field({
    leaderboard: {
      sort: "ASC",
      formatter: formatTime,
      additionalFields: ["this.wins"],
    },
    historical: { enabled: false },
  })
  public fastestWin: number;

  @Field({ leaderboard: { enabled: false } })
  public kills: number;

  @Field({ leaderboard: { enabled: false } })
  public deaths: number;

  @Field({ leaderboard: { enabled: false } })
  public bestRound: number;

  @Field()
  public doorsOpened: number;

  @Field()
  public totalRounds: number;

  public constructor(data: APIData, map?: string, difficulty?: string) {
    const mode = map ? `_${map}${difficulty ? `_${difficulty}` : ""}` : "";

    this.wins = data[`wins_zombies${mode}`];
    this.fastestWin = (data[`fastest_time_30_zombies${mode}`] ?? 0) * 1000;
    this.kills = data[`zombie_kills_zombies${mode}`];
    this.deaths = data[`deaths_zombies${mode}`];
    this.bestRound = data[`best_round_zombies${mode}`];
    this.doorsOpened = data[`deaths_zombies${mode}`];
    this.totalRounds = data[`total_rounds_survived_zombies${mode}`];
  }
}

export class ZombiesMap {
  @Field()
  public normal: ZombiesMapDifficulty;

  @Field()
  public hard: ZombiesMapDifficulty;

  @Field()
  public rip: ZombiesMapDifficulty;

  @Field()
  public overall: ZombiesMapDifficulty;

  public constructor(data: APIData, map?: string) {
    this.normal = new ZombiesMapDifficulty(data, map, "normal");
    this.hard = new ZombiesMapDifficulty(data, map, "hard");
    this.rip = new ZombiesMapDifficulty(data, map, "rip");
    this.overall = new ZombiesMapDifficulty(data, map);

    this.overall.fastestWin = Math.min(
      this.normal.fastestWin || Number.MAX_SAFE_INTEGER,
      this.hard.fastestWin || Number.MAX_SAFE_INTEGER,
      this.rip.fastestWin || Number.MAX_SAFE_INTEGER
    );
    this.overall.fastestWin = this.overall.fastestWin === Number.MAX_SAFE_INTEGER ?
      0 :
      this.overall.fastestWin;
  }
}

export class Zombies {
  @Field()
  public overall: ZombiesMapDifficulty;

  @Field()
  public deadEnd: ZombiesMap;

  @Field()
  public badBlood: ZombiesMap;

  @Field()
  public alienArcadium: ZombiesMap;

  @Field()
  public prison: ZombiesMap;

  public constructor(data: APIData) {
    this.overall = new ZombiesMapDifficulty(data);
    this.deadEnd = new ZombiesMap(data, "deadend");
    this.badBlood = new ZombiesMap(data, "badblood");
    this.alienArcadium = new ZombiesMap(data, "alienarcadium");
    this.prison = new ZombiesMap(data, "prison");
  }
}
