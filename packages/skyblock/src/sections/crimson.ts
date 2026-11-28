/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type CrimsonSection, KUUDRA_TIERS } from "#types";
import { KUUDRA_KEYS } from "#data";
import { add } from "@statsify/math";
import type { RawMember } from "#raw";

export type Faction = "mages" | "barbarians";

export const REPUTATION_RANKS = [
  "neutral",
  "friendly",
  "trusted",
  "honored",
  "hero",
] as const;

export type ReputationRank = (typeof REPUTATION_RANKS)[number];
export type DojoGrade = "S" | "A" | "B" | "C" | "D" | "F";
export type DojoBelt =
  | "white"
  | "yellow"
  | "green"
  | "blue"
  | "brown"
  | "black";

// In the Dojo's order
const DOJO_TESTS = [
  "mob_kb",
  "wall_jump",
  "archer",
  "sword_swap",
  "snake",
  "lock_head",
  "fireball",
] as const;

// Each rank's least reputation, from the wiki's Factions page
const RANK_REPUTATION: Record<ReputationRank, number> = {
  neutral: 0,
  friendly: 1000,
  trusted: 3000,
  honored: 7000,
  hero: 12_000,
};

const DOJO_GRADES: [DojoGrade, number][] = [
  ["S", 1000],
  ["A", 800],
  ["B", 600],
  ["C", 400],
  ["D", 200],
  ["F", 0],
];

// Each belt's least total of the tests' points, from the wiki's Dojo page
const DOJO_BELTS: [DojoBelt, number][] = [
  ["black", 7000],
  ["brown", 6000],
  ["blue", 4000],
  ["green", 2000],
  ["yellow", 1000],
  ["white", 0],
];

const getReputationRank = (reputation: number) =>
  REPUTATION_RANKS.findLast((rank) => reputation >= RANK_REPUTATION[rank])!;

const getDojoGrade = (points: number) =>
  DOJO_GRADES.find(([, lowest]) => points >= lowest)![0];

const getDojoBelt = (points: number) =>
  DOJO_BELTS.find(([, lowest]) => points >= lowest)![0];

// player_stats.kills misses most kills, so these read the bestiary.
const MINIBOSSES = {
  bladesoul: "bladesoul_200",
  barbarian_duke_x: "barbarian_duke_x_200",
  mage_outlaw: "mage_outlaw_200",
  ashfang: "ashfang_200",
  magma_boss: "magma_boss_500",
};

export function getCrimson(member: RawMember): CrimsonSection | null {
  const island = member.nether_island_player_data;
  const tiers = island?.kuudra_completed_tiers ?? {};

  // Hypixel sends the record at 0 before the member picks a faction.
  const started =
    island?.selected_faction ||
    island?.mages_reputation ||
    island?.barbarians_reputation;
  if (!island || (!started && Object.keys(tiers).length === 0)) return null;

  const dojo = DOJO_TESTS.map((test) => {
    const points = island.dojo?.[`dojo_points_${test}`];
    return {
      test,
      points: points ?? 0,
      grade: points === undefined ? undefined : getDojoGrade(points),
      time: island.dojo?.[`dojo_time_${test}`],
    };
  });
  const dojoPoints = add(...dojo.map(({ points }) => points));
  const reputation: Record<Faction, number> = {
    mages: island.mages_reputation ?? 0,
    barbarians: island.barbarians_reputation ?? 0,
  };

  return {
    faction: island.selected_faction,
    reputation,
    reputationRanks: {
      mages: getReputationRank(reputation.mages),
      barbarians: getReputationRank(reputation.barbarians),
    },
    kuudra: KUUDRA_TIERS.map((tier) => ({
      tier,
      completions: tiers[tier] ?? 0,
      highestWave: tiers[`highest_wave_${tier}`],
      texture: { kind: "head", skin: KUUDRA_KEYS[tier] },
    })),
    dojo,
    dojoPoints,
    dojoBelt: getDojoBelt(dojoPoints),
    minibosses: Object.entries(MINIBOSSES).map(([boss, id]) => ({
      boss,
      kills: Number(member.bestiary?.kills?.[id] ?? 0),
    })),
  };
}

if (import.meta.vitest) {
  const { suite, it, expect } = import.meta.vitest;

  suite("getReputationRank", () => {
    it("should start each rank at its least reputation", () => {
      expect(getReputationRank(0)).toBe("neutral");
      expect(getReputationRank(999)).toBe("neutral");
      expect(getReputationRank(1000)).toBe("friendly");
      expect(getReputationRank(12_000)).toBe("hero");
      expect(getReputationRank(50_000)).toBe("hero");
    });
  });

  suite("getDojoGrade", () => {
    it("should start each grade at its least points", () => {
      expect(getDojoGrade(0)).toBe("F");
      expect(getDojoGrade(199)).toBe("F");
      expect(getDojoGrade(200)).toBe("D");
      expect(getDojoGrade(1000)).toBe("S");
      expect(getDojoGrade(1400)).toBe("S");
    });
  });
}
