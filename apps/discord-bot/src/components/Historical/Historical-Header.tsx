/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { DateTime } from "luxon";
import { ElementNode } from "@statsify/rendering";
import { HistoricalTimes, HistoricalType } from "@statsify/api-client";
import { prettify } from "@statsify/util";

interface HistoricalHeaderProps {
  skin: JSX.Element;
  nameTag: JSX.Element;
  time: HistoricalType;
  startTime?: DateTime;
  endTime?: DateTime;
  title: string;
  sidebar?: ElementNode;
}

export const HistoricalHeader = ({
  skin,
  nameTag,
  title,
  time,
  sidebar,
  startTime,
  endTime,
}: HistoricalHeaderProps) => {
  const now = DateTime.now();
  let start: DateTime;
  let end: DateTime;

  switch (time) {
    case HistoricalTimes.DAILY: {
      start = now.minus({ days: 1 });
      end = now;
      break;
    }
    case HistoricalTimes.WEEKLY: {
      start = now.minus({ days: now.weekday });
      end = now;
      break;
    }
    case HistoricalTimes.MONTHLY: {
      start = now.minus({ days: now.day - 1 });
      end = now;
      break;
    }
    case HistoricalTimes.LAST_DAY: {
      start = now.minus({ days: 2 });
      end = now.minus({ days: 1 });
      break;
    }
    case HistoricalTimes.LAST_WEEK: {
      start = now.minus({ week: 1, days: now.weekday });
      end = now.minus({ days: now.weekday });
      break;
    }
    case HistoricalTimes.LAST_MONTH: {
      start = now.minus({ months: 1, days: now.day - 1 });
      end = now.minus({ days: now.day });
      break;
    }
  }

  if (startTime) start = startTime;
  if (endTime) end = endTime;

  return (
    <div width="100%">
      {skin}
      <div width="remaining" height="remaining" direction="column">
        {nameTag}
        <box width="100%" height="remaining">
          <text>
            {start.toFormat("MM/dd/yy")} ➡ {end.toFormat("MM/dd/yy")}
          </text>
        </box>
        <div width="100%">
          <box padding={{ left: 12, right: 12 }}>
            <text>§l{prettify(time.toLowerCase())}</text>
          </box>
          <box width="remaining">
            <text t:ignore>{title}</text>
          </box>
        </div>
      </div>
      {sidebar ?? <></>}
    </div>
  );
};
