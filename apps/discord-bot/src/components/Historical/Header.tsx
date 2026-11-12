/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  addDays,
  addHours,
  addMinutes,
  addMonths,
  addSeconds,
  addYears,
  differenceInCalendarDays,
  differenceInCalendarMonths,
  differenceInCalendarYears,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
  format,
  getDate,
  getISODay,
  sub,
  subDays,
} from "date-fns";
import { ElementNode } from "@statsify/rendering";
import { HistoricalTimes, HistoricalType } from "@statsify/api-client";
import { prettify } from "@statsify/util";

interface HistoricalHeaderProps {
  skin: JSX.Element;
  nameTag: JSX.Element;
  time: HistoricalTimeData;
  startTime?: Date;
  endTime?: Date;
  title: string;
  sidebar?: ElementNode;
}

export interface HistoricalTimeData {
  timeType: HistoricalType;
  startTime?: Date;
  endTime?: Date;
  sessionReset?: Date;
}

const DATE_FORMAT = "MM/dd/yyyy";

const RELATIVE_TIME_UNITS = [
  ["year", differenceInCalendarYears, addYears],
  ["month", differenceInCalendarMonths, addMonths],
  ["day", differenceInCalendarDays, addDays],
  ["hour", differenceInHours, addHours],
  ["minute", differenceInMinutes, addMinutes],
  ["second", differenceInSeconds, addSeconds],
] as const;

// Counted by hand since differenceInMonths makes Jan 29 6pm to Feb 28 noon a month instead of 29
// days, because Feb 28 ends its month
const formatRelativeTime = (date: Date) => {
  const now = new Date();
  const [earlier, later, sign] = date < now ? [date, now, -1] : [now, date, 1];
  const formatter = new Intl.RelativeTimeFormat();

  for (const [unit, difference, add] of RELATIVE_TIME_UNITS) {
    let count = difference(later, earlier);
    if (add(earlier, count) > later) count--;
    if (count > 0) return formatter.format(sign * count, unit);
  }

  return formatter.format(sign * 0, "second");
};

export const HistoricalHeader = ({
  skin,
  nameTag,
  title,
  sidebar,
  time: { timeType, startTime, endTime, sessionReset },
}: HistoricalHeaderProps) => {
  const now = new Date();
  const weekday = getISODay(now);
  const day = getDate(now);
  let start = now;
  let end = now;

  switch (timeType) {
    case HistoricalTimes.DAILY:
      start = subDays(now, 1);
      end = now;
      break;
    case HistoricalTimes.WEEKLY:
      start = subDays(now, weekday);
      end = now;
      break;
    case HistoricalTimes.MONTHLY:
      start = subDays(now, day - 1);
      end = now;
      break;
    case HistoricalTimes.LAST_DAY:
      start = subDays(now, 2);
      end = subDays(now, 1);
      break;
    case HistoricalTimes.LAST_WEEK:
      start = sub(now, { weeks: 1, days: weekday });
      end = subDays(now, weekday);
      break;
    case HistoricalTimes.LAST_MONTH:
      start = sub(now, { months: 1, days: day - 2 });
      end = subDays(now, day);
      break;
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
            {timeType === HistoricalTimes.SESSION ?
              `Started ${format(sessionReset!, DATE_FORMAT)} (${formatRelativeTime(sessionReset!)})` :
              `${format(start, DATE_FORMAT)} ➡ ${format(end, DATE_FORMAT)}`}
          </text>
        </box>
        <div width="100%">
          <box padding={{ left: 12, right: 12 }}>
            <text>§l{prettify(timeType.toLowerCase())}</text>
          </box>
          <box width="remaining">
            <text>{title}</text>
          </box>
        </div>
      </div>
      {sidebar ?? <></>}
    </div>
  );
};
