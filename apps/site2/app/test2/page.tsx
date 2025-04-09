/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import Image from "next/image";
import { SearchIcon } from "~/components/icons/search";
import { Background } from "~/components/ui/background";
import { Box } from "~/components/ui/box";
import { cn } from "~/lib/util";
import SkyWarsIcon from "~/public/icons/skywars.png";

const boards = {
  easy: {
    casual: {
      diagonalRewards: [
        {
          name: "Diagonal One",
          description: "§8+§610,000§7 Arcade Games Coins§r",
        },
        {
          name: "Digaonal Two",
          description: "§8+25,000§6 Murder Mystery Tokens§r",
        },
      ],
      columnRewards: [
        { name: "Column One", description: "§8+§35,000§7 Build Battle Tokens§r" },
        { name: "Column Two", description: "§8+§250,000§7 Hypixel Experience§r" },
        { name: "Column Three", description: "§8+§35,000§7 Murder Mystery Tokens§r" },
        { name: "Column Four", description: "§8+§71§6 2.0x§7 Personal Coin Booster (§bTwo Hour§7)§r" },
      ],
      rowRewards: [
        { name: "Row One", description: "§8+§250,000§7 Hypixel Experience§r" },
        { name: "Row Two", description: "§8+§b175,000§7 Event Experience§r" },
        { name: "Row Three", description: "§8+§610,000§7 Arcade Games Coins§r" },
        { name: "Row Four", description: "§8+§e3§d Daily Reward Token§r" },
      ],
      blackoutReward: {
        name: "Blackout",
        description:
          "§8+§a§l4§r§7 Bingo Bucks§r\n§8+§650,000§7 Coins in All Minigames§r\n§8+§350,000§7 Hypixel Experience§r\n§8+§b175,000§7 Event Experience§r",
      },
      tasks: [
        {
          game: "murder_mystery",
          name: "Robin Hood",
          description: "Kill a player with a bow shot in a game of Murder Mystery",
          progress: "Progress: ✖",
          field: "robinHood",
        },
        {
          game: "main_lobby",
          name: "One With The Fish",
          description: "Catch 25 fish in the Main Lobby",
          progress: "Progress: 0/25",
          field: "oneWithTheFish",
        },
        {
          game: "prototype",
          name: "I Survived Anniversary Bingo",
          description: "Survive 5 Disasters in games of Disasters in the Prototype Lobby",
          progress: "Progress: 5/5",
          field: "iSurvivedAnniversaryBingo",
        },
        {
          game: "arcade_games",
          name: "Home Run",
          description: "Win any 3 games in the Arcade Games Lobby",
          progress: "Progress: 0/3",
          field: "homeRun",
        },
        {
          game: "arcade_games",
          name: "Into the Labyrinth",
          description: "Reach the middle of the Spider Maze in a round of Party Games in the Arcade Games",
          progress: "Progress: ✖",
          field: "intoTheLabyrinth",
        },
        {
          game: "build_battle",
          name: "A Perfect Medium",
          description: "Finish a MEDIUM build with 100% accuracy in a game of Speed Builders in the Build Battle Lobby",
          progress: "Progress: ✖",
          field: "aPerfectMedium",
        },
        {
          game: "arcade_games",
          name: "Fallin' Past the Fall",
          description: "Complete all 5 maps in a game of Dropper in the Arcade Lobby",
          progress: "Progress: ✔",
          field: "fallinPastTheFall",
        },
        {
          game: "arcade_games",
          name: "Not Quite a Dead End",
          description: "Open up a new location in a game of Zombies in Arcade Games",
          progress: "Progress: ✖",
          field: "notQuiteADeadEnd",
        },
        {
          game: "build_battle",
          name: "Festive Spirit",
          description: 'Receive a "Good" or higher vote in a game of Build Battle',
          progress: "Progress: ✖",
          field: "festiveSpirit",
        },
        {
          game: "arcade_games",
          name: "Intermediate Egg Hunter",
          description: "Find 25 eggs in a game of Easter Simulator in the Arcade Lobby",
          progress: "Progress: ✖",
          field: "intermediateEggHunter",
        },
        {
          game: "housing",
          name: "If You Give A House A Cookie",
          description: "Give Cookies to other players in Housing",
          progress: "Progress: 5/5",
          field: "ifYouGiveAHouseACookie",
        },
        {
          game: "prototype",
          name: "Ain't No TNT Tag",
          description: "Pass the Hot Potato to another player in a game of Disasters in the Prototype Lobby",
          progress: "Progress: ✖",
          field: "ainTNoTNTTag",
        },
        {
          game: "arcade_games",
          name: "Podium Position",
          description: "Finish in the top 3 for one round of Party Games in Arcade Games",
          progress: "Progress: ✖",
          field: "podiumPosition",
        },
        {
          game: "murder_mystery",
          name: "Golden Sun",
          description: "Collect 15 Gold in a game of Murder Mystery",
          progress: "Progress: ✖",
          field: "goldenSun",
        },
        {
          game: "build_battle",
          name: "The Thing!",
          description: "Have 5 players correctly guess your build in a game of Guess the Build in Build Battle",
          progress: "Progress: ✔",
          field: "theThing!",
        },
        {
          game: "murder_mystery",
          name: "Doomsday Prep",
          description: "Win a game of Murder Mystery: Infection as a Survivor",
          progress: "Progress: ✖",
          field: "doomsdayPrep",
        },
      ],
    },
    pvp: {
      tasks: [
        {
          field: "littleShopOfTraps",
          game: "bed_wars",
          name: "Little Shop of Traps",
          description: "Purchase a trap in a game of Bed Wars",
          progress: "Progress: ✖",
        },
        {
          field: "sumoVictor",
          game: "duels",
          name: "Sumo Victor",
          description: "Win a game of Sumo Duels",
          progress: "Progress: ✖",
        },
        {
          field: "ironWall",
          game: "skywars",
          name: "Iron Wall",
          description: "Wear a full set of Iron Armor in a game of SkyWars",
          progress: "Progress: ✖",
        },
        {
          field: "greenEyedMonster",
          game: "bed_wars",
          name: "Green-Eyed Monster",
          description: "Collect 2 emeralds from generators in a game of Bed Wars",
          progress: "Progress: ✖",
        },
        {
          field: "aLongWayDown",
          game: "skywars",
          name: "A Long Way Down...",
          description: "Knock 3 players into the void in a game of SkyWars",
          progress: "Progress: ✖",
        },
        {
          field: "crushingVictory",
          game: "wool_games",
          name: "Crushing Victory",
          description: "Win a game of Wool Wars without losing a single round",
          progress: "Progress: ✖",
        },
        {
          field: "bedDestroyer",
          game: "bed_wars",
          name: "Bed Destroyer",
          description: "Break 2 beds in games of Bed Wars",
          progress: "Progress: 0/2",
        },
        {
          field: "swiftOfFoot",
          game: "duels",
          name: "Swift of Foot",
          description: "Reach the 3rd checkpoint in a game of Parkour Duels",
          progress: "Progress: ✖",
        },
        {
          field: "classicVictor",
          game: "duels",
          name: "Classic Victor",
          description: "Win a game of Classic Duels",
          progress: "Progress: ✖",
        },
        {
          field: "funWithFriends",
          game: "skywars",
          name: "Fun with Friends",
          description: "Get a kill in a game of SkyWars Doubles",
          progress: "Progress: ✖",
        },
        {
          field: "multifacetedKiller",
          game: "duels",
          name: "Multifaceted Killer",
          description: "Kill 4 in games of Duels",
          progress: "Progress: 0/4",
        },
        {
          field: "infestation",
          game: "bed_wars",
          name: "Infestation",
          description: "Throw a Bedbug in a game of Bed Wars",
          progress: "Progress: ✖",
        },
        {
          field: "woolThatKills",
          game: "wool_games",
          name: "Wool That Kills",
          description: "Kill 2 players with explosive damage in a game of Sheep Wars in the Wool Games Lobby",
          progress: "Progress: ✖",
        },
        {
          field: "andStayDown",
          game: "bed_wars",
          name: "And Stay Down!",
          description: "Get 1 Final Kills in games of Bed Wars",
          progress: "Progress: ✖",
        },
        {
          field: "suitUp",
          game: "wool_games",
          name: "Suit Up!",
          description: "Purchase a Kit in a game of Capture the Wool in the Wool Games Lobby",
          progress: "Progress: ✖",
        },
        {
          field: "treasureHunter",
          game: "skywars",
          name: "Treasure Hunter",
          description: "Open 10 chests in games of SkyWars",
          progress: "Progress: 0/10",
        },
      ],
    },
    classic: {
      tasks: [
        {
          field: "notEnoughToGoAround",
          game: "the_tnt_games",
          name: "Not Enough to Go Around",
          description: "Pick up 2 powerups in a game of TNT Tag in the TNT Games Lobby",
          progress: "Progress: ✔",
        },
        {
          field: "bloodthirsty",
          game: "smash_heroes",
          name: "Bloodthirsty",
          description: "Get the first kill in a game of Smash Heroes",
          progress: "Progress: ✖",
        },
        {
          field: "handOfTheKing",
          game: "mega_walls",
          name: "Hand of the King",
          description: "Hit a player attacking your Wither in a game of Mega Walls",
          progress: "Progress: ✖",
        },
        {
          field: "sunnyDelight",
          game: "quakecraft",
          name: "Sunny Delight",
          description: "Kill 10 players in games of Quakecraft in the Classic Lobby",
          progress: "Progress: 10/10",
        },
        {
          field: "threeTimesTheFun",
          game: "paintball_warfare",
          name: "Three Times the Fun!",
          description: "Activate the Triple Shot killstreak in a game of Paintball in the Classic Lobby",
          progress: "Progress: ✖",
        },
        {
          field: "defusalVictor",
          game: "cops_and_crims",
          name: "Defusal Victor",
          description: "Win a game of Defusal in Cops and Crims",
          progress: "Progress: ✔",
        },
        {
          field: "revelingInTheSun",
          game: "the_tnt_games",
          name: "Reveling in the Sun",
          description: "Survive for a total of 5 minutes in games of TNT Run in the TNT Games Lobby",
          progress: "Progress: 4/5",
        },
        {
          field: "shutdown",
          game: "blitz_sg",
          name: "Shutdown",
          description: "Kill a player who has at least 1 kill in a game of Blitz Survival Games",
          progress: "Progress: ✔",
        },
        {
          field: "witheringHeights",
          game: "mega_walls",
          name: "Withering Heights",
          description: "Damage a Wither in a game of Mega Walls",
          progress: "Progress: ✖",
        },
        {
          field: "quenchy",
          game: "blitz_sg",
          name: "Quenchy",
          description: "Splash yourself with a potion in a game of Blitz Survival Games",
          progress: "Progress: ✔",
        },
        {
          field: "slowingThemDown",
          game: "warlords",
          name: "Slowing Them Down",
          description: "Damage a player who is carrying your flag in the Capture the Flag mode of Warlords",
          progress: "Progress: ✖",
        },
        {
          field: "tooStronk",
          game: "smash_heroes",
          name: "TOO STRONK",
          description: "Throw a player off the map in a game of Smash Heroes",
          progress: "Progress: ✖",
        },
        {
          field: "amateurWizard",
          game: "the_tnt_games",
          name: "Amateur Wizard",
          description: "Capture a point in a game of Wizards in the TNT Games Lobby",
          progress: "Progress: ✔",
        },
        {
          field: "luckyLooter",
          game: "turbo_kart_racers",
          name: "Lucky Looter",
          description: "Pick up 10 item boxes in a single game of Turbo Kart Racers in the Classic Lobby",
          progress: "Progress: ✔",
        },
        {
          field: "ninjaVanish",
          game: "cops_and_crims",
          name: "Ninja Vanish",
          description: "Kill a player being affected by a Smoke Grenade in a game of Cops and Crims",
          progress: "Progress: ✖",
        },
        {
          field: "longNight",
          game: "vampirez",
          name: "Long Night",
          description: "Survive for 5 minutes in games of VampireZ in the Classic Games Lobby",
          progress: "Progress: 5/5",
        },
      ],
    },
  },
};

export default function TestPage() {
  const difficulty = "easy";
  const category = "casual";

  const bingo = boards[difficulty][category];

  return (
    <div className="relative h-[100dvh]">
      <Background
        background="background"
        className="h-full"
        mask="linear-gradient(rgb(255 255 255) 20%, rgb(0 0 0 / 0) 95%)"
      />
      <div className="absolute h-[100dvh] w-full bg-[rgb(17_17_17_/0.7)] -z-10" />
      <div className="w-full h-full flex justify-center items-center flex-col gap-8">
        <div className="flex flex-col gap-2 items-center">
          <h1 className="text-mc-yellow text-mc-7 font-bold">Bingo Tracker</h1>
          <h2 className="text-mc-gold text-mc-3">12th Anniversary Bingo</h2>
        </div>
        <Search className="w-[80%]" />
        <div className="flex gap-4 items-center justify-center">
          <div className="flex gap-2">
            <Box borderRadius={{ bottom: 0 }}>
              <span className="text-mc-white font-bold">Casual</span>
            </Box>
            <Box borderRadius={{ bottom: 0 }}>
              <span className="text-mc-white/60">PvP</span>
            </Box>
            <Box borderRadius={{ bottom: 0 }}>
              <span className="text-mc-white/60">Classic</span>
            </Box>
          </div>
          <div className="h-[70%] w-[2px] bg-white/20" />
          <div className="flex gap-2">
            <Box borderRadius={{ bottom: 0 }}>
              <span className="text-mc-green font-bold">Easy</span>
            </Box>
            <Box borderRadius={{ bottom: 0 }}>
              <span className="text-mc-red/50">Hard</span>
            </Box>
          </div>
        </div>
        <div className="flex justify-evenly w-full">
          <div className="flex flex-col">
            <Box contentClass="flex flex-col gap-8">
              <div className="flex flex-col gap-4">
                <p className="text-center">
                  <span className="flex items-center justify-center gap-2">
                    <Image
                      src={SkyWarsIcon}
                      width={32}
                      height={32}
                      alt="icon"
                      style={{ imageRendering: "pixelated" }}
                      className="opacity-80 group-aria-pressed:opacity-100 transition-opacity"
                    />
                    Casual Bingo Cards
                  </span>
                </p>
                <div className="flex flex-col gap-1">
                  <p className="text-mc-gray">
                    <span className="text-mc-green">Easy</span>: <span className="text-mc-red">0%</span> completed
                  </p>
                  <p className="text-mc-gray">
                    <span className="text-mc-red">Hard</span>: <span className="text-mc-red">0%</span> completed
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <p className="text-center">
                  <span className="flex items-center justify-center gap-2">
                    <Image
                      src={SkyWarsIcon}
                      width={32}
                      height={32}
                      alt="icon"
                      style={{ imageRendering: "pixelated" }}
                      className="opacity-80 group-aria-pressed:opacity-100 transition-opacity"
                    />
                    PvP Bingo Cards
                  </span>
                </p>
                <div className="flex flex-col gap-1">
                  <p className="text-mc-gray">
                    <span className="text-mc-green">Easy</span>: <span className="text-mc-red">0%</span> completed
                  </p>
                  <p className="text-mc-gray">
                    <span className="text-mc-red">Hard</span>: <span className="text-mc-red">0%</span> completed
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <p className="text-center">
                  <span className="flex items-center justify-center gap-2">
                    <Image
                      src={SkyWarsIcon}
                      width={32}
                      height={32}
                      alt="icon"
                      style={{ imageRendering: "pixelated" }}
                      className="opacity-80 group-aria-pressed:opacity-100 transition-opacity"
                    />
                    Classic Bingo Cards
                  </span>
                </p>
                <div className="flex flex-col gap-1">
                  <p className="text-mc-gray">
                    <span className="text-mc-green">Easy</span>: <span className="text-mc-red">0%</span> completed
                  </p>
                  <p className="text-mc-gray">
                    <span className="text-mc-red">Hard</span>: <span className="text-mc-red">0%</span> completed
                  </p>
                </div>
              </div>
            </Box>
          </div>
          <div className="grid grid-cols-6 grid-rows-6">
            <Box>{bingo.diagonalRewards[0].name}</Box>
            {bingo.columnRewards.map((reward) => (
              <Box key={reward.name}>{reward.name}</Box>
            ))}
            <Box>{bingo.diagonalRewards[1].name}</Box>

            <div className="grid grid-cols-4 grid-rows-4 row-span-5 col-span-5">
              {["task1", "task2", "task3", "task4"].map((item, index) => (
                <Box key={index}>{item}</Box>
              ))}
              {["task5", "task6", "task7", "task8"].map((item, index) => (
                <Box key={index}>{item}</Box>
              ))}
              {["task9", "task10", "task11", "task12"].map((item, index) => (
                <Box key={index}>{item}</Box>
              ))}
              {["task13", "task14", "task15", "task16"].map((item, index) => (
                <Box key={index}>{item}</Box>
              ))}
            </div>

            {bingo.rowRewards.map((reward) => (
              <Box key={reward.name} containerClass="col-start-6">
                {reward.name}
              </Box>
            ))}
          </div>
        </div>
      </div>
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
