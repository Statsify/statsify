/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type ItemsResource, JACOB_BRACKETS, type JacobBracket, type JacobContest, type JacobSection } from "#types";
import { prettify } from "@statsify/util";
import { resourceTexture } from "#textures";
import { skyblockTime } from "../calendar.js";
import type { RawContest, RawMember } from "#raw";

// A member can have thousands of contests, so the history keeps the latest
const HISTORY = 100;

const isBracket = (medal?: string): medal is JacobBracket => JACOB_BRACKETS.includes(medal as JacobBracket);

/** "<year>:<month>_<day>:<crop>", the year counting from 0 and the month from 1 (the latest saves are today's date). */
function toContest(key: string, { collected, claimed_position, claimed_participants, claimed_medal }: RawContest): JacobContest {
  const [year, date, ...crop] = key.split(":");
  const [month, day] = date.split("_").map(Number);
  return {
    at: skyblockTime({ year: Number(year) + 1, month: month - 1, day }),
    crop: crop.join(":"),
    collected,
    place: claimed_position === undefined ? undefined : claimed_position + 1,
    participants: claimed_participants,
    medal: isBracket(claimed_medal) ? claimed_medal : undefined,
  };
}

/** null before the member's first contest. The crops are the ones with a bracket or a personal best. */
export function getJacob(member: RawMember, items?: ItemsResource): JacobSection | null {
  const jacob = member.jacobs_contest;
  const brackets = jacob?.unique_brackets ?? {};
  const bests = jacob?.personal_bests ?? {};
  const crops = new Set([...Object.values(brackets).flat(), ...Object.keys(bests)]);
  const contests = Object.keys(jacob?.contests ?? {}).length;

  // Hypixel sends an empty record before the member's first contest
  if (!jacob || (contests === 0 && crops.size === 0)) return null;

  const history = Object.entries(jacob.contests ?? {}).map(([key, contest]) => toContest(key, contest));
  const medalsEarned = Object.fromEntries(JACOB_BRACKETS.map((bracket) => [bracket, 0])) as JacobSection["medalsEarned"];
  for (const { medal } of history) if (medal) medalsEarned[medal]++;
  const gold = JACOB_BRACKETS.indexOf("gold");

  const cropViews = [...crops]
    .map((id) => {
      const item = items?.items[id];
      return {
        id,
        name: item?.name ?? prettify(id),
        texture: item && resourceTexture(item),
        bracket: JACOB_BRACKETS.findLast((bracket) => brackets[bracket]?.includes(id)),
        personalBest: bests[id],
      };
    })
    .toSorted((a, b) => a.name.localeCompare(b.name));

  return {
    medals: { bronze: jacob.medals_inv?.bronze ?? 0, silver: jacob.medals_inv?.silver ?? 0, gold: jacob.medals_inv?.gold ?? 0 },
    medalsEarned,
    contests,
    uniqueGolds: cropViews.filter(({ bracket }) => bracket && JACOB_BRACKETS.indexOf(bracket) >= gold).length,
    crops: cropViews,
    perks: {
      doubleDrops: jacob.perks?.double_drops ?? 0,
      // 4 a tier (the wiki's Anita page)
      farmingFortune: 4 * (jacob.perks?.double_drops ?? 0),
      farmingLevelCap: jacob.perks?.farming_level_cap ?? 0,
    },
    history: history.toSorted((a, b) => b.at - a.at).slice(0, HISTORY),
  };
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest;

  test("getJacob takes each crop's best bracket", () => {
    const jacob = getJacob({
      jacobs_contest: { unique_brackets: { bronze: ["WHEAT", "INK_SACK:3"], gold: ["WHEAT"], diamond: ["WHEAT"] } },
    });

    expect(jacob?.crops).toMatchObject([
      { id: "INK_SACK:3", bracket: "bronze" },
      { id: "WHEAT", bracket: "diamond" },
    ]);
    expect(jacob?.uniqueGolds).toBe(1);
  });

  test("toContest dates a contest from its key and places it from 1", () => {
    expect(toContest("524:8_16:CARROT_ITEM", { collected: 5, claimed_position: 0, claimed_participants: 9, claimed_medal: "gold" })).toEqual({
      at: skyblockTime({ year: 525, month: 7, day: 16 }),
      crop: "CARROT_ITEM",
      collected: 5,
      place: 1,
      participants: 9,
      medal: "gold",
    });
    expect(toContest("0:1_1:WHEAT", { collected: 1 })).toMatchObject({ at: skyblockTime({ year: 1, month: 0, day: 1 }), place: undefined });
  });
}
