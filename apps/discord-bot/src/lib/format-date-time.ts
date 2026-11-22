/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { format } from "date-fns";
import type { LocalizeFunction } from "@statsify/discord";

export const formatDateTime = (t: LocalizeFunction, time: number): string => {
  // Intl's AM/PM, since date-fns locales spell it differently (de "nachm.")
  const dayPeriod = new Intl.DateTimeFormat(t.locale, { hour: "numeric", hourCycle: "h12" })
    .formatToParts(time)
    .find((part) => part.type === "dayPeriod")!.value;

  return `${format(time, "MM/dd/yy, hh:mm")} ${dayPeriod}`;
};
