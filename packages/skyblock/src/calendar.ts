/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { MayorView } from "./election.js";

// Early Spring 1 of year 1 began on 2019-06-11 at 17:55 UTC.
const EPOCH_MS = 1_560_275_700_000;
const DAY_MS = 20 * 60_000;
const MONTH_DAYS = 31;

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

const YEAR_DAYS = SKYBLOCK_MONTHS.length * MONTH_DAYS;

export interface SkyBlockDate {
  year: number;
  // Months count from 0, Early Spring, and days from 1.
  month: number;
  day: number;
}

export const toSkyBlockDate = (time: number): SkyBlockDate => {
  const days = Math.floor((time - EPOCH_MS) / DAY_MS);
  return {
    year: Math.floor(days / YEAR_DAYS) + 1,
    month: Math.floor((days % YEAR_DAYS) / MONTH_DAYS),
    day: (days % MONTH_DAYS) + 1,
  };
};

export const getDayStart = ({ year, month, day }: SkyBlockDate) =>
  EPOCH_MS + ((year - 1) * YEAR_DAYS + month * MONTH_DAYS + day - 1) * DAY_MS;

const ELECTION_END = { month: 2, day: 27 } as const;

const EVENTS = [
  { key: "hoppitysHunt", month: 0, day: 1, days: 93 },
  { key: "electionOver", ...ELECTION_END, days: 1 },
  { key: "travelingZoo", month: 3, day: 1, days: 3 },
  { key: "electionOpens", month: 5, day: 27, days: 1 },
  { key: "harvestFeast", month: 6, day: 1, days: 93 },
  { key: "spookyFestival", month: 7, day: 29, days: 3 },
  { key: "travelingZoo", month: 9, day: 1, days: 3 },
  { key: "seasonOfJerry", month: 11, day: 24, days: 3 },
  { key: "newYear", month: 11, day: 29, days: 3 },
] as const;

export type SkyBlockEvent = (typeof EVENTS)[number]["key"];

export interface EventTime {
  key: SkyBlockEvent;
  start: number;
  end: number;
}

// A term runs from its election's end, and undefined means it's over.
export function getTerm(mayor: MayorView | undefined, time: number) {
  if (!mayor) return;

  const start = getDayStart({ year: mayor.term, ...ELECTION_END });
  const end = start + YEAR_DAYS * DAY_MS;
  return end > time ? { start, end } : undefined;
}

export function getNextEvents(time: number, mayor?: MayorView): EventTime[] {
  const { year } = toSkyBlockDate(time);
  const term = getTerm(mayor, time);

  const perks = mayor ? [...mayor.mayor.perks] : [];
  if (mayor?.minister) perks.push(mayor.minister.perk);

  // Finnegan's Grand Feast perk runs the Harvest Feast for his whole term.
  const grandFeast = perks.some(({ name }) => name === "Grand Feast")
    ? term
    : undefined;

  return EVENTS.map(({ key, month, day, days }) => {
    if (key === "harvestFeast" && grandFeast) return { key, ...grandFeast };
    const start = [year, year + 1]
      .map((at) => getDayStart({ year: at, month, day }))
      .find((start) => start + days * DAY_MS > time)!;
    return { key, start, end: start + days * DAY_MS };
  }).toSorted((a, b) => a.start - b.start);
}

if (import.meta.vitest) {
  const { suite, it, expect } = import.meta.vitest;

  suite("toSkyBlockDate", () => {
    it("should count 20-minute days, 31-day months and 12-month years", () => {
      expect(toSkyBlockDate(EPOCH_MS)).toEqual({ year: 1, month: 0, day: 1 });
      expect(toSkyBlockDate(EPOCH_MS + 31 * DAY_MS - 1)).toEqual({
        year: 1,
        month: 0,
        day: 31,
      });
      expect(toSkyBlockDate(EPOCH_MS + YEAR_DAYS * DAY_MS)).toEqual({
        year: 2,
        month: 0,
        day: 1,
      });
      expect(toSkyBlockDate(1_794_105_965_338)).toEqual({
        year: 524,
        month: 9,
        day: 24,
      });
    });
  });

  suite("getNextEvents", () => {
    const zoo = getDayStart({ year: 10, month: 3, day: 2 });
    const findStart = (key: SkyBlockEvent) =>
      getNextEvents(zoo).find((event) => event.key === key)?.start;

    it("should put an event on now first", () => {
      const [first, second] = getNextEvents(zoo);
      expect(first).toEqual({
        key: "travelingZoo",
        start: getDayStart({ year: 10, month: 3, day: 1 }),
        end: getDayStart({ year: 10, month: 3, day: 4 }),
      });
      expect(second.key).toBe("electionOpens");
    });

    it("should move a past event to next year", () => {
      expect(findStart("newYear")).toBe(
        getDayStart({ year: 10, month: 11, day: 29 }),
      );
      expect(findStart("electionOver")).toBe(
        getDayStart({ year: 11, month: 2, day: 27 }),
      );
    });

    it("should run the Harvest Feast through a Grand Feast term only", () => {
      const finnegan = {
        mayor: {
          name: "Finnegan",
          perks: [{ name: "Grand Feast", description: "" }],
        },
        term: 9,
      };
      const getFeast = (time: number) =>
        getNextEvents(time, finnegan).find(({ key }) => key === "harvestFeast");

      expect(getFeast(getDayStart({ year: 10, month: 0, day: 5 }))).toEqual({
        key: "harvestFeast",
        start: getDayStart({ year: 9, month: 2, day: 27 }),
        end: getDayStart({ year: 10, month: 2, day: 27 }),
      });
      expect(getFeast(getDayStart({ year: 10, month: 3, day: 1 }))?.start).toBe(
        getDayStart({ year: 10, month: 6, day: 1 }),
      );
    });
  });
}
