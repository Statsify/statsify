/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { decodeSlots } from "#items";
import type { ItemsResource, MuseumView } from "#types";
import type { RawMuseumMember } from "#raw";

/**
 * The member's donations; null when there are none to show: the museum wasn't fetched (the profile's `museumFetchedAt`
 * tells), its API is off, or nothing is donated.
 */
export function getMuseum(museum: RawMuseumMember | undefined, items: ItemsResource): MuseumView | null {
  if (!museum?.items && !museum?.special) return null;

  const donations = Object.entries(museum.items ?? {}).map(([id, { donated_time, items: blob }]) => ({
    id,
    category: items.museum[id],
    donatedAt: donated_time,
    items: blob ? decodeSlots(blob) : [],
  }));

  const counts = new Map<string, number>();
  for (const { category } of donations) if (category) counts.set(category, (counts.get(category) ?? 0) + 1);

  return {
    value: museum.value ?? 0,
    appraisal: museum.appraisal ?? false,
    items: donations.toSorted((a, b) => (b.donatedAt ?? 0) - (a.donatedAt ?? 0)),
    special: (museum.special ?? []).map(({ donated_time, items: blob }) => ({ donatedAt: donated_time, items: blob ? decodeSlots(blob) : [] })),
    donated: [...counts].map(([category, count]) => ({ category, count })).toSorted((a, b) => b.count - a.count),
  };
}
