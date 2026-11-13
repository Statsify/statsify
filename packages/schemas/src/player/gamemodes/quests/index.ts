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
  WoolGamesQuests,
} from "./modes/index.js";
import { ExtractGameModes, FormattedGame, GameModes } from "#game";
import { Field } from "#metadata";
import { QuestTime, createQuestsInstance } from "./util.js";


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
  WOOLGAMES: WoolGamesQuests,
} as const;

export const DailyQuests = createQuestsInstance(QuestTime.Daily, questModes);
export const WeeklyQuests = createQuestsInstance(QuestTime.Weekly, questModes);
export const MonthlyQuests = createQuestsInstance(QuestTime.Monthly, questModes);
export const OverallQuests = createQuestsInstance(QuestTime.Overall, questModes);

export interface GameQuests {
  total: number;
}

export type GenericQuestInstance = {
  [K in keyof typeof FormattedGame]?: GameQuests;
};

export class Quests {
  @Field({
    leaderboard: { name: "Total Quests", fieldName: "Quests" },
    historical: { enabled: false },
  })
  public total: number;

  @Field({
    leaderboard: {
      name: "Weekly Quests",
      fieldName: "Quests",
      resetEvery: "friday",
    },
    historical: { enabled: false },
  })
  public weeklyTotal: number;

  @Field({
    leaderboard: {
      name: "Daily Quests",
      fieldName: "Quests",
      resetEvery: "day",
    },
    historical: { enabled: false },
  })
  public dailyTotal: number;

  // TODO: add monthlyTotal

  @Field({ type: () => OverallQuests, leaderboard: { fieldName: "" } })
  public overall: UnwrapConstructor<typeof OverallQuests>;

  @Field({ type: () => MonthlyQuests })
  public monthly: UnwrapConstructor<typeof MonthlyQuests>;

  @Field({ type: () => WeeklyQuests })
  public weekly: UnwrapConstructor<typeof WeeklyQuests>;

  @Field({ type: () => DailyQuests })
  public daily: UnwrapConstructor<typeof DailyQuests>;

  public constructor(quests: APIData) {
    this.overall = new OverallQuests(quests);
    this.monthly = new MonthlyQuests(quests);
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
