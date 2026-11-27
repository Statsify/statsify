/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { APIData } from "@statsify/util";
import { deepAdd } from "@statsify/math";
import { s } from "#definition/s";

const WatchdogModeSchema = s.object({
  bans: s.number(),
  lastMinute: s.number(),
  lastDay: s.number(),
});

export type WatchdogMode = s.infer<typeof WatchdogModeSchema>;

export const WatchdogSchema = s.object({
  overall: WatchdogModeSchema,
  watchdog: WatchdogModeSchema,
  staff: WatchdogModeSchema,
});

export type Watchdog = s.infer<typeof WatchdogSchema>;

function watchdogMode(data: APIData, mode: string): s.input<typeof WatchdogModeSchema> {
  return {
    bans: data[`${mode}_total`],
    lastMinute: data[`${mode}_lastMinute`],
    lastDay: data[`${mode}_rollingDaily`],
  };
}

export function watchdog(data: APIData): s.input<typeof WatchdogSchema> {
  const watchdog = watchdogMode(data, "watchdog");
  const staff = watchdogMode(data, "staff");

  return { overall: deepAdd(watchdog, staff), watchdog, staff };
}
