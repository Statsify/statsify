/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  Arcade,
  ArenaBrawl,
  BedWars,
  BlitzSG,
  BuildBattle,
  CopsAndCrims,
  Duels,
  General,
  MegaWalls,
  MurderMystery,
  Paintball,
  Parkour,
  Pit,
  Quake,
  SkyWars,
  SmashHeroes,
  SpeedUHC,
  TNTGames,
  TurboKartRacers,
  UHC,
  VampireZ,
  Walls,
  Warlords,
  WoolWars,
} from "./gamemodes";
import { Field } from "../metadata";
import { FormattedGame } from "../game";
import type { APIData } from "@statsify/util";

export class PlayerStats {
  @Field({ leaderboard: { fieldName: `${FormattedGame.ARCADE} -` } })
  public arcade: Arcade;

  @Field({
    leaderboard: {
      fieldName: FormattedGame.ARENA_BRAWL,
      extraDisplay: "stats.arenabrawl.naturalPrefix",
    },
  })
  public arenabrawl: ArenaBrawl;

  @Field({
    leaderboard: {
      fieldName: FormattedGame.BEDWARS,
      extraDisplay: "stats.bedwars.levelFormatted",
    },
  })
  public bedwars: BedWars;

  @Field({
    leaderboard: {
      fieldName: FormattedGame.BLITZSG,
      extraDisplay: "stats.blitzsg.naturalPrefix",
    },
  })
  public blitzsg: BlitzSG;

  @Field({
    leaderboard: {
      fieldName: FormattedGame.BUILD_BATTLE,
      extraDisplay: "stats.buildbattle.titleFormatted",
    },
  })
  public buildbattle: BuildBattle;

  @Field({ leaderboard: { fieldName: FormattedGame.COPS_AND_CRIMS } })
  public copsandcrims: CopsAndCrims;

  @Field({ leaderboard: { fieldName: `${FormattedGame.DUELS} -` } })
  public duels: Duels;

  @Field({ leaderboard: { fieldName: `${FormattedGame.GENERAL} -` } })
  public general: General;

  @Field({ leaderboard: { fieldName: FormattedGame.MEGAWALLS } })
  public megawalls: MegaWalls;

  @Field({ leaderboard: { fieldName: FormattedGame.MURDER_MYSTERY } })
  public murdermystery: MurderMystery;

  @Field({
    leaderboard: {
      fieldName: FormattedGame.PAINTBALL,
      extraDisplay: "stats.paintball.naturalPrefix",
    },
  })
  public paintball: Paintball;

  @Field({ leaderboard: { fieldName: `${FormattedGame.PARKOUR} -` } })
  public parkour: Parkour;

  @Field({
    leaderboard: {
      fieldName: FormattedGame.PIT,
      extraDisplay: "stats.pit.levelFormatted",
    },
  })
  public pit: Pit;

  @Field({
    leaderboard: {
      fieldName: FormattedGame.QUAKE,
      extraDisplay: "stats.quake.naturalPrefix",
    },
  })
  public quake: Quake;

  @Field({
    leaderboard: {
      fieldName: FormattedGame.SKYWARS,
      extraDisplay: "stats.skywars.levelFormatted",
    },
  })
  public skywars: SkyWars;

  @Field({
    leaderboard: {
      fieldName: FormattedGame.SMASH_HEROES,
      extraDisplay: "stats.smashheroes.levelFormatted",
    },
  })
  public smashheroes: SmashHeroes;

  @Field({
    leaderboard: {
      fieldName: FormattedGame.SPEED_UHC,
      extraDisplay: "stats.speeduhc.levelFormatted",
    },
  })
  public speeduhc: SpeedUHC;

  @Field({ leaderboard: { fieldName: FormattedGame.TNT_GAMES } })
  public tntgames: TNTGames;

  @Field({
    leaderboard: {
      fieldName: FormattedGame.TURBO_KART_RACERS,
      extraDisplay: "stats.turbokartracers.naturalPrefix",
    },
  })
  public turbokartracers: TurboKartRacers;

  @Field({
    leaderboard: {
      fieldName: FormattedGame.UHC,
      extraDisplay: "stats.uhc.levelFormatted",
    },
  })
  public uhc: UHC;

  @Field({
    leaderboard: {
      fieldName: FormattedGame.VAMPIREZ,
    },
  })
  public vampirez: VampireZ;

  @Field({
    leaderboard: {
      fieldName: FormattedGame.WALLS,
      extraDisplay: "stats.walls.naturalPrefix",
    },
  })
  public walls: Walls;

  @Field({ leaderboard: { fieldName: FormattedGame.WARLORDS } })
  public warlords: Warlords;

  @Field({
    leaderboard: {
      fieldName: FormattedGame.WOOLWARS,
      extraDisplay: "stats.woolwars.levelFormatted",
    },
  })
  public woolwars: WoolWars;

  public constructor(data: APIData = {}) {
    const achievements = data?.achievements ?? {};
    const legacy = data?.stats?.Legacy ?? {};

    this.arcade = new Arcade(data?.stats?.Arcade ?? {}, achievements);
    this.arenabrawl = new ArenaBrawl(data?.stats?.Arena ?? {}, legacy);
    this.bedwars = new BedWars(data?.stats?.Bedwars ?? {});
    this.blitzsg = new BlitzSG(data?.stats?.HungerGames ?? {});
    this.buildbattle = new BuildBattle(data?.stats?.BuildBattle ?? {});
    this.copsandcrims = new CopsAndCrims(data?.stats?.MCGO ?? {});
    this.duels = new Duels(data?.stats?.Duels ?? {});
    this.general = new General(data?.stats?.Legacy ?? {}, data);
    this.megawalls = new MegaWalls(data?.stats?.Walls3 ?? {});
    this.murdermystery = new MurderMystery(
      data?.stats?.MurderMystery ?? {},
      achievements
    );
    this.paintball = new Paintball(data?.stats?.Paintball ?? {}, legacy);
    this.parkour = new Parkour(data?.parkourCompletions ?? {});
    this.pit = new Pit(
      data?.stats?.Pit?.profile ?? {},
      data?.stats?.Pit?.pit_stats_ptl ?? {}
    );
    this.quake = new Quake(data?.stats?.Quake ?? {}, achievements, legacy);
    this.skywars = new SkyWars(data?.stats?.SkyWars ?? {});
    this.smashheroes = new SmashHeroes(data?.stats?.SuperSmash ?? {});
    this.speeduhc = new SpeedUHC(data?.stats?.SpeedUHC ?? {});
    this.tntgames = new TNTGames(data?.stats?.TNTGames ?? {}, achievements);
    this.turbokartracers = new TurboKartRacers(data?.stats?.GingerBread ?? {}, legacy);
    this.uhc = new UHC(data?.stats?.UHC ?? {});
    this.vampirez = new VampireZ(data?.stats?.VampireZ ?? {}, legacy);
    this.walls = new Walls(data?.stats?.Walls ?? {}, legacy);
    this.warlords = new Warlords(data?.stats?.Battleground ?? {});
    this.woolwars = new WoolWars(data?.stats?.WoolGames ?? {});
  }
}
