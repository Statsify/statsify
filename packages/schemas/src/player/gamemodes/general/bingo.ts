/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Field } from "#metadata";
import type { APIData } from "@statsify/util";

export class BingoCasualEasy2026 {
  @Field({ leaderboard: { enabled: false } })
  public iSurvivedAnniversaryBingo: number;

  @Field({ leaderboard: { enabled: false } })
  public theEvilDead: number;

  @Field({ leaderboard: { enabled: false } })
  public festiveSpirit: number;

  @Field({ leaderboard: { enabled: false } })
  public goal: number;

  @Field({ leaderboard: { enabled: false } })
  public nailedIt: number;

  @Field({ leaderboard: { enabled: false } })
  public readyAim: number;

  @Field({ leaderboard: { enabled: false } })
  public ifYouGiveAHouseACookie: number;

  @Field({ leaderboard: { enabled: false } })
  public beginnerEggHunter: number;

  @Field({ leaderboard: { enabled: false } })
  public seasonalStar: number;

  @Field({ leaderboard: { enabled: false } })
  public oneWithTheFish: number;

  @Field({ leaderboard: { enabled: false } })
  public shoppingRun: number;

  @Field({ leaderboard: { enabled: false } })
  public goldenSun: number;

  @Field({ leaderboard: { enabled: false } })
  public readyOrNot: number;

  @Field({ leaderboard: { enabled: false } })
  public creepShow: number;

  @Field({ leaderboard: { enabled: false } })
  public theThing: number;

  @Field({ leaderboard: { enabled: false } })
  public homeRun: number;

  public constructor(data: APIData = {}) {
    this.iSurvivedAnniversaryBingo = data.Disasterssurvive;
    this.theEvilDead = data.Arcadeevildead;
    this.festiveSpirit = data.Bbvote;
    this.goal = data.Arcadefootballgoal;
    this.nailedIt = data.Bbguess;
    this.readyAim = data.Murderbowgold;
    this.ifYouGiveAHouseACookie = data.Housingcookie;
    this.beginnerEggHunter = data.Arcadebeginneregghunter;
    this.seasonalStar = data.Arcadeseasonalstar;
    this.oneWithTheFish = data.Maincatchfish;
    this.shoppingRun = data.Arcadeshoppingrun;
    this.goldenSun = data.Murdergoldensun;
    this.readyOrNot = data.Murderreadyornot;
    this.creepShow = data.Arcadecreepshow;
    this.theThing = data.Bbthething;
    this.homeRun = data.Arcademanywinseasy;
  }
}

export class BingoPvPEasy2026 {
  @Field({ leaderboard: { enabled: false } })
  public elfish: number;

  @Field({ leaderboard: { enabled: false } })
  public spleefVictor: number;

  @Field({ leaderboard: { enabled: false } })
  public willItHatch: number;

  @Field({ leaderboard: { enabled: false } })
  public bloodhound: number;

  @Field({ leaderboard: { enabled: false } })
  public quakeVictor: number;

  @Field({ leaderboard: { enabled: false } })
  public eatThis: number;

  @Field({ leaderboard: { enabled: false } })
  public suitUp: number;

  @Field({ leaderboard: { enabled: false } })
  public feelingLight: number;

  @Field({ leaderboard: { enabled: false } })
  public brightAndEarly: number;

  @Field({ leaderboard: { enabled: false } })
  public bloodHealing: number;

  @Field({ leaderboard: { enabled: false } })
  public aLongWayDown: number;

  @Field({ leaderboard: { enabled: false } })
  public shiny: number;

  @Field({ leaderboard: { enabled: false } })
  public flowingDefense: number;

  @Field({ leaderboard: { enabled: false } })
  public eggstraterrestrial: number;

  @Field({ leaderboard: { enabled: false } })
  public areaSecured: number;

  @Field({ leaderboard: { enabled: false } })
  public treasureHunter: number;

  public constructor(data: APIData = {}) {
    this.elfish = data.Skywarsholidayrefill;
    this.spleefVictor = data.Duelsspleefvictor;
    this.willItHatch = data.Bedwarswillithatch;
    this.bloodhound = data.Skywarsbloodhound;
    this.quakeVictor = data.Duelsquakevictor;
    this.eatThis = data.Bedwarseatthis;
    this.suitUp = data.Woolctwkit;
    this.feelingLight = data.Duelsboost;
    this.brightAndEarly = data.Skywarsbrightandearly;
    this.bloodHealing = data.Woolbloodhealing;
    this.aLongWayDown = data.Skywarsvoidkill;
    this.shiny = data.Bedwarsdiamond;
    this.flowingDefense = data.Bedwarsflowingdefense;
    this.eggstraterrestrial = data.Duelsfarmerkit;
    this.areaSecured = data.Wwplacewool;
    this.treasureHunter = data.Skywarsopenchests;
  }
}

export class BingoClassicEasy2026 {
  @Field({ leaderboard: { enabled: false } })
  public countingDown: number;

  @Field({ leaderboard: { enabled: false } })
  public aDashingFellow: number;

  @Field({ leaderboard: { enabled: false } })
  public itFollows: number;

  @Field({ leaderboard: { enabled: false } })
  public prepTime: number;

  @Field({ leaderboard: { enabled: false } })
  public poweringUp: number;

  @Field({ leaderboard: { enabled: false } })
  public braiiiins: number;

  @Field({ leaderboard: { enabled: false } })
  public explosiveEnding: number;

  @Field({ leaderboard: { enabled: false } })
  public freeFood: number;

  @Field({ leaderboard: { enabled: false } })
  public nowhereToHide: number;

  @Field({ leaderboard: { enabled: false } })
  public leafMeAlone: number;

  @Field({ leaderboard: { enabled: false } })
  public hotSpell: number;

  @Field({ leaderboard: { enabled: false } })
  public mutant: number;

  @Field({ leaderboard: { enabled: false } })
  public forTheTeam: number;

  @Field({ leaderboard: { enabled: false } })
  public witheringHeights: number;

  @Field({ leaderboard: { enabled: false } })
  public youreIt: number;

  @Field({ leaderboard: { enabled: false } })
  public tooStronk: number;

  public constructor(data: APIData = {}) {
    this.countingDown = data.Blitzcountingdown;
    this.aDashingFellow = data.Quakedash;
    this.itFollows = data.Tkritfollows;
    this.prepTime = data.Vampzprep;
    this.poweringUp = data.Pbpowerup;
    this.braiiiins = data.Cvcbrains;
    this.explosiveEnding = data.Cvcthrowprojectile;
    this.freeFood = data.Megawallsskywarsfreefood;
    this.nowhereToHide = data.Smashnowheretohide;
    this.leafMeAlone = data.Tntleafmealone;
    this.hotSpell = data.Warlordshotspell;
    this.mutant = data.Tntmutant;
    this.forTheTeam = data.Warlordsfortheteam;
    this.witheringHeights = data.Megawallswitheringheights;
    this.youreIt = data.Tnttagplayer;
    this.tooStronk = data.Smashthrowoff;
  }
}

export class BingoCasualHard2026 {
  @Field({ leaderboard: { enabled: false } })
  public deathDestructionDragons: number;

  @Field({ leaderboard: { enabled: false } })
  public thePurger: number;

  @Field({ leaderboard: { enabled: false } })
  public scaryGood: number;

  @Field({ leaderboard: { enabled: false } })
  public lifeOfTheParty: number;

  @Field({ leaderboard: { enabled: false } })
  public warmingUp: number;

  @Field({ leaderboard: { enabled: false } })
  public undisputedMasterpiece: number;

  @Field({ leaderboard: { enabled: false } })
  public caughtInTheAct: number;

  @Field({ leaderboard: { enabled: false } })
  public noHelpNeeded: number;

  @Field({ leaderboard: { enabled: false } })
  public bloodthirsty: number;

  @Field({ leaderboard: { enabled: false } })
  public heresSteve: number;

  @Field({ leaderboard: { enabled: false } })
  public shiny: number;

  @Field({ leaderboard: { enabled: false } })
  public fastAndAccurate: number;

  @Field({ leaderboard: { enabled: false } })
  public bossBuilder: number;

  @Field({ leaderboard: { enabled: false } })
  public vengeance: number;

  @Field({ leaderboard: { enabled: false } })
  public survivorStreak: number;

  @Field({ leaderboard: { enabled: false } })
  public moonlitEscape: number;

  public constructor(data: APIData = {}) {
    this.deathDestructionDragons = data.Arcadedragons;
    this.thePurger = data.Arcadepurger;
    this.scaryGood = data.Bbscarygood;
    this.lifeOfTheParty = data.Arcadepartystarswin;
    this.warmingUp = data.Arcadedropperwarmingup;
    this.undisputedMasterpiece = data.Bbtop3;
    this.caughtInTheAct = data.Murderkillmurdermultiple;
    this.noHelpNeeded = data.Arcadeenderspleef;
    this.bloodthirsty = data.Murderstreak;
    this.heresSteve = data.Arcadesteve;
    this.shiny = data.Mainraremythical;
    this.fastAndAccurate = data.Bbspeedfirst;
    this.bossBuilder = data.Buildbattlebossbuilder;
    this.vengeance = data.Murdervengeance;
    this.survivorStreak = data.Arcadesurvivorstreak;
    this.moonlitEscape = data.Arcademoonlitescape;
  }
}

export class BingoPvPHard2026 {
  @Field({ leaderboard: { enabled: false } })
  public sneaky: number;

  @Field({ leaderboard: { enabled: false } })
  public unmoving: number;

  @Field({ leaderboard: { enabled: false } })
  public technicolorMurder: number;

  @Field({ leaderboard: { enabled: false } })
  public cabinetOfSouls: number;

  @Field({ leaderboard: { enabled: false } })
  public cleanSheet: number;

  @Field({ leaderboard: { enabled: false } })
  public childsPlay: number;

  @Field({ leaderboard: { enabled: false } })
  public anOffering: number;

  @Field({ leaderboard: { enabled: false } })
  public giveThatBack: number;

  @Field({ leaderboard: { enabled: false } })
  public prizefighter: number;

  @Field({ leaderboard: { enabled: false } })
  public betterNerfThis: number;

  @Field({ leaderboard: { enabled: false } })
  public immortal: number;

  @Field({ leaderboard: { enabled: false } })
  public barbarian: number;

  @Field({ leaderboard: { enabled: false } })
  public betterWithBuds: number;

  @Field({ leaderboard: { enabled: false } })
  public renaissanceKiller: number;

  @Field({ leaderboard: { enabled: false } })
  public headInTheClouds: number;

  @Field({ leaderboard: { enabled: false } })
  public expensiveSlaying: number;

  public constructor(data: APIData = {}) {
    this.sneaky = data.Bedwarsinvisibility;
    this.unmoving = data.Woolunmoving;
    this.technicolorMurder = data.Wooltechnicolor;
    this.cabinetOfSouls = data.Skywarscabinetofsouls;
    this.cleanSheet = data.Duelsbridgeflawless;
    this.childsPlay = data.Bedwarschildsplay;
    this.anOffering = data.Swoffering;
    this.giveThatBack = data.Woolctwcarrier;
    this.prizefighter = data.Duelsprizefighter;
    this.betterNerfThis = data.Skywarschallenge;
    this.immortal = data.Bedwarsflawless;
    this.barbarian = data.Woolbarbarian;
    this.betterWithBuds = data.Skywarsbetterwithbuds;
    this.renaissanceKiller = data.Duelshardkillsacrossmodes;
    this.headInTheClouds = data.Duelsheadintheclouds;
    this.expensiveSlaying = data.Bedwarsdiamondsword;
  }
}

export class BingoClassicHard2026 {
  @Field({ leaderboard: { enabled: false } })
  public multifaceted: number;

  @Field({ leaderboard: { enabled: false } })
  public unlimitedPower: number;

  @Field({ leaderboard: { enabled: false } })
  public deathmatchMadness: number;

  @Field({ leaderboard: { enabled: false } })
  public theEndIsNigh: number;

  @Field({ leaderboard: { enabled: false } })
  public graveConsequences: number;

  @Field({ leaderboard: { enabled: false } })
  public springtimeShowcase: number;

  @Field({ leaderboard: { enabled: false } })
  public pursuit: number;

  @Field({ leaderboard: { enabled: false } })
  public triumphant: number;

  @Field({ leaderboard: { enabled: false } })
  public overkill: number;

  @Field({ leaderboard: { enabled: false } })
  public tilDeathDoUsPart: number;

  @Field({ leaderboard: { enabled: false } })
  public safetyIsAnIllusion: number;

  @Field({ leaderboard: { enabled: false } })
  public whatsDeadIsDead: number;

  @Field({ leaderboard: { enabled: false } })
  public allHallowsHavoc: number;

  @Field({ leaderboard: { enabled: false } })
  public notSoClose: number;

  @Field({ leaderboard: { enabled: false } })
  public catchMeIfYouCan: number;

  @Field({ leaderboard: { enabled: false } })
  public soulSiphoner: number;

  public constructor(data: APIData = {}) {
    this.multifaceted = data.Cvcallaround;
    this.unlimitedPower = data.Blitzstar;
    this.deathmatchMadness = data.Megawallsblitzdeathmatch;
    this.theEndIsNigh = data.Smashtheendisnigh;
    this.graveConsequences = data.Warlordsgraveconsequences;
    this.springtimeShowcase = data.Quakespringtimeshowcase;
    this.pursuit = data.Wallspursuit;
    this.triumphant = data.Tntspleeftriumphant;
    this.overkill = data.Pbnuke;
    this.tilDeathDoUsPart = data.Tnttagtildeath;
    this.safetyIsAnIllusion = data.Blitzsafetyisanillusion;
    this.whatsDeadIsDead = data.Megawallsfinal;
    this.allHallowsHavoc = data.Blitzallhallowshavoc;
    this.notSoClose = data.Smashtwolives;
    this.catchMeIfYouCan = data.Warlordscapture;
    this.soulSiphoner = data.Arenasoulsiphoner;
  }
}

export class BingoEasy {
  @Field()
  public casual: BingoCasualEasy2026;

  @Field()
  public pvp: BingoPvPEasy2026;

  @Field()
  public classic: BingoClassicEasy2026;

  public constructor(data: APIData = {}) {
    this.casual = new BingoCasualEasy2026(data.casual_easy?.objectives);
    this.pvp = new BingoPvPEasy2026(data.pvp_easy?.objectives);
    this.classic = new BingoClassicEasy2026(data.classic_easy?.objectives);
  }
}

export class BingoHard {
  @Field()
  public casual: BingoCasualHard2026;

  @Field()
  public pvp: BingoPvPHard2026;

  @Field()
  public classic: BingoClassicHard2026;

  public constructor(data: APIData = {}) {
    this.casual = new BingoCasualHard2026(data.casual_hard?.objectives);
    this.pvp = new BingoPvPHard2026(data.pvp_hard?.objectives);
    this.classic = new BingoClassicHard2026(data.classic_hard?.objectives);
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
    this.easy = new BingoEasy(data.easter?.["2026"]?.bingo);
    this.hard = new BingoHard(data.easter?.["2026"]?.bingo);
    this.bucks = data.bingo?.bucks;
  }
}
