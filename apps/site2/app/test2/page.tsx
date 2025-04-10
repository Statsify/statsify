/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

"use client";

import Image from "next/image";
import SkyWarsIcon from "~/public/icons/skywars.png";
import { Background } from "~/components/ui/background";
import { Box } from "~/components/ui/box";
import { MinecraftText } from "~/components/ui/minecraft-text";
import { SearchIcon } from "~/components/icons/search";
import { cn } from "~/lib/util";
import { useState } from "react";

const boards = {
  easy: {
    casual: {
      diagonalRewards: [
        {
          name: "Diagonal One",
          description: "§8+§610,000 §7Arcade Games Coins§r",
        },
        {
          name: "Digaonal Two",
          description: "§8+§25,000 §7Murder Mystery Tokens§r",
        },
      ],
      columnRewards: [
        { name: "Column One", description: "§8+§25,000 §7Build Battle Tokens§r" },
        { name: "Column Two", description: "§8+§350,000 §7Hypixel Experience§r" },
        { name: "Column Three", description: "§8+§25,000 §7Murder Mystery Tokens§r" },
        { name: "Column Four", description: "§8+§71§6 2.0x §7Personal Coin Booster (§bTwo Hour§7)§r" },
      ],
      rowRewards: [
        { name: "Row One", description: "§8+§350,000 §7Hypixel Experience§r" },
        { name: "Row Two", description: "§8+§b175,000 §7Event Experience§r" },
        { name: "Row Three", description: "§8+§610,000 §7Arcade Games Coins§r" },
        { name: "Row Four", description: "§8+§e3 §dDaily Reward Token§r" },
      ],
      blackoutReward: {
        name: "Blackout",
        description: [
          "§8+§a§l4§r §7Bingo Bucks§r",
          "§8+§650,000 §7Coins in All Minigames§r",
          "§8+§350,000 §7Hypixel Experience§r",
          "§8+§b175,000 §7Event Experience§r",
        ],
      },
      tasks: [
        {
          game: "Murder Mystery",
          name: "Robin Hood",
          description: "Kill a player with a bow shot in a game of Murder Mystery",
          progress: "Progress: ✖",
          field: "robinHood",
        },
        {
          game: "Main Lobby",
          name: "One With The Fish",
          description: "Catch 25 fish in the Main Lobby",
          progress: "Progress: 0/25",
          field: "oneWithTheFish",
        },
        {
          game: "Prototype",
          name: "I Survived Anniversary Bingo",
          description: "Survive 5 Disasters in games of Disasters in the Prototype Lobby",
          progress: "Progress: 5/5",
          field: "iSurvivedAnniversaryBingo",
        },
        {
          game: "Arcade Games",
          name: "Home Run",
          description: "Win any 3 games in the Arcade Games Lobby",
          progress: "Progress: 0/3",
          field: "homeRun",
        },
        {
          game: "Arcade Games",
          name: "Into the Labyrinth",
          description: "Reach the middle of the Spider Maze in a round of Party Games in the Arcade Games",
          progress: "Progress: ✖",
          field: "intoTheLabyrinth",
        },
        {
          game: "Build Battle",
          name: "A Perfect Medium",
          description: "Finish a MEDIUM build with 100% accuracy in a game of Speed Builders in the Build Battle Lobby",
          progress: "Progress: ✖",
          field: "aPerfectMedium",
        },
        {
          game: "Arcade Games",
          name: "Fallin' Past the Fall",
          description: "Complete all 5 maps in a game of Dropper in the Arcade Lobby",
          progress: "Progress: ✔",
          field: "fallinPastTheFall",
        },
        {
          game: "Arcade Games",
          name: "Not Quite a Dead End",
          description: "Open up a new location in a game of Zombies in Arcade Games",
          progress: "Progress: ✖",
          field: "notQuiteADeadEnd",
        },
        {
          game: "Build Battle",
          name: "Festive Spirit",
          description: 'Receive a "Good" or higher vote in a game of Build Battle',
          progress: "Progress: ✖",
          field: "festiveSpirit",
        },
        {
          game: "Arcade Games",
          name: "Intermediate Egg Hunter",
          description: "Find 25 eggs in a game of Easter Simulator in the Arcade Lobby",
          progress: "Progress: ✖",
          field: "intermediateEggHunter",
        },
        {
          game: "Housing",
          name: "If You Give A House A Cookie",
          description: "Give Cookies to other players in Housing",
          progress: "Progress: 5/5",
          field: "ifYouGiveAHouseACookie",
        },
        {
          game: "Prototype",
          name: "Ain't No TNT Tag",
          description: "Pass the Hot Potato to another player in a game of Disasters in the Prototype Lobby",
          progress: "Progress: ✖",
          field: "ainTNoTNTTag",
        },
        {
          game: "Arcade Games",
          name: "Podium Position",
          description: "Finish in the top 3 for one round of Party Games in Arcade Games",
          progress: "Progress: ✖",
          field: "podiumPosition",
        },
        {
          game: "Murder Mystery",
          name: "Golden Sun",
          description: "Collect 15 Gold in a game of Murder Mystery",
          progress: "Progress: ✖",
          field: "goldenSun",
        },
        {
          game: "Build Battle",
          name: "The Thing!",
          description: "Have 5 players correctly guess your build in a game of Guess the Build in Build Battle",
          progress: "Progress: ✔",
          field: "theThing",
        },
        {
          game: "Murder Mystery",
          name: "Doomsday Prep",
          description: "Win a game of Murder Mystery: Infection as a Survivor",
          progress: "Progress: ✖",
          field: "doomsdayPrep",
        },
      ],
    },
    pvp: {
      diagonalRewards: [
        {
          name: "Diagonal One",
          description: "§8+§65,000 §7Wool Games Wool§r",
        },
        {
          name: "Digaonal Two",
          description: "§8+§25,000 §7Bed Wars Tokens§r",
        },
      ],
      columnRewards: [
        { name: "Column One", description: "§8+§25,000§7 Bed Wars Tokens§r" },
        { name: "Column Two", description: "§8+§350,000§7 §7Hypixel Experience§r" },
        { name: "Column Three", description: "§8+§25,000 §7SkyWars Tokens§r" },
        { name: "Column Four", description: "§8+§71 §62.0x §7Personal Coin Booster §7(§bTwo Hour§7)§r" },
      ],
      rowRewards: [
        { name: "Row One", description: "§8+§350,000§7 §7Hypixel Experience§r" },
        { name: "Row Two", description: "§8+§b175,000§7 §7Event Experience§r" },
        { name: "Row Three", description: "§8+§25,000 §7Duels Tokens§r" },
        { name: "Row Four", description: "§8+§e3 §dDaily Reward Token§r" },
      ],
      blackoutReward: {
        name: "Blackout",
        description: [
          "§8+§a§l4§r §7Bingo Bucks§r",
          "§8+§650,000 §7Coins in All Minigames§r",
          "§8+§350,000§7 §7Hypixel Experience§r",
          "§8+§b175,000§7 §7Event Experience§r",
        ],
      },
      tasks: [
        {
          field: "littleShopOfTraps",
          game: "Bed Wars",
          name: "Little Shop of Traps",
          description: "Purchase a trap in a game of Bed Wars",
          progress: "Progress: ✖",
        },
        {
          field: "sumoVictor",
          game: "Duels",
          name: "Sumo Victor",
          description: "Win a game of Sumo Duels",
          progress: "Progress: ✖",
        },
        {
          field: "ironWall",
          game: "SkyWars",
          name: "Iron Wall",
          description: "Wear a full set of Iron Armor in a game of SkyWars",
          progress: "Progress: ✖",
        },
        {
          field: "greenEyedMonster",
          game: "Bed Wars",
          name: "Green-Eyed Monster",
          description: "Collect 2 emeralds from generators in a game of Bed Wars",
          progress: "Progress: ✖",
        },
        {
          field: "aLongWayDown",
          game: "SkyWars",
          name: "A Long Way Down...",
          description: "Knock 3 players into the void in a game of SkyWars",
          progress: "Progress: ✖",
        },
        {
          field: "crushingVictory",
          game: "Wool Games",
          name: "Crushing Victory",
          description: "Win a game of Wool Wars without losing a single round",
          progress: "Progress: ✖",
        },
        {
          field: "bedDestroyer",
          game: "Bed Wars",
          name: "Bed Destroyer",
          description: "Break 2 beds in games of Bed Wars",
          progress: "Progress: 0/2",
        },
        {
          field: "swiftOfFoot",
          game: "Duels",
          name: "Swift of Foot",
          description: "Reach the 3rd checkpoint in a game of Parkour Duels",
          progress: "Progress: ✖",
        },
        {
          field: "classicVictor",
          game: "Duels",
          name: "Classic Victor",
          description: "Win a game of Classic Duels",
          progress: "Progress: ✖",
        },
        {
          field: "funWithFriends",
          game: "SkyWars",
          name: "Fun with Friends",
          description: "Get a kill in a game of SkyWars Doubles",
          progress: "Progress: ✖",
        },
        {
          field: "multifacetedKiller",
          game: "Duels",
          name: "Multifaceted Killer",
          description: "Kill 4 in games of Duels",
          progress: "Progress: 0/4",
        },
        {
          field: "infestation",
          game: "Bed Wars",
          name: "Infestation",
          description: "Throw a Bedbug in a game of Bed Wars",
          progress: "Progress: ✖",
        },
        {
          field: "woolThatKills",
          game: "Wool Games",
          name: "Wool That Kills",
          description: "Kill 2 players with explosive damage in a game of Sheep Wars in the Wool Games Lobby",
          progress: "Progress: ✖",
        },
        {
          field: "andStayDown",
          game: "Bed Wars",
          name: "And Stay Down!",
          description: "Get 1 Final Kills in games of Bed Wars",
          progress: "Progress: ✖",
        },
        {
          field: "suitUp",
          game: "Wool Games",
          name: "Suit Up!",
          description: "Purchase a Kit in a game of Capture the Wool in the Wool Games Lobby",
          progress: "Progress: ✖",
        },
        {
          field: "treasureHunter",
          game: "SkyWars",
          name: "Treasure Hunter",
          description: "Open 10 chests in games of SkyWars",
          progress: "Progress: 0/10",
        },
      ],
    },
    classic: {
      diagonalRewards: [
        {
          name: "Diagonal One",
          description: "§8+§65,000 §7VampireZ Coins§r",
        },
        {
          name: "Digaonal Two",
          description: "§8+§65,000 §7Smash Heroes Coins§r",
        },
      ],
      columnRewards: [
        { name: "Column One", description: "§8+§65,000 §7Mega Walls Coins§r" },
        { name: "Column Two", description: "§8+§350,000§7 §7Hypixel Experience§r" },
        { name: "Column Three", description: "§8+§65,000 §7Cops and Crims Coins§r" },
        { name: "Column Four", description: "§8+§71 §62.0x §7Personal Coin Booster §7(§bTwo Hour§7)§r" },
      ],
      rowRewards: [
        { name: "Row One", description: "§8+§350,000§7 §7Hypixel Experience§r" },
        { name: "Row Two", description: "§8+§b175,000§7 §7Event Experience§r" },
        { name: "Row Three", description: "§8+§25,000 §7The TNT Games Tokens§r" },
        { name: "Row Four", description: "§8+§e3 §dDaily Reward Token§r" },
      ],
      blackoutReward: {
        name: "Blackout",
        description: [
          "§8+§a§l4§r §7Bingo Bucks§r",
          "§8+§650,000 §7Coins in All Minigames§r",
          "§8+§350,000§7 §7Hypixel Experience§r",
          "§8+§b175,000§7 §7Event Experience",
        ],
      },
      tasks: [
        {
          field: "notEnoughToGoAround",
          game: "The TNT Games",
          name: "Not Enough to Go Around",
          description: "Pick up 2 powerups in a game of TNT Tag in the TNT Games Lobby",
          progress: "Progress: ✔",
        },
        {
          field: "bloodthirsty",
          game: "Smash Heroes",
          name: "Bloodthirsty",
          description: "Get the first kill in a game of Smash Heroes",
          progress: "Progress: ✖",
        },
        {
          field: "handOfTheKing",
          game: "Mega Walls",
          name: "Hand of the King",
          description: "Hit a player attacking your Wither in a game of Mega Walls",
          progress: "Progress: ✖",
        },
        {
          field: "sunnyDelight",
          game: "Quakecraft",
          name: "Sunny Delight",
          description: "Kill 10 players in games of Quakecraft in the Classic Lobby",
          progress: "Progress: 10/10",
        },
        {
          field: "threeTimesTheFun",
          game: "Paintball Warfare",
          name: "Three Times the Fun!",
          description: "Activate the Triple Shot killstreak in a game of Paintball in the Classic Lobby",
          progress: "Progress: ✖",
        },
        {
          field: "defusalVictor",
          game: "Cops and Crims",
          name: "Defusal Victor",
          description: "Win a game of Defusal in Cops and Crims",
          progress: "Progress: ✔",
        },
        {
          field: "revelingInTheSun",
          game: "The TNT Games",
          name: "Reveling in the Sun",
          description: "Survive for a total of 5 minutes in games of TNT Run in the TNT Games Lobby",
          progress: "Progress: 4/5",
        },
        {
          field: "shutdown",
          game: "Blitz SG",
          name: "Shutdown",
          description: "Kill a player who has at least 1 kill in a game of Blitz Survival Games",
          progress: "Progress: ✔",
        },
        {
          field: "witheringHeights",
          game: "Mega Walls",
          name: "Withering Heights",
          description: "Damage a Wither in a game of Mega Walls",
          progress: "Progress: ✖",
        },
        {
          field: "quenchy",
          game: "Blitz SG",
          name: "Quenchy",
          description: "Splash yourself with a potion in a game of Blitz Survival Games",
          progress: "Progress: ✔",
        },
        {
          field: "slowingThemDown",
          game: "Warlords",
          name: "Slowing Them Down",
          description: "Damage a player who is carrying your flag in the Capture the Flag mode of Warlords",
          progress: "Progress: ✖",
        },
        {
          field: "tooStronk",
          game: "Smash Heroes",
          name: "TOO STRONK",
          description: "Throw a player off the map in a game of Smash Heroes",
          progress: "Progress: ✖",
        },
        {
          field: "amateurWizard",
          game: "The TNT Games",
          name: "Amateur Wizard",
          description: "Capture a point in a game of Wizards in the TNT Games Lobby",
          progress: "Progress: ✔",
        },
        {
          field: "luckyLooter",
          game: "Turbo Kart Racers",
          name: "Lucky Looter",
          description: "Pick up 10 item boxes in a single game of Turbo Kart Racers in the Classic Lobby",
          progress: "Progress: ✔",
        },
        {
          field: "ninjaVanish",
          game: "Cops and Crims",
          name: "Ninja Vanish",
          description: "Kill a player being affected by a Smoke Grenade in a game of Cops and Crims",
          progress: "Progress: ✖",
        },
        {
          field: "longNight",
          game: "VampireZ",
          name: "Long Night",
          description: "Survive for 5 minutes in games of VampireZ in the Classic Games Lobby",
          progress: "Progress: 5/5",
        },
      ],
    },
  },
  hard: {
    casual: {
      diagonalRewards: [
        {
          name: "Diagonal One",
          description: "§8+§650,000 §7Arcade Games Coins§r",
        },
        {
          name: "Digaonal Two",
          description: "§8+§225,000 §7Murder Mystery Tokens§r",
        },
      ],
      columnRewards: [
        { name: "Column One", description: "§8+§225,000 §7Build Battle Tokens§r" },
        { name: "Column Two", description: "§8+§3150,000§7 §7Hypixel Experience§r" },
        { name: "Column Three", description: "§8+§225,000 §7Murder Mystery Tokens§r" },
        { name: "Column Four", description: "§8+§71 §64.0x §7Personal Coin Booster §7(§bOne Day§7)§r" },
      ],
      rowRewards: [
        { name: "Row One", description: "§8+§3150,000§7 §7Hypixel Experience§r" },
        { name: "Row Two", description: "§8+§b525,000§7 §7Event Experience§r" },
        { name: "Row Three", description: "§8+§650,000 §7Arcade Games Coins§r" },
        { name: "Row Four", description: "§8+§e10 §dDaily Reward Token§r" },
      ],
      blackoutReward: {
        name: "Blackout",
        description: [
          "§8+§a§l8§r §7Bingo Bucks§r",
          "§8+§6100,000 §7Coins in All Minigames§r",
          "§8+§3250,000§7 §7Hypixel Experience§r",
          "§8+§b875,000§7 §7Event Experience§r",
        ],
      },
      tasks: [
        {
          field: "fastANDAccurate",
          game: "Build Battle",
          name: "Fast AND Accurate",
          description: "Finish a build first in a game of Speed Builders in the Build Battle Lobby",
          progress: "Progress: ✖",
        },
        {
          field: "springParty",
          game: "Arcade Games",
          name: "Spring Party",
          description: "Win a game of Party Games",
          progress: "Progress: ✔",
        },
        {
          field: "canTCatchMe",
          game: "Murder Mystery",
          name: "Can't Catch Me!",
          description: "Kill 13 players as Murderer in games of Murder Mystery",
          progress: "Progress: 0/13",
        },
        {
          field: "untouchable1",
          game: "Prototype",
          name: "Untouchable",
          description: "Win a game of Disasters in the Prototype Lobby with full health remaining",
          progress: "Progress: ✔",
        },
        {
          field: "vacationFunds",
          game: "Murder Mystery",
          name: "Vacation Funds",
          description: "Collect 100 Gold in games of Murder Mystery",
          progress: "Progress: 0/100",
        },
        {
          field: "untouchable2",
          game: "Prototype",
          name: "Untouchable",
          description: "Survive 50 Disasters in games of Disasters in the Prototype Lobby",
          progress: "Progress: 13/50",
        },
        {
          field: "grandSlam",
          game: "Arcade Games",
          name: "Grand Slam",
          description: "Win any 10 games in the Arcade Games Lobby",
          progress: "Progress: 3/10",
        },
        {
          field: "scaryGood",
          game: "Build Battle",
          name: "Scary Good",
          description: "Obtain 200 points in games of Build Battle",
          progress: "Progress: 0/200",
        },
        {
          field: "safeAndSound",
          game: "Arcade Games",
          name: "Safe and Sound",
          description: "Beat Round 25 in a game of Zombies in Arcade Games",
          progress: "Progress: ✖",
        },
        {
          field: "junkHoarder",
          game: "Main Lobby",
          name: "Junk Hoarder",
          description: "Catch 50 junk in the Main Lobby",
          progress: "Progress: 0/50",
        },
        {
          field: "infectiousFun",
          game: "Murder Mystery",
          name: "Infectious Fun",
          description: "Kill 10 Infected without dying in games of Infection in the Murder Mystery Lobby",
          progress: "Progress: ✖",
        },
        {
          field: "freakyFalling",
          game: "Arcade Games",
          name: "Freaky Falling",
          description: "Complete a game of Dropper in the Arcade Games without failing",
          progress: "Progress: ✖",
        },
        {
          field: "masterEggHunter",
          game: "Arcade Games",
          name: "Master Egg Hunter",
          description: "Find 50 eggs in a game of Easter Simulator in the Arcade Lobby",
          progress: "Progress: ✖",
        },
        {
          field: "lightningFast",
          game: "Build Battle",
          name: "Lightning Fast",
          description: "Guess the build within 15 seconds in a round of Guess the Build in Build Battle",
          progress: "Progress: ✖",
        },
        {
          field: "slayinThroughTheEnd",
          game: "Arcade Games",
          name: "Slayin' through the End",
          description: "Complete the Soulshank Prison map in a game of Zombies in the Arcade Games Lobby",
          progress: "Progress: ✖",
        },
        {
          field: "caughtInTheAct!",
          game: "Murder Mystery",
          name: "Caught in the Act!",
          description: "Shoot the Murderer in a game of Murder Mystery",
          progress: "Progress: ✖",
        },
      ],
    },
    pvp: {
      diagonalRewards: [
        {
          name: "Diagonal One",
          description: "§8+§625,000 §7Wool Games Wool§r",
        },
        {
          name: "Digaonal Two",
          description: "§8+§225,000 §7Bed Wars Tokens§r",
        },
      ],
      columnRewards: [
        { name: "Column One", description: "§8+§225,000 §7Bed Wars Tokens§r" },
        { name: "Column Two", description: "§8+§3150,000§7 §7Hypixel Experience§r" },
        { name: "Column Three", description: "§8+§225,000 §7SkyWars Tokens§r" },
        { name: "Column Four", description: "§8+§71 §64.0x §7Personal Coin Booster §7(§bOne Day§7)§r" },
      ],
      rowRewards: [
        { name: "Row One", description: "§8+§3150,000§7 §7Hypixel Experience§r" },
        { name: "Row Two", description: "§8+§b525,000§7 §7Event Experience§r" },
        { name: "Row Three", description: "§8+§225,000 §7Duels Tokens§r" },
        { name: "Row Four", description: "§8+§e10 §dDaily Reward Token§r" },
      ],
      blackoutReward: {
        name: "Blackout",
        description: [
          "§8+§a§l8§r §7Bingo Bucks§r",
          "§8+§6100,000 §7Coins in All Minigames§r",
          "§8+§3250,000§7 §7Hypixel Experience§r",
          "§8+§b875,000§7 §7Event Experience§r",
        ],
      },
      tasks: [
        {
          field: "betterNerfThis",
          game: "SkyWars",
          name: "Better Nerf This",
          description: "Win a game of SkyWars with a challenge active",
          progress: "Progress: ✖",
        },
        {
          field: "hardcoreChampion",
          game: "Duels",
          name: "Hardcore Champion",
          description: "Win 3 games of UHC Duels",
          progress: "Progress: 0/3",
        },
        {
          field: "finalDestination",
          game: "Bed Wars",
          name: "Final Destination",
          description: "Final Kill a player who is wearing a piece of diamond armor in Bed Wars",
          progress: "Progress: ✖",
        },
        {
          field: "giveThatBack",
          game: "Wool Games",
          name: "Give That Back!",
          description: "Kill a player carrying your team's wool in a game of Capture the Wool in the Wool Games Lobby",
          progress: "Progress: ✖",
        },
        {
          field: "immortal",
          game: "Bed Wars",
          name: "Immortal",
          description: "Win a game of Bed Wars without dying",
          progress: "Progress: ✖",
        },
        {
          field: "technicolorMurder",
          game: "Wool Games",
          name: "Technicolor Murder",
          description: "Win a game of Sheep Wars in the Wool Games Lobby after using one of every sheep",
          progress: "Progress: ✖",
        },
        {
          field: "cabinetOfSouls",
          game: "SkyWars",
          name: "Cabinet of Souls",
          description: "Kill 3 players in a Corrupted game of SkyWars",
          progress: "Progress: ✖",
        },
        {
          field: "renaissanceKiller",
          game: "Duels",
          name: "Renaissance Killer",
          description: "Kill 25 in games of Duels",
          progress: "Progress: 0/25",
        },
        {
          field: "headInTheClouds",
          game: "Duels",
          name: "Head in the Clouds",
          description: "Finish 1st in a game of Parkour Duels in the Duels Lobby",
          progress: "Progress: ✖",
        },
        {
          field: "anOffering",
          game: "SkyWars",
          name: "An Offering",
          description: "Win a game of SkyWars Solo with at least 5 kills",
          progress: "Progress: ✖",
        },
        {
          field: "cleanSheet",
          game: "Duels",
          name: "Clean Sheet",
          description: "Win a game of The Bridge in the Duels Lobby without the enemy team scoring.",
          progress: "Progress: ✖",
        },
        {
          field: "oneForAll",
          game: "Bed Wars",
          name: "One For All",
          description: "Purchase 5 team upgrades in a single game of Bed Wars",
          progress: "Progress: ✖",
        },
        {
          field: "partySOver",
          game: "Bed Wars",
          name: "Party's Over",
          description: "Final Kill an entire team in a game of Bed Wars",
          progress: "Progress: ✖",
        },
        {
          field: "notAChance",
          game: "Wool Games",
          name: "Not a Chance",
          description: "Win a game of Wool Wars without the enemy team placing a single wool",
          progress: "Progress: ✖",
        },
        {
          field: "cantStopTheCelebrations",
          game: "Bed Wars",
          name: "Can't Stop the Celebrations!",
          description: "Win a game of Bed Wars with a challenge active",
          progress: "Progress: ✖",
        },
        {
          field: "funInTheSun",
          game: "SkyWars",
          name: "Fun in the Sun",
          description: "Win a game of SkyWars Lucky Blocks",
          progress: "Progress: ✖",
        },
      ],
    },
    classic: {
      diagonalRewards: [
        {
          name: "Diagonal One",
          description: "§8+§625,000 §7Quakecraft Coins§r",
        },
        {
          name: "Digaonal Two",
          description: "§8+§625,000 §7Blitz SG Coins§r",
        },
      ],
      columnRewards: [
        { name: "Column One", description: "§8+§625,000 §7Mega Walls Coins§r" },
        { name: "Column Two", description: "§8+§3150,000§7 §7Hypixel Experience§r" },
        { name: "Column Three", description: "§8+§625,000 §7Cops and Crims Coins§r" },
        { name: "Column Four", description: "§8+§71 §64.0x §7Personal Coin Booster §7(§bOne Day§7)§r" },
      ],
      rowRewards: [
        { name: "Row One", description: "§8+§3150,000§7 §7Hypixel Experience§r" },
        { name: "Row Two", description: "§8+§b525,000§7 §7Event Experience§r" },
        { name: "Row Three", description: "§8+§225,000 §7The TNT Games Tokens§r" },
        { name: "Row Four", description: "§8+§e10 §dDaily Reward Token§r" },
      ],
      blackoutReward: {
        name: "Blackout",
        description: [
          "§8+§a§l8§r §7Bingo Bucks§r",
          "§8+§6100,000 §7Coins in All Minigames§r",
          "§8+§3250,000§7 §7Hypixel Experience§r",
          "§8+§b875,000§7 §7Event Experience§r",
        ],
      },
      tasks: [
        {
          field: "unlimitedPower",
          game: "Blitz SG",
          name: "Unlimited Power",
          description: "Find the Blitz Star in a game of Blitz Survival Games",
          progress: "Progress: ✖",
        },
        {
          field: "anExerciseInRestraint",
          game: "Arena Brawl",
          name: "An Exercise in Restraint",
          description: "Win a game of Arena Brawl in the Classic Lobby without using your Ultimate Skill",
          progress: "Progress: ✖",
        },
        {
          field: "undeath",
          game: "Quakecraft",
          name: "Undeath",
          description: "Get 10 kills without dying in Quakecraft",
          progress: "Progress: ✖",
        },
        {
          field: "snowbodySSafe",
          game: "The TNT Games",
          name: "Snowbody's Safe!",
          description: "Kill 4 players in a game of PvP Run in the TNT Games Lobby",
          progress: "Progress: ✖",
        },
        {
          field: "deadlyDrifting",
          game: "Turbo Kart Racers",
          name: "Deadly Drifting",
          description: "Finish in 1st Place in a game of Turbo Kart Racers in the Classic Lobby",
          progress: "Progress: ✔",
        },
        {
          field: "oneLastChallenge",
          game: "Mega Walls",
          name: "One Last Challenge",
          description: "Final kill a player who is wearing a piece of diamond armor in Mega Walls",
          progress: "Progress: ✖",
        },
        {
          field: "fromRichesToRags",
          game: "Blitz SG",
          name: "From Riches to Rags",
          description: "Kill a player who is wearing a piece of Diamond Armor in Blitz Survival Games",
          progress: "Progress: ✖",
        },
        {
          field: "whatDoesTheRedWireDo",
          game: "Cops and Crims",
          name: "What Does the Red Wire do?",
          description: "Defuse a bomb in a game of Defusal in Cops and Crims",
          progress: "Progress: ✖",
        },
        {
          field: "oneStepAbove",
          game: "The TNT Games",
          name: "One Step Above",
          description: "Win a game of TNT Run in the TNT Games Lobby with at least 4 double jumps remaining",
          progress: "Progress: ✖",
        },
        {
          field: "unassailable",
          game: "VampireZ",
          name: "Unassailable",
          description: "Survive until the sun rises in a game of VampireZ in the Classic Games Lobby",
          progress: "Progress: ✖",
        },
        {
          field: "notSoClose",
          game: "Smash Heroes",
          name: "Not So Close",
          description: "Win a game of Smash Heroes with at least two lives remaining",
          progress: "Progress: ✖",
        },
        {
          field: "catchMeIfYouCan",
          game: "Warlords",
          name: "Catch Me If You Can",
          description: "Capture a flag in a game of Capture the Flag in Warlords",
          progress: "Progress: ✖",
        },
        {
          field: "multifaceted",
          game: "Cops and Crims",
          name: "Multifaceted",
          description: "Get a kill with a gun, knife, and grenade in a game of Cops and Crims",
          progress: "This cannot be completed in Challenge Mode",
        },
        {
          field: "aLoudSilence",
          game: "Paintball Warfare",
          name: "A Loud Silence",
          description: "Active the Nuke killstreak in a game of Paintball in the Classic Games Lobby",
          progress: "Progress: ✖",
        },
        {
          field: "landslideVictory",
          game: "The TNT Games",
          name: "Landslide Victory",
          description: "Win a game of Wizards by over 500 points",
          progress: "Progress: ✖",
        },
        {
          field: "sharpenedDiamond",
          game: "The Walls",
          name: "Sharpened Diamond",
          description: "Craft a diamond sword in a game of The Walls in the Classic Games Lobby",
          progress: "Progress: ✖",
        },
      ],
    },
  },
};

export default function TestPage() {
  const [category, setCategory] = useState<"casual" | "pvp" | "classic">("casual");
  const [difficulty, setDifficulty] = useState<"easy" | "hard">("easy");

  return (
    <div className="h-full">
      <Background
        background="background"
        className="h-full aspect-auto"
        mask="linear-gradient(rgb(255 255 255) 20%, rgb(0 0 0 / 0) 95%)"
      />
      <div className="absolute h-[100dvh] w-full bg-[rgb(17_17_17_/0.7)] -z-10" />
      <div className="w-[95%] max-w-[1800px] mx-auto flex justify-center items-center flex-col gap-4">
        <div className="flex flex-col gap-2 items-center mt-12 mb-4 lg:mb-8">
          <h1 className="text-mc-yellow text-mc-4 lg:text-mc-7 font-bold">Bingo Tracker</h1>
          <h2 className="text-mc-gold text-mc-2 lg:text-mc-3">12th Anniversary Bingo</h2>
        </div>
        <div className="w-[80%] flex items-stretch flex-col gap-4">
          <Search />
          <Box contentClass="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
            <CategoryOverview category="Casual" easyComp={24} hardComp={25} />
            <CategoryOverview category="PvP" easyComp={12} hardComp={0} />
            <CategoryOverview category="Classic" easyComp={100} hardComp={12.5} />
          </Box>
          <div className="grid grid-cols-1 lg:grid-cols-[3fr_2px_2fr] items-center gap-4">
            <CategoryTabs category={category} setCategory={setCategory} />
            <div className="h-[32px] bg-white/20 hidden lg:block" />
            <DifficultyTabs difficulty={difficulty} setDifficulty={setDifficulty} />
          </div>
          <div className="w-full h-[2px] bg-black/50" />
        </div>
        <div className="flex flex-col justify-evenly w-full">
          <BingoBoard category={category} difficulty={difficulty} />
        </div>
      </div>
    </div>
  );
}

function CategoryOverview({ category, easyComp, hardComp }: { category: string; easyComp: number; hardComp: number }) {
  return (
    <div className="flex flex-col justify-center gap-1 lg:gap-4 text-center text-mc-1.5 lg:text-mc-2">
      <div className="flex gap-2 justify-center">
        <Image
          src={SkyWarsIcon}
          width={32}
          height={32}
          alt="icon"
          style={{ imageRendering: "pixelated" }}
          className="opacity-80 group-aria-pressed:opacity-100 transition-opacity w-[24px] lg:w-[32px]"
        />
        <p className="flex items-center justify-center gap-2">{category} Bingo Cards</p>
      </div>
      <div className="flex flex-col justify-center gap-1">
        <p className="text-mc-gray">
          <span className="text-mc-green">Easy</span>:{" "}
          <span
            className={
              easyComp == 0
                ? "text-mc-red"
                : easyComp > 0 && easyComp < 100
                ? "text-mc-yellow"
                : "text-mc-green font-bold"
            }
          >
            {easyComp}%
          </span>{" "}
          completed
        </p>
        <p className="text-mc-gray">
          <span className="text-mc-red">Hard</span>: <span className="text-mc-red">{hardComp}%</span> completed
        </p>
      </div>
    </div>
  );
}

function BingoBoard({ category, difficulty }: { category: string; difficulty: string }) {
  type Difficulty = "easy" | "hard";
  type Category = "casual" | "pvp" | "classic";

  const bingo = boards[difficulty as Difficulty][category as Category];

  return (
    <>
      <div className="grid md:hidden grid-cols-4 grid-rows-4 gap-2 **:text-mc-1">
        {bingo.tasks.map((task) => (
          <Box key={task.field} contentClass="@container flex flex-col gap-2 text-center">
            <p className="font-bold text-mc-gold text-center leading-[16px]">{task.name}</p>
            <p className="leading-[16px] @min-[150px]:block hidden">{task.description}</p>
          </Box>
        ))}
      </div>
      <div className="hidden md:grid grid-cols-6 grid-rows-6 gap-2 **:text-mc-1.5">
        <Box containerClass="@container" contentClass="flex flex-col gap-2">
          <p className="font-bold text-mc-pink text-center leading-[16px]">{bingo.diagonalRewards[0].name} Reward</p>
          <p className="leading-[16px] @min-[150px]:block hidden">
            <MinecraftText>{bingo.diagonalRewards[0].description}</MinecraftText>
          </p>
        </Box>
        {bingo.columnRewards.map((reward) => (
          <Box key={reward.name} containerClass="@container" contentClass="flex flex-col gap-2">
            <p className="font-bold text-mc-pink text-center leading-[16px]">{reward.name} Reward</p>
            <p className="leading-[16px] @min-[150px]:block hidden">
              <MinecraftText>{reward.description}</MinecraftText>
            </p>
          </Box>
        ))}
        <Box containerClass="@container" contentClass="flex flex-col gap-2">
          <p className="font-bold text-mc-pink text-center leading-[16px]">{bingo.diagonalRewards[1].name} Reward</p>
          <p className="leading-[16px] @min-[150px]:block hidden">
            <MinecraftText>{bingo.diagonalRewards[1].description}</MinecraftText>
          </p>
        </Box>
        <div className="row-start-2 col-start-2 grid grid-cols-subgrid grid-rows-subgrid row-span-4 col-span-4">
          {bingo.tasks.map((task) => (
            <Box key={task.field} containerClass="@container" contentClass="flex flex-col gap-2 text-center">
              <div>
                <p className="font-bold text-mc-gold text-center leading-[16px]">{task.name}</p>
                <p className="text-mc-dark-gray text-center leading-[16px]">{task.game} Task</p>
              </div>
              <p className="leading-[16px] @min-[150px]:block hidden">{task.description}</p>
            </Box>
          ))}
        </div>
        {bingo.rowRewards.map((reward) => (
          <Box key={reward.name} containerClass="col-start-6 @container" contentClass="flex flex-col gap-2">
            <p className="font-bold text-mc-pink text-center">{reward.name}</p>
            <p className="leading-[16px] @min-[150px]:block hidden">
              <MinecraftText>{reward.description}</MinecraftText>
            </p>
          </Box>
        ))}
        <Box containerClass="col-start-6 @container" contentClass="flex flex-col gap-2">
          <p className="font-bold text-mc-dark-purple text-center">{bingo.blackoutReward.name} Reward</p>
          <div className="flex-col gap-0.5  @min-[150px]:flex hidden">
            {bingo.blackoutReward.description.map((part) => (
              <MinecraftText key={part}>{part}</MinecraftText>
            ))}
          </div>
        </Box>
      </div>
    </>
  );
}

function CategoryTabs({
  category,
  setCategory,
}: {
  category: string;
  setCategory: React.Dispatch<React.SetStateAction<"casual" | "pvp" | "classic">>;
}) {
  return (
    <div className="grid grid-cols-3 gap-4 grow items-center justify-center text-center **:text-mc-1.5 **:lg:text-mc-2">
      <button aria-pressed={category === "casual"} className="group" onClick={() => setCategory("casual")}>
        <Box borderRadius={{ bottom: 0 }}>
          <span className="text-mc-white/60 group-aria-pressed:font-bold group-aria-pressed:text-mc-white transition-colors">
            Casual
          </span>
        </Box>
      </button>
      <button aria-pressed={category === "pvp"} className="group" onClick={() => setCategory("pvp")}>
        <Box borderRadius={{ bottom: 0 }}>
          <span className="text-mc-white/60 group-aria-pressed:font-bold group-aria-pressed:text-mc-white transition-colors">
            PvP
          </span>
        </Box>
      </button>
      <button aria-pressed={category === "classic"} className="group" onClick={() => setCategory("classic")}>
        <Box borderRadius={{ bottom: 0 }}>
          <span className="text-mc-white/60 group-aria-pressed:font-bold group-aria-pressed:text-mc-white transition-colors">
            Classic
          </span>
        </Box>
      </button>
    </div>
  );
}

function DifficultyTabs({
  difficulty,
  setDifficulty,
}: {
  difficulty: string;
  setDifficulty: React.Dispatch<React.SetStateAction<"easy" | "hard">>;
}) {
  return (
    <div className="grid grid-cols-2 grow gap-4 items-center justify-center text-center **:text-mc-1.5 **:lg:text-mc-2">
      <button aria-pressed={difficulty === "easy"} className="group" onClick={() => setDifficulty("easy")}>
        <Box borderRadius={{ bottom: 0 }}>
          <span className="text-mc-green/50 group-aria-pressed:font-bold group-aria-pressed:text-mc-green transition-colors">
            Easy
          </span>
        </Box>
      </button>
      <button aria-pressed={difficulty === "hard"} className="group" onClick={() => setDifficulty("hard")}>
        <Box borderRadius={{ bottom: 0 }}>
          <span className="text-mc-red/50 group-aria-pressed:font-bold group-aria-pressed:text-mc-red transition-colors">
            Hard
          </span>
        </Box>
      </button>
    </div>
  );
}

function Search({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-16 flex items-center px-4 gap-4 bg-white/30 border-4 border-white/40 backdrop-blur-sm",
        className
      )}
    >
      <SearchIcon className="size-8 text-white drop-shadow-mc-2" />
      <input
        placeholder="Search a player"
        className="text-mc-2 placeholder-mc-darkgray text-white outline-none h-full w-full selection:bg-white/50"
        spellCheck={false}
      />
    </div>
  );
}
