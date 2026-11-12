/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type ItemsResource, JACOB_BRACKETS, type JacobSection } from "#types";
import { prettify } from "@statsify/util";
import { resourceTexture } from "#textures";
import type { RawMember } from "#raw";

/** null before the member's first contest. The crops are the ones with a bracket or a personal best. */
export function getJacob(member: RawMember, items?: ItemsResource): JacobSection | null {
  const jacob = member.jacobs_contest;
  const brackets = jacob?.unique_brackets ?? {};
  const bests = jacob?.personal_bests ?? {};
  const crops = new Set([...Object.values(brackets).flat(), ...Object.keys(bests)]);
  const contests = Object.keys(jacob?.contests ?? {}).length;

  // Hypixel sends an empty record before the member's first contest
  if (!jacob || (contests === 0 && crops.size === 0)) return null;

  return {
    medals: { bronze: jacob.medals_inv?.bronze ?? 0, silver: jacob.medals_inv?.silver ?? 0, gold: jacob.medals_inv?.gold ?? 0 },
    contests,
    crops: [...crops]
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
      .toSorted((a, b) => a.name.localeCompare(b.name)),
    perks: {
      doubleDrops: jacob.perks?.double_drops ?? 0,
      // 4 a tier (the wiki's Anita page)
      farmingFortune: 4 * (jacob.perks?.double_drops ?? 0),
      farmingLevelCap: jacob.perks?.farming_level_cap ?? 0,
    },
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
  });
}
