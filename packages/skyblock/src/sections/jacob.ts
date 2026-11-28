/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  type ItemsResource,
  JACOB_BRACKETS,
  JACOB_MEDALS,
  type JacobSection,
} from "#types";
import { resourceItem } from "#textures";
import type { RawMember } from "#raw";

/** null before the member's first contest. The crops are the ones with a bracket or a personal best. */
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

  // Hypixel sends an empty record before the member's first contest
  if (!jacob || (contests === 0 && crops.size === 0)) return null;

  return {
    medals: Object.fromEntries(
      JACOB_MEDALS.map((medal) => [medal, jacob.medals_inv?.[medal] ?? 0]),
    ) as JacobSection["medals"],
    contests,
    crops: [...crops]
      .map((id) => ({
        id,
        ...resourceItem(items, id),
        bracket: JACOB_BRACKETS.findLast((bracket) =>
          brackets[bracket]?.includes(id),
        ),
        personalBest: bests[id],
      }))
      .toSorted((a, b) => a.name.localeCompare(b.name)),
    perks: {
      // double_drops counts Anita's Extra Farming Fortune tiers, 4 each (the wiki's Anita page)
      farmingFortune: 4 * (jacob.perks?.double_drops ?? 0),
      farmingLevelCap: jacob.perks?.farming_level_cap ?? 0,
    },
  };
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest;

  test("getJacob takes each crop's best bracket", () => {
    const jacob = getJacob({
      jacobs_contest: {
        unique_brackets: {
          bronze: ["WHEAT", "INK_SACK:3"],
          gold: ["WHEAT"],
          diamond: ["WHEAT"],
        },
      },
    });

    expect(jacob?.crops).toMatchObject([
      { id: "INK_SACK:3", bracket: "bronze" },
      { id: "WHEAT", bracket: "diamond" },
    ]);
  });
}
