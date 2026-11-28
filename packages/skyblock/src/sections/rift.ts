/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { RawMember } from "#raw";
import type { RiftSection } from "#types";

// The wiki's counts, since Hypixel doesn't send how many there are to find.
export const RIFT_TOTALS = {
  enigmaSouls: 52,
  timecharms: 8,
  catsFound: 9,
} as const satisfies Partial<Record<keyof RiftSection, number>>;

export function getRift(member: RawMember): RiftSection | null {
  const stats = member.player_stats?.rift;
  const rift = member.rift;
  if (!stats?.visits) return null;

  return {
    motes: member.currencies?.motes_purse ?? 0,
    lifetimeMotes: stats.lifetime_motes_earned ?? 0,
    visits: stats.visits,
    enigmaSouls: rift?.enigma?.found_souls?.length ?? 0,
    timecharms: rift?.gallery?.secured_trophies?.length ?? 0,
    catsFound: rift?.dead_cats?.found_cats?.length ?? 0,
  };
}
