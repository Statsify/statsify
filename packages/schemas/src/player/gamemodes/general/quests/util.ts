/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData, Constructor, removeFormatting } from "@statsify/util";
import { DateTime } from "luxon";
import { Field, FieldOptions } from "../../../../metadata";
import { FormattedGame } from "../../../../game";

export type Quest = {
  completions?: { time: number }[];
};

export enum QuestTime {
  Daily,
  Weekly,
  Overall,
}

export const questFieldData: FieldOptions = { leaderboard: { limit: 5000 } };

export const questTotalFieldData = (game: FormattedGame) => ({
  leaderboard: { name: "Total", fieldName: `${removeFormatting(game)} Total` },
});

interface QuestOption {
  field: string;
  propertyKey?: string;
  fieldName?: string;
  name?: string;
}

export interface CreateQuestsOptions {
  game: FormattedGame;
  fieldPrefix: string;

  /**
   * A list of daily quests
   */
  daily: QuestOption[];

  /**
   * A list of weekly quests
   */
  weekly: QuestOption[];
}

const processQuests = (
  instance: Record<string, number>,
  quests: APIData,
  time: QuestTime,
  fieldPrefix: string,
  options: QuestOption[]
) => {
  options.forEach((quest) => {
    const k = quest.propertyKey ?? quest.field;
    instance[k] = getAmountDuring(time, quests[`${fieldPrefix}_${quests[quest.field]}`]);
    instance.total += instance[k] ?? 0;
  });
};

const assignQuestMetadata = (constructor: Constructor<any>, options: QuestOption[]) => {
  options.forEach((quest) => {
    const decorator = Field({
      type: () => Number,
      leaderboard: {
        limit: 5000,
        name: quest.name,
        fieldName: quest.fieldName,
      },
    });

    decorator(constructor.prototype, quest.propertyKey ?? quest.field);
  });
};

type QuestGame = [
  daily: Constructor<any>,
  weekly: Constructor<any>,
  overall: Constructor<any>
];

export function createGameModeQuests({
  game,
  fieldPrefix,
  daily,
  weekly,
}: CreateQuestsOptions): QuestGame {
  class Daily {
    [key: string]: number;

    @Field(questTotalFieldData(game))
    public total: number;

    public constructor(quests: APIData) {
      this.total = 0;
      processQuests(this, quests, QuestTime.Daily, fieldPrefix, daily);
    }
  }

  assignQuestMetadata(Daily, daily);

  class Weekly {
    [key: string]: number;

    @Field(questTotalFieldData(game))
    public total: number;

    public constructor(quests: APIData) {
      this.total = 0;
      processQuests(this, quests, QuestTime.Weekly, fieldPrefix, weekly);
    }
  }

  assignQuestMetadata(Weekly, weekly);

  class Overall {
    [key: string]: number;

    @Field(questTotalFieldData(game))
    public total: number;

    public constructor(quests: APIData) {
      this.total = 0;

      processQuests(this, quests, QuestTime.Daily, fieldPrefix, daily);
      processQuests(this, quests, QuestTime.Weekly, fieldPrefix, weekly);
    }
  }

  assignQuestMetadata(Overall, daily);
  assignQuestMetadata(Overall, weekly);

  return [Daily, Weekly, Overall];
}

export type QuestMode = [keyof typeof FormattedGame, QuestGame];

export function createQuestsInstance(time: QuestTime, modes: QuestMode[]) {
  class QuestInstance {
    [key: string]: Record<string, number>;

    public constructor(data: APIData) {
      modes.forEach(([game, quests]) => {
        this[game] = new quests[time](data);
      });
    }
  }

  console.log(modes);

  modes.forEach(([game, quests]) => {
    const QuestGameModeClass = quests[time];

    const decorator = Field({
      type: () => QuestGameModeClass,
      leaderboard: {
        fieldName: `${FormattedGame[game]} Quests`,
        additionalFields: ["this.total"],
      },
    });

    decorator(QuestInstance.prototype, game);
  });

  return QuestInstance;
}

export const getAmountDuring = (time: QuestTime, quest: Quest | undefined) => {
  if (!quest?.completions) return 0;
  if (time === QuestTime.Overall) return quest.completions.length;

  let t: DateTime = DateTime.now().setZone("America/New_York");

  if (time === QuestTime.Daily) {
    t = t.startOf("day");
  } else if (time === QuestTime.Weekly) {
    t = t.startOf("week");
    t =
      t.plus({ days: 4 }).toMillis() < Date.now()
        ? t.plus({ days: 4 })
        : t.minus({ days: 3 });
  }

  const millis = t.toMillis();

  return quest.completions.filter((ms) => ms.time >= millis).length;
};
