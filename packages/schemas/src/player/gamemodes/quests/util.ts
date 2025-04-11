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

interface Quest {
  completions?: { time: number }[];
}

export enum QuestTime {
  Daily,
  Weekly,
  Monthly,
  Overall
}

export interface QuestOption<TField extends string> {
  field: string;
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

const processQuests = (
  instance: Record<string, number>,
  quests: APIData,
  time: QuestTime,
  options: QuestOption<string>[],
  fieldPrefix?: string
) => {
  options.forEach((quest) => {
    const k = quest.propertyKey ?? quest.field;
    const field = fieldPrefix ? `${fieldPrefix}_${quest.field}` : quest.field;

    if (time === QuestTime.Monthly) console.log(field);

    instance[k] = getQuestCountDuring(time, quests[field]);
    instance.total += instance[k] ?? 0;
  });
};

const assignQuestMetadata = (
  constructor: Constructor<any>,
  time: QuestTime,
  options: QuestOption<string>[]
) => {
  options.forEach((quest) => {
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
  });
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
  class Daily {
    [key: string]: number;

    @Field(questTotalFieldData(game))
    public total: number;

    public constructor(quests: APIData) {
      this.total = 0;
      processQuests(this, quests, QuestTime.Daily, daily, fieldPrefix);
    }
  }

  assignQuestMetadata(Daily, QuestTime.Daily, daily);

  class Weekly {
    [key: string]: number;

    @Field(questTotalFieldData(game))
    public total: number;

    public constructor(quests: APIData) {
      this.total = 0;
      processQuests(this, quests, QuestTime.Weekly, weekly, fieldPrefix);
    }
  }

  assignQuestMetadata(Weekly, QuestTime.Weekly, weekly);

  class Monthly {
    [key: string]: number;

    @Field(questTotalFieldData(game))
    public total: number;

    public constructor(quests: APIData) {
      this.total = 0;
      processQuests(this, quests, QuestTime.Monthly, monthly, fieldPrefix);
    }
  }

  assignQuestMetadata(Monthly, QuestTime.Monthly, monthly);

  class Overall {
    [key: string]: number;

    @Field(questTotalFieldData(game, true))
    public total: number;

    public constructor(quests: APIData) {
      this.total = 0;

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
  [K in keyof GamesWithQuests]: GamesWithQuests[K] extends GameWithQuests<string, string, string>
    ? UnwrapConstructor<GamesWithQuests[K][Time]>
    : never;
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
      modes.forEach(([game, quests]) => {
        this[game] = new quests[time](data);
      });
    }
  }

  modes.forEach(([gameName, quests]) => {
    const GameModeClass = quests[time];

    const decorator = Field({
      type: () => GameModeClass,
      leaderboard: { fieldName: `${FormattedGame[gameName]} Quests -` },
      historical: { enabled: false },
    });

    decorator(QuestInstance.prototype, gameName);
  });

  return QuestInstance as unknown as IQuestInstance<Time, GamesWithQuests>;
}

export const getQuestCountDuring = (time: QuestTime, quest: Quest | undefined) => {
  if (!quest?.completions) return 0;
  if (time === QuestTime.Overall) return quest.completions.length;

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

  const millis = t.toMillis();

  return quest.completions.filter((ms) => ms.time >= millis).length;
};
