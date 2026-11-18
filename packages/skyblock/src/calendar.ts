/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { MayorView } from "./election.js";

// The wiki's Time page (unverified): Early Spring 1 of year 1 began on 2019-06-11 at 17:55 UTC, a day lasts 20 minutes
// and a month 31 days.
const EPOCH = 1_560_275_700_000;
const DAY = 1_200_000;
const MONTH_DAYS = 31;
const YEAR_DAYS = 12 * MONTH_DAYS;

export const SKYBLOCK_MONTHS = [
  "earlySpring",
  "spring",
  "lateSpring",
  "earlySummer",
  "summer",
  "lateSummer",
  "earlyAutumn",
  "autumn",
  "lateAutumn",
  "earlyWinter",
  "winter",
  "lateWinter",
] as const;

/** A day of SkyBlock's calendar: the month counts from 0 (Early Spring), the day from 1. */
export interface SkyBlockDate {
  year: number;
  month: number;
  day: number;
}

export const skyblockDate = (time: number): SkyBlockDate => {
  const days = Math.floor((time - EPOCH) / DAY);
  return { year: Math.floor(days / YEAR_DAYS) + 1, month: Math.floor((days % YEAR_DAYS) / MONTH_DAYS), day: (days % MONTH_DAYS) + 1 };
};

/** When a SkyBlock day begins. */
export const skyblockTime = ({ year, month, day }: SkyBlockDate) => EPOCH + ((year - 1) * YEAR_DAYS + month * MONTH_DAYS + day - 1) * DAY;

/** Each year's fixed events from the wiki's Calendar page (unverified): the month and day each starts, and how many days. */
const EVENTS = [
  { key: "hoppitysHunt", month: 0, day: 1, days: 93 },
  { key: "electionOver", month: 2, day: 27, days: 1 },
  { key: "travelingZoo", month: 3, day: 1, days: 3 },
  { key: "electionOpens", month: 5, day: 27, days: 1 },
  { key: "harvestFeast", month: 6, day: 1, days: 93 },
  { key: "spookyFestival", month: 7, day: 29, days: 3 },
  { key: "travelingZoo", month: 9, day: 1, days: 3 },
  { key: "seasonOfJerry", month: 11, day: 24, days: 3 },
  { key: "newYear", month: 11, day: 29, days: 3 },
] as const;

export type SkyBlockEvent = (typeof EVENTS)[number]["key"];

/** One event's run in real time; `end` is the moment it's over. */
export interface EventTime {
  key: SkyBlockEvent;
  start: number;
  end: number;
}

/** The mayor's term in real time, from its election's end, while it lasts. */
export function termOf(mayor: MayorView | undefined, time: number) {
  // A copy the API cached before `term` existed has none until it refreshes
  if (mayor?.term === undefined) return;
  const start = skyblockTime({ year: mayor.term, month: 2, day: 27 });
  const end = start + YEAR_DAYS * DAY;
  return end > time ? { start, end } : undefined;
}

/** Every event's run that hasn't ended at `time`, the ones on now first, then by start; `mayor` is the one in office. */
export function nextEvents(time: number, mayor?: MayorView): EventTime[] {
  const { year } = skyblockDate(time);
  const term = termOf(mayor, time);
  const perks = mayor ? [...mayor.mayor.perks, ...(mayor.minister ? [mayor.minister.perk] : [])] : [];
  // With Finnegan's Grand Feast perk in office, the Harvest Feast runs his whole term (the wiki's Harvest Feast page,
  // unverified)
  const grandFeast = perks.some(({ name }) => name === "Grand Feast") ? term : undefined;

  return EVENTS.map(({ key, month, day, days }) => {
    if (key === "harvestFeast" && grandFeast) return { key, ...grandFeast };
    const start = [year, year + 1].map((at) => skyblockTime({ year: at, month, day })).find((start) => start + days * DAY > time)!;
    return { key, start, end: start + days * DAY };
  }).toSorted((a, b) => a.start - b.start);
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest;

  test("skyblockDate counts 20-minute days, 31-day months and 12-month years from the epoch", () => {
    expect(skyblockDate(EPOCH)).toEqual({ year: 1, month: 0, day: 1 });
    expect(skyblockDate(EPOCH + 31 * DAY - 1)).toEqual({ year: 1, month: 0, day: 31 });
    expect(skyblockDate(EPOCH + YEAR_DAYS * DAY)).toEqual({ year: 2, month: 0, day: 1 });
    expect(skyblockDate(1_794_105_965_338)).toEqual({ year: 524, month: 9, day: 24 });
  });

  test("nextEvents puts an event on now first and moves a past one to next year", () => {
    const zoo = skyblockTime({ year: 10, month: 3, day: 2 });
    const [first, second] = nextEvents(zoo);
    expect(first).toEqual({ key: "travelingZoo", start: skyblockTime({ year: 10, month: 3, day: 1 }), end: skyblockTime({ year: 10, month: 3, day: 4 }) });
    expect(second.key).toBe("electionOpens");
    expect(nextEvents(zoo).find(({ key }) => key === "newYear")?.start).toBe(skyblockTime({ year: 10, month: 11, day: 29 }));
    expect(nextEvents(zoo).find(({ key }) => key === "electionOver")?.start).toBe(skyblockTime({ year: 11, month: 2, day: 27 }));
  });

  test("nextEvents runs the Harvest Feast through the whole term under Grand Feast, and not past it", () => {
    const finnegan = { mayor: { name: "Finnegan", perks: [{ name: "Grand Feast", description: "" }] }, term: 9 };
    const feast = (time: number) => nextEvents(time, finnegan).find(({ key }) => key === "harvestFeast");
    expect(feast(skyblockTime({ year: 10, month: 0, day: 5 }))).toEqual({ key: "harvestFeast", start: skyblockTime({ year: 9, month: 2, day: 27 }), end: skyblockTime({ year: 10, month: 2, day: 27 }) });
    expect(feast(skyblockTime({ year: 10, month: 3, day: 1 }))?.start).toBe(skyblockTime({ year: 10, month: 6, day: 1 }));
  });
}
