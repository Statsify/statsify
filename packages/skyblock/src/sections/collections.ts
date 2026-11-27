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
import { stepsReached } from "#leveling";
import { resourceTexture } from "#textures";
import { type BossCollection, type CollectionsSection, type ItemsResource, KUUDRA_TIERS } from "#types";
import type { RawMember, RawProfile } from "#raw";

// Each boss's tiers, from its wiki page's Collection section, fit every saved member. Owner exceptions (unverified):
// a Master Mode completion counts twice, and Kuudra's tiers count 1 to 5; the wiki gives only Basic 1 and Infernal 5.
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
  const tier = stepsReached(amount, tiers);
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

/** The highest tier each collection reached, from `unlocked_coll_tiers`. */
function unlockedTiers(unlocked: string[]) {
  const tiers = new Map<string, number>();
  for (const entry of unlocked) {
    const split = entry.lastIndexOf("_");
    const id = entry.slice(0, split);
    tiers.set(id, Math.max(tiers.get(id) ?? 0, Number(entry.slice(split + 1))));
  }
  return tiers;
}

/**
 * Collections count the whole co-op's gathering, and a tier unlocks for every member. Only the resource's collections,
 * since the API still keeps retired ones (ENCHANTED_DIAMOND).
 */
export function getCollections(profile: RawProfile, member: RawMember, items?: ItemsResource): CollectionsSection | null {
  if (!member.collection) return null;

  const members = coopMembers(profile);
  const counted = members.filter(([, other]) => other.collection);
  // A co-op member with the API off leaves the sum short of a tier the member already unlocked
  const reached = unlockedTiers(member.player_data?.unlocked_coll_tiers ?? []);

  const categories = COLLECTIONS.map(({ id, name, items: collections }) => ({
    id,
    name,
    items: collections.map(({ id, name, tiers }) => {
      const parts = counted
        .map(([uuid, other]) => ({ uuid, amount: other.collection?.[id] ?? 0 }))
        .filter(({ amount }) => amount > 0)
        .toSorted((a, b) => b.amount - a.amount);
      const amount = add(...parts.map(({ amount }) => amount));
      // The list can name tiers the resource no longer has (Redstone at 16 of 9)
      const tier = Math.max(stepsReached(amount, tiers), Math.min(reached.get(id) ?? 0, tiers.length));
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

  // A co-op of two, the other member with the Collections API off
  const tierOf = (amount: number, unlocked: string[]) => {
    const member: RawMember = { collection: { "INK_SACK:3": amount }, player_data: { unlocked_coll_tiers: unlocked } };
    const profile = { profile_id: "p", cute_name: "Apple", members: { a: member, b: {} } };
    return getCollections(profile, member)
      ?.categories.flatMap(({ items }) => items)
      .find(({ id }) => id === "INK_SACK:3")?.tier;
  };

  test("getCollections reads a tier no lower than the member unlocked, which a hidden co-op member can leave the sum under", () => {
    expect(tierOf(100, ["INK_SACK:3_4"])).toBe(4);
    expect(tierOf(10_000, ["INK_SACK:3_2"])).toBe(6);
    expect(tierOf(100, ["INK_SACK:3_16"])).toBe(9);
  });

  test("unlockedTiers keeps each collection's highest tier", () => {
    expect(unlockedTiers(["BONE_-1", "INK_SACK:3_2", "INK_SACK:3_9", "INK_SACK:3_8", "MUTTON_1"])).toEqual(
      new Map([
        ["BONE", 0],
        ["INK_SACK:3", 9],
        ["MUTTON", 1],
      ])
    );
  });
}
