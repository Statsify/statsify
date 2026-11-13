/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { CoinsSchema, KillsStats, WinsStats } from "../common.js";
import { type NumberSchema, type ObjectSchema, s } from "#definition/s";
import { add, deepAdd, deepSub, sub } from "@statsify/math";
import type { APIData } from "@statsify/util";
import { FormattedGame } from "#game";
import { formats } from "#definition/format";

// Wins and kills without the rest of their ratio beside them
const WinsSchema = s.number().leaderboard({ limit: 500_000 });
const KillsSchema = s.number().leaderboard({ limit: 500_000 });

const BlockingDeadSchema = s.object({
  wins: WinsSchema.color("§e"),
  kills: KillsSchema.color("§a"),
  headshots: s.number().color("§6").leaderboard(false),
});

const BountyHuntersSchema = s.object({
  wins: WinsSchema.color("§a"),
  kills: KillsStats.kills,
  bowKills: s.number(),
  swordKills: s.number(),
  deaths: KillsStats.deaths,
  kdr: KillsStats.kdr,
  bountyKills: s.number().color("§e"),
});

const CreeperAttackSchema = s.object({
  maxWave: s.number().color("§a"),
});

const survivals = (disaster: string) =>
  s.number().color("§f").leaderboard({ fieldName: "Survivals", name: `${disaster} Survivals` });

const DisasterSurvivalsSchema = s.object({
  overall: s.number().color("§d").leaderboard({ fieldName: "Survivals", name: "Survivals" }),
  acidRain: survivals("Acid Rain"),
  dragons: survivals("Dragons"),
  flood: survivals("Flood"),
  fragileGround: survivals("Fragile Ground"),
  lightning: survivals("Lightning"),
  meteorShower: survivals("Meteor Shower"),
  sinkhole: survivals("Sinkhole"),
  solarFlare: survivals("Solar Flare"),
  stampede: survivals("Stampede"),
  theFloorIsLava: survivals("The Floor is Lava"),
  tntRain: survivals("TNT Rain"),
  tornado: survivals("Tornado"),
  withers: survivals("Withers"),
  zombieApocalypse: survivals("Zombie Apocalypse"),
  anvilRain: survivals("Anvil Rain"),
  batSwarm: survivals("Bat Swarm"),
  blackout: survivals("Blackout"),
  disco: survivals("Disco"),
  grounded: survivals("Grounded"),
  halfHealth: survivals("Half Health"),
  hotPotato: survivals("Hot Potato"),
  hypixelSays: survivals("Hypixel Says"),
  nuke: survivals("Nuke"),
  purge: survivals("Purge"),
  redLightGreenLight: survivals("Red Light Green Light"),
  swappage: survivals("Swappage"),
  werewolf: survivals("Werewolf"),
});

const deaths = (cause: string) =>
  s.number().color("§f").leaderboard({ fieldName: "Deaths", name: `${cause} Deaths` });

const DisastersDeathsSchema = s.object({
  overall: s.number().color("§f").leaderboard({ fieldName: "Deaths", name: "Deaths" }),
  stampede: deaths("Stampede"),
  void: deaths("Void"),
  withers: deaths("Withers"),
  fall: deaths("Fall"),
  redLightGreenLight: deaths("Red Light Green Light"),
  unknown: deaths("Unknown"),
  flood: deaths("Flood"),
  lightning: deaths("Lightning"),
  zombieApocalypse: deaths("Zombie Apocalypse"),
  tntRain: deaths("TNT Rain"),
  solarFlare: deaths("Solar Flare"),
  tornado: deaths("Tornado"),
  acidRain: deaths("Acid Rain"),
  batSwarm: deaths("Bat Swarm"),
  hotPotato: deaths("Hot Potato"),
  sinkhole: deaths("Sinkhole"),
  dragons: deaths("Dragons"),
  theFloorIsLava: deaths("The Floor is Lava"),
  anvilRain: deaths("Anvil Rain"),
  werewolf: deaths("Werewolf"),
  disco: deaths("Disco"),
  nuke: deaths("Nuke"),
  hypixelSays: deaths("Hypixel Says"),
});

const DisastersSchema = s.object({
  gamesPlayed: s.number().color("§e"),
  ...WinsStats,
  playtime: s.number().color("§b").format(formats.time),
  survivals: DisasterSurvivalsSchema.leaderboard({ name: "" }),
  deaths: DisastersDeathsSchema.leaderboard({ name: "" }),
  powerups: s.number().color("§5"),
});

const DragonWarsSchema = s.object({
  wins: WinsSchema.color("§e"),
  kills: KillsSchema.color("§a"),
  mounts: s.number().color("§6"),
});

const DropperMapSchema = s.object({
  completions: s.number().color("§f"),
  bestTime: s.number().color("§f").format(formats.raceTime).leaderboard({ sort: "ASC" }),
});

// Lists rather than objects keyed by property: swc's jsonify writes a large object literal with its keys sorted
const DROPPER_MAPS = [
  { property: "atlantis", key: "atlantis", name: "§cAtlantis§f" },
  { property: "balloons", key: "balloons", name: "§aBalloons§f" },
  { property: "bbq", key: "bbq", name: "§aBBQ§f" },
  { property: "beanstalk", key: "beanstalk", name: "§eBeanstalk§f" },
  { property: "birdcage", key: "birdcage", name: "§cBirdcage§f" },
  { property: "boardGames", key: "boardgames", name: "§aBoard Games§f" },
  { property: "bridges", key: "bridges", name: "§aBridges§f" },
  { property: "butterflies", key: "butterflies", name: "§eButterflies§f" },
  { property: "cabin", key: "cabin", name: "§eCabin§f" },
  { property: "castle", key: "castle", name: "§eCastle§f" },
  { property: "city", key: "city", name: "§eCity§f" },
  { property: "distance", key: "distance", name: "§aDistance§f" },
  { property: "distortion", key: "distortion", name: "§aDistortion§f" },
  { property: "drainage", key: "drainage", name: "§aDrainage§f" },
  { property: "emoji", key: "emoji", name: "§eEmoji§f" },
  { property: "factory", key: "factory", name: "§cFactory§f" },
  { property: "floatingIslands", key: "floatingislands", name: "§eFloating Islands§f" },
  { property: "flytrap", key: "flytrap", name: "§cFlytrap§f" },
  { property: "frogspawn", key: "frogspawn", name: "§cFrogspawn§f" },
  { property: "gears", key: "gears", name: "§cGears§f" },
  { property: "geometry", key: "geometry", name: "§eGeometry§f" },
  { property: "glacier", key: "glacier", name: "§eGlacier§f" },
  { property: "hellGate", key: "hellgate", name: "§cHell Gate§f" },
  { property: "illusion", key: "illusion", name: "§cIllusion§f" },
  { property: "iris", key: "iris", name: "§cIris§f" },
  { property: "kingdomMines", key: "kingdommines", name: "§aKingdom Mines§f" },
  { property: "kingsPass", key: "kingspass", name: "§aKing's Pass§f" },
  { property: "kraken", key: "kraken", name: "§aKraken§f" },
  { property: "launchZone", key: "launchzone", name: "§eLaunch Zone§f" },
  { property: "lavafall", key: "lavafall", name: "§eLavafall§f" },
  { property: "lily", key: "lily", name: "§aLily§f" },
  { property: "maelstrom", key: "maelstrom", name: "§eMaelstrom§f" },
  { property: "mainframe", key: "mainframe", name: "§aMainframe§f" },
  { property: "microscope", key: "microscope", name: "§aMicroscope§f" },
  { property: "mineshaft", key: "mineshaft", name: "§eMineshaft§f" },
  { property: "mushroom", key: "mushroom", name: "§aMushroom§f" },
  { property: "nightlife", key: "nightlife", name: "§eNightlife§f" },
  { property: "ocean", key: "ocean", name: "§cOcean§f" },
  { property: "overgrown", key: "overgrown", name: "§eOvergrown§f" },
  { property: "painted", key: "painted", name: "§ePainted§f" },
  { property: "paradigm", key: "paradigm", name: "§eParadigm§f" },
  { property: "raindrops", key: "raindrops", name: "§aRaindrops§f" },
  { property: "ravine", key: "ravine", name: "§eRavine§f" },
  { property: "retro", key: "retro", name: "§eRetro§f" },
  { property: "revolve", key: "revolve", name: "§aRevolve§f" },
  { property: "sandworm", key: "sandworm", name: "§cSandworm§f" },
  { property: "sewer", key: "sewer", name: "§aSewer§f" },
  { property: "space", key: "space", name: "§aSpace§f" },
  { property: "stratocumulus", key: "stratocumulus", name: "§eStratocumulus§f" },
  { property: "sweets", key: "sweets", name: "§eSweets§f" },
  { property: "tangle", key: "tangle", name: "§aTangle§f" },
  { property: "time", key: "time", name: "§aTime§f" },
  { property: "ufo", key: "ufo", name: "§eUFO§f" },
  { property: "upsideDown", key: "upsidedown", name: "§aUpside Down§f" },
  { property: "vintage", key: "vintage", name: "§aVintage§f" },
  { property: "vortex", key: "vortex", name: "§cVortex§f" },
  { property: "warp", key: "warp", name: "§aWarp§f" },
  { property: "warportal", key: "warportal", name: "§eWarportal§f" },
  { property: "well", key: "well", name: "§aWell§f" },
  { property: "western", key: "western", name: "§eWestern§f" },
] as const satisfies readonly { property: string; key: string; name: string }[];

type DropperMapsSchema = ObjectSchema<
  Record<(typeof DROPPER_MAPS)[number]["property"], typeof DropperMapSchema>
>;

const DropperMapsSchema = s.object(
  Object.fromEntries(
    DROPPER_MAPS.map(({ property, name }) => [property, DropperMapSchema.leaderboard({ name })])
  )
) as DropperMapsSchema;

const DropperSchema = s.object({
  wins: WinsSchema.color("§a"),
  fails: s.number().color("§c"),
  mapsCompleted: s.number().color("§e"),
  gamesPlayed: s.number().color("§b"),
  gamesFinished: s.number().color("§3"),
  flawlessGames: s.number().color("§5"),
  bestTime: s.number().color("§d").format(formats.time).leaderboard({ sort: "ASC" }),
  maps: DropperMapsSchema.leaderboard({ name: "Maps:" }),
});

const EnderSpleefSchema = s.object({
  wins: WinsSchema.color("§a"),
  trail: s.string().default("none"),
  blocksBroken: s.number().color("§c"),
  tripleShot: s.number().color("§c"),
  bigShot: s.number().color("§a"),
  powerupActivations: s.number().color("§6").leaderboard(false),
});

const FarmHuntSchema = s.object({
  wins: WinsSchema.color("§e"),
  animalWins: s.number().color("§e"),
  hunterWins: s.number().color("§e"),
  kills: KillsSchema.color("§a"),
  animalKills: s.number().color("§a"),
  hunterKills: s.number().color("§a"),
  tauntsUsed: s.number().color("§b"),
  poopCollected: s.number().color("§#a7673f"),
});

const FootballSchema = s.object({
  wins: WinsSchema.color("§a"),
  goals: s.number().color("§b"),
  kicks: s.number().color("§e"),
  powerKicks: s.number().color("§6"),
});

const GalaxyWarsSchema = s.object({
  wins: WinsSchema.color("§a"),
  ...KillsStats,
  empireKills: s.number().color("§6"),
  rebelKills: s.number().color("§c"),
});

const HideAndSeekModeSchema = s.object({
  wins() {
    return WinsSchema.color("§a").leaderboard({ additionalFields: [this.seekerWins, this.hiderWins] });
  },
  seekerWins() {
    return s.number().color("§b").leaderboard({ additionalFields: [this.wins] });
  },
  hiderWins() {
    return s.number().color("§e").leaderboard({ additionalFields: [this.wins] });
  },
});

const HideAndSeekSchema = s.object({
  overall: HideAndSeekModeSchema,
  propHunt: HideAndSeekModeSchema,
  partyPooper: HideAndSeekModeSchema,
  kills: KillsSchema.color("§b"),
  objectivesCompleted: s.number().color("§a"),
});

const HoleInTheWallSchema = s.object({
  wins() {
    return WinsSchema.color("§a").leaderboard({
      additionalFields: [this.highestScoreQualifications, this.highestScoreFinals],
    });
  },
  wallsFaced: s.number().color("§c"),
  highestScoreQualifications: s
    .number()
    .color("§b")
    .leaderboard({ name: "Highest Score - Qualifications", fieldName: "Qualifiers PB" }),
  highestScoreFinals: s
    .number()
    .color("§6")
    .leaderboard({ name: "Highest Score - Finals", fieldName: "Finals PB" }),
});

const HypixelSaysStats = s.fields({
  points: s.number().color("§e"),
  roundsWon: s.number().color("§b"),
  wins() {
    return WinsSchema.color("§a").leaderboard({ additionalFields: [this.roundsWon, this.points] });
  },
  maxScore: s.number().color("§6"),
});

const HypixelSaysModeSchema = s.object(HypixelSaysStats);

// Santa Says is seasonal, so it counts toward Hypixel Says' boards without boards of its own
const SantaSaysSchema = s.object({
  points: s.number().color("§e").leaderboard(false),
  roundsWon: s.number().color("§b").leaderboard(false),
  wins: WinsSchema.color("§a").leaderboard(false),
  maxScore: s.number().color("§6").leaderboard(false),
});

const HypixelSaysSchema = s.object({
  ...HypixelSaysStats,
  simonSays: HypixelSaysModeSchema,
  santaSays: SantaSaysSchema,
});

const MiniWallsSchema = s.object({
  kit: s.string().default("soldier"),
  wins: WinsSchema.color("§e"),
  ...KillsStats,
  finalKills: s.number().color("§a").leaderboard({ limit: 500_000 }),
  witherDamage: s.number().color("§#0668af"),
  witherKills: s.number().color("§#417286"),
});

const BestTimeSchema = s.number().color("§a").format(formats.raceTime).leaderboard({ sort: "ASC" });

const PartyGamesSchema = s.object({
  // Fields that read each other through `this` need return types, or TypeScript can't infer them
  wins(): NumberSchema {
    return WinsSchema.color("§a").leaderboard({ additionalFields: [this.roundsWon, this.starsEarned] });
  },
  starsEarned(): NumberSchema {
    return s.number().color("§6").leaderboard({ additionalFields: [this.roundsWon, this.wins] });
  },
  roundsWon() {
    return s.number().color("§e").leaderboard({ additionalFields: [this.starsEarned, this.wins] });
  },
  animalSlaughterWins: s.number().color("§a"),
  anvilSpleefWins: s.number().color("§a"),
  avalancheWins: s.number().color("§a"),
  bombardmentWins: s.number().color("§a"),
  cannonPaintingWins: s.number().color("§a"),
  chickenRingsWins: s.number().color("§a"),
  diveWins: s.number().color("§a"),
  fireLeapersWins: s.number().color("§a"),
  frozenFloorWins: s.number().color("§a"),
  highGroundWins: s.number().color("§a"),
  hoeHoeHoeWins: s.number().color("§a"),
  jigsawRushWins: s.number().color("§a"),
  jungleJumpWins: s.number().color("§a"),
  labEscapeWins: s.number().color("§a"),
  lawnMoowerWins: s.number().color("§a"),
  minecartRacingWins: s.number().color("§a"),
  pigFishingWins: s.number().color("§a"),
  pigJoustingWins: s.number().color("§a"),
  rpg16Wins: s.number().color("§a"),
  shootingRangeWins: s.number().color("§a"),
  spiderMazeWins: s.number().color("§a"),
  superSheepWins: s.number().color("§a"),
  theFloorIsLavaWins: s.number().color("§a"),
  trampolinioWins: s.number().color("§a"),
  volcanoWins: s.number().color("§a"),
  workshopWins: s.number().color("§a"),
  // The goal of anvil spleef is to live the longest not the shortest so we sort in descending order
  anvilSpleefBestTime: s.number().color("§a").format(formats.raceTime),
  labEscapeBestTime: BestTimeSchema,
  jigsawRushBestTime: BestTimeSchema,
  theFloorIsLavaBestTime: BestTimeSchema,
  chickenRingsBestTime: BestTimeSchema,
  jungleJumpBestTime: BestTimeSchema,
  // The goal of bombardment is to live the longest not the shortest so we sort in descending order
  bombardmentBestTime: s.number().color("§a").format(formats.raceTime),
  minecartRacingBestTime: BestTimeSchema,
  spiderMazeBestTime: BestTimeSchema,
  animalSlaughterBestScore: s.number().color("§a"),
  diveBestScore: s.number().color("§a"),
  highGroundBestScore: s.number().color("§a"),
  hoeHoeHoeBestScore: s.number().color("§a"),
  lawnMoowerBestScore: s.number().color("§a"),
  rpg16BestScore: s.number().color("§a"),
});

const PixelPaintersSchema = s.object({
  wins: WinsSchema.color("§a"),
});

const PixelPartyModeSchema = s.object({
  wins: WinsStats.wins,
  gamesPlayed: s.number().color("§b"),
  losses: WinsStats.losses,
  wlr: WinsStats.wlr,
});

const PixelPartySchema = s.object({
  overall: PixelPartyModeSchema,
  normal: PixelPartyModeSchema,
  hyper: PixelPartyModeSchema,
  roundsCompleted: s.number().color("§e"),
  powerupsCollected: s.number().color("§d"),
});

const SeasonalSchema = s.object({
  totalWins: s.number(),
  easterSimulator: s.object({
    wins: WinsSchema.color("§d"),
    eggsFound: s.number().color("§e"),
  }),
  grinchSimulator: s.object({
    wins: WinsSchema.color("§a"),
    giftsFound: s.number().color("§c"),
  }),
  halloweenSimulator: s.object({
    wins: WinsSchema.color("§6"),
    candyFound: s.number().color("§5"),
  }),
  scubaSimulator: s.object({
    wins: WinsSchema.color("§e"),
    points: s.number().color("§b"),
  }),
});

const ThrowOutSchema = s.object({
  wins: WinsSchema.color("§e"),
  ...KillsStats,
});

const ZombiesMapDifficultySchema = s.object({
  // Fields that read each other through `this` need one return type, or TypeScript can't infer either
  wins(): NumberSchema {
    return WinsSchema.color("§a").leaderboard({ additionalFields: [this.fastestWin] });
  },
  fastestWin() {
    return s
      .number()
      .color("§b")
      .format(formats.time)
      .leaderboard({ sort: "ASC", additionalFields: [this.wins] });
  },
  kills(): NumberSchema {
    return s.number().color("§e").leaderboard({ enabled: false, additionalFields: [this.deaths] });
  },
  deaths() {
    return s.number().color("§c").leaderboard({ enabled: false, additionalFields: [this.kills] });
  },
  bestRound: s.number().color("§a").leaderboard(false),
  doorsOpened: s.number().color("§9"),
  totalRounds: s.number().color("§d"),
});

type ZombiesMapDifficulty = s.input<typeof ZombiesMapDifficultySchema>;

const ZombiesMapSchema = s.object({
  normal: ZombiesMapDifficultySchema,
  hard: ZombiesMapDifficultySchema,
  rip: ZombiesMapDifficultySchema,
  overall: ZombiesMapDifficultySchema,
});

const ZombiesSchema = s.object({
  overall: ZombiesMapDifficultySchema,
  deadEnd: ZombiesMapSchema,
  badBlood: ZombiesMapSchema,
  alienArcadium: ZombiesMapDifficultySchema,
  prison: ZombiesMapSchema,
});

export const ArcadeSchema = s
  .object({
    coins: CoinsSchema.color("§6"),
    wins: WinsSchema.color("§b"),
    coinConversions: s.number().color("§e"),
    blockingDead: BlockingDeadSchema,
    bountyHunters: BountyHuntersSchema,
    creeperAttack: CreeperAttackSchema,
    disasters: DisastersSchema,
    dragonWars: DragonWarsSchema,
    dropper: DropperSchema,
    enderSpleef: EnderSpleefSchema,
    farmHunt: FarmHuntSchema,
    football: FootballSchema,
    galaxyWars: GalaxyWarsSchema,
    hideAndSeek: HideAndSeekSchema,
    holeInTheWall: HoleInTheWallSchema,
    hypixelSays: HypixelSaysSchema,
    miniWalls: MiniWallsSchema,
    partyGames: PartyGamesSchema,
    pixelPainters: PixelPaintersSchema,
    pixelParty: PixelPartySchema,
    seasonal: SeasonalSchema,
    throwOut: ThrowOutSchema,
    zombies: ZombiesSchema,
  })
  .leaderboard({ fieldName: `${FormattedGame.ARCADE} -` });

export type Arcade = s.infer<typeof ArcadeSchema>;

function blockingDead(data: APIData): s.input<typeof BlockingDeadSchema> {
  return {
    wins: data.wins_dayone,
    kills: data.kills_dayone,
    headshots: data.headshots_dayone,
  };
}

function bountyHunters(data: APIData): s.input<typeof BountyHuntersSchema> {
  return {
    wins: data.wins_oneinthequiver,
    kills: data.kills_oneinthequiver,
    bowKills: data.bow_kills_oneinthequiver,
    swordKills: data.sword_kills_oneinthequiver,
    deaths: data.deaths_oneinthequiver,
    bountyKills: data.bounty_kills_oneinthequiver,
  };
}

function disasterSurvivals(data: APIData = {}): s.input<typeof DisasterSurvivalsSchema> {
  const survivals = {
    acidRain: data.acid_rain,
    dragons: data.dragons,
    flood: data.flood,
    fragileGround: data.fragile_ground,
    lightning: data.lightning,
    meteorShower: data.meteor_shower,
    sinkhole: data.sinkhole,
    solarFlare: data.solar_flare,
    stampede: data.stampede,
    theFloorIsLava: data.the_floor_is_lava,
    tntRain: data.tnt_rain,
    tornado: data.tornado,
    withers: data.withers,
    zombieApocalypse: data.zombie_apocalypse,
    anvilRain: data.anvil_rain,
    batSwarm: data.bat_swarm,
    blackout: data.blackout,
    disco: data.disco,
    grounded: data.grounded,
    halfHealth: data.half_health,
    hotPotato: data.hot_potato,
    hypixelSays: data.hypixel_says,
    nuke: data.nuke,
    purge: data.purge,
    redLightGreenLight: data.red_light_green_light,
    swappage: data.swappage,
    werewolf: data.werewolf,
  };

  return { overall: add(...Object.values(survivals)), ...survivals };
}

function disastersDeaths(data: APIData = {}): s.input<typeof DisastersDeathsSchema> {
  const deaths = {
    stampede: data.stampede,
    void: data.void,
    withers: data.withers,
    fall: data.fall,
    redLightGreenLight: data.red_light_green_light,
    unknown: data.unknown,
    flood: data.flood,
    lightning: data.lightning,
    zombieApocalypse: data.zombie_apocalypse,
    tntRain: data.tnt_rain,
    solarFlare: data.solar_flare,
    tornado: data.tornado,
    acidRain: data.acid_rain,
    batSwarm: data.bat_swarm,
    hotPotato: data.hot_potato,
    sinkhole: data.sinkhole,
    dragons: data.dragons,
    theFloorIsLava: data.the_floor_is_lava,
    anvilRain: data.anvil_rain,
    werewolf: data.werewolf,
    disco: data.disco,
    nuke: data.nuke,
    hypixelSays: data.hypixel_says,
  };

  return { overall: add(...Object.values(deaths)), ...deaths };
}

function disasters(data: APIData = {}, achievements: APIData = {}): s.input<typeof DisastersSchema> {
  return {
    gamesPlayed: data.games_played,
    wins: data.wins,
    losses: data.losses,
    playtime: (data.time_survived ?? 0) * 1000,
    survivals: disasterSurvivals(data.survived),
    deaths: disastersDeaths(data.deaths),
    powerups: achievements.arcade_disasters_prepared,
  };
}

function dragonWars(data: APIData, achievements: APIData): s.input<typeof DragonWarsSchema> {
  return {
    wins: data.wins_dragonwars2,
    kills: data.kills_dragonwars2,
    mounts: achievements.arcade_dw_dragonborn,
  };
}

const dropperMap = (data: APIData = {}): s.input<typeof DropperMapSchema> => ({
  completions: data.completions,
  bestTime: data.best_time,
});

function dropper(data: APIData = {}): s.input<typeof DropperSchema> {
  const maps: APIData = data.map_stats ?? {};

  return {
    wins: data.wins,
    fails: data.fails,
    mapsCompleted: data.maps_completed,
    gamesPlayed: data.games_played,
    gamesFinished: data.games_finished,
    flawlessGames: data.flawless_games,
    bestTime: data.fastest_game,
    maps: Object.fromEntries(
      DROPPER_MAPS.map(({ property, key }) => [property, dropperMap(maps[key])])
    ) as s.input<DropperMapsSchema>,
  };
}

function enderSpleef(data: APIData): s.input<typeof EnderSpleefSchema> {
  return {
    wins: data.wins_ender,
    trail: data.enderspleef_trail || "none",
    blocksBroken: data.blocks_destroyed_ender,
    tripleShot: data.tripleshot_powerup_activations_ender,
    bigShot: data.bigshot_powerup_activations_ender,
    powerupActivations: data.powerup_activations_ender,
  };
}

function farmHunt(data: APIData): s.input<typeof FarmHuntSchema> {
  return {
    wins: data.wins_farm_hunt,
    animalWins: data.animal_wins_farm_hunt,
    hunterWins: data.hunter_wins_farm_hunt,
    kills: data.kills_farm_hunt,
    animalKills: data.animal_kills_farm_hunt,
    hunterKills: data.hunter_kills_farm_hunt,
    tauntsUsed: data.taunts_used_farm_hunt,
    poopCollected: add(data.poop_collected, data.poop_collected_farm_hunt),
  };
}

function football(data: APIData): s.input<typeof FootballSchema> {
  return {
    wins: data.wins_soccer,
    goals: data.goals_soccer,
    kicks: data.kicks_soccer,
    powerKicks: data.powerkicks_soccer,
  };
}

function galaxyWars(data: APIData): s.input<typeof GalaxyWarsSchema> {
  return {
    wins: data.sw_game_wins,
    kills: data.sw_kills,
    deaths: data.sw_deaths,
    empireKills: data.sw_empire_kills,
    rebelKills: data.sw_rebel_kills,
  };
}

function hideAndSeekMode(data: APIData, mode: string): s.input<typeof HideAndSeekModeSchema> {
  const seekerWins = data[`${mode}_seeker_wins_hide_and_seek`];
  const hiderWins = data[`${mode}_hider_wins_hide_and_seek`];

  return { wins: add(seekerWins, hiderWins), seekerWins, hiderWins };
}

function hideAndSeek(data: APIData, achievements: APIData): s.input<typeof HideAndSeekSchema> {
  const propHunt = hideAndSeekMode(data, "prop_hunt");
  const partyPooper = hideAndSeekMode(data, "party_pooper");

  return {
    overall: deepAdd(propHunt, partyPooper),
    propHunt,
    partyPooper,
    kills: achievements.arcade_hide_and_seek_hider_kills,
    objectivesCompleted: achievements.arcade_hide_and_seek_master_hider,
  };
}

function holeInTheWall(data: APIData): s.input<typeof HoleInTheWallSchema> {
  return {
    wins: data.wins_hole_in_the_wall,
    wallsFaced: data.rounds_hole_in_the_wall,
    highestScoreQualifications: data.hitw_record_q,
    highestScoreFinals: data.hitw_record_f,
  };
}

function hypixelSaysMode(data: APIData, mode: "simon" | "santa"): s.input<typeof HypixelSaysModeSchema> {
  return {
    points: data[`rounds_${mode}_says`],
    roundsWon: data[`round_wins_${mode}_says`],
    wins: data[`wins_${mode}_says`],
    maxScore: data[`top_score_${mode}_says`] ?? 0,
  };
}

function hypixelSays(data: APIData): s.input<typeof HypixelSaysSchema> {
  const simonSays = hypixelSaysMode(data, "simon");
  const santaSays = hypixelSaysMode(data, "santa");

  return {
    points: add(simonSays.points, santaSays.points),
    roundsWon: add(simonSays.roundsWon, santaSays.roundsWon),
    wins: add(simonSays.wins, santaSays.wins),
    maxScore: Math.max(simonSays.maxScore, santaSays.maxScore),
    simonSays,
    santaSays,
  };
}

function miniWalls(data: APIData): s.input<typeof MiniWallsSchema> {
  return {
    kit: data.miniwalls_activeKit || "soldier",
    wins: data.wins_mini_walls,
    kills: data.kills_mini_walls,
    deaths: data.deaths_mini_walls,
    finalKills: data.final_kills_mini_walls,
    witherDamage: data.wither_damage_mini_walls,
    witherKills: data.wither_kills_mini_walls,
  };
}

function partyGames(data: APIData): s.input<typeof PartyGamesSchema> {
  return {
    wins: add(data.wins_party, data.wins_party_2, data.wins_party_3),
    starsEarned: data.total_stars_party,
    roundsWon: data.round_wins_party,
    animalSlaughterWins: data.animal_slaughter_round_wins_party,
    anvilSpleefWins: data.anvil_spleef_round_wins_party,
    avalancheWins: data.avalanche_round_wins_party,
    bombardmentWins: data.bombardment_round_wins_party,
    cannonPaintingWins: data.cannon_painting_round_wins_party,
    chickenRingsWins: data.chicken_rings_round_wins_party,
    diveWins: data.dive_round_wins_party,
    fireLeapersWins: data.fire_leapers_round_wins_party,
    frozenFloorWins: data.frozen_floor_round_wins_party,
    highGroundWins: data.high_ground_round_wins_party,
    hoeHoeHoeWins: data.hoe_hoe_hoe_round_wins_party,
    jigsawRushWins: data.jigsaw_rush_round_wins_party,
    jungleJumpWins: data.jungle_jump_round_wins_party,
    labEscapeWins: data.lab_escape_round_wins_party,
    lawnMoowerWins: data.lawn_moower_round_wins_party,
    minecartRacingWins: data.minecart_racing_round_wins_party,
    pigFishingWins: data.pig_fishing_round_wins_party,
    pigJoustingWins: data.pig_jousting_round_wins_party,
    rpg16Wins: data.rpg_16_round_wins_party,
    shootingRangeWins: data.shooting_range_round_wins_party,
    spiderMazeWins: data.spider_maze_round_wins_party,
    superSheepWins: data.super_sheep_round_wins_party,
    theFloorIsLavaWins: data.the_floor_is_lava_round_wins_party,
    trampolinioWins: data.trampolinio_round_wins_party,
    volcanoWins: data.volcano_round_wins_party,
    workshopWins: data.workshop_round_wins_party,
    anvilSpleefBestTime: data.anvil_spleef_best_time_party,
    labEscapeBestTime: data.lab_escape_best_time_party,
    jigsawRushBestTime: data.jigsaw_rush_best_time_party,
    theFloorIsLavaBestTime: data.the_floor_is_lava_best_time_party,
    chickenRingsBestTime: data.chicken_rings_best_time_party,
    jungleJumpBestTime: data.jungle_jump_best_time_party,
    bombardmentBestTime: data.bombardment_best_time_party,
    minecartRacingBestTime: data.minecart_racing_best_time_party,
    spiderMazeBestTime: data.spider_maze_best_time_party,
    animalSlaughterBestScore: data.animal_slaughter_best_score_party,
    diveBestScore: data.dive_best_score_party,
    highGroundBestScore: data.high_ground_best_score_party,
    hoeHoeHoeBestScore: data.hoe_hoe_hoe_best_score_party,
    lawnMoowerBestScore: data.lawn_moower_mowed_best_score_party,
    rpg16BestScore: data.rpg_16_kills_best_score_party,
  };
}

function pixelPartyMode(data: APIData, mode?: string): s.input<typeof PixelPartyModeSchema> {
  const suffix = mode ? `_${mode}` : "";
  const wins = data[`wins${suffix}`];
  const gamesPlayed = data[`games_played${suffix}`];

  return { wins, gamesPlayed, losses: sub(gamesPlayed, wins) };
}

function pixelParty(data: APIData = {}): s.input<typeof PixelPartySchema> {
  const overall = pixelPartyMode(data);
  const hyper = pixelPartyMode(data, "hyper");

  return {
    overall,
    normal: deepSub(overall, hyper),
    hyper,
    roundsCompleted: data.rounds_completed,
    powerupsCollected: data.power_ups_collected,
  };
}

function seasonal(data: APIData): s.input<typeof SeasonalSchema> {
  const easterSimulator = {
    wins: data.wins_easter_simulator,
    eggsFound: data.eggs_found_easter_simulator,
  };

  const grinchSimulator = {
    wins: data.wins_grinch_simulator_v2,
    giftsFound: data.gifts_grinch_simulator_v2,
  };

  const halloweenSimulator = {
    wins: data.wins_halloween_simulator,
    candyFound: data.candy_found_halloween_simulator,
  };

  const scubaSimulator = {
    wins: data.wins_scuba_simulator,
    points: data.total_points_scuba_simulator,
  };

  return {
    totalWins: add(
      easterSimulator.wins,
      grinchSimulator.wins,
      halloweenSimulator.wins,
      scubaSimulator.wins
    ),
    easterSimulator,
    grinchSimulator,
    halloweenSimulator,
    scubaSimulator,
  };
}

function throwOut(data: APIData): s.input<typeof ThrowOutSchema> {
  return {
    wins: data.wins_throw_out,
    kills: data.kills_throw_out,
    deaths: data.deaths_throw_out,
  };
}

function zombiesMapDifficulty(data: APIData, map?: string, difficulty?: string): ZombiesMapDifficulty {
  const mode = map ? `_${map}${difficulty ? `_${difficulty}` : ""}` : "";

  return {
    wins: data[`wins_zombies${mode}`],
    fastestWin: (data[`fastest_time_30_zombies${mode}`] ?? 0) * 1000,
    kills: data[`zombie_kills_zombies${mode}`],
    deaths: data[`deaths_zombies${mode}`],
    bestRound: data[`best_round_zombies${mode}`],
    doorsOpened: data[`doors_opened_zombies${mode}`],
    totalRounds: data[`total_rounds_survived_zombies${mode}`],
  };
}

function zombiesMap(data: APIData, map: string): s.input<typeof ZombiesMapSchema> {
  const normal = zombiesMapDifficulty(data, map, "normal");
  const hard = zombiesMapDifficulty(data, map, "hard");
  const rip = zombiesMapDifficulty(data, map, "rip");

  const fastestWins = [normal, hard, rip].map(({ fastestWin }) => fastestWin).filter(Boolean);

  return {
    normal,
    hard,
    rip,
    overall: {
      ...zombiesMapDifficulty(data, map),
      fastestWin: fastestWins.length > 0 ? Math.min(...fastestWins) : 0,
    },
  };
}

function zombies(data: APIData): s.input<typeof ZombiesSchema> {
  return {
    overall: zombiesMapDifficulty(data),
    deadEnd: zombiesMap(data, "deadend"),
    badBlood: zombiesMap(data, "badblood"),
    alienArcadium: {
      ...zombiesMapDifficulty(data, "alienarcadium"),
      // Alien Arcadium doesn't have different difficulties but fastest time is stored as "normal" difficulty
      fastestWin: (data.fastest_time_30_zombies_alienarcadium_normal ?? 0) * 1000,
    },
    prison: zombiesMap(data, "prison"),
  };
}

export function arcade(data: APIData = {}, achievements: APIData = {}): s.input<typeof ArcadeSchema> {
  const modes = {
    blockingDead: blockingDead(data),
    bountyHunters: bountyHunters(data),
    creeperAttack: { maxWave: data.max_wave },
    disasters: disasters(data.disasters?.stats, achievements),
    dragonWars: dragonWars(data, achievements),
    dropper: dropper(data.dropper),
    enderSpleef: enderSpleef(data),
    farmHunt: farmHunt(data),
    football: football(data),
    galaxyWars: galaxyWars(data),
    hideAndSeek: hideAndSeek(data, achievements),
    holeInTheWall: holeInTheWall(data),
    hypixelSays: hypixelSays(data),
    miniWalls: miniWalls(data),
    partyGames: partyGames(data),
    pixelPainters: { wins: data.wins_draw_their_thing },
    pixelParty: pixelParty(data.pixel_party),
    seasonal: seasonal(data),
    throwOut: throwOut(data),
    zombies: zombies(data),
  } satisfies Partial<s.input<typeof ArcadeSchema>>;

  return {
    coins: data.coins,
    wins: add(
      modes.blockingDead.wins,
      modes.bountyHunters.wins,
      modes.disasters.wins,
      modes.dragonWars.wins,
      modes.dropper.wins,
      modes.enderSpleef.wins,
      modes.farmHunt.wins,
      modes.football.wins,
      modes.galaxyWars.wins,
      modes.hideAndSeek.overall.wins,
      modes.holeInTheWall.wins,
      modes.hypixelSays.wins,
      modes.miniWalls.wins,
      modes.partyGames.wins,
      modes.pixelPainters.wins,
      modes.pixelParty.overall.wins,
      modes.seasonal.totalWins,
      modes.throwOut.wins,
      modes.zombies.overall.wins
    ),
    coinConversions: data.stamp_level,
    ...modes,
  };
}
