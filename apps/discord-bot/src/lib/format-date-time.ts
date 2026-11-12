/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { LocalizeFunction } from "@statsify/discord";
import { format } from "date-fns";

export const formatDateTime = (t: LocalizeFunction, time: number): string => {
  // Intl's AM/PM rather than a date-fns locale's, which spells it differently (de "nachm." instead of "PM")
  const dayPeriod = new Intl.DateTimeFormat(t.locale, { hour: "numeric", hourCycle: "h12" })
    .formatToParts(time)
    .find((part) => part.type === "dayPeriod")!.value;

  return `${format(time, "MM/dd/yy, hh:mm")} ${dayPeriod}`;
};
