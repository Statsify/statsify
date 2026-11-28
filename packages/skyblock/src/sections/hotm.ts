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
import type { HotmSection, TreeLayout, TreeNode } from "#types";
import type { RawMember } from "#raw";

export const POWDERS = ["mithril", "gemstone", "glacite"] as const;

export type Powder = (typeof POWDERS)[number];

export function getTreeNodes(
  layout: TreeLayout,
  nodes: Record<string, number | boolean>,
): TreeNode[] {
  return Object.entries(layout).map(([id, { name, x, y, maxLevel }]) => {
    const level = Number(nodes[id] ?? 0);
    return {
      id,
      name,
      level,
      maxLevel,
      x,
      y,
      enabled: level > 0 && nodes[`toggle_${id}`] !== false,
    };
  });
}

// The wiki's Fossils page lists eight fossils.
const FOSSILS = 8;

// The API stores only the tokens spent, so the total comes from these.
const TIER_TOKENS = [1, 2, 2, 2, 2, 2, 3, 2, 2, 2];
const CORE_TOKENS = [0, 1, 1, 1, 1, 2, 2, 3, 3, 3, 5];

// A Crystal Nucleus run places each of these once.
const NUCLEUS_CRYSTALS = [
  "amber",
  "amethyst",
  "jade",
  "sapphire",
  "topaz",
] as const;

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
  const crystals = Object.entries(core.crystals ?? {});
  const glacite = member.glacite_player_data;

  return {
    level,
    coreLevel,
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
    nodes: getTreeNodes(HOTM_LAYOUT, {
      ...nodes,
      core_of_the_mountain: coreLevel,
    }),
    crystals: {
      found: add(...crystals.map(([, crystal]) => crystal.total_found ?? 0)),
      placed: add(...crystals.map(([, crystal]) => crystal.total_placed ?? 0)),
      gems: crystals
        .filter(([, crystal]) => (crystal.total_found ?? 0) > 0)
        .map(([key, crystal]) => ({
          gem: key.replace(/_crystal$/, ""),
          found: crystal.total_found!,
          placed: crystal.total_placed,
        }))
        .toSorted((a, b) => b.found - a.found),
    },
    // The NUCLEUS_RUNS completion stops counting at 50.
    nucleusRuns: Math.min(
      ...NUCLEUS_CRYSTALS.map(
        (gem) => core.crystals?.[`${gem}_crystal`]?.total_placed ?? 0,
      ),
    ),
    kingQuests: core.biomes?.goblin?.king_quests_completed ?? 0,
    glacite: {
      corpses: add(...Object.values(glacite?.corpses_looted ?? {})),
      corpsesByType: Object.entries(glacite?.corpses_looted ?? {})
        .map(([type, count]) => ({ type, count }))
        .toSorted((a, b) => b.count - a.count),
      fossils: glacite?.fossils_donated?.length ?? 0,
      maxFossils: FOSSILS,
      fossilDust: Math.floor(glacite?.fossil_dust ?? 0),
      mineshafts: glacite?.mineshafts_entered ?? 0,
    },
  };
}
