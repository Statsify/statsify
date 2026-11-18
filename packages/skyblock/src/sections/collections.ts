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
import type { CollectionsSection, ItemsResource } from "#types";
import type { RawMember, RawProfile } from "#raw";

/** The tiers reached at an amount, out of each tier's amount needed. */
export const collectionTier = (amount: number, tiers: number[]) => tiers.filter((needed) => amount >= needed).length;

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
