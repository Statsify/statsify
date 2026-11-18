/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { KUUDRA_KEYS } from "#data";
import { add } from "@statsify/math";
import { type CrimsonSection, KUUDRA_TIERS } from "#types";
import type { RawMember } from "#raw";

// In the Dojo's order
const DOJO_TESTS = ["mob_kb", "wall_jump", "archer", "sword_swap", "snake", "lock_head", "fireball"] as const;

// Bestiary ids: player_stats.kills misses most kills
const MINIBOSSES = {
  bladesoul: "bladesoul_200",
  barbarian_duke_x: "barbarian_duke_x_200",
  mage_outlaw: "mage_outlaw_200",
  ashfang: "ashfang_200",
  magma_boss: "magma_boss_500",
};

/** null before the member's first Crimson Isle progress. */
export function getCrimson(member: RawMember): CrimsonSection | null {
  const island = member.nether_island_player_data;
  const tiers = island?.kuudra_completed_tiers ?? {};

  // Hypixel sends the record, with no Kuudra tiers and the Dojo at 0, before the member picks a faction
  const started = island?.selected_faction || island?.mages_reputation || island?.barbarians_reputation;
  if (!island || (!started && Object.keys(tiers).length === 0)) return null;

  const dojo = DOJO_TESTS.map((test) => ({ test, points: island.dojo?.[`dojo_points_${test}`] ?? 0 }));

  return {
    faction: island.selected_faction,
    reputation: { mages: island.mages_reputation ?? 0, barbarians: island.barbarians_reputation ?? 0 },
    kuudra: KUUDRA_TIERS.map((tier) => ({
      tier,
      completions: tiers[tier] ?? 0,
      texture: { kind: "head", skin: KUUDRA_KEYS[tier] },
    })),
    dojo,
    dojoPoints: add(...dojo.map(({ points }) => points)),
    minibosses: Object.entries(MINIBOSSES).map(([boss, id]) => ({ boss, kills: member.bestiary?.kills?.[id] ?? 0 })),
  };
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest;

  test("getCrimson is null for the record Hypixel sends before a faction is picked", () => {
    expect(getCrimson({ nether_island_player_data: { kuudra_completed_tiers: {}, dojo: { dojo_points_mob_kb: 0 } } })).toBeNull();
    expect(getCrimson({ nether_island_player_data: { selected_faction: "mages" } })).not.toBeNull();
  });
}
