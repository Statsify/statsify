/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData, Constructor, removeFormatting } from "@statsify/util";
import { DateTime } from "luxon";
import { Field } from "../../../../metadata";
import { FormattedGame } from "../../../../game";

interface Quest {
  completions?: { time: number }[];
}

export enum QuestTime {
  Daily,
  Weekly,
  Overall,
}

export interface QuestOption {
  field: string;
  propertyKey?: string;
  fieldName?: string;
  name?: string;
  leaderboard?: false;
}

export interface CreateQuestsOptions {
  game: FormattedGame;
  fieldPrefix?: string;

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
  options: QuestOption[],
  fieldPrefix?: string
) => {
  options.forEach((quest) => {
    const k = quest.propertyKey ?? quest.field;
    const field = fieldPrefix ? `${fieldPrefix}_${quest.field}` : quest.field;

    instance[k] = getQuestCountDuring(time, quests[field]);
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
        enabled: quest.leaderboard,
      },
    });

    decorator(constructor.prototype, quest.propertyKey ?? quest.field);
  });
};

const questTotalFieldData = (game: FormattedGame) => ({
  leaderboard: { name: "Total", fieldName: `${removeFormatting(game)} Total` },
});

type GameWithQuests = [
  daily: Constructor<any>,
  weekly: Constructor<any>,
  overall: Constructor<any>
];

export function createGameModeQuests({
  game,
  fieldPrefix,
  daily,
  weekly,
}: CreateQuestsOptions): GameWithQuests {
  class Daily {
    [key: string]: number;

    @Field(questTotalFieldData(game))
    public total: number;

    public constructor(quests: APIData) {
      this.total = 0;
      processQuests(this, quests, QuestTime.Daily, daily, fieldPrefix);
    }
  }

  assignQuestMetadata(Daily, daily);

  class Weekly {
    [key: string]: number;

    @Field(questTotalFieldData(game))
    public total: number;

    public constructor(quests: APIData) {
      this.total = 0;
      processQuests(this, quests, QuestTime.Weekly, weekly, fieldPrefix);
    }
  }

  assignQuestMetadata(Weekly, weekly);

  class Overall {
    [key: string]: number;

    @Field(questTotalFieldData(game))
    public total: number;

    public constructor(quests: APIData) {
      this.total = 0;

      processQuests(this, quests, QuestTime.Overall, daily, fieldPrefix);
      processQuests(this, quests, QuestTime.Overall, weekly, fieldPrefix);
    }
  }

  assignQuestMetadata(Overall, daily);
  assignQuestMetadata(Overall, weekly);

  return [Daily, Weekly, Overall];
}

export type GameWithQuestsEntry = [keyof typeof FormattedGame, GameWithQuests];

export function createQuestsInstance(time: QuestTime, modes: GameWithQuestsEntry[]) {
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
      leaderboard: {
        fieldName: `${FormattedGame[gameName]} Quests -`,
        additionalFields: ["this.total"],
      },
    });

    decorator(QuestInstance.prototype, gameName);
  });

  return QuestInstance;
}

export const getQuestCountDuring = (time: QuestTime, quest: Quest | undefined) => {
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
