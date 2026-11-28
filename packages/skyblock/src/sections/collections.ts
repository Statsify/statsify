/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { COLLECTIONS } from "#data";
import { add } from "@statsify/math";
import { countTiersReached } from "#leveling";
import { getCoopMembers } from "../profiles.js";
import { resourceTexture } from "#textures";
import {
  type BossCollection,
  type CollectionsSection,
  type ItemsResource,
  KUUDRA_TIERS,
} from "#types";
import type { RawMember, RawProfile } from "#raw";

export const COLLECTION_CATEGORIES = [
  "FARMING",
  "MINING",
  "COMBAT",
  "FORAGING",
  "FISHING",
  "RIFT",
] as const;

export type CollectionCategory = (typeof COLLECTION_CATEGORIES)[number];

// Each boss's tiers come from its wiki page's Collection section.
const SHORT_TIERS = [25, 50, 100, 150, 250, 1000];
const LONG_TIERS = [50, 100, 150, 250, 500, 750, 1000];

// In floor order, from floor 1
const FLOOR_BOSSES = [
  { boss: "bonzo", tiers: SHORT_TIERS },
  { boss: "scarf", tiers: SHORT_TIERS },
  { boss: "the_professor", tiers: SHORT_TIERS },
  { boss: "thorn", tiers: [50, 100, 150, 250, 400, 1000] },
  { boss: "livid", tiers: LONG_TIERS },
  { boss: "sadan", tiers: LONG_TIERS },
  { boss: "necron", tiers: LONG_TIERS },
];

const KUUDRA_COLLECTION = [10, 100, 500, 2000, 5000];

function toBossCollection(
  boss: string,
  amount: number,
  tiers: number[],
): BossCollection {
  const tier = countTiersReached(amount, tiers);
  return { boss, amount, tier, maxTier: tiers.length, next: tiers[tier] };
}

// A Master Mode completion counts twice, and a Kuudra tier counts its place.
function getBossCollections(member: RawMember) {
  const types = member.dungeons?.dungeon_types;
  const kuudra = member.nether_island_player_data?.kuudra_completed_tiers ?? {};

  const floors = FLOOR_BOSSES.map(({ boss, tiers }, index) => {
    const floor = String(index + 1);
    const normal = types?.catacombs?.tier_completions?.[floor] ?? 0;
    const master = types?.master_catacombs?.tier_completions?.[floor] ?? 0;
    return toBossCollection(boss, normal + 2 * master, tiers);
  });

  const kuudraRuns = add(
    ...KUUDRA_TIERS.map((tier, index) => (index + 1) * (kuudra[tier] ?? 0)),
  );
  return [...floors, toBossCollection("kuudra", kuudraRuns, KUUDRA_COLLECTION)];
}

// Each entry is "<collection>_<tier>", and one found at no tier yet is -1.
function getUnlockedTiers(unlocked: string[]) {
  const tiers = new Map<string, number>();
  for (const entry of unlocked) {
    const split = entry.lastIndexOf("_");
    const id = entry.slice(0, split);
    const tier = Number(entry.slice(split + 1));
    tiers.set(id, Math.max(tiers.get(id) ?? 0, tier));
  }
  return tiers;
}

// The API still keeps retired collections, so only the resource's are listed.
export function getCollections(
  profile: RawProfile,
  member: RawMember,
  items?: ItemsResource,
): CollectionsSection | null {
  if (!member.collection) return null;

  const members = getCoopMembers(profile);
  const counted = members.filter(([, other]) => other.collection);
  // A member with the API off can leave the sum under a tier already unlocked.
  const unlocked = member.player_data?.unlocked_coll_tiers ?? [];
  const reached = getUnlockedTiers(unlocked);

  const categories = COLLECTIONS.map(({ id, name, items: collections }) => ({
    id,
    name,
    items: collections.map(({ id, name, tiers }) => {
      const parts = counted
        .map(([uuid, other]) => ({ uuid, amount: other.collection?.[id] ?? 0 }))
        .filter(({ amount }) => amount > 0)
        .toSorted((a, b) => b.amount - a.amount);
      const amount = add(...parts.map(({ amount }) => amount));
      // Unlocked tiers can go past the resource's last one (Redstone 16 of 9).
      const unlockedTier = Math.min(reached.get(id) ?? 0, tiers.length);
      const tier = Math.max(countTiersReached(amount, tiers), unlockedTier);
      const item = items?.items[id];

      return {
        id,
        name,
        texture: item && resourceTexture(item),
        amount,
        tier,
        maxTier: tiers.length,
        next: tiers[tier],
        members: parts,
      };
    }),
  }));

  const all = categories.flatMap(({ items }) => items);
  return {
    categories,
    maxed: all.filter(({ tier, maxTier }) => tier === maxTier).length,
    total: all.length,
    hidden: members
      .filter(([, other]) => !other.collection)
      .map(([uuid]) => uuid),
    bosses: getBossCollections(member),
  };
}

if (import.meta.vitest) {
  const { suite, it, expect } = import.meta.vitest;

  suite("getUnlockedTiers", () => {
    it("should keep each collection's highest tier", () => {
      expect(
        getUnlockedTiers([
          "BONE_-1",
          "INK_SACK:3_2",
          "INK_SACK:3_9",
          "INK_SACK:3_8",
          "MUTTON_1",
        ]),
      ).toEqual(
        new Map([
          ["BONE", 0],
          ["INK_SACK:3", 9],
          ["MUTTON", 1],
        ]),
      );
    });
  });
}
