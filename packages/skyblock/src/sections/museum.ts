/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { decodeSlots } from "#items";
import { setImmediate } from "node:timers/promises";
import type { ItemsResource, MuseumView } from "#types";
import type { RawMuseumMember } from "#raw";

const DONATIONS_PER_TURN = 50;

export async function getMuseum(
  museum: RawMuseumMember | undefined,
  items: ItemsResource,
): Promise<MuseumView | null> {
  if (!museum?.items && !museum?.special) return null;

  const donations: MuseumView["items"] = [];
  for (const [index, [id, { donated_time, items: blob }]] of Object.entries(
    museum.items ?? {},
  ).entries()) {
    // oxlint-disable-next-line no-await-in-loop -- yields to other requests
    if (index > 0 && index % DONATIONS_PER_TURN === 0) await setImmediate();
    donations.push({
      id,
      category: items.museum[id],
      donatedAt: donated_time,
      items: blob ? decodeSlots(blob) : [],
    });
  }

  const counts = new Map<string, number>();
  for (const { category } of donations)
    if (category) counts.set(category, (counts.get(category) ?? 0) + 1);

  return {
    value: museum.value ?? 0,
    appraisal: museum.appraisal ?? false,
    items: donations.toSorted(
      (a, b) => (b.donatedAt ?? 0) - (a.donatedAt ?? 0),
    ),
    special: (museum.special ?? []).map(({ donated_time, items: blob }) => ({
      donatedAt: donated_time,
      items: blob ? decodeSlots(blob) : [],
    })),
    donated: [...counts]
      .map(([category, count]) => ({ category, count }))
      .toSorted((a, b) => b.count - a.count),
  };
}
