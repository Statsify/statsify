/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { Bingo } from "@statsify/schemas";

export type Difficulty = keyof Bingo;
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
      blackoutReward: {
        description: [
          "§8+§a§l4§r §7Bingo Bucks§r",
          "§8+§650,000 §7Coins in All Minigames§r",
          "§8+§350,000 §7Hypixel Experience§r",
          "§8+§b175,000 §7Event Experience§r",
        ],
        name: "Blackout",
      },
      columnRewards: [
        {
          description: "§8+§25,000 §7Build Battle Tokens§r",
          name: "Column One",
        },
        {
          description: "§8+§350,000 §7Hypixel Experience§r",
          name: "Column Two",
        },
        {
          description: "§8+§25,000 §7Murder Mystery Tokens§r",
          name: "Column Three",
        },
        {
          description: "§8+§71§6 2.0x §7Personal Coin Booster (§bTwo Hour§7)§r",
          name: "Column Four",
        },
      ],
      diagonalRewards: [
        {
          description: "§8+§610,000 §7Arcade Games Coins§r",
          name: "Diagonal One",
        },
        {
          description: "§8+§25,000 §7Murder Mystery Tokens§r",
          name: "Digaonal Two",
        },
      ],
      rowRewards: [
        {
          description: "§8+§350,000 §7Hypixel Experience§r",
          name: "Row One",
        },
        {
          description: "§8+§b175,000 §7Event Experience§r",
          name: "Row Two",
        },
        {
          description: "§8+§610,000 §7Arcade Games Coins§r",
          name: "Row Three",
        },
        {
          description: "§8+§e3 §dDaily Reward Token§r",
          name: "Row Four",
        },
      ],
      tasks: [
        {
          description: "Kill a player with a bow shot in a game of Murder Mystery",
          field: "robinHood",
          game: "Murder Mystery",
          name: "Robin Hood",
          progress: 1,
        },
        {
          description: "Catch 25 fish in the Main Lobby",
          field: "oneWithTheFish",
          game: "Main Lobby",
          name: "One With The Fish",
          progress: 25,
        },
        {
          description: "Survive 5 Disasters in games of Disasters in the Prototype Lobby",
          field: "iSurvivedAnniversaryBingo",
          game: "Prototype",
          name: "I Survived Anniversary Bingo",
          progress: 5,
        },
        {
          description: "Win any 3 games in the Arcade Games Lobby",
          field: "homeRun",
          game: "Arcade Games",
          name: "Home Run",
          progress: 3,
        },
        {
          description: "Reach the middle of the Spider Maze in a round of Party Games in the Arcade Games",
          field: "intoTheLabyrinth",
          game: "Arcade Games",
          name: "Into the Labyrinth",
          progress: 1,
        },
        {
          description: "Finish a MEDIUM build with 100% accuracy in a game of Speed Builders in the Build Battle Lobby",
          field: "aPerfectMedium",
          game: "Build Battle",
          name: "A Perfect Medium",
          progress: 1,
        },
        {
          description: "Complete all 5 maps in a game of Dropper in the Arcade Lobby",
          field: "fallinPastTheFall",
          game: "Arcade Games",
          name: "Fallin' Past the Fall",
          progress: 1,
        },
        {
          description: "Open up a new location in a game of Zombies in Arcade Games",
          field: "notQuiteADeadEnd",
          game: "Arcade Games",
          name: "Not Quite a Dead End",
          progress: 1,
        },
        {
          description: "Receive a \"Good\" or higher vote in a game of Build Battle",
          field: "festiveSpirit",
          game: "Build Battle",
          name: "Festive Spirit",
          progress: 1,
        },
        {
          description: "Find 25 eggs in a game of Easter Simulator in the Arcade Lobby",
          field: "intermediateEggHunter",
          game: "Arcade Games",
          name: "Intermediate Egg Hunter",
          progress: 25,
        },
        {
          description: "Give Cookies to other players in Housing",
          field: "ifYouGiveAHouseACookie",
          game: "Housing",
          name: "If You Give A House A Cookie",
          progress: 5,
        },
        {
          description: "Pass the Hot Potato to another player in a game of Disasters in the Prototype Lobby",
          field: "aintNoTNTTag",
          game: "Prototype",
          name: "Ain't No TNT Tag",
          progress: 1,
        },
        {
          description: "Finish in the top 3 for one round of Party Games in Arcade Games",
          field: "podiumPosition",
          game: "Arcade Games",
          name: "Podium Position",
          progress: 1,
        },
        {
          description: "Collect 15 Gold in a game of Murder Mystery",
          field: "goldenSun",
          game: "Murder Mystery",
          name: "Golden Sun",
          progress: 15,
        },
        {
          description: "Have 5 players correctly guess your build in a game of Guess the Build in Build Battle",
          field: "theThing",
          game: "Build Battle",
          name: "The Thing!",
          progress: 5,
        },
        {
          description: "Win a game of Murder Mystery: Infection as a Survivor",
          field: "doomsdayPrep",
          game: "Murder Mystery",
          name: "Doomsday Prep",
          progress: 1,
        },
      ],
    },
    classic: {
      blackoutReward: {
        description: [
          "§8+§a§l4§r §7Bingo Bucks§r",
          "§8+§650,000 §7Coins in All Minigames§r",
          "§8+§350,000§7 §7Hypixel Experience§r",
          "§8+§b175,000§7 §7Event Experience",
        ],
        name: "Blackout",
      },
      columnRewards: [
        {
          description: "§8+§65,000 §7Mega Walls Coins§r",
          name: "Column One",
        },
        {
          description: "§8+§350,000§7 §7Hypixel Experience§r",
          name: "Column Two",
        },
        {
          description: "§8+§65,000 §7Cops and Crims Coins§r",
          name: "Column Three",
        },
        {
          description: "§8+§71 §62.0x §7Personal Coin Booster §7(§bTwo Hour§7)§r",
          name: "Column Four",
        },
      ],
      diagonalRewards: [
        {
          description: "§8+§65,000 §7VampireZ Coins§r",
          name: "Diagonal One",
        },
        {
          description: "§8+§65,000 §7Smash Heroes Coins§r",
          name: "Digaonal Two",
        },
      ],
      rowRewards: [
        {
          description: "§8+§350,000§7 §7Hypixel Experience§r",
          name: "Row One",
        },
        {
          description: "§8+§b175,000§7 §7Event Experience§r",
          name: "Row Two",
        },
        {
          description: "§8+§25,000 §7The TNT Games Tokens§r",
          name: "Row Three",
        },
        {
          description: "§8+§e3 §dDaily Reward Token§r",
          name: "Row Four",
        },
      ],
      tasks: [
        {
          description: "Pick up 2 powerups in a game of TNT Tag in the TNT Games Lobby",
          field: "notEnoughToGoAround",
          game: "The TNT Games",
          name: "Not Enough to Go Around",
          progress: 2,
        },
        {
          description: "Get the first kill in a game of Smash Heroes",
          field: "bloodthirsty",
          game: "Smash Heroes",
          name: "Bloodthirsty",
          progress: 1,
        },
        {
          description: "Hit a player attacking your Wither in a game of Mega Walls",
          field: "handOfTheKing",
          game: "Mega Walls",
          name: "Hand of the King",
          progress: 1,
        },
        {
          description: "Kill 10 players in games of Quakecraft in the Classic Lobby",
          field: "sunnyDelight",
          game: "Quakecraft",
          name: "Sunny Delight",
          progress: 10,
        },
        {
          description: "Activate the Triple Shot killstreak in a game of Paintball in the Classic Lobby",
          field: "threeTimesTheFun",
          game: "Paintball Warfare",
          name: "Three Times the Fun!",
          progress: 1,
        },
        {
          description: "Win a game of Defusal in Cops and Crims",
          field: "defusalVictor",
          game: "Cops and Crims",
          name: "Defusal Victor",
          progress: 1,
        },
        {
          description: "Survive for a total of 5 minutes in games of TNT Run in the TNT Games Lobby",
          field: "revelingInTheSun",
          game: "The TNT Games",
          name: "Reveling in the Sun",
          progress: 5,
        },
        {
          description: "Kill a player who has at least 1 kill in a game of Blitz Survival Games",
          field: "shutdown",
          game: "Blitz SG",
          name: "Shutdown",
          progress: 1,
        },
        {
          description: "Damage a Wither in a game of Mega Walls",
          field: "witheringHeights",
          game: "Mega Walls",
          name: "Withering Heights",
          progress: 1,
        },
        {
          description: "Splash yourself with a potion in a game of Blitz Survival Games",
          field: "quenchy",
          game: "Blitz SG",
          name: "Quenchy",
          progress: 1,
        },
        {
          description: "Damage a player who is carrying your flag in the Capture the Flag mode of Warlords",
          field: "slowingThemDown",
          game: "Warlords",
          name: "Slowing Them Down",
          progress: 1,
        },
        {
          description: "Throw a player off the map in a game of Smash Heroes",
          field: "tooStronk",
          game: "Smash Heroes",
          name: "TOO STRONK",
          progress: 1,
        },
        {
          description: "Capture a point in a game of Wizards in the TNT Games Lobby",
          field: "amateurWizard",
          game: "The TNT Games",
          name: "Amateur Wizard",
          progress: 1,
        },
        {
          description: "Pick up 10 item boxes in a single game of Turbo Kart Racers in the Classic Lobby",
          field: "luckyLooter",
          game: "Turbo Kart Racers",
          name: "Lucky Looter",
          progress: 10,
        },
        {
          description: "Kill a player being affected by a Smoke Grenade in a game of Cops and Crims",
          field: "ninjaVanish",
          game: "Cops and Crims",
          name: "Ninja Vanish",
          progress: 1,
        },
        {
          description: "Survive for 5 minutes in games of VampireZ in the Classic Games Lobby",
          field: "longNight",
          game: "VampireZ",
          name: "Long Night",
          progress: 5,
        },
      ],
    },
    pvp: {
      blackoutReward: {
        description: [
          "§8+§a§l4§r §7Bingo Bucks§r",
          "§8+§650,000 §7Coins in All Minigames§r",
          "§8+§350,000§7 §7Hypixel Experience§r",
          "§8+§b175,000§7 §7Event Experience§r",
        ],
        name: "Blackout",
      },
      columnRewards: [
        {
          description: "§8+§25,000§7 Bed Wars Tokens§r",
          name: "Column One",
        },
        {
          description: "§8+§350,000§7 §7Hypixel Experience§r",
          name: "Column Two",
        },
        {
          description: "§8+§25,000 §7SkyWars Tokens§r",
          name: "Column Three",
        },
        {
          description: "§8+§71 §62.0x §7Personal Coin Booster §7(§bTwo Hour§7)§r",
          name: "Column Four",
        },
      ],
      diagonalRewards: [
        {
          description: "§8+§65,000 §7Wool Games Wool§r",
          name: "Diagonal One",
        },
        {
          description: "§8+§25,000 §7Bed Wars Tokens§r",
          name: "Digaonal Two",
        },
      ],
      rowRewards: [
        {
          description: "§8+§350,000§7 §7Hypixel Experience§r",
          name: "Row One",
        },
        {
          description: "§8+§b175,000§7 §7Event Experience§r",
          name: "Row Two",
        },
        {
          description: "§8+§25,000 §7Duels Tokens§r",
          name: "Row Three",
        },
        {
          description: "§8+§e3 §dDaily Reward Token§r",
          name: "Row Four",
        },
      ],
      tasks: [
        {
          description: "Purchase a trap in a game of Bed Wars",
          field: "littleShopOfTraps",
          game: "Bed Wars",
          name: "Little Shop of Traps",
          progress: 1,
        },
        {
          description: "Win a game of Sumo Duels",
          field: "sumoVictor",
          game: "Duels",
          name: "Sumo Victor",
          progress: 1,
        },
        {
          description: "Wear a full set of Iron Armor in a game of SkyWars",
          field: "ironWall",
          game: "SkyWars",
          name: "Iron Wall",
          progress: 1,
        },
        {
          description: "Collect 2 emeralds from generators in a game of Bed Wars",
          field: "greenEyedMonster",
          game: "Bed Wars",
          name: "Green-Eyed Monster",
          progress: 2,
        },
        {
          description: "Knock 3 players into the void in a game of SkyWars",
          field: "aLongWayDown",
          game: "SkyWars",
          name: "A Long Way Down...",
          progress: 3,
        },
        {
          description: "Win a game of Wool Wars without losing a single round",
          field: "crushingVictory",
          game: "Wool Games",
          name: "Crushing Victory",
          progress: 1,
        },
        {
          description: "Break 2 beds in games of Bed Wars",
          field: "bedDestroyer",
          game: "Bed Wars",
          name: "Bed Destroyer",
          progress: 2,
        },
        {
          description: "Reach the 3rd checkpoint in a game of Parkour Duels",
          field: "swiftOfFoot",
          game: "Duels",
          name: "Swift of Foot",
          progress: 1,
        },
        {
          description: "Win a game of Classic Duels",
          field: "classicVictor",
          game: "Duels",
          name: "Classic Victor",
          progress: 1,
        },
        {
          description: "Get a kill in a game of SkyWars Doubles",
          field: "funWithFriends",
          game: "SkyWars",
          name: "Fun with Friends",
          progress: 1,
        },
        {
          description: "Kill 4 in games of Duels",
          field: "multifacetedKiller",
          game: "Duels",
          name: "Multifaceted Killer",
          progress: 4,
        },
        {
          description: "Throw a Bedbug in a game of Bed Wars",
          field: "infestation",
          game: "Bed Wars",
          name: "Infestation",
          progress: 1,
        },
        {
          description: "Kill 2 players with explosive damage in a game of Sheep Wars in the Wool Games Lobby",
          field: "woolThatKills",
          game: "Wool Games",
          name: "Wool That Kills",
          progress: 2,
        },
        {
          description: "Get 1 Final Kills in games of Bed Wars",
          field: "andStayDown",
          game: "Bed Wars",
          name: "And Stay Down!",
          progress: 1,
        },
        {
          description: "Purchase a Kit in a game of Capture the Wool in the Wool Games Lobby",
          field: "suitUp",
          game: "Wool Games",
          name: "Suit Up!",
          progress: 1,
        },
        {
          description: "Open 10 chests in games of SkyWars",
          field: "treasureHunter",
          game: "SkyWars",
          name: "Treasure Hunter",
          progress: 10,
        },
      ],
    },
  },
  hard: {
    casual: {
      blackoutReward: {
        description: [
          "§8+§a§l8§r §7Bingo Bucks§r",
          "§8+§6100,000 §7Coins in All Minigames§r",
          "§8+§3250,000§7 §7Hypixel Experience§r",
          "§8+§b875,000§7 §7Event Experience§r",
        ],
        name: "Blackout",
      },
      columnRewards: [
        {
          description: "§8+§225,000 §7Build Battle Tokens§r",
          name: "Column One",
        },
        {
          description: "§8+§3150,000§7 §7Hypixel Experience§r",
          name: "Column Two",
        },
        {
          description: "§8+§225,000 §7Murder Mystery Tokens§r",
          name: "Column Three",
        },
        {
          description: "§8+§71 §64.0x §7Personal Coin Booster §7(§bOne Day§7)§r",
          name: "Column Four",
        },
      ],
      diagonalRewards: [
        {
          description: "§8+§650,000 §7Arcade Games Coins§r",
          name: "Diagonal One",
        },
        {
          description: "§8+§225,000 §7Murder Mystery Tokens§r",
          name: "Digaonal Two",
        },
      ],
      rowRewards: [
        {
          description: "§8+§3150,000§7 §7Hypixel Experience§r",
          name: "Row One",
        },
        {
          description: "§8+§b525,000§7 §7Event Experience§r",
          name: "Row Two",
        },
        {
          description: "§8+§650,000 §7Arcade Games Coins§r",
          name: "Row Three",
        },
        {
          description: "§8+§e10 §dDaily Reward Token§r",
          name: "Row Four",
        },
      ],
      tasks: [
        {
          description: "Finish a build first in a game of Speed Builders in the Build Battle Lobby",
          field: "fastANDAccurate",
          game: "Build Battle",
          name: "Fast AND Accurate",
          progress: 1,
        },
        {
          description: "Win a game of Party Games",
          field: "springParty",
          game: "Arcade Games",
          name: "Spring Party",
          progress: 1,
        },
        {
          description: "Kill 13 players as Murderer in games of Murder Mystery",
          field: "canTCatchMe",
          game: "Murder Mystery",
          name: "Can't Catch Me!",
          progress: 13,
        },
        {
          description: "Win a game of Disasters in the Prototype Lobby with full health remaining",
          field: "untouchable1",
          game: "Prototype",
          name: "Untouchable",
          progress: 1,
        },
        {
          description: "Collect 100 Gold in games of Murder Mystery",
          field: "vacationFunds",
          game: "Murder Mystery",
          name: "Vacation Funds",
          progress: 100,
        },
        {
          description: "Survive 50 Disasters in games of Disasters in the Prototype Lobby",
          field: "untouchable2",
          game: "Prototype",
          name: "Untouchable",
          progress: 50,
        },
        {
          description: "Win any 10 games in the Arcade Games Lobby",
          field: "grandSlam",
          game: "Arcade Games",
          name: "Grand Slam",
          progress: 10,
        },
        {
          description: "Obtain 200 points in games of Build Battle",
          field: "scaryGood",
          game: "Build Battle",
          name: "Scary Good",
          progress: 200,
        },
        {
          description: "Beat Round 25 in a game of Zombies in Arcade Games",
          field: "safeAndSound",
          game: "Arcade Games",
          name: "Safe and Sound",
          progress: 1,
        },
        {
          description: "Catch 50 junk in the Main Lobby",
          field: "junkHoarder",
          game: "Main Lobby",
          name: "Junk Hoarder",
          progress: 50,
        },
        {
          description: "Kill 10 Infected without dying in games of Infection in the Murder Mystery Lobby",
          field: "infectiousFun",
          game: "Murder Mystery",
          name: "Infectious Fun",
          progress: 10,
        },
        {
          description: "Complete a game of Dropper in the Arcade Games without failing",
          field: "freakyFalling",
          game: "Arcade Games",
          name: "Freaky Falling",
          progress: 1,
        },
        {
          description: "Find 50 eggs in a game of Easter Simulator in the Arcade Lobby",
          field: "masterEggHunter",
          game: "Arcade Games",
          name: "Master Egg Hunter",
          progress: 50,
        },
        {
          description: "Guess the build within 15 seconds in a round of Guess the Build in Build Battle",
          field: "lightningFast",
          game: "Build Battle",
          name: "Lightning Fast",
          progress: 1,
        },
        {
          description: "Complete the Soulshank Prison map in a game of Zombies in the Arcade Games Lobby",
          field: "slayinThroughTheEnd",
          game: "Arcade Games",
          name: "Slayin' through the End",
          progress: 1,
        },
        {
          description: "Shoot the Murderer in a game of Murder Mystery",
          field: "caughtInTheAct",
          game: "Murder Mystery",
          name: "Caught in the Act!",
          progress: 1,
        },
      ],
    },
    classic: {
      blackoutReward: {
        description: [
          "§8+§a§l8§r §7Bingo Bucks§r",
          "§8+§6100,000 §7Coins in All Minigames§r",
          "§8+§3250,000§7 §7Hypixel Experience§r",
          "§8+§b875,000§7 §7Event Experience§r",
        ],
        name: "Blackout",
      },
      columnRewards: [
        {
          description: "§8+§625,000 §7Mega Walls Coins§r",
          name: "Column One",
        },
        {
          description: "§8+§3150,000§7 §7Hypixel Experience§r",
          name: "Column Two",
        },
        {
          description: "§8+§625,000 §7Cops and Crims Coins§r",
          name: "Column Three",
        },
        {
          description: "§8+§71 §64.0x §7Personal Coin Booster §7(§bOne Day§7)§r",
          name: "Column Four",
        },
      ],
      diagonalRewards: [
        {
          description: "§8+§625,000 §7Quakecraft Coins§r",
          name: "Diagonal One",
        },
        {
          description: "§8+§625,000 §7Blitz SG Coins§r",
          name: "Digaonal Two",
        },
      ],
      rowRewards: [
        {
          description: "§8+§3150,000§7 §7Hypixel Experience§r",
          name: "Row One",
        },
        {
          description: "§8+§b525,000§7 §7Event Experience§r",
          name: "Row Two",
        },
        {
          description: "§8+§225,000 §7The TNT Games Tokens§r",
          name: "Row Three",
        },
        {
          description: "§8+§e10 §dDaily Reward Token§r",
          name: "Row Four",
        },
      ],
      tasks: [
        {
          description: "Find the Blitz Star in a game of Blitz Survival Games",
          field: "unlimitedPower",
          game: "Blitz SG",
          name: "Unlimited Power",
          progress: 1,
        },
        {
          description: "Win a game of Arena Brawl in the Classic Lobby without using your Ultimate Skill",
          field: "anExerciseInRestraint",
          game: "Arena Brawl",
          name: "An Exercise in Restraint",
          progress: 1,
        },
        {
          description: "Get 10 kills without dying in Quakecraft",
          field: "undeath",
          game: "Quakecraft",
          name: "Undeath",
          progress: 10,
        },
        {
          description: "Kill 4 players in a game of PvP Run in the TNT Games Lobby",
          field: "snowbodySSafe",
          game: "The TNT Games",
          name: "Snowbody's Safe!",
          progress: 4,
        },
        {
          description: "Finish in 1st Place in a game of Turbo Kart Racers in the Classic Lobby",
          field: "deadlyDrifting",
          game: "Turbo Kart Racers",
          name: "Deadly Drifting",
          progress: 1,
        },
        {
          description: "Final kill a player who is wearing a piece of diamond armor in Mega Walls",
          field: "oneLastChallenge",
          game: "Mega Walls",
          name: "One Last Challenge",
          progress: 1,
        },
        {
          description: "Kill a player who is wearing a piece of Diamond Armor in Blitz Survival Games",
          field: "fromRichesToRags",
          game: "Blitz SG",
          name: "From Riches to Rags",
          progress: 1,
        },
        {
          description: "Defuse a bomb in a game of Defusal in Cops and Crims",
          field: "whatDoesTheRedWireDo",
          game: "Cops and Crims",
          name: "What Does the Red Wire do?",
          progress: 1,
        },
        {
          description: "Win a game of TNT Run in the TNT Games Lobby with at least 4 double jumps remaining",
          field: "oneStepAbove",
          game: "The TNT Games",
          name: "One Step Above",
          progress: 4,
        },
        {
          description: "Survive until the sun rises in a game of VampireZ in the Classic Games Lobby",
          field: "unassailable",
          game: "VampireZ",
          name: "Unassailable",
          progress: 1,
        },
        {
          description: "Win a game of Smash Heroes with at least two lives remaining",
          field: "notSoClose",
          game: "Smash Heroes",
          name: "Not So Close",
          progress: 1,
        },
        {
          description: "Capture a flag in a game of Capture the Flag in Warlords",
          field: "catchMeIfYouCan",
          game: "Warlords",
          name: "Catch Me If You Can",
          progress: 1,
        },
        {
          description: "Get a kill with a gun, knife, and grenade in a game of Cops and Crims",
          field: "multifaceted",
          game: "Cops and Crims",
          name: "Multifaceted",
          progress: 1,
        },
        {
          description: "Active the Nuke killstreak in a game of Paintball in the Classic Games Lobby",
          field: "aLoudSilence",
          game: "Paintball Warfare",
          name: "A Loud Silence",
          progress: 1,
        },
        {
          description: "Win a game of Wizards by over 500 points",
          field: "landslideVictory",
          game: "The TNT Games",
          name: "Landslide Victory",
          progress: 1,
        },
        {
          description: "Craft a diamond sword in a game of The Walls in the Classic Games Lobby",
          field: "sharpenedDiamond",
          game: "The Walls",
          name: "Sharpened Diamond",
          progress: 1,
        },
      ],
    },
    pvp: {
      blackoutReward: {
        description: [
          "§8+§a§l8§r §7Bingo Bucks§r",
          "§8+§6100,000 §7Coins in All Minigames§r",
          "§8+§3250,000§7 §7Hypixel Experience§r",
          "§8+§b875,000§7 §7Event Experience§r",
        ],
        name: "Blackout",
      },
      columnRewards: [
        {
          description: "§8+§225,000 §7Bed Wars Tokens§r",
          name: "Column One",
        },
        {
          description: "§8+§3150,000§7 §7Hypixel Experience§r",
          name: "Column Two",
        },
        {
          description: "§8+§225,000 §7SkyWars Tokens§r",
          name: "Column Three",
        },
        {
          description: "§8+§71 §64.0x §7Personal Coin Booster §7(§bOne Day§7)§r",
          name: "Column Four",
        },
      ],
      diagonalRewards: [
        {
          description: "§8+§625,000 §7Wool Games Wool§r",
          name: "Diagonal One",
        },
        {
          description: "§8+§225,000 §7Bed Wars Tokens§r",
          name: "Digaonal Two",
        },
      ],
      rowRewards: [
        {
          description: "§8+§3150,000§7 §7Hypixel Experience§r",
          name: "Row One",
        },
        {
          description: "§8+§b525,000§7 §7Event Experience§r",
          name: "Row Two",
        },
        {
          description: "§8+§225,000 §7Duels Tokens§r",
          name: "Row Three",
        },
        {
          description: "§8+§e10 §dDaily Reward Token§r",
          name: "Row Four",
        },
      ],
      tasks: [
        {
          description: "Win a game of SkyWars with a challenge active",
          field: "betterNerfThis",
          game: "SkyWars",
          name: "Better Nerf This",
          progress: 1,
        },
        {
          description: "Win 3 games of UHC Duels",
          field: "hardcoreChampion",
          game: "Duels",
          name: "Hardcore Champion",
          progress: 3,
        },
        {
          description: "Final Kill a player who is wearing a piece of diamond armor in Bed Wars",
          field: "finalDestination",
          game: "Bed Wars",
          name: "Final Destination",
          progress: 1,
        },
        {
          description: "Kill a player carrying your team's wool in a game of Capture the Wool in the Wool Games Lobby",
          field: "giveThatBack",
          game: "Wool Games",
          name: "Give That Back!",
          progress: 1,
        },
        {
          description: "Win a game of Bed Wars without dying",
          field: "immortal",
          game: "Bed Wars",
          name: "Immortal",
          progress: 1,
        },
        {
          description: "Win a game of Sheep Wars in the Wool Games Lobby after using one of every sheep",
          field: "technicolorMurder",
          game: "Wool Games",
          name: "Technicolor Murder",
          progress: 1,
        },
        {
          description: "Kill 3 players in a Corrupted game of SkyWars",
          field: "cabinetOfSouls",
          game: "SkyWars",
          name: "Cabinet of Souls",
          progress: 3,
        },
        {
          description: "Kill 25 in games of Duels",
          field: "renaissanceKiller",
          game: "Duels",
          name: "Renaissance Killer",
          progress: 25,
        },
        {
          description: "Finish 1st in a game of Parkour Duels in the Duels Lobby",
          field: "headInTheClouds",
          game: "Duels",
          name: "Head in the Clouds",
          progress: 1,
        },
        {
          description: "Win a game of SkyWars Solo with at least 5 kills",
          field: "anOffering",
          game: "SkyWars",
          name: "An Offering",
          progress: 5,
        },
        {
          description: "Win a game of The Bridge in the Duels Lobby without the enemy team scoring.",
          field: "cleanSheet",
          game: "Duels",
          name: "Clean Sheet",
          progress: 1,
        },
        {
          description: "Purchase 5 team upgrades in a single game of Bed Wars",
          field: "oneForAll",
          game: "Bed Wars",
          name: "One For All",
          progress: 5,
        },
        {
          description: "Final Kill an entire team in a game of Bed Wars",
          field: "partySOver",
          game: "Bed Wars",
          name: "Party's Over",
          progress: 1,
        },
        {
          description: "Win a game of Wool Wars without the enemy team placing a single wool",
          field: "notAChance",
          game: "Wool Games",
          name: "Not a Chance",
          progress: 1,
        },
        {
          description: "Win a game of Bed Wars with a challenge active",
          field: "cantStopTheCelebrations",
          game: "Bed Wars",
          name: "Can't Stop the Celebrations!",
          progress: 1,
        },
        {
          description: "Win a game of SkyWars Lucky Blocks",
          field: "funInTheSun",
          game: "SkyWars",
          name: "Fun in the Sun",
          progress: 1,
        },
      ],
    },
  },
};
