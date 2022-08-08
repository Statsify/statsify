/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData } from "@statsify/util";
import {
  ArcadeQuests,
  ArenaQuests,
  BedwarsQuests,
  BlitzQuests,
  BuildBattleQuests,
  CopsAndCrimsQuests,
  DuelsQuests,
  MegaWallsQuests,
  MurderMysteryQuests,
  PaintballQuests,
  PitQuests,
  QuakeQuests,
  SkywarsQuests,
  SmashQuests,
  SpeedUHCQuests,
  TNTGamesQuests,
  TurboKartRacersQuests,
  UHCQuests,
  VampireZQuests,
  WallsQuests,
  WarlordsQuests,
  WoolWarsQuests,
} from "./modes";
import { Field } from "../../../../metadata";
import { FormattedGame } from "../../../../game";
import { QuestTime } from "./util";

export class QuestsInstance {
  @Field({ leaderboard: { fieldName: `${FormattedGame.ARCADE} Quests` } })
  public ARCADE: ArcadeQuests;

  @Field({ leaderboard: { fieldName: `${FormattedGame.ARENA_BRAWL} Quests` } })
  public ARENA_BRAWL: ArenaQuests;

  @Field({ leaderboard: { fieldName: `${FormattedGame.BEDWARS} Quests` } })
  public BEDWARS: BedwarsQuests;

  @Field({ leaderboard: { fieldName: `${FormattedGame.BLITZSG} Quests` } })
  public BLITZSG: BlitzQuests;

  @Field({ leaderboard: { fieldName: `${FormattedGame.BUILD_BATTLE} Quests` } })
  public BUILD_BATTLE: BuildBattleQuests;

  @Field({ leaderboard: { fieldName: `${FormattedGame.DUELS} Quests` } })
  public DUELS: DuelsQuests;

  @Field({ leaderboard: { fieldName: `${FormattedGame.COPS_AND_CRIMS} Quests` } })
  public COPS_AND_CRIMS: CopsAndCrimsQuests;

  @Field({ leaderboard: { fieldName: `${FormattedGame.MURDER_MYSTERY} Quests` } })
  public MEGAWALLS: MegaWallsQuests;

  @Field({ leaderboard: { fieldName: `${FormattedGame.MURDER_MYSTERY} Quests` } })
  public MURDER_MYSTERY: MurderMysteryQuests;

  @Field({ leaderboard: { fieldName: `${FormattedGame.PAINTBALL} Quests` } })
  public PAINTBALL: PaintballQuests;

  @Field({ leaderboard: { fieldName: `${FormattedGame.PIT} Quests` } })
  public PIT: PitQuests;

  @Field({ leaderboard: { fieldName: `${FormattedGame.QUAKE} Quests` } })
  public QUAKE: QuakeQuests;

  @Field({ leaderboard: { fieldName: `${FormattedGame.SKYWARS} Quests` } })
  public SKYWARS: SkywarsQuests;

  @Field({ leaderboard: { fieldName: `${FormattedGame.SMASH_HEROES} Quests` } })
  public SMASH_HEROES: SmashQuests;

  @Field({ leaderboard: { fieldName: `${FormattedGame.SPEED_UHC} Quests` } })
  public SPEED_UHC: SpeedUHCQuests;

  @Field({ leaderboard: { fieldName: `${FormattedGame.TNT_GAMES} Quests` } })
  public TNT_GAMES: TNTGamesQuests;

  @Field({
    leaderboard: { fieldName: `${FormattedGame.TURBO_KART_RACERS} Quests` },
  })
  public TURBO_KART_RACERS: TurboKartRacersQuests;

  @Field({ leaderboard: { fieldName: `${FormattedGame.UHC} Quests` } })
  public UHC: UHCQuests;

  @Field({ leaderboard: { fieldName: `${FormattedGame.VAMPIREZ} Quests` } })
  public VAMPIREZ: VampireZQuests;

  @Field({ leaderboard: { fieldName: `${FormattedGame.WALLS} Quests` } })
  public WALLS: WallsQuests;

  @Field({ leaderboard: { fieldName: `${FormattedGame.WARLORDS} Quests` } })
  public WARLORDS: WarlordsQuests;

  @Field({ leaderboard: { fieldName: `${FormattedGame.WOOLWARS} Quests` } })
  public WOOLWARS: WoolWarsQuests;

  public constructor(quests: APIData, time?: QuestTime) {
    this.ARCADE = new ArcadeQuests(quests, time);
    this.ARENA_BRAWL = new ArenaQuests(quests, time);
    this.BEDWARS = new BedwarsQuests(quests, time);
    this.BLITZSG = new BlitzQuests(quests, time);
    this.BUILD_BATTLE = new BuildBattleQuests(quests, time);
    this.COPS_AND_CRIMS = new CopsAndCrimsQuests(quests, time);
    this.DUELS = new DuelsQuests(quests, time);
    this.MEGAWALLS = new MegaWallsQuests(quests, time);
    this.MURDER_MYSTERY = new MurderMysteryQuests(quests, time);
    this.PAINTBALL = new PaintballQuests(quests, time);
    this.PIT = new PitQuests(quests, time);
    this.QUAKE = new QuakeQuests(quests, time);
    this.SKYWARS = new SkywarsQuests(quests, time);
    this.SMASH_HEROES = new SmashQuests(quests, time);
    this.SPEED_UHC = new SpeedUHCQuests(quests, time);
    this.TNT_GAMES = new TNTGamesQuests(quests, time);
    this.TURBO_KART_RACERS = new TurboKartRacersQuests(quests, time);
    this.UHC = new UHCQuests(quests, time);
    this.VAMPIREZ = new VampireZQuests(quests, time);
    this.WALLS = new WallsQuests(quests, time);
    this.WARLORDS = new WarlordsQuests(quests, time);
    this.WOOLWARS = new WoolWarsQuests(quests, time);
  }
}
