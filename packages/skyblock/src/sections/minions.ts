/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { add } from "@statsify/math";
import { coopMembers } from "../profiles.js";
import { resourceTexture } from "#textures";
import type { ItemsResource, MinionsSection } from "#types";
import type { RawProfile } from "#raw";

// The wiki's table, which no data source has (unverified): 5 slots, and one more at each of these unique crafts
const SLOT_CRAFTS = [5, 15, 30, 50, 75, 100, 125, 150, 175, 200, 225, 250, 275, 300, 350, 400, 450, 500, 550, 600, 650, 700];

/** The minion slots unique crafts give, and the unique crafts the next one needs. */
export function craftedSlots(unique: number) {
  const reached = SLOT_CRAFTS.filter((crafts) => unique >= crafts).length;
  return { slots: 5 + reached, next: SLOT_CRAFTS[reached] };
}

/** "WHEAT_11" → the minion's type and tier. */
const parseCraft = (craft: string) => {
  const match = /^(.+)_(\d+)$/.exec(craft);
  return match ? { type: match[1], tier: Number(match[2]) } : undefined;
};

/**
 * Minion slots are the island's, so unique crafts are the co-op's: a tier any member crafted counts once. Each minion's
 * tiers come from the items resource, whose `<TYPE>_GENERATOR_<n>` items carry their type and tier.
 */
export function getMinions(profile: RawProfile, items: ItemsResource): MinionsSection {
  const minions = new Map<string, { tier1?: ItemsResource["items"][string]; maxTier: number }>();
  for (const item of Object.values(items.items)) {
    if (!item.generator || item.generatorTier === undefined) continue;
    const minion = minions.get(item.generator) ?? { maxTier: 0 };
    if (item.generatorTier === 1) minion.tier1 = item;
    minion.maxTier = Math.max(minion.maxTier, item.generatorTier);
    minions.set(item.generator, minion);
  }

  const crafted = new Map<string, Set<number>>();
  const members = coopMembers(profile).flatMap(([uuid, member]) => {
    const own = new Set(member.player_data?.crafted_generators);
    for (const craft of own) {
      const parsed = parseCraft(craft);
      if (!parsed || !minions.has(parsed.type)) continue;
      crafted.set(parsed.type, (crafted.get(parsed.type) ?? new Set()).add(parsed.tier));
    }
    return own.size > 0 ? [{ uuid, amount: own.size }] : [];
  });

  const views = [...minions].flatMap(([id, { tier1, maxTier }]) =>
    tier1 ?
      [
        {
          id,
          // "Wheat Minion I"
          name: tier1.name.replace(/ [IVXL]+$/, ""),
          texture: resourceTexture(tier1),
          tiers: [...(crafted.get(id) ?? [])].toSorted((a, b) => a - b),
          maxTier,
        },
      ] :
      []
  );

  const unique = add(...views.map(({ tiers }) => tiers.length));
  const { slots, next } = craftedSlots(unique);
  const community = Math.max(
    0,
    ...(profile.community_upgrades?.upgrade_states ?? []).filter(({ upgrade }) => upgrade === "minion_slots").map(({ tier }) => tier)
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
  const { test, expect } = import.meta.vitest;

  test("craftedSlots adds a slot at each of the table's unique crafts", () => {
    expect(craftedSlots(0)).toEqual({ slots: 5, next: 5 });
    expect(craftedSlots(4)).toEqual({ slots: 5, next: 5 });
    expect(craftedSlots(5)).toEqual({ slots: 6, next: 15 });
    expect(craftedSlots(699)).toEqual({ slots: 26, next: 700 });
    expect(craftedSlots(719)).toEqual({ slots: 27, next: undefined });
  });
}
