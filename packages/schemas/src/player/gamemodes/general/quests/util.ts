/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { DateTime } from "luxon";

export type Quest = {
  completions?: { time: number }[];
};

export type QuestTime = "day" | "week" | undefined;

export const getAmountDuring = (quest: Quest | undefined, time: QuestTime) => {
  if (!quest?.completions) return 0;

  if (time) {
    let t = DateTime.now().setZone("America/New_York").startOf(time);

    if (time === "week") {
      t =
        t.plus({ days: 3 }).toMillis() < Date.now()
          ? t.plus({ days: 3 })
          : t.minus({ days: 4 });
    }

    return quest.completions.filter((ms) => ms.time >= t.toMillis()).length;
  } else {
    return quest.completions.length;
  }
};
