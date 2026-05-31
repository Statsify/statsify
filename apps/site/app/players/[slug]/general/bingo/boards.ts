/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { Bingo } from "@statsify/schemas";

export type Difficulty = Exclude<keyof Bingo, "bucks">;
export type Category = keyof Bingo[Difficulty];

export type Reward = {
  name: string;
  description: string | string[];
};

export type Board<D extends Difficulty, C extends Category> = {
  diagonalRewards: [Reward, Reward];
  columnRewards: Reward[];
  rowRewards: Reward[];
  blackoutReward: Reward;
  tasks: Task<D, C>[];
  name: string;
};

export type Task<D extends Difficulty = Difficulty, C extends Category = Category> = {
  game: string;
  name: string;
  description: string;
  progress: number;
  field: keyof Bingo[D][C];
};

export const boards: { [D in Difficulty]: { [C in Category]: Board<D, C> } } = {
  easy: {
    casual: {
      name: "Casual",
      blackoutReward: {
        description: [
          "§8+§a§l4 §7Bingo Bucks",
          "§8+§650,000 §7Coins in All Minigames",
          "§8+§350,000§7 §7Hypixel Experience",
          "§8+§b150,000§7 §7Event Experience",
        ],
        name: "Blackout",
      },
      columnRewards: [
        {
          name: "Column One",
          description: "§8+§25,000 §7Build Battle Tokens",
        },
        {
          name: "Column Two",
          description: "§8+§350,000§7 §7Hypixel Experience",
        },
        {
          name: "Column Three",
          description: "§8+§25,000 §7Murder Mystery Tokens",
        },
        {
          name: "Column Four",
          description: "§8+§71 §62.0x §7Personal Coin Booster §7(§bTwo Hour§7)",
        },
      ],
      diagonalRewards: [
        {
          name: "Diagonal One",
          description: "§8+§610,000 §7Arcade Games Coins",
        },
        {
          name: "Diagonal Two",
          description: "§8+§25,000 §7Murder Mystery Tokens",
        },
      ],
      rowRewards: [
        {
          name: "Row One",
          description: "§8+§350,000§7 §7Hypixel Experience",
        },
        {
          name: "Row Two",
          description: "§8+§b150,000§7 §7Event Experience",
        },
        {
          name: "Row Three",
          description: "§8+§610,000 §7Arcade Games Coins",
        },
        {
          name: "Row Four",
          description: "§8+§e3 §dDaily Token",
        },
      ],
      tasks: [
        {
          name: "I Survived Anniversary Bingo",
          field: "iSurvivedAnniversaryBingo",
          game: "Arcade Games",
          description: "Survive 5 Disasters in games of Disasters in the Arcade Games",
          progress: 5,
        },
        {
          name: "The Evil Dead",
          field: "theEvilDead",
          game: "Arcade Games",
          description: "Kill 100 Zombies in games of The Blocking Dead in the Arcade Games",
          progress: 100,
        },
        {
          name: "Festive Spirit",
          field: "festiveSpirit",
          game: "Build Battle",
          description: 'Receive a "Good" or higher vote in a game of Build Battle',
          progress: 1,
        },
        {
          name: "GOAL!",
          field: "goal",
          game: "Arcade Games",
          description: "Score a goal in a game of Football in the Arcade Games",
          progress: 1,
        },
        {
          name: "NAILED IT!",
          field: "nailedIt",
          game: "Build Battle",
          description: "Guess a build correctly in the Guess the Build mode of Build Battle",
          progress: 1,
        },
        {
          name: "Ready, aim...",
          field: "readyAim",
          game: "Murder Mystery",
          description: "Obtain a bow as an Innocent by collecting gold in Murder Mystery",
          progress: 1,
        },
        {
          name: "If You Give A House A Cookie",
          field: "ifYouGiveAHouseACookie",
          game: "Housing",
          description: "Give Cookies to other players in Housing",
          progress: 5,
        },
        {
          name: "Beginner Egg Hunter",
          field: "beginnerEggHunter",
          game: "Arcade Games",
          description: "Find 10 eggs in a game of Easter Simulator in the Arcade Games",
          progress: 1,
        },
        {
          name: "Seasonal Star",
          field: "seasonalStar",
          game: "Arcade Games",
          description: "Finish a game of Hypixel Says in the Arcade Games with at least 10 points",
          progress: 1,
        },
        {
          name: "One With The Fish",
          field: "oneWithTheFish",
          game: "Main Lobby",
          description: "Catch 25 fish in the Main Lobby",
          progress: 25,
        },
        {
          name: "Shopping Run",
          field: "shoppingRun",
          game: "Arcade Games",
          description: "Buy 3 different items on the Melon Mall map in Disasters in the Arcade Games",
          progress: 1,
        },
        {
          name: "Golden Sun",
          field: "goldenSun",
          game: "Murder Mystery",
          description: "Collect 15 Gold in a game of Murder Mystery",
          progress: 1,
        },
        {
          name: "Ready or Not",
          field: "readyOrNot",
          game: "Murder Mystery",
          description: "Within 25 seconds of a Murder Mystery game, kill the Murderer or get a kill as the Murderer",
          progress: 1,
        },
        {
          name: "Creep Show",
          field: "creepShow",
          game: "Arcade Games",
          description: "Survive 30 rounds in games of Creeper Attack in the Arcade Games",
          progress: 30,
        },
        {
          name: "The Thing!",
          field: "theThing",
          game: "Build Battle",
          description: "Have 5 players correctly guess your build in a game of Guess the Build in Build Battle",
          progress: 1,
        },
        {
          name: "Home Run",
          field: "homeRun",
          game: "Arcade Games",
          description: "Win any 3 games in the Arcade Games",
          progress: 3,
        },
      ],
    },
    classic: {
      name: "Classic",
      blackoutReward: {
        description: [
          "§8+§a§l4 §7Bingo Bucks",
          "§8+§650,000 §7Coins in All Minigames",
          "§8+§350,000§7 §7Hypixel Experience",
          "§8+§b150,000§7 §7Event Experience",
        ],
        name: "Blackout",
      },
      columnRewards: [
        {
          name: "Column One",
          description: "§8+§65,000 §7Mega Walls Coins",
        },
        {
          name: "Column Two",
          description: "§8+§350,000§7 §7Hypixel Experience",
        },
        {
          name: "Column Three",
          description: "§8+§65,000 §7Cops and Crims Coins",
        },
        {
          name: "Column Four",
          description: "§8+§71 §62.0x §7Personal Coin Booster §7(§bTwo Hour§7)",
        },
      ],
      diagonalRewards: [
        {
          name: "Diagonal One",
          description: "§8+§65,000 §7VampireZ Coins",
        },
        {
          name: "Diagonal Two",
          description: "§8+§65,000 §7Smash Heroes Coins",
        },
      ],
      rowRewards: [
        {
          name: "Row One",
          description: "§8+§350,000§7 §7Hypixel Experience",
        },
        {
          name: "Row Two",
          description: "§8+§b150,000§7 §7Event Experience",
        },
        {
          name: "Row Three",
          description: "§8+§25,000 §7The TNT Games Tokens",
        },
        {
          name: "Row Four",
          description: "§8+§e3 §dDaily Token",
        },
      ],
      tasks: [
        {
          name: "Counting Down",
          field: "countingDown",
          game: "Blitz SG",
          description: "Kill a player within the first minute in a game of Blitz Survival Games",
          progress: 1,
        },
        {
          name: "A Dashing Fellow",
          field: "aDashingFellow",
          game: "Quakecraft",
          description: "Use your Dash ability in a game of Quakecraft in the Classic Games Lobby",
          progress: 1,
        },
        {
          name: "It Follows!",
          field: "itFollows",
          game: "Turbo Kart Racers",
          description: "Hit a player with a Red Missile in a game of Turbo Kart Racers in the Classic Lobby",
          progress: 1,
        },
        {
          name: "Prep Time",
          field: "prepTime",
          game: "VampireZ",
          description:
            "Purchase something from the in-game shop as a Survivor in a game of VampireZ in the Classic Games Lobby",
          progress: 1,
        },
        {
          name: "Powering Up",
          field: "poweringUp",
          game: "Paintball Warfare",
          description: "Activate a killstreak in a game of Paintball Warfare in the Classic Games Lobby",
          progress: 1,
        },
        {
          name: "BRAIIIINS",
          field: "braiiiins",
          game: "Cops and Crims",
          description: "Kill a player with a headshot in a game of Cops and Crims",
          progress: 1,
        },
        {
          name: "Explosive Ending",
          field: "explosiveEnding",
          game: "Cops and Crims",
          description: "Throw a grenade in a game of Cops and Crims  This cannot be completed in Challenge Mode",
          progress: 1,
        },
        {
          name: "Free Food",
          field: "freeFood",
          game: "Mega Walls",
          description: "Kill a player in a game of Mega Walls or SkyWars Solo Insane mode",
          progress: 1,
        },
        {
          name: "Nowhere to Hide",
          field: "nowhereToHide",
          game: "Smash Heroes",
          description: "Use your Smash Ability in a game of Smash Heroes",
          progress: 1,
        },
        {
          name: "Leaf Me Alone!",
          field: "leafMeAlone",
          game: "The TNT Games",
          description: "Damage other players 10 times in a single game of PVP Run in the TNT Games lobby",
          progress: 1,
        },
        {
          name: "Hot Spell",
          field: "hotSpell",
          game: "Warlords",
          description: "Kill an enemy while using the Pyromancer class in a game of Warlords",
          progress: 1,
        },
        {
          name: "Mutant",
          field: "mutant",
          game: "The TNT Games",
          description: "Pick up a powerup in a game of TNT Tag in the TNT Games Lobby",
          progress: 1,
        },
        {
          name: "For the Team!",
          field: "forTheTeam",
          game: "Warlords",
          description: "Get a kill in a game of Team Deathmatch in Warlords",
          progress: 1,
        },
        {
          name: "Withering Heights",
          field: "witheringHeights",
          game: "Mega Walls",
          description: "Damage a Wither in a game of Mega Walls",
          progress: 1,
        },
        {
          name: "You're It!",
          field: "youreIt",
          game: "The TNT Games",
          description: "Tag a player in a game of TNT Tag in the TNT Games Lobby",
          progress: 1,
        },
        {
          name: "TOO STRONK",
          field: "tooStronk",
          game: "Smash Heroes",
          description: "Throw a player off the map in a game of Smash Heroes",
          progress: 1,
        },
      ],
    },
    pvp: {
      name: "PvP",
      blackoutReward: {
        description: [
          "§8+§a§l4 §7Bingo Bucks",
          "§8+§650,000 §7Coins in All Minigames",
          "§8+§350,000§7 §7Hypixel Experience",
          "§8+§b150,000§7 §7Event Experience",
        ],
        name: "Blackout",
      },
      columnRewards: [
        {
          name: "Column One",
          description: "§8+§25,000 §7Bed Wars Tokens",
        },
        {
          name: "Column Two",
          description: "§8+§350,000§7 §7Hypixel Experience",
        },
        {
          name: "Column Three",
          description: "§8+§25,000 §7SkyWars Tokens",
        },
        {
          name: "Column Four",
          description: "§8+§71 §62.0x §7Personal Coin Booster §7(§bTwo Hour§7)",
        },
      ],
      diagonalRewards: [
        {
          name: "Diagonal One",
          description: "§8+§65,000 §7Wool Games Wool",
        },
        {
          name: "Diagonal Two",
          description: "§8+§25,000 §7Bed Wars Tokens",
        },
      ],
      rowRewards: [
        {
          name: "Row One",
          description: "§8+§350,000§7 §7Hypixel Experience",
        },
        {
          name: "Row Two",
          description: "§8+§b150,000§7 §7Event Experience",
        },
        {
          name: "Row Three",
          description: "§8+§25,000 §7Duels Tokens",
        },
        {
          name: "Row Four",
          description: "§8+§e3 §dDaily Token",
        },
      ],
      tasks: [
        {
          name: "Elfish",
          field: "elfish",
          game: "SkyWars",
          description: "Survive until chests refill in a game of SkyWars",
          progress: 1,
        },
        {
          name: "Spleef Victor",
          field: "spleefVictor",
          game: "Duels",
          description: "Win 2 game of Spleef Duels in the Duels Lobby",
          progress: 2,
        },
        {
          name: "Will It Hatch?",
          field: "willItHatch",
          game: "Bed Wars",
          description: "Purchase a Bridge Egg in a game of Bed Wars",
          progress: 1,
        },
        {
          name: "Bloodhound",
          field: "bloodhound",
          game: "SkyWars",
          description: "Get the first kill in a game of SkyWars",
          progress: 1,
        },
        {
          name: "Quake Victor",
          field: "quakeVictor",
          game: "Duels",
          description: "Win a game of Quakecraft Duels in the Duels Lobby",
          progress: 1,
        },
        {
          name: "Eat This!",
          field: "eatThis",
          game: "Bed Wars",
          description: "Place down TNT in a game of Bed Wars",
          progress: 1,
        },
        {
          name: "Suit Up!",
          field: "suitUp",
          game: "Wool Games",
          description: "Purchase a Kit in a game of Capture the Wool in the Wool Games Lobby",
          progress: 1,
        },
        {
          name: "Feeling Light",
          field: "feelingLight",
          game: "Duels",
          description: "Use your Boost Ability in a game of Parkour Duels in the Duels Lobby",
          progress: 1,
        },
        {
          name: "Bright and Early",
          field: "brightAndEarly",
          game: "SkyWars",
          description: "Kill a player within 10 seconds of a game of SkyWars starting",
          progress: 1,
        },
        {
          name: "Blood Healing",
          field: "bloodHealing",
          game: "Wool Games",
          description:
            "Use a Healing Sheep on a teammate with 5 or less hearts in a game of Sheep Wars in the Wool Games Lobby",
          progress: 1,
        },
        {
          name: "A Long Way Down...",
          field: "aLongWayDown",
          game: "SkyWars",
          description: "Knock 3 players into the void in a game of SkyWars",
          progress: 1,
        },
        {
          name: "Shiny!",
          field: "shiny",
          game: "Bed Wars",
          description: "Collect 4 diamonds from generators in a game of Bed Wars",
          progress: 1,
        },
        {
          name: "Flowing Defense",
          field: "flowingDefense",
          game: "Bed Wars",
          description: "Place a Water Bucket on your island in a game of Bed Wars",
          progress: 1,
        },
        {
          name: "Eggstraterrestrial",
          field: "eggstraterrestrial",
          game: "Duels",
          description: "Win a game of Blitz Duels in the Duels Lobby while using the Farmer Kit",
          progress: 1,
        },
        {
          name: "Area Secured",
          field: "areaSecured",
          game: "Wool Games",
          description: "Place wool in the center in a game of Wool Wars",
          progress: 1,
        },
        {
          name: "Treasure Hunter",
          field: "treasureHunter",
          game: "SkyWars",
          description: "Open 10 chests in games of SkyWars",
          progress: 10,
        },
      ],
    },
  },
  hard: {
    casual: {
      name: "Casual",
      blackoutReward: {
        description: [
          "§8+§a§l8 §7Bingo Bucks",
          "§8+§6100,000 §7Coins in All Minigames",
          "§8+§3250,000§7 §7Hypixel Experience",
          "§8+§b750,000§7 §7Event Experience",
        ],
        name: "Blackout",
      },
      columnRewards: [
        {
          name: "Column One",
          description: "§8+§225,000 §7Build Battle Tokens",
        },
        {
          name: "Column Two",
          description: "§8+§3150,000§7 §7Hypixel Experience",
        },
        {
          name: "Column Three",
          description: "§8+§225,000 §7Murder Mystery Tokens",
        },
        {
          name: "Column Four",
          description: "§8+§71 §64.0x §7Personal Coin Booster §7(§bOne Day§7)",
        },
      ],
      diagonalRewards: [
        {
          name: "Diagonal One",
          description: "§8+§650,000 §7Arcade Games Coins",
        },
        {
          name: "Diagonal Two",
          description: "§8+§225,000 §7Murder Mystery Tokens",
        },
      ],
      rowRewards: [
        {
          name: "Row One",
          description: "§8+§3150,000§7 §7Hypixel Experience",
        },
        {
          name: "Row Two",
          description: "§8+§b450,000§7 §7Event Experience",
        },
        {
          name: "Row Three",
          description: "§8+§650,000 §7Arcade Games Coins",
        },
        {
          name: "Row Four",
          description: "§8+§e10 §dDaily Token",
        },
      ],
      tasks: [
        {
          name: "Death, Destruction, Dragons!",
          field: "deathDestructionDragons",
          game: "Arcade Games",
          description: "Kill 3 players while on your Dragon in games of Dragon Wars in the Arcade Games",
          progress: 3,
        },
        {
          name: "The Purger",
          field: "thePurger",
          game: "Arcade Games",
          description: "Kill 3 players during a Purge in Disasters in the Arcade Games",
          progress: 1,
        },
        {
          name: "Scary Good",
          field: "scaryGood",
          game: "Build Battle",
          description: "Obtain 200 points in games of Build Battle",
          progress: 200,
        },
        {
          name: "Life of the Party",
          field: "lifeOfTheParty",
          game: "Arcade Games",
          description: "Win a game of Party Games in the Arcade Lobby with 15 or more stars",
          progress: 1,
        },
        {
          name: "Warming Up",
          field: "warmingUp",
          game: "Arcade Games",
          description: "Finish a game of Dropper in the Arcade Games with 5 fails or less",
          progress: 1,
        },
        {
          name: "Undisputed Masterpiece",
          field: "undisputedMasterpiece",
          game: "Build Battle",
          description: "Place in the top 3 in a game of Solo or Teams Build Battle",
          progress: 1,
        },
        {
          name: "Caught In The Act",
          field: "caughtInTheAct",
          game: "Murder Mystery",
          description: "Kill the Murderer 3 times in games of Murder Mystery",
          progress: 3,
        },
        {
          name: "No Help Needed",
          field: "noHelpNeeded",
          game: "Arcade Games",
          description: "Win a game of Ender Spleef in Arcade Games without using any powerups",
          progress: 1,
        },
        {
          name: "Bloodthirsty",
          field: "bloodthirsty",
          game: "Murder Mystery",
          description: "Kill 10 players as the Murderer in games of Murder Mystery",
          progress: 10,
        },
        {
          name: "Here's Steve!",
          field: "heresSteve",
          game: "Arcade Games",
          description: "Make it to the finals in a game of Hole in the Wall in the Arcade Games",
          progress: 1,
        },
        {
          name: "Shiny!",
          field: "shiny",
          game: "Main Lobby",
          description: "Catch a Rare or higher Mythical Fish in the Main Lobby",
          progress: 1,
        },
        {
          name: "Fast AND Accurate",
          field: "fastAndAccurate",
          game: "Build Battle",
          description: "Finish a build first in a game of Speed Builders in the Build Battle Lobby",
          progress: 1,
        },
        {
          name: "Boss Builder",
          field: "bossBuilder",
          game: "Build Battle",
          description: "Score 40 points in games of Build Battle: Guess the Build",
          progress: 40,
        },
        {
          name: "Vengeance",
          field: "vengeance",
          game: "Murder Mystery",
          description: "Kill the Murderer when there are less than 6 innocents alive in a game of Murder Mystery",
          progress: 1,
        },
        {
          name: "Survivor Streak",
          field: "survivorStreak",
          game: "Arcade Games",
          description: "Survive 4 games in a row of Disasters in the Arcade Games",
          progress: 4,
        },
        {
          name: "Moonlit Escape",
          field: "moonlitEscape",
          game: "Arcade Games",
          description: "Wear a full set of Diamond Armor on Zombies: Prison in the Arcade Games",
          progress: 1,
        },
      ],
    },
    classic: {
      name: "Classic",
      blackoutReward: {
        description: [
          "§8+§a§l8 §7Bingo Bucks",
          "§8+§6100,000 §7Coins in All Minigames",
          "§8+§3250,000§7 §7Hypixel Experience",
          "§8+§b875,000§7 §7Event Experience",
        ],
        name: "Blackout",
      },
      columnRewards: [
        {
          name: "Column One",
          description: "§8+§625,000 §7Mega Walls Coins",
        },
        {
          name: "Column Two",
          description: "§8+§3150,000§7 §7Hypixel Experience",
        },
        {
          name: "Column Three",
          description: "§8+§625,000 §7Cops and Crims Coins",
        },
        {
          name: "Column Four",
          description: "§8+§71 §64.0x §7Personal Coin Booster §7(§bOne Day§7)",
        },
      ],
      diagonalRewards: [
        {
          name: "Diagonal One",
          description: "§8+§625,000 §7Quakecraft Coins",
        },
        {
          name: "Diagonal Two",
          description: "§8+§625,000 §7Blitz SG Coins",
        },
      ],
      rowRewards: [
        {
          name: "Row One",
          description: "§8+§3150,000§7 §7Hypixel Experience",
        },
        {
          name: "Row Two",
          description: "§8+§b525,000§7 §7Event Experience",
        },
        {
          name: "Row Three",
          description: "§8+§225,000 §7The TNT Games Tokens",
        },
        {
          name: "Row Four",
          description: "§8+§e10 §dDaily Token",
        },
      ],
      tasks: [
        {
          name: "Multifaceted",
          field: "multifaceted",
          game: "Cops and Crims",
          description:
            "Get a kill with a gun, knife, and grenade in a game of Cops and Crims  This cannot be completed in Challenge Mode",
          progress: 1,
        },
        {
          name: "Unlimited Power",
          field: "unlimitedPower",
          game: "Blitz SG",
          description: "Find the Blitz Star in a game of Blitz Survival Games",
          progress: 1,
        },
        {
          name: "Deathmatch Madness",
          field: "deathmatchMadness",
          game: "Mega Walls",
          description: "Survive until deathmatch begins in a game of Mega Walls or Blitz Survival Games",
          progress: 1,
        },
        {
          name: "The End is Nigh",
          field: "theEndIsNigh",
          game: "Smash Heroes",
          description: "Pick up 2 Smash Crystals in a game of Smash Heroes",
          progress: 1,
        },
        {
          name: "Grave Consequences",
          field: "graveConsequences",
          game: "Warlords",
          description: "Kill an enemy carrying your flag in a game of Capture the Flag in Warlords",
          progress: 1,
        },
        {
          name: "Springtime Showcase",
          field: "springtimeShowcase",
          game: "Quakecraft",
          description: "Win a game of Quakecraft in the Classic Lobby",
          progress: 1,
        },
        {
          name: "Pursuit",
          field: "pursuit",
          game: "The Walls",
          description: "Kill a player with a bow and arrow in a game of The Walls in the Classic Lobby",
          progress: 1,
        },
        {
          name: "Triumphant",
          field: "triumphant",
          game: "The TNT Games",
          description: "Win a game of Bow Spleef in the TNT Games Lobby",
          progress: 1,
        },
        {
          name: "Overkill",
          field: "overkill",
          game: "Paintball Warfare",
          description: "Activate a Nuke in a game of Paintball Warfare in the Classic Games Lobby",
          progress: 1,
        },
        {
          name: "Til Death Do Us Part",
          field: "tilDeathDoUsPart",
          game: "The TNT Games",
          description: "Reach deathmatch in a game of TNT Tag in the TNT Games Lobby",
          progress: 1,
        },
        {
          name: "Safety is an Illusion",
          field: "safetyIsAnIllusion",
          game: "Blitz SG",
          description: "Kill the player who found the Blitz Star in a game of Blitz Survival Games",
          progress: 1,
        },
        {
          name: "What's Dead is Dead",
          field: "whatsDeadIsDead",
          game: "Mega Walls",
          description: "Get a final kill in a game of Mega Walls",
          progress: 1,
        },
        {
          name: "All Hallows' Havoc",
          field: "allHallowsHavoc",
          game: "Blitz SG",
          description: "Win a game of Blitz Survival Games with a Random Kit",
          progress: 1,
        },
        {
          name: "Not So Close",
          field: "notSoClose",
          game: "Smash Heroes",
          description: "Win a game of Smash Heroes with at least two lives remaining",
          progress: 1,
        },
        {
          name: "Catch Me If You Can",
          field: "catchMeIfYouCan",
          game: "Warlords",
          description: "Capture a flag in a game of Capture the Flag in Warlords",
          progress: 1,
        },
        {
          name: "Soul Siphoner",
          field: "soulSiphoner",
          game: "Arena Brawl",
          description: "Heal 1500 health in a single game of Arena Brawl in the Classic Lobby",
          progress: 1,
        },
      ],
    },
    pvp: {
      name: "PvP",
      blackoutReward: {
        description: [
          "§8+§a§l8 §7Bingo Bucks",
          "§8+§6100,000 §7Coins in All Minigames",
          "§8+§3250,000§7 §7Hypixel Experience",
          "§8+§b875,000§7 §7Event Experience",
        ],
        name: "Blackout",
      },
      columnRewards: [
        {
          name: "Column One",
          description: "§8+§225,000 §7Bed Wars Tokens",
        },
        {
          name: "Column Two",
          description: "§8+§3150,000§7 §7Hypixel Experience",
        },
        {
          name: "Column Three",
          description: "§8+§225,000 §7SkyWars Tokens",
        },
        {
          name: "Column Four",
          description: "§8+§71 §64.0x §7Personal Coin Booster §7(§bOne Day§7)",
        },
      ],
      diagonalRewards: [
        {
          name: "Diagonal One",
          description: "§8+§625,000 §7Wool Games Wool",
        },
        {
          name: "Diagonal Two",
          description: "§8+§225,000 §7Bed Wars Tokens",
        },
      ],
      rowRewards: [
        {
          name: "Row One",
          description: "§8+§3150,000§7 §7Hypixel Experience",
        },
        {
          name: "Row Two",
          description: "§8+§b525,000§7 §7Event Experience",
        },
        {
          name: "Row Three",
          description: "§8+§225,000 §7Duels Tokens",
        },
        {
          name: "Row Four",
          description: "§8+§e10 §dDaily Token",
        },
      ],
      tasks: [
        {
          name: "Sneaky",
          field: "sneaky",
          game: "Bed Wars",
          description: "Break a bed while you have Invisibility in a game of Bed Wars",
          progress: 1,
        },
        {
          name: "Unmoving",
          field: "unmoving",
          game: "Wool Games",
          description: "Win a game of Wool Wars without dying",
          progress: 1,
        },
        {
          name: "Technicolor Murder",
          field: "technicolorMurder",
          game: "Wool Games",
          description: "Win a game of Sheep Wars in the Wool Games Lobby after using one of every sheep",
          progress: 1,
        },
        {
          name: "Cabinet of Souls",
          field: "cabinetOfSouls",
          game: "SkyWars",
          description: "Kill 5 players in a Corrupted game of SkyWars",
          progress: 1,
        },
        {
          name: "Clean Sheet",
          field: "cleanSheet",
          game: "Duels",
          description: "Win a game of The Bridge in the Duels Lobby without the enemy team scoring.",
          progress: 1,
        },
        {
          name: "Child's Play",
          field: "childsPlay",
          game: "Bed Wars",
          description: "Win a game of Bed Wars with your entire team still alive",
          progress: 1,
        },
        {
          name: "An Offering",
          field: "anOffering",
          game: "SkyWars",
          description: "Win a game of SkyWars Solo with at least 5 kills",
          progress: 1,
        },
        {
          name: "Give That Back!",
          field: "giveThatBack",
          game: "Wool Games",
          description: "Kill a player carrying your team's wool in a game of Capture the Wool in the Wool Games Lobby",
          progress: 1,
        },
        {
          name: "Prizefighter",
          field: "prizefighter",
          game: "Duels",
          description: "Win a game of Boxing Duels in the Duels Lobby by more than 10 hits",
          progress: 1,
        },
        {
          name: "Better Nerf This",
          field: "betterNerfThis",
          game: "SkyWars",
          description: "Win a game of SkyWars with a challenge active",
          progress: 1,
        },
        {
          name: "Immortal",
          field: "immortal",
          game: "Bed Wars",
          description: "Win a game of Bed Wars without dying",
          progress: 1,
        },
        {
          name: "Barbarian!",
          field: "barbarian",
          game: "Wool Games",
          description: "Get 4 kills in a single round of Wool Wars",
          progress: 1,
        },
        {
          name: "Better with Buds",
          field: "betterWithBuds",
          game: "SkyWars",
          description: "Win a game of SkyWars Doubles",
          progress: 1,
        },
        {
          name: "Renaissance Killer",
          field: "renaissanceKiller",
          game: "Duels",
          description: "Kill 25 players in games of Duels",
          progress: 25,
        },
        {
          name: "Head in the Clouds",
          field: "headInTheClouds",
          game: "Duels",
          description: "Finish 1st in a game of Parkour Duels in the Duels Lobby",
          progress: 1,
        },
        {
          name: "Expensive Slaying",
          field: "expensiveSlaying",
          game: "Bed Wars",
          description: "Kill a player with a diamond sword in Bed Wars",
          progress: 1,
        },
      ],
    },
  },
};
