/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ArcadeSchema, arcade } from "./gamemodes/arcade/definition.js";
import { ArenaBrawlSchema, arenaBrawl } from "./gamemodes/arenabrawl/definition.js";
import { BedWarsSchema, bedWars } from "./gamemodes/bedwars/definition.js";
import { BlitzSGSchema, blitzSG } from "./gamemodes/blitzsg/definition.js";
import { BuildBattleSchema, buildBattle } from "./gamemodes/buildbattle/definition.js";
import { ChallengesSchema, challenges } from "./gamemodes/challenges/definition.js";
import { CopsAndCrimsSchema, copsAndCrims } from "./gamemodes/copsandcrims/definition.js";
import { DuelsSchema, duels } from "./gamemodes/duels/definition.js";
import { GeneralSchema, general } from "./gamemodes/general/definition.js";
import { MegaWallsSchema, megaWalls } from "./gamemodes/megawalls/definition.js";
import { MurderMysterySchema, murderMystery } from "./gamemodes/murdermystery/definition.js";
import { PaintballSchema, paintball } from "./gamemodes/paintball/definition.js";
import { ParkourSchema, parkour } from "./gamemodes/parkour/definition.js";
import { PitSchema, pit } from "./gamemodes/pit/definition.js";
import { QuakeSchema, quake } from "./gamemodes/quake/definition.js";
import { QuestsSchema, quests } from "./gamemodes/quests/definition.js";
import { SkyWarsSchema, skyWars } from "./gamemodes/skywars/definition.js";
import { SmashHeroesSchema, smashHeroes } from "./gamemodes/smashheroes/definition.js";
import { SpeedUHCSchema, speedUHC } from "./gamemodes/speeduhc/definition.js";
import { TNTGamesSchema, tntGames } from "./gamemodes/tntgames/definition.js";
import { TurboKartRacersSchema, turboKartRacers } from "./gamemodes/turbokartracers/definition.js";
import { UHCSchema, uhc } from "./gamemodes/uhc/definition.js";
import { VampireZSchema, vampireZ } from "./gamemodes/vampirez/definition.js";
import { WallsSchema, walls } from "./gamemodes/walls/definition.js";
import { WarlordsSchema, warlords } from "./gamemodes/warlords/definition.js";
import { WoolGamesSchema, woolGames } from "./gamemodes/woolgames/definition.js";
import type { APIData } from "@statsify/util";
import { s } from "#definition/s";

export const PlayerStatsSchema = s
  .object({
    arcade: ArcadeSchema,
    arenabrawl: ArenaBrawlSchema,
    bedwars: BedWarsSchema,
    blitzsg: BlitzSGSchema,
    buildbattle: BuildBattleSchema,
    challenges: ChallengesSchema,
    copsandcrims: CopsAndCrimsSchema,
    duels: DuelsSchema,
    general: GeneralSchema,
    megawalls: MegaWallsSchema,
    murdermystery: MurderMysterySchema,
    paintball: PaintballSchema,
    parkour: ParkourSchema,
    pit: PitSchema,
    quake: QuakeSchema,
    quests: QuestsSchema,
    skywars: SkyWarsSchema,
    smashheroes: SmashHeroesSchema,
    speeduhc: SpeedUHCSchema,
    tntgames: TNTGamesSchema,
    turbokartracers: TurboKartRacersSchema,
    uhc: UHCSchema,
    vampirez: VampireZSchema,
    walls: WallsSchema,
    warlords: WarlordsSchema,
    woolgames: WoolGamesSchema,
  })
  .leaderboard({ fieldName: "" });

export type PlayerStats = s.infer<typeof PlayerStatsSchema>;

export function playerStats(data: APIData = {}): s.input<typeof PlayerStatsSchema> {
  const achievements = data.achievements ?? {};
  const stats = data.stats ?? {};
  const legacy = stats.Legacy ?? {};

  return {
    arcade: arcade(stats.Arcade, achievements),
    arenabrawl: arenaBrawl(stats.Arena, legacy),
    bedwars: bedWars(stats.Bedwars),
    blitzsg: blitzSG(stats.HungerGames),
    buildbattle: buildBattle(stats.BuildBattle, achievements),
    challenges: challenges(data.challenges?.all_time, achievements),
    copsandcrims: copsAndCrims(stats.MCGO),
    duels: duels(stats.Duels),
    general: general(data, legacy),
    megawalls: megaWalls(stats.Walls3),
    murdermystery: murderMystery(stats.MurderMystery, achievements),
    paintball: paintball(stats.Paintball, legacy),
    parkour: parkour(data.parkourCompletions),
    pit: pit(stats.Pit?.profile, stats.Pit?.pit_stats_ptl),
    quake: quake(stats.Quake, achievements, legacy),
    quests: quests(data.quests),
    skywars: skyWars(stats.SkyWars, achievements),
    smashheroes: smashHeroes(stats.SuperSmash),
    speeduhc: speedUHC(stats.SpeedUHC),
    tntgames: tntGames(stats.TNTGames, achievements),
    turbokartracers: turboKartRacers(stats.GingerBread, legacy),
    uhc: uhc(stats.UHC),
    vampirez: vampireZ(stats.VampireZ, legacy),
    walls: walls(stats.Walls, legacy),
    warlords: warlords(stats.Battleground),
    woolgames: woolGames(stats.WoolGames, achievements),
  };
}
