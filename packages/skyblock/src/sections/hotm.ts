/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { HOTM_LAYOUT, LEVELING } from "#data";
import { type HotmSection, POWDERS } from "#types";
import { add } from "@statsify/math";
import { getLevel } from "#leveling";
import type { RawMember } from "#raw";

// Tokens of the Mountain per HOTM tier, and the total Core of the Mountain gives by its level (1 at level 1, 5 and 7,
// 2 at 10). The API only stores the spent ones.
const TIER_TOKENS = [1, 2, 2, 2, 2, 2, 3, 2, 2, 2];
const CORE_TOKENS = [0, 1, 1, 1, 1, 2, 2, 3, 3, 3, 5];

/**
 * The selected loadout of the Heart of the Mountain: slot 1's keys have no suffix and slot n's end in _n. A loadout
 * counts once it has a tokens_spent entry. Members from before loadouts keep their tree in mining_core.
 */
export function getHotm(member: RawMember): HotmSection {
  const tree = member.skill_tree;
  const core = member.mining_core ?? {};
  const slot = tree?.selected_skill_tree_slot?.mining ?? 1;
  const suffix = slot === 1 ? "" : `_${slot}`;
  const nodes = tree?.nodes?.[`mining${suffix}`] ?? core.nodes ?? {};

  const level = getLevel(tree?.experience?.mining ?? core.experience ?? 0, LEVELING.HOTM, LEVELING.leveling_caps.HOTM);
  const coreLevel = Number(nodes.core_of_the_mountain ?? 0);
  const loadouts = Object.keys(tree?.tokens_spent ?? {}).filter((key) => /^mountain(_\d+)?$/.test(key)).length;

  return {
    level,
    loadout: { selected: slot, total: Math.max(slot, loadouts) },
    tokens: {
      spent: tree?.tokens_spent?.[`mountain${suffix}`] ?? core.tokens_spent ?? 0,
      total: add(CORE_TOKENS[coreLevel], ...TIER_TOKENS.slice(0, level.level)),
    },
    ability: tree?.selected_ability?.[`mining${suffix}`] ?? core.selected_pickaxe_ability,
    powder: Object.fromEntries(
      POWDERS.map((type) => [
        type,
        { available: core[`powder_${type}`] ?? 0, spent: core[`powder_spent_${type}${suffix}`] ?? 0 },
      ])
    ) as HotmSection["powder"],
    nodes: Object.entries(HOTM_LAYOUT).map(([id, { name, x, y, maxLevel }]) => {
      const nodeLevel = Number(nodes[id] ?? 0);
      return { id, name, level: nodeLevel, maxLevel, x, y, enabled: nodeLevel > 0 && nodes[`toggle_${id}`] !== false };
    }),
  };
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest;

  test("getHotm reads the selected loadout", () => {
    const hotm = getHotm({
      skill_tree: {
        experience: { mining: 2_000_000 },
        selected_skill_tree_slot: { mining: 2 },
        nodes: { mining: { mining_speed: 50 }, mining_2: { core_of_the_mountain: 10, mining_fortune: 3, toggle_mining_fortune: false } },
        tokens_spent: { mountain: 1, mountain_2: 25 },
        selected_ability: { mining: "pickobulus", mining_2: "sheer_force" },
      },
      mining_core: { powder_mithril: 10, powder_spent_mithril: 1, powder_spent_mithril_2: 2 },
    });

    expect(hotm.level).toMatchObject({ level: 10, xp: 2_000_000, xpForNext: undefined });
    expect(hotm.loadout).toEqual({ selected: 2, total: 2 });
    expect(hotm.tokens).toEqual({ spent: 25, total: 25 });
    expect(hotm.ability).toBe("sheer_force");
    expect(hotm.powder.mithril).toEqual({ available: 10, spent: 2 });
    expect(hotm.nodes.find(({ id }) => id === "mining_fortune")).toMatchObject({ level: 3, enabled: false });
    expect(hotm.nodes.find(({ id }) => id === "mining_speed")).toMatchObject({ level: 0, enabled: false });

    // Tier 6 gives two tokens, and Core of the Mountain's first level one
    const hotm5 = getHotm({ skill_tree: { experience: { mining: 110_000 }, nodes: { mining: { core_of_the_mountain: 1 } } } });

    expect(hotm5.tokens.total).toBe(10);
    expect(getHotm({ skill_tree: { experience: { mining: 230_000 } } }).tokens.total).toBe(11); // HOTM 6
    expect(getHotm({ skill_tree: { experience: { mining: 400_000 } } }).tokens.total).toBe(14); // HOTM 7
  });
}
