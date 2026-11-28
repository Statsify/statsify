/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { SEA_CREATURES, TROPHY_FISH } from "#data";
import { add } from "@statsify/math";
import { getTrophyFishTexture } from "#textures";
import { prettify } from "@statsify/util";
import type { FishingSection, TrophyFish, TrophyFrog } from "#types";
import type { RawMember } from "#raw";

export const TROPHY_TIERS = ["bronze", "silver", "gold", "diamond"] as const;

export type TrophyTier = (typeof TROPHY_TIERS)[number];

export const CATCHES = [
  "normal",
  "treasure",
  "largeTreasure",
  "outstanding",
] as const;

export type Catch = (typeof CATCHES)[number];

export const TROPHY_HUNTER_RANKS = [
  "novice",
  "adept",
  "expert",
  "master",
] as const;

export type TrophyHunterRank = (typeof TROPHY_HUNTER_RANKS)[number];

// Hypixel keeps only each tier's first catch, as a TROPHY_<FROG>_<TIER> task.
const TROPHY_FROGS = [
  "COMMON_FROG",
  "WETLANDS_FROG",
  "BULLFROG",
  "REALITY_HOPPER",
  "BLESSED_FROG",
  "CAVE_FROG",
  "HIGHLANDS_FROG",
  "SEA_FROG",
  "TREE_FROG",
  "LEAP_FROG",
  "EXPLODING_FROG",
  "PUDDLE_JUMPER",
] as const;

// Odger's rewards list the ranks claimed from 1, and a stray 99 isn't one.
function getTrophyHunter(rewards: number[] = []) {
  const ranks = rewards.filter((rank) => rank <= TROPHY_HUNTER_RANKS.length);
  return TROPHY_HUNTER_RANKS[Math.max(0, ...ranks) - 1];
}

export function getFishing(member: RawMember): FishingSection | null {
  const trophy = member.trophy_fish ?? {};
  const caught = (key: string) => Number(trophy[key] ?? 0);
  const fished = member.player_stats?.items_fished ?? {};
  const kills = member.bestiary?.kills ?? {};
  const tasks = new Set(member.leveling?.completed_tasks);

  // Hypixel can send both with every count at 0.
  if (!fished.total && !caught("total_caught")) return null;

  const seaCreatures = SEA_CREATURES.map(({ name, ids }) => ({
    name,
    kills: add(...ids.map((id) => Number(kills[id] ?? 0))),
  }))
    .filter(({ kills }) => kills > 0)
    .toSorted((a, b) => b.kills - a.kills);

  return {
    trophyFish: Object.entries(TROPHY_FISH).map(([id, name]) => {
      const tiers = Object.fromEntries(
        TROPHY_TIERS.map((tier) => [
          tier,
          caught(`${id.toLowerCase()}_${tier}`),
        ]),
      ) as TrophyFish["tiers"];
      const best =
        TROPHY_TIERS.findLast((tier) => tiers[tier] > 0) ?? TROPHY_TIERS[0];

      return { id, name, tiers, texture: getTrophyFishTexture(id, best) };
    }),
    trophyFishCaught: caught("total_caught"),
    trophyFrogs: TROPHY_FROGS.map((id) => ({
      id,
      name: prettify(id),
      tiers: Object.fromEntries(
        TROPHY_TIERS.map((tier) => [
          tier,
          tasks.has(`TROPHY_${id}_${tier.toUpperCase()}`),
        ]),
      ) as TrophyFrog["tiers"],
    })),
    trophyFrogsCaught: fished.trophy_frog,
    itemsFished: {
      total: fished.total ?? 0,
      normal: fished.normal ?? 0,
      treasure: fished.treasure ?? 0,
      largeTreasure: fished.large_treasure ?? 0,
      outstanding: fished.outstanding ?? 0,
    },
    // Hypixel's sea_creature_kills neither matches nor bounds the bestiary.
    seaCreatureKills: add(...seaCreatures.map(({ kills }) => kills)),
    seaCreatures,
    trophyHunter: getTrophyHunter(member.trophy_fish?.rewards),
  };
}

if (import.meta.vitest) {
  const { suite, it, expect } = import.meta.vitest;

  suite("getTrophyHunter", () => {
    it("should take the highest rank claimed", () => {
      expect(getTrophyHunter([1])).toBe("novice");
      expect(getTrophyHunter([2, 1])).toBe("adept");
      expect(getTrophyHunter([1, 2, 3, 99, 4])).toBe("master");
    });

    it("should skip a member with no rank claimed", () => {
      expect(getTrophyHunter()).toBeUndefined();
      expect(getTrophyHunter([])).toBeUndefined();
    });
  });
}
