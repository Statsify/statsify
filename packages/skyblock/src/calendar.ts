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
  { key: "spookyFishing", month: 7, day: 26, days: 9 },
  { key: "spookyFestival", month: 7, day: 29, days: 3 },
  { key: "travelingZoo", month: 9, day: 1, days: 3 },
  { key: "jerrysWorkshop", month: 11, day: 1, days: 31 },
  { key: "seasonOfJerry", month: 11, day: 24, days: 3 },
  { key: "newYear", month: 11, day: 29, days: 3 },
] as const;

// A cycle starts `at` days into each `every` days, counted from the epoch.
interface Cycle {
  every: number;
  at: number[];
  days: number;
}

const getYearCycle = (year: number, every: number): Cycle => ({
  every: every * YEAR_DAYS,
  at: [((year - 1) % every) * YEAR_DAYS],
  days: YEAR_DAYS,
});

const CYCLES = {
  darkAuction: { every: 3, at: [0], days: 0 },
  jacobsContest: { every: 3, at: [1], days: 1 },
  cult: { every: MONTH_DAYS, at: [6, 13, 20, 27], days: 0.25 },
  bankInterest: { every: 3 * MONTH_DAYS, at: [0], days: 0 },
  yearOfTheSeal: getYearCycle(402, 12),
  yearOfThePig: getYearCycle(407, 12),
  yearOfTheWitch: getYearCycle(476, 12),
  century: getYearCycle(100, 100),
} satisfies Record<string, Cycle>;

const getDayOfYear = (month: number, day: number) =>
  month * MONTH_DAYS + day - 1;

const TERM: Cycle = {
  every: YEAR_DAYS,
  at: [getDayOfYear(ELECTION_END.month, ELECTION_END.day)],
  days: YEAR_DAYS,
};

// Foxy's Extra Event and Diaz's Stock Exchange have no set time.
const PERK_EVENTS = {
  fishingFestival: {
    perk: "Fishing Festival",
    every: MONTH_DAYS,
    at: [0],
    days: 3,
  },
  miningFiesta: { perk: "Mining Fiesta", ...TERM },
  mythologicalRitual: { perk: "Mythological Ritual", ...TERM },
  carnival: { perk: "Chivalrous Carnival", ...TERM },
} satisfies Record<string, Cycle & { perk: string }>;

type PerkEvent = keyof typeof PERK_EVENTS;

export type SkyBlockEvent =
  | (typeof EVENTS)[number]["key"]
  | keyof typeof CYCLES
  | PerkEvent;

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

// The events that start within a year, with a term's perk events to its end.
export function getNextEvents(time: number, mayor?: MayorView): EventTime[] {
  const now = (time - EPOCH_MS) / DAY_MS;
  const term = getTerm(mayor, time);

  const perks = mayor && term ? [...mayor.mayor.perks] : [];
  if (mayor?.minister && term) perks.push(mayor.minister.perk);

  const perkEvents: PerkEvent[] = [];
  for (const { name } of perks) {
    const entry = Object.entries(PERK_EVENTS).find(
      ([, event]) => event.perk === name,
    );
    if (entry) perkEvents.push(entry[0] as PerkEvent);
  }

  // Finnegan's Grand Feast perk runs the Harvest Feast for his whole term.
  const grandFeast = perks.some(({ name }) => name === "Grand Feast");

  const cycles: (Cycle & { key: SkyBlockEvent })[] = [
    ...EVENTS.map(({ key, month, day, days }) =>
      key === "harvestFeast" && grandFeast
        ? { key, ...TERM }
        : { key, every: YEAR_DAYS, at: [getDayOfYear(month, day)], days },
    ),
    ...Object.entries(CYCLES).map(([key, cycle]) => ({
      key: key as keyof typeof CYCLES,
      ...cycle,
    })),
    ...perkEvents.map((key) => ({ key, ...PERK_EVENTS[key] })),
  ];

  const yearEnd = time + YEAR_DAYS * DAY_MS;
  return cycles
    .map(({ key, every, at, days }) => {
      const starts = at.map(
        (offset) =>
          offset + every * (Math.floor((now - offset - days) / every) + 1),
      );
      const start = Math.min(...starts);
      return {
        key,
        start: EPOCH_MS + start * DAY_MS,
        end: EPOCH_MS + (start + days) * DAY_MS,
      };
    })
    .filter(({ key, start }) => {
      const isPerkEvent = perkEvents.includes(key as PerkEvent);
      return start < (term && isPerkEvent ? term.end : yearEnd);
    })
    .toSorted((a, b) => a.start - b.start);
}

if (import.meta.vitest) {
  const { suite, it, expect } = import.meta.vitest;

  const findAt = (key: SkyBlockEvent, time: number, mayor?: MayorView) =>
    getNextEvents(time, mayor).find((event) => event.key === key)?.start;

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
      const [first] = getNextEvents(zoo);
      expect(first).toEqual({
        key: "travelingZoo",
        start: getDayStart({ year: 10, month: 3, day: 1 }),
        end: getDayStart({ year: 10, month: 3, day: 4 }),
      });
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

    it("should repeat the other cycles and list a 12-year event within a year of it", () => {
      const spring8 = getDayStart({ year: 10, month: 0, day: 8 });
      const marina = {
        mayor: {
          name: "Marina",
          perks: [{ name: "Fishing Festival", description: "" }],
        },
        term: 9,
      };
      expect(findAt("darkAuction", spring8)).toBe(
        getDayStart({ year: 10, month: 0, day: 10 }),
      );
      expect(findAt("cult", spring8)).toBe(
        getDayStart({ year: 10, month: 0, day: 14 }),
      );
      expect(findAt("fishingFestival", spring8, marina)).toBe(
        getDayStart({ year: 10, month: 1, day: 1 }),
      );
      expect(
        findAt(
          "fishingFestival",
          getDayStart({ year: 10, month: 2, day: 5 }),
          marina,
        ),
      ).toBeUndefined();
      expect(
        findAt("yearOfTheSeal", getDayStart({ year: 401, month: 1, day: 1 })),
      ).toBe(getDayStart({ year: 402, month: 0, day: 1 }));
      expect(
        findAt("yearOfTheSeal", getDayStart({ year: 400, month: 11, day: 31 })),
      ).toBeUndefined();
    });
  });
}
