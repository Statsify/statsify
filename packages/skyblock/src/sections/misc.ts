/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BESTIARY } from "#data";
import { add } from "@statsify/math";
import { prettify } from "@statsify/util";
import type { MiscSection } from "#types";
import type { RawMember } from "#raw";

export const AUCTION_STATS = [
  "created",
  "completed",
  "won",
  "bids",
  "highestBid",
  "goldSpent",
  "goldEarned",
  "fees",
] as const;

export type AuctionStat = (typeof AUCTION_STATS)[number];

const TOP = 20;

const FAMILIES = BESTIARY.pages.flatMap(({ families }) => families);

// player_stats drops the level from a kill id, so one id can span families.
const toMobId = (id: string) => id.replace(/_\d+$/, "");
const BESTIARY_MOBS = new Set(FAMILIES.flatMap(({ ids }) => ids.map(toMobId)));

type BestiaryCounts = Record<string, number | string | undefined>;

// The bestiary counts the mobs it lists, and player_stats counts the rest.
function getTopCounts(
  bestiary: BestiaryCounts | undefined,
  counts: Record<string, number> = {},
) {
  const tracked = bestiary !== undefined && Object.keys(bestiary).length > 0;
  // Two families on different pages share a name, so counts add up by name.
  const byName = new Map<string, number>();
  const addCount = (name: string, amount: number) =>
    byName.set(name, (byName.get(name) ?? 0) + amount);

  if (tracked) {
    for (const { name, ids } of FAMILIES) {
      addCount(name, add(...ids.map((id) => Number(bestiary[id] ?? 0))));
    }
  }

  for (const [id, amount] of Object.entries(counts)) {
    if (id === "total") continue;
    if (tracked && BESTIARY_MOBS.has(toMobId(id))) continue;
    addCount(prettify(id), amount);
  }

  return [...byName]
    .filter(([, amount]) => amount > 0)
    .toSorted((a, b) => b[1] - a[1])
    .slice(0, TOP)
    .map(([name, count]) => ({ name, count }));
}

export function getMisc(member: RawMember): MiscSection {
  const stats = member.player_stats ?? {};
  const auctions = stats.auctions ?? {};

  return {
    kills: stats.kills?.total ?? 0,
    deaths: stats.deaths?.total ?? 0,
    topKills: getTopCounts(member.bestiary?.kills, stats.kills),
    topDeaths: getTopCounts(member.bestiary?.deaths, stats.deaths),
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
    gifts: {
      given: stats.gifts?.total_given ?? 0,
      received: stats.gifts?.total_received ?? 0,
    },
    mythological: {
      kills: stats.mythos?.kills ?? 0,
      chains: stats.mythos?.burrows_chains_complete?.total ?? 0,
    },
    candy: stats.candy_collected?.total ?? 0,
    soulflow: member.item_data?.soulflow ?? 0,
  };
}

if (import.meta.vitest) {
  const { suite, it, expect } = import.meta.vitest;

  suite("getTopCounts", () => {
    it("should name bestiary families from the bestiary and the rest from player_stats", () => {
      const bestiary = {
        zealot_enderman_55: 30,
        zealot_bruiser_100: 10,
        unburried_zombie_30: 4,
        unburried_zombie_60: 1,
        enderman_1: 3,
        enderman_50: 2,
      };
      const stats = {
        total: 999,
        zealot_enderman: 38,
        unburried_zombie: 5,
        enderman: 5,
        void: 7,
      };

      expect(getTopCounts(bestiary, stats)).toEqual([
        { name: "Zealot", count: 40 },
        { name: "Void", count: 7 },
        { name: "Enderman", count: 5 },
        { name: "Crypt Ghoul", count: 4 },
        { name: "Golden Ghoul", count: 1 },
      ]);
    });

    it("should read player_stats alone without a bestiary", () => {
      expect(getTopCounts(undefined, { enderman: 5, void: 7 })).toEqual([
        { name: "Void", count: 7 },
        { name: "Enderman", count: 5 },
      ]);
    });
  });
}
