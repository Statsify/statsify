/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { getDayStart } from "../calendar.js";
import { resourceItem } from "#textures";
import type { ItemsResource, JacobContest, JacobSection } from "#types";
import type { RawContest, RawMember } from "#raw";

export const JACOB_BRACKETS = [
  "bronze",
  "silver",
  "gold",
  "platinum",
  "diamond",
] as const;

export type JacobBracket = (typeof JACOB_BRACKETS)[number];

export const JACOB_MEDALS = ["gold", "silver", "bronze"] as const;

export type JacobMedal = (typeof JACOB_MEDALS)[number];

// A member can have thousands of contests, so the history keeps the latest.
const HISTORY_SIZE = 100;

const isBracket = (medal?: string): medal is JacobBracket =>
  JACOB_BRACKETS.includes(medal as JacobBracket);

// A key is "<year>:<month>_<day>:<crop>", the year from 0 and the month from 1.
function toContest(key: string, contest: RawContest): JacobContest {
  const [year, date, ...crop] = key.split(":");
  const [month, day] = date.split("_").map(Number);
  const position = contest.claimed_position;

  return {
    at: getDayStart({ year: Number(year) + 1, month: month - 1, day }),
    crop: crop.join(":"),
    collected: contest.collected,
    place: position === undefined ? undefined : position + 1,
    participants: contest.claimed_participants,
    medal: isBracket(contest.claimed_medal) ? contest.claimed_medal : undefined,
  };
}

export function getJacob(
  member: RawMember,
  items?: ItemsResource,
): JacobSection | null {
  const jacob = member.jacobs_contest;
  const brackets = jacob?.unique_brackets ?? {};
  const bests = jacob?.personal_bests ?? {};
  const crops = new Set([
    ...Object.values(brackets).flat(),
    ...Object.keys(bests),
  ]);
  const contests = Object.keys(jacob?.contests ?? {}).length;

  // Hypixel sends an empty record before the member's first contest.
  if (!jacob || (contests === 0 && crops.size === 0)) return null;

  const history = Object.entries(jacob.contests ?? {}).map(([key, contest]) =>
    toContest(key, contest),
  );
  const medalsEarned = Object.fromEntries(
    JACOB_BRACKETS.map((bracket) => [bracket, 0]),
  ) as JacobSection["medalsEarned"];
  for (const { medal } of history) {
    if (medal) medalsEarned[medal]++;
  }

  const cropViews = [...crops]
    .map((id) => ({
      id,
      ...resourceItem(items, id),
      bracket: JACOB_BRACKETS.findLast((bracket) =>
        brackets[bracket]?.includes(id),
      ),
      personalBest: bests[id],
    }))
    .toSorted((a, b) => a.name.localeCompare(b.name));
  const gold = JACOB_BRACKETS.indexOf("gold");

  return {
    medals: Object.fromEntries(
      JACOB_MEDALS.map((medal) => [medal, jacob.medals_inv?.[medal] ?? 0]),
    ) as JacobSection["medals"],
    medalsEarned,
    contests,
    uniqueGolds: cropViews.filter(
      ({ bracket }) => bracket && JACOB_BRACKETS.indexOf(bracket) >= gold,
    ).length,
    crops: cropViews,
    perks: {
      // The wiki's Anita page gives 4 Farming Fortune per double_drops tier.
      farmingFortune: 4 * (jacob.perks?.double_drops ?? 0),
      farmingLevelCap: jacob.perks?.farming_level_cap ?? 0,
    },
    history: history.toSorted((a, b) => b.at - a.at).slice(0, HISTORY_SIZE),
  };
}

if (import.meta.vitest) {
  const { suite, it, expect } = import.meta.vitest;

  suite("toContest", () => {
    it("should date a contest from its key and place it from 1", () => {
      const contest = {
        collected: 5,
        claimed_position: 0,
        claimed_participants: 9,
        claimed_medal: "gold",
      };
      expect(toContest("524:8_16:CARROT_ITEM", contest)).toEqual({
        at: getDayStart({ year: 525, month: 7, day: 16 }),
        crop: "CARROT_ITEM",
        collected: 5,
        place: 1,
        participants: 9,
        medal: "gold",
      });
    });

    it("should leave the place out before the rewards are claimed", () => {
      expect(toContest("0:1_1:WHEAT", { collected: 1 })).toMatchObject({
        at: getDayStart({ year: 1, month: 0, day: 1 }),
        place: undefined,
      });
    });
  });
}
