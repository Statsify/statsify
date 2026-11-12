/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { KUUDRA_KEYS } from "#data";
import { add } from "@statsify/math";
import {
  type CrimsonSection,
  type DojoBelt,
  type DojoGrade,
  type Faction,
  KUUDRA_TIERS,
  REPUTATION_RANKS,
  type ReputationRank,
} from "#types";
import type { RawMember } from "#raw";

// In the Dojo's order
const DOJO_TESTS = ["mob_kb", "wall_jump", "archer", "sword_swap", "snake", "lock_head", "fireball"] as const;

// Owner exceptions, since no data source has them (unverified). Each rank by the least reputation it takes, from the
// wiki's Factions page. Of the Dojo grades, the wiki has only S at 1,000 points; A to F have no source. Each belt by the
// least the tests' points add up to, from the wiki's Dojo page.
const RANK_FROM: Record<ReputationRank, number> = { neutral: 0, friendly: 1000, trusted: 3000, honored: 7000, hero: 12_000 };
const DOJO_GRADES: [DojoGrade, number][] = [["S", 1000], ["A", 800], ["B", 600], ["C", 400], ["D", 200], ["F", 0]];
const DOJO_BELTS: [DojoBelt, number][] = [
  ["black", 7000],
  ["brown", 6000],
  ["blue", 4000],
  ["green", 2000],
  ["yellow", 1000],
  ["white", 0],
];

const rankOf = (reputation: number) => REPUTATION_RANKS.findLast((rank) => reputation >= RANK_FROM[rank]) ?? "neutral";
const dojoGrade = (points: number) => DOJO_GRADES.find(([, lowest]) => points >= lowest)![0];
const dojoBelt = (points: number) => DOJO_BELTS.find(([, lowest]) => points >= lowest)![0];

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

  const dojo = DOJO_TESTS.map((test) => {
    const points = island.dojo?.[`dojo_points_${test}`] ?? 0;
    return { test, points, grade: dojoGrade(points), time: island.dojo?.[`dojo_time_${test}`] };
  });
  const dojoPoints = add(...dojo.map(({ points }) => points));
  const reputation: Record<Faction, number> = {
    mages: island.mages_reputation ?? 0,
    barbarians: island.barbarians_reputation ?? 0,
  };

  return {
    faction: island.selected_faction,
    reputation,
    reputationRanks: { mages: rankOf(reputation.mages), barbarians: rankOf(reputation.barbarians) },
    kuudra: KUUDRA_TIERS.map((tier) => ({
      tier,
      completions: tiers[tier] ?? 0,
      highestWave: tiers[`highest_wave_${tier}`],
      texture: { kind: "head", skin: KUUDRA_KEYS[tier] },
    })),
    dojo,
    dojoPoints,
    dojoBelt: dojoBelt(dojoPoints),
    minibosses: Object.entries(MINIBOSSES).map(([boss, id]) => ({ boss, kills: member.bestiary?.kills?.[id] ?? 0 })),
  };
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest;

  test("getCrimson is null for the record Hypixel sends before a faction is picked", () => {
    expect(getCrimson({ nether_island_player_data: { kuudra_completed_tiers: {}, dojo: { dojo_points_mob_kb: 0 } } })).toBeNull();
    expect(getCrimson({ nether_island_player_data: { selected_faction: "mages" } })).not.toBeNull();
  });

  test("rankOf and dojoGrade start each rank and grade at its lowest amount", () => {
    expect([0, 999, 1000, 6999, 7000, 12_000, 50_000].map(rankOf)).toEqual(["neutral", "neutral", "friendly", "trusted", "honored", "hero", "hero"]);
    expect([0, 199, 200, 799, 800, 1000, 1400].map(dojoGrade)).toEqual(["F", "F", "D", "B", "A", "S", "S"]);
  });
}
