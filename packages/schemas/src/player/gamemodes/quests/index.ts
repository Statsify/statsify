/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type APIData, type UnwrapConstructor, removeFormatting } from "@statsify/util";
import {
  ArcadeQuests,
  ArenaBrawlQuests,
  BedWarsQuests,
  BlitzSGQuests,
  BuildBattleQuests,
  CopsAndCrimsQuests,
  DuelsQuests,
  MegaWallsQuests,
  MurderMysteryQuests,
  PaintballQuests,
  PitQuests,
  QuakeQuests,
  SkyWarsQuests,
  SmashHeroesQuests,
  SpeedUHCQuests,
  TNTGamesQuests,
  TurboKartRacersQuests,
  UHCQuests,
  VampireZQuests,
  WallsQuests,
  WarlordsQuests,
  WoolWarsQuests,
} from "./modes/index.js";
import { Field } from "#metadata";
import { FormattedGame, GameModes, IGameModes } from "#game";
import { QuestTime, createQuestsInstance } from "./util.js";

export const QUEST_MODES = new GameModes([
  { api: "overall" },
  { api: "ARCADE", formatted: removeFormatting(FormattedGame.ARCADE) },
  { api: "ARENA_BRAWL", formatted: removeFormatting(FormattedGame.ARENA_BRAWL) },
  { api: "BEDWARS", formatted: removeFormatting(FormattedGame.BEDWARS) },
  { api: "BLITZSG", formatted: removeFormatting(FormattedGame.BLITZSG) },
  { api: "BUILD_BATTLE", formatted: removeFormatting(FormattedGame.BUILD_BATTLE) },
  { api: "DUELS", formatted: removeFormatting(FormattedGame.DUELS) },
  { api: "COPS_AND_CRIMS", formatted: removeFormatting(FormattedGame.COPS_AND_CRIMS) },
  { api: "MEGAWALLS", formatted: removeFormatting(FormattedGame.MEGAWALLS) },
  { api: "MURDER_MYSTERY", formatted: removeFormatting(FormattedGame.MURDER_MYSTERY) },
  { api: "PAINTBALL", formatted: removeFormatting(FormattedGame.PAINTBALL) },
  { api: "PIT", formatted: removeFormatting(FormattedGame.PIT) },
  { api: "QUAKE", formatted: removeFormatting(FormattedGame.QUAKE) },
  { api: "SKYWARS", formatted: removeFormatting(FormattedGame.SKYWARS) },
  { api: "SMASH_HEROES", formatted: removeFormatting(FormattedGame.SMASH_HEROES) },
  { api: "SPEED_UHC", formatted: removeFormatting(FormattedGame.SPEED_UHC) },
  { api: "TNT_GAMES", formatted: removeFormatting(FormattedGame.TNT_GAMES) },
  {
    api: "TURBO_KART_RACERS",
    formatted: removeFormatting(FormattedGame.TURBO_KART_RACERS),
  },
  { api: "UHC", formatted: removeFormatting(FormattedGame.UHC) },
  { api: "VAMPIREZ", formatted: removeFormatting(FormattedGame.VAMPIREZ) },
  { api: "WALLS", formatted: removeFormatting(FormattedGame.WALLS) },
  { api: "WARLORDS", formatted: removeFormatting(FormattedGame.WARLORDS) },
  { api: "WOOLWARS", formatted: removeFormatting(FormattedGame.WOOLWARS) },
]);

export type QuestModes = IGameModes<typeof QUEST_MODES>;

const questModes = {
  ARCADE: ArcadeQuests,
  ARENA_BRAWL: ArenaBrawlQuests,
  BEDWARS: BedWarsQuests,
  BLITZSG: BlitzSGQuests,
  BUILD_BATTLE: BuildBattleQuests,
  DUELS: DuelsQuests,
  COPS_AND_CRIMS: CopsAndCrimsQuests,
  MEGAWALLS: MegaWallsQuests,
  MURDER_MYSTERY: MurderMysteryQuests,
  PAINTBALL: PaintballQuests,
  PIT: PitQuests,
  QUAKE: QuakeQuests,
  SKYWARS: SkyWarsQuests,
  SMASH_HEROES: SmashHeroesQuests,
  SPEED_UHC: SpeedUHCQuests,
  TNT_GAMES: TNTGamesQuests,
  TURBO_KART_RACERS: TurboKartRacersQuests,
  UHC: UHCQuests,
  VAMPIREZ: VampireZQuests,
  WALLS: WallsQuests,
  WARLORDS: WarlordsQuests,
  WOOLWARS: WoolWarsQuests,
} as const;

export const DailyQuests = createQuestsInstance(QuestTime.Daily, questModes);
export const WeeklyQuests = createQuestsInstance(QuestTime.Weekly, questModes);
export const OverallQuests = createQuestsInstance(QuestTime.Overall, questModes);

export interface GameQuests {
  total: number;
}

export type GenericQuestInstance = {
  [K in keyof typeof FormattedGame]?: GameQuests;
};

export class Quests {
  @Field({ leaderboard: { name: "Total Quests", fieldName: "Quests" } })
  public total: number;

  @Field({
    leaderboard: {
      name: "Weekly Quests",
      fieldName: "Quests",
      resetEvery: "friday",
    },
  })
  public weeklyTotal: number;

  @Field({
    leaderboard: {
      name: "Daily Quests",
      fieldName: "Quests",
      resetEvery: "day",
    },
  })
  public dailyTotal: number;

  @Field({ type: () => OverallQuests, leaderboard: { fieldName: "" } })
  public overall: UnwrapConstructor<typeof OverallQuests>;

  @Field({ type: () => WeeklyQuests })
  public weekly: UnwrapConstructor<typeof WeeklyQuests>;

  @Field({ type: () => DailyQuests })
  public daily: UnwrapConstructor<typeof DailyQuests>;

  public constructor(quests: APIData) {
    this.overall = new OverallQuests(quests);
    this.weekly = new WeeklyQuests(quests);
    this.daily = new DailyQuests(quests);

    // Some quests like SkyClash and Crazy Walls aren't stored by us.
    this.total = Object.values(quests).reduce(
      (p: number, c: APIData) => p + (c?.completions?.length ?? 0),
      0
    );

    this.weeklyTotal = Quests.getTotal(this.weekly);
    this.dailyTotal = Quests.getTotal(this.daily);
  }

  private static getTotal<T extends GenericQuestInstance>(quests: T): number {
    return Object.values(quests).reduce((total, game) => total + game.total, 0);
  }
}

export { QuestTime } from "./util.js";
