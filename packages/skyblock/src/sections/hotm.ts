/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { HOTM_LAYOUT, LEVELING } from "#data";
import { type HotmSection, POWDERS, type TreeLayout, type TreeNode } from "#types";
import { add } from "@statsify/math";
import { getLevel } from "#leveling";
import type { RawMember } from "#raw";

/** A tree's perks at their menu spots, levelled from the member's nodes. */
export const treeNodes = (layout: TreeLayout, nodes: Record<string, number | boolean>): TreeNode[] =>
  Object.entries(layout).map(([id, { name, x, y, maxLevel }]) => {
    const level = Number(nodes[id] ?? 0);
    return { id, name, level, maxLevel, x, y, enabled: level > 0 && nodes[`toggle_${id}`] !== false };
  });

// Tokens of the Mountain per HOTM tier, and the total Core of the Mountain gives by its level (1 at level 1, 5 and 7,
// 2 at 10). The API only stores the spent ones.
const TIER_TOKENS = [1, 2, 2, 2, 2, 2, 3, 2, 2, 2];
const CORE_TOKENS = [0, 1, 1, 1, 1, 2, 2, 3, 3, 3, 5];

// A Crystal Nucleus run places each of these once. leveling.completions.NUCLEUS_RUNS stops counting at 50.
const NUCLEUS_CRYSTALS = ["amber", "amethyst", "jade", "sapphire", "topaz"] as const;

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
  // The old mining_core tree names it special_0
  const coreLevel = Number(nodes.core_of_the_mountain ?? nodes.special_0 ?? 0);
  const loadouts = Object.keys(tree?.tokens_spent ?? {}).filter((key) => /^mountain(_\d+)?$/.test(key)).length;
  const crystals = Object.entries(core.crystals ?? {});
  const glacite = member.glacite_player_data;

  return {
    level,
    coreLevel,
    loadout: { selected: slot, total: Math.max(slot, loadouts) },
    tokens: {
      spent: tree?.tokens_spent?.[`mountain${suffix}`] ?? core.tokens_spent ?? 0,
      total: add(CORE_TOKENS[coreLevel], ...TIER_TOKENS.slice(0, level.level)),
    },
    ability: tree?.selected_ability?.[`mining${suffix}`] ?? core.selected_pickaxe_ability,
    // powder_<type> is all the powder earned, which each loadout spends from. Core of the Mountain's cost is kept apart in
    // powder_spent_non_refundable_*, since a reset never refunds it, but older saves paid one without that key; there
    // what's left isn't known unless the Core was never levelled.
    powder: Object.fromEntries(
      POWDERS.map((type) => {
        const nonRefundable = core[`powder_spent_non_refundable_${type}${suffix}`];
        const total = core[`powder_${type}`] ?? 0;
        const spent = add(core[`powder_spent_${type}${suffix}`] ?? 0, nonRefundable ?? 0);
        return [type, { total, spent, available: nonRefundable !== undefined || coreLevel === 0 ? total - spent : undefined }];
      })
    ) as HotmSection["powder"],
    nodes: treeNodes(HOTM_LAYOUT, nodes),
    crystals: {
      found: add(...crystals.map(([, crystal]) => crystal.total_found ?? 0)),
      placed: add(...crystals.map(([, crystal]) => crystal.total_placed ?? 0)),
      gems: crystals
        .filter(([, crystal]) => (crystal.total_found ?? 0) > 0)
        .map(([key, crystal]) => ({ gem: key.replace(/_crystal$/, ""), found: crystal.total_found!, placed: crystal.total_placed }))
        .toSorted((a, b) => b.found - a.found),
    },
    nucleusRuns: Math.min(...NUCLEUS_CRYSTALS.map((gem) => core.crystals?.[`${gem}_crystal`]?.total_placed ?? 0)),
    kingQuests: core.biomes?.goblin?.king_quests_completed ?? 0,
    glacite: {
      corpses: add(...Object.values(glacite?.corpses_looted ?? {})),
      corpsesByType: Object.entries(glacite?.corpses_looted ?? {})
        .map(([type, count]) => ({ type, count }))
        .toSorted((a, b) => b.count - a.count),
      fossils: glacite?.fossils_donated?.length ?? 0,
      // Claw, Clubbed, Footprint, Helix, Spine, Tusk, Ugly and Webbed (the wiki's Fossils page, an owner exception,
      // unverified)
      maxFossils: 8,
      fossilDust: glacite?.fossil_dust ?? 0,
      mineshafts: glacite?.mineshafts_entered ?? 0,
    },
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
      mining_core: {
        powder_mithril: 200_000,
        powder_spent_mithril: 1,
        powder_spent_mithril_2: 2,
        powder_spent_non_refundable_mithril_2: 150_000,
        powder_gemstone: 900,
        crystals: { jade_crystal: { total_found: 3, total_placed: 2 }, ruby_crystal: { total_found: 5 }, opal_crystal: {} },
      },
    });

    expect(hotm.level).toMatchObject({ level: 10, xp: 2_000_000, xpForNext: undefined });
    expect(hotm.loadout).toEqual({ selected: 2, total: 2 });
    expect(hotm.tokens).toEqual({ spent: 25, total: 25 });
    expect(hotm.ability).toBe("sheer_force");
    expect(hotm.powder.mithril).toEqual({ total: 200_000, spent: 150_002, available: 49_998 });
    expect(hotm.powder.gemstone).toEqual({ total: 900, spent: 0, available: undefined });
    expect(hotm.nodes.find(({ id }) => id === "mining_fortune")).toMatchObject({ level: 3, enabled: false });
    expect(hotm.nodes.find(({ id }) => id === "mining_speed")).toMatchObject({ level: 0, enabled: false });
    expect(hotm.crystals).toEqual({
      found: 8,
      placed: 2,
      gems: [
        { gem: "ruby", found: 5, placed: undefined },
        { gem: "jade", found: 3, placed: 2 },
      ],
    });

    // Tier 6 gives two tokens, and Core of the Mountain's first level one
    const hotm5 = getHotm({ skill_tree: { experience: { mining: 110_000 }, nodes: { mining: { core_of_the_mountain: 1 } } } });

    expect(hotm5.tokens.total).toBe(10);
    expect(getHotm({ skill_tree: { experience: { mining: 230_000 } } }).tokens.total).toBe(11); // HOTM 6
    expect(getHotm({ skill_tree: { experience: { mining: 400_000 } } }).tokens.total).toBe(14); // HOTM 7
  });
}
