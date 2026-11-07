/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { MiscSection } from "#types";
import type { RawMember } from "#raw";

const TOP = 20;

/** The most counted, without Hypixel's own "total" entry. */
const topOf = (counts: Record<string, number> = {}) =>
  Object.entries(counts)
    .filter(([id]) => id !== "total")
    .toSorted((a, b) => b[1] - a[1])
    .slice(0, TOP)
    .map(([id, count]) => ({ id, count }));

/** The member's lifetime counters from `player_stats`, and their soulflow. */
export function getMisc(member: RawMember): MiscSection {
  const stats = member.player_stats ?? {};
  const auctions = stats.auctions ?? {};

  return {
    kills: stats.kills?.total ?? 0,
    deaths: stats.deaths?.total ?? 0,
    topKills: topOf(stats.kills),
    topDeaths: topOf(stats.deaths),
    highestDamage: stats.highest_damage,
    highestCriticalDamage: stats.highest_critical_damage,
    auctions: {
      created: auctions.created ?? 0,
      completed: auctions.completed ?? 0,
      won: auctions.won ?? 0,
      bids: auctions.bids ?? 0,
      highestBid: auctions.highest_bid ?? 0,
      goldSpent: auctions.gold_spent ?? 0,
      goldEarned: auctions.gold_earned ?? 0,
      fees: auctions.fees ?? 0,
    },
    gifts: { given: stats.gifts?.total_given ?? 0, received: stats.gifts?.total_received ?? 0 },
    mythological: { kills: stats.mythos?.kills ?? 0, chains: stats.mythos?.burrows_chains_complete?.total ?? 0 },
    candy: stats.candy_collected?.total ?? 0,
    soulflow: member.item_data?.soulflow ?? 0,
  };
}
