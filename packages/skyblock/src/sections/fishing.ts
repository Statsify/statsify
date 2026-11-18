/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type FishingSection, TROPHY_HUNTER_RANKS, TROPHY_TIERS, type TrophyFish } from "#types";
import { SEA_CREATURES, TROPHY_FISH } from "#data";
import { add } from "@statsify/math";
import type { RawMember } from "#raw";

// `rewards` lists the ranks claimed from Odger, read as 1 (Novice) to 4 (Master), the wiki's order (an owner exception,
// unverified). One save also has a 99, left out.
const trophyHunter = (rewards: number[] = []) => TROPHY_HUNTER_RANKS[Math.max(0, ...rewards.filter((rank) => rank <= 4)) - 1];

/** null before the member's first catch. */
export function getFishing(member: RawMember): FishingSection | null {
  const trophy = member.trophy_fish ?? {};
  const caught = (key: string) => Number(trophy[key] ?? 0);
  const fished = member.player_stats?.items_fished ?? {};
  const kills = member.bestiary?.kills ?? {};

  // Hypixel can send both with every count at 0
  if (!fished.total && !caught("total_caught")) return null;

  return {
    trophyFish: Object.entries(TROPHY_FISH).map(([id, name]) => ({
      id,
      name,
      tiers: Object.fromEntries(
        TROPHY_TIERS.map((tier) => [tier, caught(`${id.toLowerCase()}_${tier}`)])
      ) as TrophyFish["tiers"],
    })),
    trophyFishCaught: caught("total_caught"),
    itemsFished: {
      total: fished.total ?? 0,
      normal: fished.normal ?? 0,
      treasure: fished.treasure ?? 0,
      largeTreasure: fished.large_treasure ?? 0,
      outstanding: fished.outstanding ?? 0,
    },
    // Hypixel's own counter, which neither matches nor bounds the bestiary's kills
    seaCreatureKills: member.player_stats?.sea_creature_kills ?? 0,
    seaCreatures: SEA_CREATURES.map(({ name, ids }) => ({ name, kills: add(...ids.map((id) => kills[id] ?? 0)) }))
      .filter(({ kills }) => kills > 0)
      .toSorted((a, b) => b.kills - a.kills),
    trophyHunter: trophyHunter(member.trophy_fish?.rewards),
  };
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest;

  test("getFishing ranks sea creatures by their bestiary kills, leaving out other mobs", () => {
    const fishing = getFishing({
      trophy_fish: { total_caught: 5, rewards: [] },
      bestiary: { kills: { zombie_miner_150: 3, great_white_shark_180: 7, zombie: 1000 } },
    });

    expect(fishing?.seaCreatures).toEqual([
      { name: "Great White Shark", kills: 7 },
      { name: "Abyssal Miner", kills: 3 },
    ]);
  });

  test("trophyHunter takes the highest rank claimed", () => {
    expect([undefined, [], [1], [1, 2, 3, 99, 4], [2, 1]].map((rewards) => trophyHunter(rewards))).toEqual([
      undefined,
      undefined,
      "novice",
      "master",
      "adept",
    ]);
  });
}
