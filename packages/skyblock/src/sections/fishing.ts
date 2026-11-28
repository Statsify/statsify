/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { SEA_CREATURES, TROPHY_FISH } from "#data";
import { add } from "@statsify/math";
import type { FishingSection, TrophyFish } from "#types";
import type { RawMember } from "#raw";

export const TROPHY_TIERS = ["bronze", "silver", "gold", "diamond"] as const;

export type TrophyTier = (typeof TROPHY_TIERS)[number];

export function getFishing(member: RawMember): FishingSection | null {
  const trophy = member.trophy_fish ?? {};
  const caught = (key: string) => Number(trophy[key] ?? 0);
  const fished = member.player_stats?.items_fished ?? {};
  const kills = member.bestiary?.kills ?? {};

  // Hypixel can send both with every count at 0.
  if (!fished.total && !caught("total_caught")) return null;

  const seaCreatures = SEA_CREATURES.map(({ name, ids }) => ({
    name,
    kills: add(...ids.map((id) => Number(kills[id] ?? 0))),
  }))
    .filter(({ kills }) => kills > 0)
    .toSorted((a, b) => b.kills - a.kills);

  return {
    trophyFish: Object.entries(TROPHY_FISH).map(([id, name]) => ({
      id,
      name,
      tiers: Object.fromEntries(
        TROPHY_TIERS.map((tier) => [
          tier,
          caught(`${id.toLowerCase()}_${tier}`),
        ]),
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
    // Hypixel's sea_creature_kills neither matches nor bounds the bestiary.
    seaCreatureKills: add(...seaCreatures.map(({ kills }) => kills)),
    seaCreatures,
  };
}
