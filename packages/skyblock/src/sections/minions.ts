/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { add } from "@statsify/math";
import { countTiersReached } from "#leveling";
import { getCoopMembers } from "../profiles.js";
import { resourceTexture } from "#textures";
import type { ItemsResource, MinionsSection } from "#types";
import type { RawProfile } from "#raw";

type ResourceItem = ItemsResource["items"][string];

const BASE_SLOTS = 5;

// No data source has the wiki's table of unique crafts that each add a slot.
const SLOT_CRAFTS = [
  5, 15, 30, 50, 75, 100, 125, 150, 175, 200, 225, 250, 275, 300, 350, 400, 450,
  500, 550, 600, 650, 700,
];

function getCraftedSlots(unique: number) {
  const reached = countTiersReached(unique, SLOT_CRAFTS);
  return { slots: BASE_SLOTS + reached, next: SLOT_CRAFTS[reached] };
}

// A craft reads like "WHEAT_11".
const parseCraft = (craft: string) => {
  const match = /^(.+)_(\d+)$/.exec(craft);
  return match ? { type: match[1], tier: Number(match[2]) } : undefined;
};

// Minion slots are the island's, so a tier any member crafted counts once.
export function getMinions(
  profile: RawProfile,
  items: ItemsResource,
): MinionsSection {
  const minions = new Map<string, { tier1?: ResourceItem; maxTier: number }>();
  for (const item of Object.values(items.items)) {
    if (!item.generator || item.generatorTier === undefined) continue;
    const minion = minions.get(item.generator) ?? { maxTier: 0 };
    if (item.generatorTier === 1) minion.tier1 = item;
    minion.maxTier = Math.max(minion.maxTier, item.generatorTier);
    minions.set(item.generator, minion);
  }

  const crafted = new Map<string, Set<number>>();
  const members: MinionsSection["members"] = [];
  for (const [uuid, member] of getCoopMembers(profile)) {
    const own = new Set(member.player_data?.crafted_generators);
    if (own.size > 0) members.push({ uuid, amount: own.size });

    for (const craft of own) {
      const parsed = parseCraft(craft);
      if (!parsed || !minions.has(parsed.type)) continue;
      const tiers = crafted.get(parsed.type) ?? new Set();
      crafted.set(parsed.type, tiers.add(parsed.tier));
    }
  }

  const views: MinionsSection["minions"] = [];
  for (const [id, { tier1, maxTier }] of minions) {
    if (!tier1) continue;
    views.push({
      id,
      // "Wheat Minion I"
      name: tier1.name.replace(/ [IVXL]+$/, ""),
      texture: resourceTexture(tier1),
      tiers: [...(crafted.get(id) ?? [])].toSorted((a, b) => a - b),
      maxTier,
    });
  }

  const unique = add(...views.map(({ tiers }) => tiers.length));
  const { slots, next } = getCraftedSlots(unique);
  const community = Math.max(
    0,
    ...(profile.community_upgrades?.upgrade_states ?? [])
      .filter(({ upgrade }) => upgrade === "minion_slots")
      .map(({ tier }) => tier),
  );

  return {
    minions: views.toSorted((a, b) => a.name.localeCompare(b.name)),
    unique,
    total: add(...views.map(({ maxTier }) => maxTier)),
    slots: { total: slots + community, crafts: slots, community, next },
    members: members.toSorted((a, b) => b.amount - a.amount),
  };
}

if (import.meta.vitest) {
  const { suite, it, expect } = import.meta.vitest;

  suite("getCraftedSlots", () => {
    it("should add a slot at each of the table's unique crafts", () => {
      expect(getCraftedSlots(0)).toEqual({ slots: 5, next: 5 });
      expect(getCraftedSlots(4)).toEqual({ slots: 5, next: 5 });
      expect(getCraftedSlots(5)).toEqual({ slots: 6, next: 15 });
      expect(getCraftedSlots(699)).toEqual({ slots: 26, next: 700 });
      expect(getCraftedSlots(719)).toEqual({ slots: 27, next: undefined });
    });
  });
}
