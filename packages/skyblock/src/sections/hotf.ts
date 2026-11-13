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
import { treeNodes } from "./hotm.js";
import type { HotfSection, Whisper } from "#types";
import type { RawMember } from "#raw";

/**
 * null before the member's first Heart of the Forest XP. Hypixel creates all five loadouts at once, so one counts
 * once it has tokens spent.
 */
export function getHotf(member: RawMember): HotfSection | null {
  const tree = member.skill_tree;
  const xp = tree?.experience?.foraging;
  if (xp === undefined) return null;

  const slot = tree?.selected_skill_tree_slot?.foraging ?? 1;
  const suffix = slot === 1 ? "" : `_${slot}`;
  const nodes = tree?.nodes?.[`foraging${suffix}`] ?? {};
  const used = Object.entries(tree?.tokens_spent ?? {}).filter(
    ([key, spent]) => /^forest(_\d+)?$/.test(key) && spent > 0
  );
  const loadouts = new Set([...used.map(([key]) => key), `forest${suffix}`]).size;

  const whispers = (type: Whisper) => {
    const pool = member.foraging_core?.whispers?.[type];
    const spending = pool?.[slot];
    return { total: pool?.total ?? 0, spent: add(spending?.spent ?? 0, spending?.spent_non_refundable ?? 0) };
  };

  return {
    level: getLevel(xp, LEVELING.HOTF, LEVELING.leveling_caps.HOTF),
    centerLevel: Number(nodes.center_of_the_forest ?? 0),
    loadout: { selected: slot, total: Math.max(slot, loadouts) },
    tokensSpent: tree?.tokens_spent?.[`forest${suffix}`] ?? 0,
    ability: tree?.selected_ability?.[`foraging${suffix}`],
    whispers: { forest: whispers("forest"), desert: whispers("desert") },
    nodes: treeNodes(HOTF_LAYOUT, nodes),
  };
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest;

  test("getHotf counts the selected loadout's whispers spent, refundable or not", () => {
    const hotf = getHotf({
      skill_tree: { experience: { foraging: 0 }, selected_skill_tree_slot: { foraging: 2 } },
      foraging_core: { whispers: { forest: { total: 900, 1: { spent: 100 }, 2: { spent: 300, spent_non_refundable: 50 } } } },
    });

    expect(hotf?.whispers.forest).toEqual({ total: 900, spent: 350 });
  });
}
