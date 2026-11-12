/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { MUSEUM_MILESTONES, type MuseumCategory } from "#types";
import { add } from "@statsify/math";
import { decodeSlots } from "#items";
import { setImmediate } from "node:timers/promises";
import type { ItemsResource, MuseumView } from "#types";
import type { RawMuseumMember } from "#raw";

const DONATIONS_PER_TURN = 50;

// A milestone per 100 museum XP (the wiki's Museum/Milestones page, an owner exception, unverified)
const XP_PER_MILESTONE = 100;

/**
 * Donating an item's upgrade counts as donating the item (the wiki's Template:MuseumItemRow, from the resource's
 * `parent`); that it carries up the whole chain is unverified.
 */
function isDonated(key: string, donated: Set<string>, museum: ItemsResource["museum"]) {
  const seen = new Set<string>();
  for (let at: string | undefined = key; at !== undefined && !seen.has(at); at = museum[at]?.upgrade) {
    if (donated.has(at)) return true;
    seen.add(at);
  }
  return false;
}

function museumCategories(donated: Set<string>, museum: ItemsResource["museum"]): MuseumCategory[] {
  const categories = new Map<string, MuseumCategory>();
  for (const [key, { category, xp }] of Object.entries(museum)) {
    const entry = categories.get(category) ?? { category, count: 0, total: 0, xp: 0, maxXp: 0 };
    entry.total++;
    entry.maxXp += xp;
    if (isDonated(key, donated, museum)) {
      entry.count++;
      entry.xp += xp;
    }
    categories.set(category, entry);
  }
  return [...categories.values()].toSorted((a, b) => b.count - a.count);
}

/**
 * The member's donations; null when there are none to show: the museum wasn't fetched (the profile's `museumFetchedAt`
 * tells), its API is off, or nothing is donated.
 */
export async function getMuseum(museum: RawMuseumMember | undefined, items: ItemsResource): Promise<MuseumView | null> {
  if (!museum?.items && !museum?.special) return null;

  const donations: MuseumView["items"] = [];
  for (const [index, [id, { donated_time, items: blob }]] of Object.entries(museum.items ?? {}).entries()) {
    // oxlint-disable-next-line no-await-in-loop -- each donation is a synchronous gunzip and NBT parse, so other requests run between batches
    if (index > 0 && index % DONATIONS_PER_TURN === 0) await setImmediate();
    donations.push({ id, category: items.museum[id]?.category, donatedAt: donated_time, items: blob ? decodeSlots(blob) : [] });
  }

  const donated = museumCategories(new Set(donations.map(({ id }) => id)), items.museum);
  const xp = add(...donated.map((category) => category.xp));

  return {
    value: museum.value ?? 0,
    appraisal: museum.appraisal ?? false,
    items: donations.toSorted((a, b) => (b.donatedAt ?? 0) - (a.donatedAt ?? 0)),
    special: (museum.special ?? []).map(({ donated_time, items: blob }) => ({ donatedAt: donated_time, items: blob ? decodeSlots(blob) : [] })),
    donated,
    xp,
    maxXp: add(...donated.map((category) => category.maxXp)),
    milestone: Math.min(Math.floor(xp / XP_PER_MILESTONE), MUSEUM_MILESTONES),
  };
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest;

  test("museumCategories counts an item whose upgrade, or its upgrade's upgrade, is donated", () => {
    const museum = {
      KNIFE: { category: "FARMING", xp: 4, upgrade: "KNIFE_2" },
      KNIFE_2: { category: "FARMING", xp: 5, upgrade: "KNIFE_3" },
      KNIFE_3: { category: "FARMING", xp: 6 },
      HOE: { category: "FARMING", xp: 2 },
      SWORD: { category: "COMBAT", xp: 3 },
    };

    expect(museumCategories(new Set(["KNIFE_3"]), museum)).toEqual([
      { category: "FARMING", count: 3, total: 4, xp: 15, maxXp: 17 },
      { category: "COMBAT", count: 0, total: 1, xp: 0, maxXp: 3 },
    ]);
  });
}
