/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { COLLECTIONS } from "#data";
import { add } from "@statsify/math";
import { coopMembers } from "../profiles.js";
import { resourceTexture } from "#textures";
import { type BossCollection, type CollectionsSection, type ItemsResource, KUUDRA_TIERS } from "#types";
import type { RawMember, RawProfile } from "#raw";

/** The tiers reached at an amount, out of each tier's amount needed. */
export const collectionTier = (amount: number, tiers: number[]) => tiers.filter((needed) => amount >= needed).length;

// Each boss's tiers are the wiki's, from each boss page's Collection section, and fit every saved member. Owner
// exceptions, since no source has them (unverified): a Master Mode completion counting twice, and Kuudra's tiers
// counting 1 to 5, where the wiki gives Basic 1 and Infernal 5 only.
const SHORT_TIERS = [25, 50, 100, 150, 250, 1000];
const LONG_TIERS = [50, 100, 150, 250, 500, 750, 1000];
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

const bossCollection = (boss: string, amount: number, tiers: number[]): BossCollection => {
  const tier = collectionTier(amount, tiers);
  return { boss, amount, tier, maxTier: tiers.length, next: tiers[tier] };
};

function getBossCollections(member: RawMember): BossCollection[] {
  const types = member.dungeons?.dungeon_types;
  const kuudra = member.nether_island_player_data?.kuudra_completed_tiers ?? {};

  return [
    ...FLOOR_BOSSES.map(({ boss, tiers }, i) => {
      const floor = String(i + 1);
      const amount = (types?.catacombs?.tier_completions?.[floor] ?? 0) + 2 * (types?.master_catacombs?.tier_completions?.[floor] ?? 0);
      return bossCollection(boss, amount, tiers);
    }),
    bossCollection("kuudra", add(...KUUDRA_TIERS.map((tier, i) => (i + 1) * (kuudra[tier] ?? 0))), KUUDRA_COLLECTION),
  ];
}

/**
 * Collections count the whole co-op's gathering, and a tier unlocks for every member. Only the resource's collections,
 * since the API still keeps retired ones (ENCHANTED_DIAMOND).
 */
export function getCollections(profile: RawProfile, member: RawMember, items?: ItemsResource): CollectionsSection | null {
  if (!member.collection) return null;

  const members = coopMembers(profile);
  const counted = members.filter(([, other]) => other.collection);

  const categories = COLLECTIONS.map(({ id, name, items: collections }) => ({
    id,
    name,
    items: collections.map(({ id, name, tiers }) => {
      const parts = counted
        .map(([uuid, other]) => ({ uuid, amount: other.collection?.[id] ?? 0 }))
        .filter(({ amount }) => amount > 0)
        .toSorted((a, b) => b.amount - a.amount);
      const amount = add(...parts.map(({ amount }) => amount));
      const tier = collectionTier(amount, tiers);
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
    hidden: members.filter(([, other]) => !other.collection).map(([uuid]) => uuid),
    bosses: getBossCollections(member),
  };
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest;

  test("collectionTier counts the tiers an amount reaches", () => {
    expect(collectionTier(0, [50, 100, 250])).toBe(0);
    expect(collectionTier(99, [50, 100, 250])).toBe(1);
    expect(collectionTier(100, [50, 100, 250])).toBe(2);
    expect(collectionTier(1e9, [50, 100, 250])).toBe(3);
  });
}
