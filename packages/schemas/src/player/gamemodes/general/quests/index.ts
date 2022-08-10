/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData, removeFormatting } from "@statsify/util";
import { Field } from "../../../../metadata";
import { FormattedGame, GameModes, IGameModes } from "../../../../game";
import { GameQuests } from "./game-quests";
import { QuestsInstance } from "./quests-instance";

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

export class Quests {
  @Field({ leaderboard: { name: "Total Quests", fieldName: "Quests" } })
  public total: number;

  @Field({
    leaderboard: {
      name: "Total Quests Weekly",
      fieldName: "Quests",
      resetEvery: "friday",
    },
  })
  public weeklyTotal: number;

  @Field({
    leaderboard: {
      name: "Total Quests Daily",
      fieldName: "Quests",
      resetEvery: "day",
    },
  })
  public dailyTotal: number;

  @Field()
  public overall: QuestsInstance;

  @Field({ leaderboard: { resetEvery: "friday" } })
  public weekly: QuestsInstance;

  @Field({ leaderboard: { resetEvery: "day" } })
  public daily: QuestsInstance;

  public constructor(quests: APIData) {
    this.overall = new QuestsInstance(quests);
    this.weekly = new QuestsInstance(quests, "week");
    this.daily = new QuestsInstance(quests, "day");

    this.total = Object.values(quests).reduce(
      (p: number, c: APIData) => p + (c?.completions?.length ?? 0),
      0
    );

    this.dailyTotal = Object.entries(this.daily).reduce(
      (p, [, c]: [string, GameQuests]) => p + c.total,
      0
    );

    this.weeklyTotal = Object.entries(this.weekly).reduce(
      (p, [, c]: [string, GameQuests]) => p + c.total,
      0
    );
  }
}

export * from "./game-quests";
export * from "./quests-instance";
