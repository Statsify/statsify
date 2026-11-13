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
  { key: "spookyFishing", month: 7, day: 26, days: 9 },
  { key: "spookyFestival", month: 7, day: 29, days: 3 },
  { key: "travelingZoo", month: 9, day: 1, days: 3 },
  { key: "jerrysWorkshop", month: 11, day: 1, days: 31 },
  { key: "seasonOfJerry", month: 11, day: 24, days: 3 },
  { key: "newYear", month: 11, day: 29, days: 3 },
] as const;

/** An event that runs every `every` days, starting `at` days into each cycle (counted from the epoch), for `days`. */
interface Cycle {
  key: string;
  every: number;
  at: readonly number[];
  days: number;
}

const yearsFrom = (year: number, every: number) => ({ every: every * YEAR_DAYS, at: [((year - 1) % every) * YEAR_DAYS], days: YEAR_DAYS });

// Events on other cycles, from the wiki's Calendar, Events, Dark Auction, Jacob's Farming Contest and Cult of the Fallen
// Star pages (an owner exception, unverified). The 12-year ones are the only years of that cycle the wiki names.
const CYCLES = [
  { key: "darkAuction", every: 3, at: [0], days: 0 },
  { key: "jacobsContest", every: 3, at: [1], days: 1 },
  { key: "cult", every: MONTH_DAYS, at: [6, 13, 20, 27], days: 0.25 },
  { key: "bankInterest", every: 3 * MONTH_DAYS, at: [0], days: 0 },
  { key: "yearOfTheSeal", ...yearsFrom(402, 12) },
  { key: "yearOfThePig", ...yearsFrom(407, 12) },
  { key: "yearOfTheWitch", ...yearsFrom(476, 12) },
  { key: "century", ...yearsFrom(100, 100) },
] as const satisfies Cycle[];

const dayOfYear = (month: number, day: number) => month * MONTH_DAYS + day - 1;

const TERM = { every: YEAR_DAYS, at: [dayOfYear(2, 27)], days: YEAR_DAYS };

// The events a mayor's or minister's perk brings (the wiki's Events/Mayor Events Table, an owner exception, unverified),
// a whole-term one from the election's end. Foxy's Extra Event and Diaz's Stock Exchange are left out: no set time.
const PERK_EVENTS = {
  "Fishing Festival": { key: "fishingFestival", every: MONTH_DAYS, at: [0], days: 3 },
  "Mining Fiesta": { key: "miningFiesta", ...TERM },
  "Mythological Ritual": { key: "mythologicalRitual", ...TERM },
  "Chivalrous Carnival": { key: "carnival", ...TERM },
} as const satisfies Record<string, Cycle>;

export type SkyBlockEvent =
  | (typeof EVENTS)[number]["key"]
  | (typeof CYCLES)[number]["key"]
  | (typeof PERK_EVENTS)[keyof typeof PERK_EVENTS]["key"];

/** One event's run in real time; `end` is the moment it's over. */
export interface EventTime {
  key: SkyBlockEvent;
  start: number;
  end: number;
}

/** The mayor's term in real time, from its election's end, while it lasts. */
function termOf(mayor: MayorView | undefined, time: number) {
  // A copy the API cached before `term` existed has none until it refreshes
  if (mayor?.term === undefined) return;
  const start = skyblockTime({ year: mayor.term, month: 2, day: 27 });
  const end = start + YEAR_DAYS * DAY;
  return end > time ? { start, end } : undefined;
}

/**
 * Every event's run that hasn't ended at `time` and starts within a year, the ones on now first, then by start; `mayor`
 * is the one in office.
 */
export function nextEvents(time: number, mayor?: MayorView): EventTime[] {
  const now = (time - EPOCH) / DAY;
  // A perk brings its events only while its term lasts
  const perks =
    mayor && termOf(mayor, time) ?
      [...mayor.mayor.perks, ...(mayor.minister ? [mayor.minister.perk] : [])].map(({ name }) => name) :
      [];
  // With Finnegan's Grand Feast perk in office, the Harvest Feast runs his whole term (the wiki's Harvest Feast page,
  // unverified)
  const grandFeast = perks.includes("Grand Feast");
  const cycles: (Cycle & { key: SkyBlockEvent })[] = [
    ...EVENTS.map(({ key, month, day, days }) =>
      key === "harvestFeast" && grandFeast ? { key, ...TERM } : { key, every: YEAR_DAYS, at: [dayOfYear(month, day)], days }
    ),
    ...CYCLES,
    ...perks.flatMap((perk) => (Object.hasOwn(PERK_EVENTS, perk) ? [PERK_EVENTS[perk as keyof typeof PERK_EVENTS]] : [])),
  ];

  return cycles
    .map(({ key, every, at, days }) => {
      const start = Math.min(...at.map((offset) => offset + every * (Math.floor((now - offset - days) / every) + 1)));
      return { key, start: EPOCH + start * DAY, end: EPOCH + (start + days) * DAY };
    })
    .filter(({ start }) => start < time + YEAR_DAYS * DAY)
    .toSorted((a, b) => a.start - b.start);
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
    const [first] = nextEvents(zoo);
    expect(first).toEqual({ key: "travelingZoo", start: skyblockTime({ year: 10, month: 3, day: 1 }), end: skyblockTime({ year: 10, month: 3, day: 4 }) });
    expect(nextEvents(zoo).find(({ key }) => key === "newYear")?.start).toBe(skyblockTime({ year: 10, month: 11, day: 29 }));
    expect(nextEvents(zoo).find(({ key }) => key === "electionOver")?.start).toBe(skyblockTime({ year: 11, month: 2, day: 27 }));
  });

  test("nextEvents runs the Harvest Feast through the whole term under Grand Feast, and not past it", () => {
    const finnegan = { mayor: { name: "Finnegan", perks: [{ name: "Grand Feast", description: "" }] }, term: 9 };
    const feast = (time: number) => nextEvents(time, finnegan).find(({ key }) => key === "harvestFeast");
    expect(feast(skyblockTime({ year: 10, month: 0, day: 5 }))).toEqual({ key: "harvestFeast", start: skyblockTime({ year: 9, month: 2, day: 27 }), end: skyblockTime({ year: 10, month: 2, day: 27 }) });
    expect(feast(skyblockTime({ year: 10, month: 3, day: 1 }))?.start).toBe(skyblockTime({ year: 10, month: 6, day: 1 }));
  });

  const startOf = (key: SkyBlockEvent, time: number, mayor?: MayorView) => nextEvents(time, mayor).find((event) => event.key === key)?.start;

  test("nextEvents repeats the other cycles and lists a 12-year event only within a year of it", () => {
    const spring8 = skyblockTime({ year: 10, month: 0, day: 8 });

    expect(startOf("darkAuction", spring8)).toBe(skyblockTime({ year: 10, month: 0, day: 10 }));
    expect(startOf("cult", spring8)).toBe(skyblockTime({ year: 10, month: 0, day: 14 }));
    const marina = { mayor: { name: "Marina", perks: [{ name: "Fishing Festival", description: "" }] }, term: 9 };
    expect(startOf("fishingFestival", spring8, marina)).toBe(skyblockTime({ year: 10, month: 1, day: 1 }));
    expect(startOf("yearOfTheSeal", skyblockTime({ year: 401, month: 1, day: 1 }))).toBe(skyblockTime({ year: 402, month: 0, day: 1 }));
    expect(startOf("yearOfTheSeal", skyblockTime({ year: 400, month: 11, day: 31 }))).toBeUndefined();
  });
}
