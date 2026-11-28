/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { HOTF_LAYOUT, LEVELING } from "#data";
import { add } from "@statsify/math";
import { getLevel } from "#leveling";
import { getTreeNodes } from "./hotm.js";
import type { HotfSection } from "#types";
import type { RawMember } from "#raw";

export const WHISPERS = ["forest", "desert"] as const;

export type Whisper = (typeof WHISPERS)[number];

// The API stores only the tokens spent, so the total comes from these.
const TIER_TOKENS = [1, 2, 2, 2, 2, 2, 2, 2];
const CENTER_TOKENS = [0, 1, 1, 1, 1, 2];

export function getHotf(member: RawMember): HotfSection | null {
  const tree = member.skill_tree;
  const xp = tree?.experience?.foraging;
  if (xp === undefined) return null;

  const slot = tree?.selected_skill_tree_slot?.foraging ?? 1;
  const suffix = slot === 1 ? "" : `_${slot}`;
  const nodes = tree?.nodes?.[`foraging${suffix}`] ?? {};
  // Hypixel creates all five loadouts at once, so one counts once it's used.
  const used = Object.entries(tree?.tokens_spent ?? {}).filter(
    ([key, spent]) => /^forest(_\d+)?$/.test(key) && spent > 0,
  );
  const loadouts = new Set([...used.map(([key]) => key), `forest${suffix}`])
    .size;

  const getWhispers = (type: Whisper) => {
    const pool = member.foraging_core?.whispers?.[type];
    const spending = pool?.[slot];
    return {
      total: pool?.total ?? 0,
      spent: add(spending?.spent ?? 0, spending?.spent_non_refundable ?? 0),
    };
  };

  const level = getLevel(xp, LEVELING.HOTF, LEVELING.leveling_caps.HOTF);
  const centerLevel = Number(nodes.center_of_the_forest ?? 0);

  return {
    level,
    centerLevel,
    loadout: { selected: slot, total: Math.max(slot, loadouts) },
    tokens: {
      spent: tree?.tokens_spent?.[`forest${suffix}`] ?? 0,
      total: add(
        CENTER_TOKENS[centerLevel],
        ...TIER_TOKENS.slice(0, level.level),
      ),
    },
    ability: tree?.selected_ability?.[`foraging${suffix}`],
    whispers: Object.fromEntries(
      WHISPERS.map((type) => [type, getWhispers(type)]),
    ) as HotfSection["whispers"],
    nodes: getTreeNodes(HOTF_LAYOUT, nodes),
  };
}
