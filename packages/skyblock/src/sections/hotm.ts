/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { HOTM_LAYOUT, LEVELING } from "#data";
import { add } from "@statsify/math";
import { getLevel } from "#leveling";
import type { HotmSection } from "#types";
import type { RawMember } from "#raw";

export const POWDERS = ["mithril", "gemstone", "glacite"] as const;

export type Powder = (typeof POWDERS)[number];

// The API stores only the tokens spent, so the total comes from these.
const TIER_TOKENS = [1, 2, 2, 2, 2, 2, 3, 2, 2, 2];
const CORE_TOKENS = [0, 1, 1, 1, 1, 2, 2, 3, 3, 3, 5];

export function getHotm(member: RawMember): HotmSection {
  const tree = member.skill_tree;
  // Members from before loadouts keep their tree in mining_core.
  const core = member.mining_core ?? {};
  const slot = tree?.selected_skill_tree_slot?.mining ?? 1;
  const suffix = slot === 1 ? "" : `_${slot}`;
  const nodes = tree?.nodes?.[`mining${suffix}`] ?? core.nodes ?? {};

  const level = getLevel(
    tree?.experience?.mining ?? core.experience ?? 0,
    LEVELING.HOTM,
    LEVELING.leveling_caps.HOTM,
  );
  // The old mining_core tree calls it special_0.
  const coreLevel = Number(nodes.core_of_the_mountain ?? nodes.special_0 ?? 0);
  const loadouts = Object.keys(tree?.tokens_spent ?? {}).filter((key) =>
    /^mountain(_\d+)?$/.test(key),
  ).length;

  return {
    level,
    loadout: { selected: slot, total: Math.max(slot, loadouts) },
    tokens: {
      spent:
        tree?.tokens_spent?.[`mountain${suffix}`] ?? core.tokens_spent ?? 0,
      total: add(CORE_TOKENS[coreLevel], ...TIER_TOKENS.slice(0, level.level)),
    },
    ability:
      tree?.selected_ability?.[`mining${suffix}`] ??
      core.selected_pickaxe_ability,
    // Hypixel keeps Core of the Mountain's powder apart, since resets keep it.
    powder: Object.fromEntries(
      POWDERS.map((type) => [
        type,
        {
          total: core[`powder_${type}`] ?? 0,
          spent: add(
            core[`powder_spent_${type}${suffix}`] ?? 0,
            core[`powder_spent_non_refundable_${type}${suffix}`] ?? 0,
          ),
        },
      ]),
    ) as HotmSection["powder"],
    nodes: Object.entries(HOTM_LAYOUT).map(([id, { name, x, y, maxLevel }]) => {
      const nodeLevel = Number(nodes[id] ?? 0);
      return {
        id,
        name,
        level: nodeLevel,
        maxLevel,
        x,
        y,
        enabled: nodeLevel > 0 && nodes[`toggle_${id}`] !== false,
      };
    }),
  };
}
