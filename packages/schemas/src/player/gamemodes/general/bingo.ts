/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Field } from "#metadata";
import type { APIData } from "@statsify/util";

export class BingoCasualEasy2025 {
  @Field({ leaderboard: { enabled: false } })
  public goldenSun: number;

  @Field({ leaderboard: { enabled: false } })
  public robinHood: number;

  @Field({ leaderboard: { enabled: false } })
  public ifYouGiveAHouseACookie: number;

  @Field({ leaderboard: { enabled: false } })
  public fallinPastTheFall: number;

  @Field({ leaderboard: { enabled: false } })
  public homeRun: number;

  @Field({ leaderboard: { enabled: false } })
  public podiumPosition: number;

  @Field({ leaderboard: { enabled: false } })
  public intermediateEggHunter: number;

  @Field({ leaderboard: { enabled: false } })
  public doomsdayPrep: number;

  @Field({ leaderboard: { enabled: false } })
  public iSurvivedAnniversaryBingo: number;

  @Field({ leaderboard: { enabled: false } })
  public aintNoTNTTag: number;

  @Field({ leaderboard: { enabled: false } })
  public intoTheLabyrinth: number;

  @Field({ leaderboard: { enabled: false } })
  public notQuiteADeadEnd: number;

  @Field({ leaderboard: { enabled: false } })
  public aPerfectMedium: number;

  @Field({ leaderboard: { enabled: false } })
  public theThing: number;

  @Field({ leaderboard: { enabled: false } })
  public oneWithTheFish: number;

  @Field({ leaderboard: { enabled: false } })
  public festiveSpirit: number;

  public constructor(data: APIData = {}) {
    this.goldenSun = data.Murdergoldensun;
    this.robinHood = data.Murderbowkill;
    this.ifYouGiveAHouseACookie = data.Housingcookie;
    this.fallinPastTheFall = data.Arcadedropperfallinpast;
    this.homeRun = data.Arcademanywinseasy;
    this.podiumPosition = data.Arcadetop3round;
    this.intermediateEggHunter = data.Arcadeintermediateegghunter;
    this.doomsdayPrep = data.Murdersurvivorwin;
    this.iSurvivedAnniversaryBingo = data.Disasterssurvive;
    this.aintNoTNTTag = data.Disasterspotato;
    this.intoTheLabyrinth = data.Arcadeintothelabyrinth;
    this.notQuiteADeadEnd = data.Arcadezombiesdoor;
    this.aPerfectMedium = data.Bbspeedmedium;
    this.theThing = data.Bbthething;
    this.oneWithTheFish = data.Maincatchfish;
    this.festiveSpirit = data.Bbvote;
  }
}

export class BingoPvPEasy2025 {
  @Field({ leaderboard: { enabled: false } })
  public treasureHunter: number;

  @Field({ leaderboard: { enabled: false } })
  public multifacetedKiller: number;

  @Field({ leaderboard: { enabled: false } })
  public sumoVictor: number;

  @Field({ leaderboard: { enabled: false } })
  public aLongWayDown: number;

  @Field({ leaderboard: { enabled: false } })
  public ironWall: number;

  @Field({ leaderboard: { enabled: false } })
  public swiftOfFoot: number;

  @Field({ leaderboard: { enabled: false } })
  public classicVictor: number;

  @Field({ leaderboard: { enabled: false } })
  public funWithFriends: number;

  @Field({ leaderboard: { enabled: false } })
  public suitUp: number;

  @Field({ leaderboard: { enabled: false } })
  public woolThatKills: number;

  @Field({ leaderboard: { enabled: false } })
  public crushingVictory: number;

  @Field({ leaderboard: { enabled: false } })
  public bedDestroyer: number;

  @Field({ leaderboard: { enabled: false } })
  public greenEyedMonster: number;

  @Field({ leaderboard: { enabled: false } })
  public littleShopOfTraps: number;

  @Field({ leaderboard: { enabled: false } })
  public infestation: number;

  @Field({ leaderboard: { enabled: false } })
  public andStayDown: number;

  public constructor(data: APIData = {}) {
    this.treasureHunter = data.Skywarsopenchests;
    this.multifacetedKiller = data.Duelseasykillsacrossmodes;
    this.sumoVictor = data.Duelssumowin;
    this.aLongWayDown = data.Skywarsvoidkill;
    this.ironWall = data.Skywarsironarmor;
    this.swiftOfFoot = data.Duelsparkour3rd;
    this.classicVictor = data.Duelsclassicwin;
    this.funWithFriends = data.Skywarsfunwithfriends;
    this.suitUp = data.Woolctwkit;
    this.woolThatKills = data.Woolsheepexplosion;
    this.crushingVictory = data.Wwflawless;
    this.bedDestroyer = data.Bedwarsnorest;
    this.greenEyedMonster = data.Bedwarsemerald;
    this.littleShopOfTraps = data.Bedwarsshopoftraps;
    this.infestation = data.Bedwarsbedbug;
    this.andStayDown = data.Bedwarsstaydead;
  }
}

export class BingoClassicEasy2025 {
  @Field({ leaderboard: { enabled: false } })
  public bloodthirsty: number;

  @Field({ leaderboard: { enabled: false } })
  public tooStronk: number;

  @Field({ leaderboard: { enabled: false } })
  public sunnyDelight: number;

  @Field({ leaderboard: { enabled: false } })
  public luckyLooter: number;

  @Field({ leaderboard: { enabled: false } })
  public revelingInTheSun: number;

  @Field({ leaderboard: { enabled: false } })
  public amateurWizard: number;

  @Field({ leaderboard: { enabled: false } })
  public notEnoughToGoAround: number;

  @Field({ leaderboard: { enabled: false } })
  public defusalVictor: number;

  @Field({ leaderboard: { enabled: false } })
  public ninjaVanish: number;

  @Field({ leaderboard: { enabled: false } })
  public quenchy: number;

  @Field({ leaderboard: { enabled: false } })
  public shutdown: number;

  @Field({ leaderboard: { enabled: false } })
  public slowingThemDown: number;

  @Field({ leaderboard: { enabled: false } })
  public witheringHeights: number;

  @Field({ leaderboard: { enabled: false } })
  public handOfTheKing: number;

  @Field({ leaderboard: { enabled: false } })
  public longNight: number;

  @Field({ leaderboard: { enabled: false } })
  public threeTimesTheFun: number;

  public constructor(data: APIData = {}) {
    this.bloodthirsty = data.Smashbloodthirsty;
    this.tooStronk = data.Smashthrowoff;
    this.sunnyDelight = data.Quakesunnydelight;
    this.luckyLooter = data.Tkrluckylooter;
    this.revelingInTheSun = data.Tntrevelingsun;
    this.amateurWizard = data.Wizardscapture;
    this.notEnoughToGoAround = data.Tntnotenough;
    this.defusalVictor = data.Cvcdefusalwin;
    this.ninjaVanish = data.Cvctrickortreat;
    this.quenchy = data.Blitzquenchy;
    this.shutdown = data.Blitzshutdown;
    this.slowingThemDown = data.Warlordsdamageflag;
    this.witheringHeights = data.Megawallswitheringheights;
    this.handOfTheKing = data.Megawallsdefense;
    this.longNight = data.Vampzlongnight;
    this.threeTimesTheFun = data.Paintballthreetimes;
  }
}

export class BingoCasualHard2025 {
  @Field({ leaderboard: { enabled: false } })
  public fastANDAccurate: number;

  @Field({ leaderboard: { enabled: false } })
  public scaryGood: number;

  @Field({ leaderboard: { enabled: false } })
  public lightningFast: number;

  @Field({ leaderboard: { enabled: false } })
  public freakyFalling: number;

  @Field({ leaderboard: { enabled: false } })
  public masterEggHunter: number;

  @Field({ leaderboard: { enabled: false } })
  public grandSlam: number;

  @Field({ leaderboard: { enabled: false } })
  public springParty: number;

  @Field({ leaderboard: { enabled: false } })
  public vacationFunds: number;

  @Field({ leaderboard: { enabled: false } })
  public caughtInTheAct: number;

  @Field({ leaderboard: { enabled: false } })
  public canTCatchMe: number;

  @Field({ leaderboard: { enabled: false } })
  public infectiousFun: number;

  @Field({ leaderboard: { enabled: false } })
  public untouchable2: number;

  @Field({ leaderboard: { enabled: false } })
  public untouchable1: number;

  @Field({ leaderboard: { enabled: false } })
  public junkHoarder: number;

  @Field({ leaderboard: { enabled: false } })
  public safeAndSound: number;

  @Field({ leaderboard: { enabled: false } })
  public slayinThroughTheEnd: number;

  public constructor(data: APIData = {}) {
    this.fastANDAccurate = data.Bbspeedfirst;
    this.scaryGood = data.Bbscarygood;
    this.lightningFast = data.Bbfastguess;
    this.freakyFalling = data.Arcadefreakyfalling;
    this.masterEggHunter = data.Arcademasteregghunter;
    this.grandSlam = data.Arcademanywins;
    this.springParty = data.Arcadespringparty;
    this.vacationFunds = data.Murdercollectgoldmultigame;
    this.caughtInTheAct = data.Murdercaughtintheact;
    this.canTCatchMe = data.Murdercantcatchme;
    this.infectiousFun = data.Murderinfectionstreak;
    this.untouchable2 = data.Disasterssurvivehard;
    this.untouchable1 = data.Disastersfullhealth;
    this.junkHoarder = data.Maincatchjunk;
    this.safeAndSound = data.Arcadezombies25;
    this.slayinThroughTheEnd = data.Arcadezombiesprison;
  }
}

export class BingoPvPHard2025 {
  @Field({ leaderboard: { enabled: false } })
  public cabinetOfSouls: number;

  @Field({ leaderboard: { enabled: false } })
  public anOffering: number;

  @Field({ leaderboard: { enabled: false } })
  public betterNerfThis: number;

  @Field({ leaderboard: { enabled: false } })
  public funInTheSun: number;

  @Field({ leaderboard: { enabled: false } })
  public renaissanceKiller: number;

  @Field({ leaderboard: { enabled: false } })
  public hardcoreChampion: number;

  @Field({ leaderboard: { enabled: false } })
  public cleanSheet: number;

  @Field({ leaderboard: { enabled: false } })
  public headInTheClouds: number;

  @Field({ leaderboard: { enabled: false } })
  public giveThatBack: number;

  @Field({ leaderboard: { enabled: false } })
  public notAChance: number;

  @Field({ leaderboard: { enabled: false } })
  public technicolorMurder: number;

  @Field({ leaderboard: { enabled: false } })
  public immortal: number;

  @Field({ leaderboard: { enabled: false } })
  public partySOver: number;

  @Field({ leaderboard: { enabled: false } })
  public oneForAll: number;

  @Field({ leaderboard: { enabled: false } })
  public cantStopTheCelebrations: number;

  @Field({ leaderboard: { enabled: false } })
  public finalDestination: number;

  public constructor(data: APIData = {}) {
    this.cabinetOfSouls = data.Skywarscabinetofsouls;
    this.anOffering = data.Swoffering;
    this.betterNerfThis = data.Skywarschallenge;
    this.funInTheSun = data.Skywarsfunsun;
    this.renaissanceKiller = data.Duelshardkillsacrossmodes;
    this.hardcoreChampion = data.Duelsuhcwins;
    this.cleanSheet = data.Duelsbridgeflawless;
    this.headInTheClouds = data.Duelsheadintheclouds;
    this.giveThatBack = data.Woolctwcarrier;
    this.notAChance = data.Wwnoenemywool;
    this.technicolorMurder = data.Wooltechnicolor;
    this.immortal = data.Bedwarsflawless;
    this.partySOver = data.Bedwarspartysover;
    this.oneForAll = data.Bedwarsoneforall;
    this.cantStopTheCelebrations = data.Bedwarscelebrations;
    this.finalDestination = data.Bedwarsfinaldestination;
  }
}

export class BingoClassicHard2025 {
  @Field({ leaderboard: { enabled: false } })
  public unlimitedPower: number;

  @Field({ leaderboard: { enabled: false } })
  public fromRichesToRags: number;

  @Field({ leaderboard: { enabled: false } })
  public deadlyDrifting: number;

  @Field({ leaderboard: { enabled: false } })
  public landslideVictory: number;

  @Field({ leaderboard: { enabled: false } })
  public undeath: number;

  @Field({ leaderboard: { enabled: false } })
  public anExerciseInRestraint: number;

  @Field({ leaderboard: { enabled: false } })
  public oneStepAbove: number;

  @Field({ leaderboard: { enabled: false } })
  public whatDoesTheRedWireDo: number;

  @Field({ leaderboard: { enabled: false } })
  public unassailable: number;

  @Field({ leaderboard: { enabled: false } })
  public aLoudSilence: number;

  @Field({ leaderboard: { enabled: false } })
  public multifaceted: number;

  @Field({ leaderboard: { enabled: false } })
  public oneLastChallenge: number;

  @Field({ leaderboard: { enabled: false } })
  public notSoClose: number;

  @Field({ leaderboard: { enabled: false } })
  public catchMeIfYouCan: number;

  @Field({ leaderboard: { enabled: false } })
  public snowbodySSafe: number;

  @Field({ leaderboard: { enabled: false } })
  public sharpenedDiamond: number;

  public constructor(data: APIData = {}) {
    this.unlimitedPower = data.Blitzstar;
    this.fromRichesToRags = data.Blitzdiamondarmorkill;
    this.deadlyDrifting = data.Tkrdeadlydrifting;
    this.landslideVictory = data.Wizardslandslide;
    this.undeath = data.Quakekillstreak;
    this.anExerciseInRestraint = data.Arenaexerciserestraint;
    this.oneStepAbove = data.Tntrunonestepabove;
    this.whatDoesTheRedWireDo = data.Cvcredwire;
    this.unassailable = data.Vampzsurvive;
    this.aLoudSilence = data.Paintballloudsilence;
    this.multifaceted = data.Cvcallaround;
    this.oneLastChallenge = data.Megawallsfinaldestination;
    this.notSoClose = data.Smashtwolives;
    this.catchMeIfYouCan = data.Warlordscapture;
    this.snowbodySSafe = data.Tntpvpholidaykills;
    this.sharpenedDiamond = data.Wallssharpeneddiamond;
  }
}

export class BingoEasy {
  @Field()
  public casual: BingoCasualEasy2025;

  @Field()
  public pvp: BingoPvPEasy2025;

  @Field()
  public classic: BingoClassicEasy2025;

  public constructor(data: APIData = {}) {
    this.casual = new BingoCasualEasy2025(data.casual_easy?.objectives);
    this.pvp = new BingoPvPEasy2025(data.pvp_easy?.objectives);
    this.classic = new BingoClassicEasy2025(data.classic_easy?.objectives);
  }
}

export class BingoHard {
  @Field()
  public casual: BingoCasualHard2025;

  @Field()
  public pvp: BingoPvPHard2025;

  @Field()
  public classic: BingoClassicHard2025;

  public constructor(data: APIData = {}) {
    this.casual = new BingoCasualHard2025(data.casual_hard?.objectives);
    this.pvp = new BingoPvPHard2025(data.pvp_hard?.objectives);
    this.classic = new BingoClassicHard2025(data.classic_hard?.objectives);
  }
}

export class Bingo {
  @Field()
  public easy: BingoEasy;

  @Field()
  public hard: BingoHard;

  @Field()
  public bucks: number;

  public constructor(data: APIData = {}) {
    this.easy = new BingoEasy(data.easter?.["2025"]?.bingo);
    this.hard = new BingoHard(data.easter?.["2025"]?.bingo);
    this.bucks = data.bingo?.bucks;
  }
}
