/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { prettify } from "@statsify/util";
import { resourceTexture } from "#textures";
import type { ItemsResource, JacobSection } from "#types";
import type { RawMember } from "#raw";

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

  return {
    medals: Object.fromEntries(
      JACOB_MEDALS.map((medal) => [medal, jacob.medals_inv?.[medal] ?? 0]),
    ) as JacobSection["medals"],
    contests,
    crops: [...crops]
      .map((id) => {
        const item = items?.items[id];
        return {
          id,
          name: item?.name ?? prettify(id),
          texture: item && resourceTexture(item),
          bracket: JACOB_BRACKETS.findLast((bracket) =>
            brackets[bracket]?.includes(id),
          ),
          personalBest: bests[id],
        };
      })
      .toSorted((a, b) => a.name.localeCompare(b.name)),
    perks: {
      // The wiki's Anita page gives 4 Farming Fortune per double_drops tier.
      farmingFortune: 4 * (jacob.perks?.double_drops ?? 0),
      farmingLevelCap: jacob.perks?.farming_level_cap ?? 0,
    },
  };
}
