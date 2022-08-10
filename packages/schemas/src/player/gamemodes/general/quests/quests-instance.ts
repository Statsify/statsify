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
import { Field, FieldOptions } from "../../../../metadata";
import { FormattedGame } from "../../../../game";
import { QuestTime } from "./util";

const getFieldData = (game: string): FieldOptions => ({
  leaderboard: { fieldName: `${game} Quests`, additionalFields: ["this.total"] },
});

export class QuestsInstance {
  @Field(getFieldData(FormattedGame.ARCADE))
  public ARCADE: ArcadeQuests;

  @Field(getFieldData(FormattedGame.ARENA_BRAWL))
  public ARENA_BRAWL: ArenaQuests;

  @Field(getFieldData(FormattedGame.BEDWARS))
  public BEDWARS: BedwarsQuests;

  @Field(getFieldData(FormattedGame.BLITZSG))
  public BLITZSG: BlitzQuests;

  @Field(getFieldData(FormattedGame.BUILD_BATTLE))
  public BUILD_BATTLE: BuildBattleQuests;

  @Field(getFieldData(FormattedGame.DUELS))
  public DUELS: DuelsQuests;

  @Field(getFieldData(FormattedGame.COPS_AND_CRIMS))
  public COPS_AND_CRIMS: CopsAndCrimsQuests;

  @Field(getFieldData(FormattedGame.MEGAWALLS))
  public MEGAWALLS: MegaWallsQuests;

  @Field(getFieldData(FormattedGame.MURDER_MYSTERY))
  public MURDER_MYSTERY: MurderMysteryQuests;

  @Field(getFieldData(FormattedGame.PAINTBALL))
  public PAINTBALL: PaintballQuests;

  @Field(getFieldData(FormattedGame.PIT))
  public PIT: PitQuests;

  @Field(getFieldData(FormattedGame.QUAKE))
  public QUAKE: QuakeQuests;

  @Field(getFieldData(FormattedGame.SKYWARS))
  public SKYWARS: SkywarsQuests;

  @Field(getFieldData(FormattedGame.SMASH_HEROES))
  public SMASH_HEROES: SmashQuests;

  @Field(getFieldData(FormattedGame.SPEED_UHC))
  public SPEED_UHC: SpeedUHCQuests;

  @Field(getFieldData(FormattedGame.TNT_GAMES))
  public TNT_GAMES: TNTGamesQuests;

  @Field(getFieldData(FormattedGame.TURBO_KART_RACERS))
  public TURBO_KART_RACERS: TurboKartRacersQuests;

  @Field(getFieldData(FormattedGame.UHC))
  public UHC: UHCQuests;

  @Field(getFieldData(FormattedGame.VAMPIREZ))
  public VAMPIREZ: VampireZQuests;

  @Field(getFieldData(FormattedGame.WALLS))
  public WALLS: WallsQuests;

  @Field(getFieldData(FormattedGame.WARLORDS))
  public WARLORDS: WarlordsQuests;

  @Field(getFieldData(FormattedGame.WOOLWARS))
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
