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

// The Disasters card's literals (`disasters.tsx`), in its order: names in their own colours, values in §f.
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
  Object.fromEntries(Object.entries(names).map(([key, name]) => [key, { colour: "§f", name }]));

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
  wins: { colour: "§a" },
  roundsWon: { colour: "§e", label: "stats.roundWins" },
  starsEarned: { colour: "§6" },
  ...Object.fromEntries(ROUNDS.map((round) => [`${round}Wins`, { colour: "§a", name: roundName(round) }])),
  ...Object.fromEntries(BEST_TIMES.map((round) => [`${round}BestTime`, { colour: "§a", name: roundName(round), unset: "§7N/A" }])),
  ...Object.fromEntries(BEST_SCORES.map((round) => [`${round}BestScore`, { colour: "§a", name: roundName(round) }])),
};

/**
 * Dropper's maps as the card lists them (`dropper.tsx`): under §cHard, §eMedium and §aEasy, each by key, under their
 * leaderboard names, which carry the difficulty's colour.
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
  stats: { completions: { colour: "§f", name }, bestTime: { colour: "§f", name, unset: "§7N/A" } },
}));

// A map's block on the Zombies cards (`zombies.tsx`); Zombies › Overall draws a map's Fastest Win and Best Round in §e.
const ZOMBIES: Record<string, StatEntry> = {
  wins: { colour: "§a" },
  bestRound: { colour: "§a" },
  kills: { colour: "§e" },
  deaths: { colour: "§c" },
  fastestWin: { colour: "§b", unset: "N/A" },
  totalRounds: { colour: "§d" },
  doorsOpened: { colour: "§9" },
};

/** Zombies › Overall's own block: a map's, but with no Fastest Win, which only a map has. */
const ZOMBIES_OVERALL: Record<string, StatEntry> = Object.fromEntries(Object.entries(ZOMBIES).filter(([key]) => key !== "fastestWin"));

const HIDE_AND_SEEK: Record<string, StatEntry> = { wins: { colour: "§a" }, hiderWins: { colour: "§e" }, seekerWins: { colour: "§b" } };

const HYPIXEL_SAYS: Record<string, StatEntry> = {
  wins: { colour: "§a" },
  roundsWon: { colour: "§b", label: "stats.roundWins" },
  points: { colour: "§e" },
  maxScore: { colour: "§6", label: "stats.maxPoints" },
};

const PIXEL_PARTY: Record<string, StatEntry> = {
  wins: { colour: "§a" },
  losses: { colour: "§c" },
  wlr: { colour: "§6" },
  gamesPlayed: { colour: "§b" },
};

/**
 * The colours and labels of the bot's Arcade cards (`apps/discord-bot/src/commands/arcade`). A mode's Wins is in its
 * own card's colour here; Overall colours them by rank.
 */
export const ARCADE: Game<ArcadeModes> = {
  key: "arcade",
  id: "ARCADE",
  modes: ARCADE_MODES,
  game: {
    coins: { colour: "§6" },
    coinConversions: { colour: "§e" },
    wins: { colour: "§b", label: "stats.arcadeWins" },
  },
  shapes: [
    { modes: ["blockingDead"], stats: { wins: { colour: "§e" }, kills: { colour: "§a" }, headshots: { colour: "§6" } } },
    {
      modes: ["bountyHunters"],
      stats: {
        wins: { colour: "§a" },
        bountyKills: { colour: "§e" },
        kills: { colour: "§a" },
        deaths: { colour: "§c" },
        kdr: { colour: "§6" },
        // Not on the card: coloured as its Kills.
        bowKills: { colour: "§a" },
        swordKills: { colour: "§a" },
      },
    },
    { modes: ["creeperAttack"], stats: { maxWave: { colour: "§a" } } },
    {
      modes: ["disasters"],
      stats: {
        wins: { colour: "§a" },
        losses: { colour: "§c" },
        wlr: { colour: "§6" },
        gamesPlayed: { colour: "§e" },
        playtime: { colour: "§b" },
        powerups: { colour: "§5" },
      },
    },
    { modes: ["disasters.survivals"], stats: named(SURVIVALS) },
    { modes: ["disasters.deaths"], stats: named(DEATHS) },
    { modes: ["dragonWars"], stats: { wins: { colour: "§e" }, kills: { colour: "§a" }, mounts: { colour: "§6" } } },
    {
      modes: ["dropper"],
      stats: {
        wins: { colour: "§a" },
        fails: { colour: "§c" },
        mapsCompleted: { colour: "§e" },
        gamesPlayed: { colour: "§b" },
        gamesFinished: { colour: "§3" },
        bestTime: { colour: "§d", unset: "N/A" },
        flawlessGames: { colour: "§5" },
      },
    },
    ...DROPPER_MAP_SHAPES,
    {
      modes: ["enderSpleef"],
      stats: {
        wins: { colour: "§a" },
        blocksBroken: { colour: "§c" },
        trail: selection("§6"),
        bigShot: { colour: "§a" },
        tripleShot: { colour: "§c" },
        powerupActivations: { colour: "§6", label: "stats.total" },
      },
    },
    {
      modes: ["farmHunt"],
      stats: {
        wins: { colour: "§e" },
        kills: { colour: "§a" },
        tauntsUsed: { colour: "§b" },
        poopCollected: { colour: "§#a7673f" },
        animalWins: { colour: "§e", label: "stats.wins" },
        animalKills: { colour: "§a", label: "stats.kills" },
        hunterWins: { colour: "§e", label: "stats.wins" },
        hunterKills: { colour: "§a", label: "stats.kills" },
      },
    },
    {
      modes: ["football"],
      stats: { wins: { colour: "§a" }, goals: { colour: "§b" }, kicks: { colour: "§e" }, powerKicks: { colour: "§6" } },
    },
    {
      modes: ["galaxyWars"],
      stats: {
        wins: { colour: "§a" },
        rebelKills: { colour: "§c" },
        empireKills: { colour: "§6" },
        kills: { colour: "§a" },
        deaths: { colour: "§c" },
        kdr: { colour: "§6" },
      },
    },
    { modes: ["hideAndSeek"], stats: { objectivesCompleted: { colour: "§a", label: "stats.objectives" }, kills: { colour: "§b" } } },
    { modes: ["hideAndSeek.overall", "hideAndSeek.partyPooper", "hideAndSeek.propHunt"], stats: HIDE_AND_SEEK },
    {
      modes: ["holeInTheWall"],
      stats: {
        wins: { colour: "§a" },
        wallsFaced: { colour: "§c" },
        highestScoreQualifications: { colour: "§b" },
        highestScoreFinals: { colour: "§6" },
      },
    },
    { modes: ["hypixelSays", "hypixelSays.simonSays", "hypixelSays.santaSays"], stats: HYPIXEL_SAYS },
    {
      modes: ["miniWalls"],
      stats: {
        finalKills: { colour: "§a" },
        wins: { colour: "§e" },
        kit: selection("§b"),
        kills: { colour: "§a" },
        deaths: { colour: "§c" },
        kdr: { colour: "§6" },
        witherKills: { colour: "§#417286" },
        witherDamage: { colour: "§#0668af" },
      },
    },
    { modes: ["partyGames"], stats: PARTY_GAMES },
    { modes: ["pixelPainters"], stats: { wins: { colour: "§a" } } },
    { modes: ["pixelParty"], stats: { roundsCompleted: { colour: "§e" }, powerupsCollected: { colour: "§d" } } },
    { modes: ["pixelParty.overall", "pixelParty.normal", "pixelParty.hyper"], stats: PIXEL_PARTY },
    // Only Overall's ranking shows the total, in its rank's colour.
    { modes: ["seasonal"], stats: { totalWins: { colour: "§a" } } },
    { modes: ["seasonal.easterSimulator"], stats: { wins: { colour: "§d" }, eggsFound: { colour: "§e" } } },
    { modes: ["seasonal.grinchSimulator"], stats: { wins: { colour: "§a" }, giftsFound: { colour: "§c" } } },
    { modes: ["seasonal.halloweenSimulator"], stats: { wins: { colour: "§6" }, candyFound: { colour: "§5" } } },
    { modes: ["seasonal.scubaSimulator"], stats: { wins: { colour: "§e" }, points: { colour: "§b" } } },
    {
      modes: ["throwOut"],
      stats: { wins: { colour: "§e" }, kills: { colour: "§a" }, deaths: { colour: "§c" }, kdr: { colour: "§6" } },
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
