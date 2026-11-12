/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ARCADE_MODES, type ArcadeModes, DropperMaps, scanMetadata } from "@statsify/schemas";
import { type Game, type Shape, type StatEntry, selection } from "../catalog.js";
import { prettify } from "@statsify/util";

// The Disasters card's literals (`disasters.tsx`), in its order: names in their own colors, values in §f.
const SURVIVALS: Record<string, string> = {
  overall: "§l§fOVERALL",
  acidRain: "§l§aACID RAIN",
  anvilRain: "§l§7ANVIL RAIN §7[S]",
  batSwarm: "§l§8BAT SWARM §7[S]",
  blackout: "§l§5BLACKOUT §7[S]",
  disco: "§l§dDISCO §7[S]",
  dragons: "§l§5DRAGONS",
  flood: "§l§9FLOOD",
  fragileGround: "§l§7FRAGILE GROUND",
  grounded: "§l§2GROUNDED §7[S]",
  halfHealth: "§l§aHALF HEALTH §7[S]",
  hotPotato: "§l§6HOT POTATO §7[S]",
  hypixelSays: "§l§6HYPIXEL SAYS §7[S]",
  lightning: "§l§eLIGHTNING",
  meteorShower: "§l§cMETEOR SHOWER",
  nuke: "§l§cNUKE §7[S]",
  purge: "§l§aPURGE §7[S]",
  redLightGreenLight: "§l§cRED LIGHT§r§f, §l§aGREEN LIGHT §7[S]",
  sinkhole: "§l§6SINKHOLE",
  solarFlare: "§l§6SOLAR FLARE",
  stampede: "§l§6STAMPEDE",
  swappage: "§l§dSWAPPAGE §7[S]",
  theFloorIsLava: "§l§cTHE FLOOR IS LAVA",
  tntRain: "§l§4TNT RAIN",
  tornado: "§l§7TORNADO",
  werewolf: "§l§cWEREWOLF §7[S]",
  withers: "§l§3WITHERS",
  zombieApocalypse: "§l§2ZOMBIE APOCALYPSE",
};

const DEATHS: Record<string, string> = {
  overall: "§l§fOVERALL",
  acidRain: "§l§aACID RAIN",
  anvilRain: "§l§7ANVIL RAIN §7[S]",
  batSwarm: "§l§8BAT SWARM §7[S]",
  disco: "§l§dDISCO §7[S]",
  dragons: "§l§5DRAGONS",
  fall: "§l§eFALL",
  flood: "§l§9FLOOD",
  hotPotato: "§l§6HOT POTATO §7[S]",
  hypixelSays: "§l§6HYPIXEL SAYS §7[S]",
  lightning: "§l§eLIGHTNING",
  nuke: "§l§cNUKE §7[S]",
  redLightGreenLight: "§l§cRED LIGHT§r§f, §l§aGREEN LIGHT §7[S]",
  sinkhole: "§l§6SINKHOLE",
  solarFlare: "§l§6SOLAR FLARE",
  stampede: "§l§6STAMPEDE",
  theFloorIsLava: "§l§cTHE FLOOR IS LAVA",
  tntRain: "§l§4TNT RAIN",
  tornado: "§l§7TORNADO",
  unknown: "§l§4UNKNOWN",
  void: "§l§5VOID",
  werewolf: "§l§cWEREWOLF §7[S]",
  withers: "§l§3WITHERS",
  zombieApocalypse: "§l§2ZOMBIE APOCALYPSE",
};

const named = (names: Record<string, string>): Record<string, StatEntry> =>
  Object.fromEntries(Object.entries(names).map(([key, name]) => [key, { color: "§f", name }]));

// The Party Games card's round names (`party-games.tsx`): every round's wins, then the best times and best scores it
// shows, each in the card's order.
const ROUNDS = [
  "animalSlaughter",
  "anvilSpleef",
  "avalanche",
  "bombardment",
  "cannonPainting",
  "chickenRings",
  "dive",
  "fireLeapers",
  "frozenFloor",
  "highGround",
  "hoeHoeHoe",
  "jigsawRush",
  "jungleJump",
  "labEscape",
  "lawnMoower",
  "minecartRacing",
  "pigFishing",
  "pigJousting",
  "rpg16",
  "shootingRange",
  "spiderMaze",
  "superSheep",
  "theFloorIsLava",
  "trampolinio",
  "volcano",
  "workshop",
] as const;

const roundName = (round: string) => (round === "rpg16" ? "RPG-16" : prettify(round));

const BEST_TIMES = [
  "anvilSpleef",
  "labEscape",
  "jigsawRush",
  "theFloorIsLava",
  "chickenRings",
  "jungleJump",
  "bombardment",
  "minecartRacing",
  "spiderMaze",
];

const BEST_SCORES = ["animalSlaughter", "dive", "highGround", "hoeHoeHoe", "lawnMoower", "rpg16"];

const PARTY_GAMES: Record<string, StatEntry> = {
  wins: { color: "§a" },
  roundsWon: { color: "§e", label: "stats.roundWins" },
  starsEarned: { color: "§6" },
  ...Object.fromEntries(ROUNDS.map((round) => [`${round}Wins`, { color: "§a", name: roundName(round) }])),
  ...Object.fromEntries(BEST_TIMES.map((round) => [`${round}BestTime`, { color: "§a", name: roundName(round), unset: "§7N/A" }])),
  ...Object.fromEntries(BEST_SCORES.map((round) => [`${round}BestScore`, { color: "§a", name: roundName(round) }])),
};

/**
 * Dropper's maps as the card lists them (`dropper.tsx`): under §cHard, §eMedium and §aEasy, each by key, under their
 * leaderboard names, which carry the difficulty's color.
 */
export const DROPPER_DIFFICULTIES: { name: string; maps: [key: keyof DropperMaps, name: string][] }[] = (() => {
  const maps = scanMetadata(DropperMaps)
    .filter(([key]) => key.endsWith(".bestTime"))
    .map(([key, { leaderboard }]): [keyof DropperMaps, string] => [
      key.replace(".bestTime", "") as keyof DropperMaps,
      leaderboard.name.replace(" Best Time", ""),
    ])
    .toSorted(([a], [b]) => a.localeCompare(b));

  return ["§cHard", "§eMedium", "§aEasy"].map((name) => ({
    name,
    maps: maps.filter(([, map]) => map.startsWith(name.slice(0, 2))),
  }));
})();

const DROPPER_MAPS = DROPPER_DIFFICULTIES.flatMap(({ maps }) => maps);

const DROPPER_MAP_SHAPES: Shape[] = DROPPER_MAPS.map(([key, name]) => ({
  modes: [`dropper.maps.${key}`],
  stats: { completions: { color: "§f", name }, bestTime: { color: "§f", name, unset: "§7N/A" } },
}));

// A map's block on the Zombies cards (`zombies.tsx`); Zombies › Overall draws a map's Fastest Win and Best Round in §e.
const ZOMBIES: Record<string, StatEntry> = {
  wins: { color: "§a" },
  bestRound: { color: "§a" },
  kills: { color: "§e" },
  deaths: { color: "§c" },
  fastestWin: { color: "§b", unset: "N/A" },
  totalRounds: { color: "§d" },
  doorsOpened: { color: "§9" },
};

/** Zombies › Overall's own block: a map's, but with no Fastest Win, which only a map has. */
const ZOMBIES_OVERALL: Record<string, StatEntry> = Object.fromEntries(Object.entries(ZOMBIES).filter(([key]) => key !== "fastestWin"));

const HIDE_AND_SEEK: Record<string, StatEntry> = { wins: { color: "§a" }, hiderWins: { color: "§e" }, seekerWins: { color: "§b" } };

const HYPIXEL_SAYS: Record<string, StatEntry> = {
  wins: { color: "§a" },
  roundsWon: { color: "§b", label: "stats.roundWins" },
  points: { color: "§e" },
  maxScore: { color: "§6", label: "stats.maxPoints" },
};

const PIXEL_PARTY: Record<string, StatEntry> = {
  wins: { color: "§a" },
  losses: { color: "§c" },
  wlr: { color: "§6" },
  gamesPlayed: { color: "§b" },
};

/**
 * The colors and labels of the bot's Arcade cards (`apps/discord-bot/src/commands/arcade`). A mode's Wins is in its
 * own card's color here; Overall colors them by rank.
 */
export const ARCADE: Game<ArcadeModes> = {
  key: "arcade",
  id: "ARCADE",
  modes: ARCADE_MODES,
  game: {
    coins: { color: "§6" },
    coinConversions: { color: "§e" },
    wins: { color: "§b", label: "stats.arcadeWins" },
  },
  shapes: [
    { modes: ["blockingDead"], stats: { wins: { color: "§e" }, kills: { color: "§a" }, headshots: { color: "§6" } } },
    {
      modes: ["bountyHunters"],
      stats: {
        wins: { color: "§a" },
        bountyKills: { color: "§e" },
        kills: { color: "§a" },
        deaths: { color: "§c" },
        kdr: { color: "§6" },
        // Not on the card: colored as its Kills.
        bowKills: { color: "§a" },
        swordKills: { color: "§a" },
      },
    },
    { modes: ["creeperAttack"], stats: { maxWave: { color: "§a" } } },
    {
      modes: ["disasters"],
      stats: {
        wins: { color: "§a" },
        losses: { color: "§c" },
        wlr: { color: "§6" },
        gamesPlayed: { color: "§e" },
        playtime: { color: "§b" },
        powerups: { color: "§5" },
      },
    },
    { modes: ["disasters.survivals"], stats: named(SURVIVALS) },
    { modes: ["disasters.deaths"], stats: named(DEATHS) },
    { modes: ["dragonWars"], stats: { wins: { color: "§e" }, kills: { color: "§a" }, mounts: { color: "§6" } } },
    {
      modes: ["dropper"],
      stats: {
        wins: { color: "§a" },
        fails: { color: "§c" },
        mapsCompleted: { color: "§e" },
        gamesPlayed: { color: "§b" },
        gamesFinished: { color: "§3" },
        bestTime: { color: "§d", unset: "N/A" },
        flawlessGames: { color: "§5" },
      },
    },
    ...DROPPER_MAP_SHAPES,
    {
      modes: ["enderSpleef"],
      stats: {
        wins: { color: "§a" },
        blocksBroken: { color: "§c" },
        trail: selection("§6"),
        bigShot: { color: "§a" },
        tripleShot: { color: "§c" },
        powerupActivations: { color: "§6", label: "stats.total" },
      },
    },
    {
      modes: ["farmHunt"],
      stats: {
        wins: { color: "§e" },
        kills: { color: "§a" },
        tauntsUsed: { color: "§b" },
        poopCollected: { color: "§#a7673f" },
        animalWins: { color: "§e", label: "stats.wins" },
        animalKills: { color: "§a", label: "stats.kills" },
        hunterWins: { color: "§e", label: "stats.wins" },
        hunterKills: { color: "§a", label: "stats.kills" },
      },
    },
    {
      modes: ["football"],
      stats: { wins: { color: "§a" }, goals: { color: "§b" }, kicks: { color: "§e" }, powerKicks: { color: "§6" } },
    },
    {
      modes: ["galaxyWars"],
      stats: {
        wins: { color: "§a" },
        rebelKills: { color: "§c" },
        empireKills: { color: "§6" },
        kills: { color: "§a" },
        deaths: { color: "§c" },
        kdr: { color: "§6" },
      },
    },
    { modes: ["hideAndSeek"], stats: { objectivesCompleted: { color: "§a", label: "stats.objectives" }, kills: { color: "§b" } } },
    { modes: ["hideAndSeek.overall", "hideAndSeek.partyPooper", "hideAndSeek.propHunt"], stats: HIDE_AND_SEEK },
    {
      modes: ["holeInTheWall"],
      stats: {
        wins: { color: "§a" },
        wallsFaced: { color: "§c" },
        highestScoreQualifications: { color: "§b" },
        highestScoreFinals: { color: "§6" },
      },
    },
    { modes: ["hypixelSays", "hypixelSays.simonSays", "hypixelSays.santaSays"], stats: HYPIXEL_SAYS },
    {
      modes: ["miniWalls"],
      stats: {
        finalKills: { color: "§a" },
        wins: { color: "§e" },
        kit: selection("§b"),
        kills: { color: "§a" },
        deaths: { color: "§c" },
        kdr: { color: "§6" },
        witherKills: { color: "§#417286" },
        witherDamage: { color: "§#0668af" },
      },
    },
    { modes: ["partyGames"], stats: PARTY_GAMES },
    { modes: ["pixelPainters"], stats: { wins: { color: "§a" } } },
    { modes: ["pixelParty"], stats: { roundsCompleted: { color: "§e" }, powerupsCollected: { color: "§d" } } },
    { modes: ["pixelParty.overall", "pixelParty.normal", "pixelParty.hyper"], stats: PIXEL_PARTY },
    // Only Overall's ranking shows the total, in its rank's color.
    { modes: ["seasonal"], stats: { totalWins: { color: "§a" } } },
    { modes: ["seasonal.easterSimulator"], stats: { wins: { color: "§d" }, eggsFound: { color: "§e" } } },
    { modes: ["seasonal.grinchSimulator"], stats: { wins: { color: "§a" }, giftsFound: { color: "§c" } } },
    { modes: ["seasonal.halloweenSimulator"], stats: { wins: { color: "§6" }, candyFound: { color: "§5" } } },
    { modes: ["seasonal.scubaSimulator"], stats: { wins: { color: "§e" }, points: { color: "§b" } } },
    {
      modes: ["throwOut"],
      stats: { wins: { color: "§e" }, kills: { color: "§a" }, deaths: { color: "§c" }, kdr: { color: "§6" } },
    },
    { modes: ["zombies.overall"], stats: ZOMBIES_OVERALL },
    {
      modes: [
        "zombies.deadEnd.overall",
        "zombies.deadEnd.normal",
        "zombies.deadEnd.hard",
        "zombies.deadEnd.rip",
        "zombies.badBlood.overall",
        "zombies.badBlood.normal",
        "zombies.badBlood.hard",
        "zombies.badBlood.rip",
        "zombies.alienArcadium",
        "zombies.prison.overall",
        "zombies.prison.normal",
        "zombies.prison.hard",
        "zombies.prison.rip",
      ],
      stats: ZOMBIES,
    },
  ],
};
