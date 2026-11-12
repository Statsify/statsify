/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  DailyQuests,
  MonthlyQuests,
  OverallQuests,
  QUEST_MODES,
  type QuestModes,
  QuestTime,
  WeeklyQuests,
  scanMetadata,
} from "@statsify/schemas";
import { type Game, type Shape, type StatEntry, childClasses, doneColor } from "../catalog.js";

/** The periods the schema counts quests over, all time first, each stored at `stats.quests.<period>.<GAME>`. */
export const QUEST_PERIODS = ["overall", "daily", "weekly", "monthly"] as const;
export type QuestPeriod = (typeof QUEST_PERIODS)[number];

/** Each period's `QuestTime`, the schema's name for it. */
export const QUEST_TIMES: Record<string, QuestTime> = {
  overall: QuestTime.Overall,
  daily: QuestTime.Daily,
  weekly: QuestTime.Weekly,
  monthly: QuestTime.Monthly,
};

const PERIOD_CLASSES = { overall: OverallQuests, daily: DailyQuests, weekly: WeeklyQuests, monthly: MonthlyQuests };

/** A quest under the card's name for it. */
const quest = (name: string): StatEntry => ({ color: doneColor, name });

/** A period's total, out of the game's quests for the period: green when all are done, gold when some are, red when none. */
const done = (count: number): StatEntry => ({
  color: (value) => (count > 0 && Number(value) >= count ? "§a" : Number(value) > 0 ? "§6" : "§c"),
  of: count,
});

export const QUESTS: Game<QuestModes> = {
  key: "quests",
  id: null,
  modes: QUEST_MODES,
  game: { total: { color: "§b", glossary: "questsTotal" }, dailyTotal: { color: "§b" }, weeklyTotal: { color: "§b" } },
  // Each game's class for a period, whose own metadata holds the quest names the card shows (the player's are prefixed).
  shapes: QUEST_PERIODS.flatMap((period) =>
    childClasses(PERIOD_CLASSES[period]).map(([game, type]): Shape => {
      const quests = scanMetadata(type).filter(([key]) => key !== "total");

      return {
        modes: [`${period}.${game}`],
        stats: {
          total: { ...(period === "overall" ? { color: "§a" } : done(quests.length)), glossary: "questsTotal" },
          ...Object.fromEntries(quests.map(([key, { leaderboard }]) => [key, quest(leaderboard.name)])),
        },
      };
    })
  ),
};
