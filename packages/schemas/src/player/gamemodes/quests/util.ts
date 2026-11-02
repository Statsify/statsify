/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  type APIData,
  type Constructor,
  type UnwrapConstructor,
  removeFormatting,
} from "@statsify/util";
import { DateTime } from "luxon";
import { Field } from "#metadata";
import { FormattedGame } from "#game";
import objectiveTargets from "./objective-targets.json" with { type: "json" };

interface Quest {
  active?: { started: number; objectives?: Record<string, number> };
  completions?: { time: number }[];
}

const OBJECTIVE_TARGETS: Record<string, number> = objectiveTargets;

/**
 * Each game's quest targets by property key, for quests with a single objective
 */
export const QUEST_TARGETS: Record<string, Record<string, number>> = {};

export enum QuestTime {
  Daily,
  Weekly,
  Monthly,
  Overall
}

export interface QuestOption<TField extends string> {
  field: string;
  /**
   * The quest's full key before Hypixel renamed it, so its old completions still count
   */
  legacyField?: string;
  propertyKey: TField;
  fieldName?: string;
  name?: string;
  leaderboard?: false;
  overall?: {
    fieldName?: string;
    name?: string;
  };
}

export interface CreateQuestsOptions<
  DailyFields extends string,
  WeeklyFields extends string,
  MonthlyFields extends string
> {
  game: FormattedGame;
  fieldPrefix?: string;

  /**
   * A list of daily quests
   */
  daily: QuestOption<DailyFields>[];

  /**
   * A list of weekly quests
   */
  weekly: QuestOption<WeeklyFields>[];

  /**
   * A list of monthly quests
   */
  monthly?: QuestOption<MonthlyFields>[];
}

const getQuestField = (quest: QuestOption<string>, fieldPrefix?: string) =>
  fieldPrefix ? `${fieldPrefix}_${quest.field}` : quest.field;

const processQuests = (
  instance: { total: number; [key: string]: number | Record<string, number> },
  quests: APIData,
  time: QuestTime,
  options: QuestOption<string>[],
  fieldPrefix?: string
) => {
  for (const quest of options) {
    const k = quest.propertyKey ?? quest.field;

    let count = getQuestCountDuring(time, quests[getQuestField(quest, fieldPrefix)]);
    if (quest.legacyField) count += getQuestCountDuring(time, quests[quest.legacyField]);

    instance[k] = count;
    instance.total += count;
  }
};

const assignQuestMetadata = (
  constructor: Constructor<any>,
  time: QuestTime,
  options: QuestOption<string>[]
) => {
  for (const quest of options) {
    const hasOverall = quest.overall !== undefined;
    const canDisplayOverall = hasOverall && time === QuestTime.Overall;

    const decorator = Field({
      type: () => Number,
      leaderboard: {
        limit: 10_000,
        name: canDisplayOverall ? quest.overall?.name : quest.name,
        fieldName: canDisplayOverall ? quest.overall?.fieldName : quest.fieldName,
        enabled: time === QuestTime.Overall && quest.leaderboard,
        additionalFields: ["this.total"],
      },
      historical: { enabled: false },
    });

    decorator(constructor.prototype, quest.propertyKey ?? quest.field);
  }
};

const createQuestProgress = (
  time: Exclude<QuestTime, QuestTime.Overall>,
  options: QuestOption<string>[],
  targets: Record<string, number>,
  fieldPrefix?: string
) => {
  const tracked = options.filter((quest) => quest.propertyKey in targets);

  class Progress {
    [key: string]: number;

    public constructor(quests: APIData) {
      const start = getPeriodStart(time);

      for (const quest of tracked) {
        const active: Quest["active"] = quests[getQuestField(quest, fieldPrefix)]?.active;

        // Hypixel keeps a quest's objectives after it resets, so only count this period's
        if (active?.objectives && active.started >= start)
          this[quest.propertyKey] = Object.values(active.objectives)[0];
      }
    }
  }

  assignQuestMetadata(Progress, time, tracked);

  return Progress;
};

const questTotalFieldData = (game: FormattedGame, enabled = false) => ({
  leaderboard: {
    name: "Total",
    fieldName: `${removeFormatting(game)} Total`,
    enabled,
  },
  historical: { enabled: false },
});

type GameWithQuestMode<Fields extends string> = {
  [K in Fields]: number;
} & { total: number };

type GameWithQuests<DailyFields extends string, WeeklyFields extends string, MonthlyFields extends string> = [
  daily: Constructor<GameWithQuestMode<DailyFields>>,
  weekly: Constructor<GameWithQuestMode<WeeklyFields>>,
  monthly: Constructor<GameWithQuestMode<MonthlyFields>>,
  overall: Constructor<GameWithQuestMode<DailyFields | WeeklyFields | MonthlyFields>>
];

export function createGameModeQuests<
  DailyFields extends string,
  WeeklyFields extends string,
  MonthlyFields extends string
>({
  game,
  fieldPrefix,
  daily,
  weekly,
  monthly = [],
}: CreateQuestsOptions<DailyFields, WeeklyFields, MonthlyFields>): GameWithQuests<
  DailyFields,
  WeeklyFields,
  MonthlyFields
> {
  const targets: Record<string, number> = {};

  for (const quest of [...daily, ...weekly, ...monthly]) {
    const target = OBJECTIVE_TARGETS[getQuestField(quest, fieldPrefix)];
    if (target) targets[quest.propertyKey] = target;
  }

  QUEST_TARGETS[game] = targets;

  const DailyProgress = createQuestProgress(QuestTime.Daily, daily, targets, fieldPrefix);

  class Daily {
    [key: string]: number | Record<string, number>;

    @Field(questTotalFieldData(game))
    public total: number = 0;

    @Field({ type: () => DailyProgress })
    public progress: Record<string, number>;

    public constructor(quests: APIData) {
      processQuests(this, quests, QuestTime.Daily, daily, fieldPrefix);
      this.progress = new DailyProgress(quests);
    }
  }

  assignQuestMetadata(Daily, QuestTime.Daily, daily);

  const WeeklyProgress = createQuestProgress(QuestTime.Weekly, weekly, targets, fieldPrefix);

  class Weekly {
    [key: string]: number | Record<string, number>;

    @Field(questTotalFieldData(game))
    public total: number = 0;

    @Field({ type: () => WeeklyProgress })
    public progress: Record<string, number>;

    public constructor(quests: APIData) {
      processQuests(this, quests, QuestTime.Weekly, weekly, fieldPrefix);
      this.progress = new WeeklyProgress(quests);
    }
  }

  assignQuestMetadata(Weekly, QuestTime.Weekly, weekly);

  const MonthlyProgress = createQuestProgress(QuestTime.Monthly, monthly, targets, fieldPrefix);

  class Monthly {
    [key: string]: number | Record<string, number>;

    @Field(questTotalFieldData(game))
    public total: number = 0;

    @Field({ type: () => MonthlyProgress })
    public progress: Record<string, number>;

    public constructor(quests: APIData) {
      processQuests(this, quests, QuestTime.Monthly, monthly, fieldPrefix);
      this.progress = new MonthlyProgress(quests);
    }
  }

  assignQuestMetadata(Monthly, QuestTime.Monthly, monthly);

  class Overall {
    [key: string]: number;

    @Field(questTotalFieldData(game, true))
    public total: number = 0;

    public constructor(quests: APIData) {
      processQuests(this, quests, QuestTime.Overall, daily, fieldPrefix);
      processQuests(this, quests, QuestTime.Overall, weekly, fieldPrefix);
      processQuests(this, quests, QuestTime.Overall, monthly, fieldPrefix);
    }
  }

  assignQuestMetadata(Overall, QuestTime.Overall, daily);
  assignQuestMetadata(Overall, QuestTime.Overall, weekly);
  assignQuestMetadata(Overall, QuestTime.Overall, monthly);

  return [Daily, Weekly, Monthly, Overall] as GameWithQuests<DailyFields, WeeklyFields, MonthlyFields>;
}

type BaseGamesWithQuestsRecord = {
  [K in keyof typeof FormattedGame]?: GameWithQuests<string, string, string>;
};

type IQuestInstance<
  Time extends QuestTime,
  GamesWithQuests extends BaseGamesWithQuestsRecord
> = Constructor<{
  [K in keyof GamesWithQuests]: GamesWithQuests[K] extends GameWithQuests<string, string, string> ?
    UnwrapConstructor<GamesWithQuests[K][Time]> :
    never;
}>;

export function createQuestsInstance<
  Time extends QuestTime,
  GamesWithQuests extends BaseGamesWithQuestsRecord
>(time: Time, record: GamesWithQuests): IQuestInstance<Time, GamesWithQuests> {
  const modes = Object.entries(record) as [
    keyof typeof FormattedGame,
    GameWithQuests<string, string, string>
  ][];

  class QuestInstance {
    [key: string]: Record<string, number>;

    public constructor(data: APIData) {
      for (const [game, quests] of modes) {
        this[game] = new quests[time](data);
      }
    }
  }

  for (const [gameName, quests] of modes) {
    const GameModeClass = quests[time];

    const decorator = Field({
      type: () => GameModeClass,
      leaderboard: { fieldName: `${FormattedGame[gameName]} Quests -` },
      historical: { enabled: false },
    });

    decorator(QuestInstance.prototype, gameName);
  }

  return QuestInstance as unknown as IQuestInstance<Time, GamesWithQuests>;
}

const getPeriodStart = (time: Exclude<QuestTime, QuestTime.Overall>) => {
  let t: DateTime = DateTime.now().setZone("America/New_York");

  switch (time) {
    case QuestTime.Daily:
      t = t.startOf("day");
      break;

    case QuestTime.Weekly:
      t = t.startOf("week");
      t = t.plus({ days: 4 }).toMillis() < Date.now() ?
        t.plus({ days: 4 }) :
        t.minus({ days: 3 });
      break;

    case QuestTime.Monthly:
      t = t.startOf("month");
      break;
  }

  return t.toMillis();
};

export const getQuestCountDuring = (time: QuestTime, quest: Quest | undefined) => {
  if (!quest?.completions) return 0;
  if (time === QuestTime.Overall) return quest.completions.length;

  const millis = getPeriodStart(time);

  return quest.completions.filter((ms) => ms.time >= millis).length;
};
