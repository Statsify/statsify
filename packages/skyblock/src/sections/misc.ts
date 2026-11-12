/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { Consumable, Dragons, ItemsResource, MiscSection } from "#types";
import type { RawHarp, RawMember, RawProfile } from "#raw";
import { prettify } from "@statsify/util";
import { resourceTexture } from "#textures";

const TOP = 20;

/** The most counted, without Hypixel's own "total" entry. */
const topOf = (counts: Record<string, number> = {}) =>
  Object.entries(counts)
    .filter(([id]) => id !== "total")
    .toSorted((a, b) => b[1] - a[1])
    .slice(0, TOP)
    .map(([id, count]) => ({ id, count }));

// Each permanent consumable's count, and how many the game takes: the wiki's maximums (an owner exception, unverified)
const CONSUMABLES: { id: string; max: number; used: (member: RawMember) => number | undefined }[] = [
  { id: "METAPHYSICAL_SERUM", max: 3, used: (member) => member.experimentation?.serums_drank },
  { id: "REAPER_PEPPER", max: 5, used: (member) => member.player_data?.reaper_peppers_eaten },
  { id: "WRIGGLING_LARVA", max: 5, used: (member) => member.garden_player_data?.larva_consumed },
  { id: "REFINED_DARK_CACAO_TRUFFLE", max: 5, used: (member) => member.events?.easter?.refined_dark_cacao_truffles },
  { id: "REFINED_BOTTLE_OF_JYRRE", max: 5, used: (member) => member.winter_player_data?.refined_jyrre_uses },
  { id: "BEE_SALIVA", max: 5, used: (member) => member.player_data?.bee_saliva_eaten },
  { id: "ISOPOD_HUSK", max: 5, used: (member) => member.player_data?.isopod_husks_eaten },
  { id: "RIFT_PRISM", max: 1, used: (member) => Number(member.rift?.access?.consumed_prism ?? false) },
];

// Every song played has a best; its completions keys also come as _perfect_completions
const HARP_SONG = /^song_(.+)_best_completion$/;

/** Each song played on the harp, from `foraging.songs.harp`, or `quests.harp_quest` where it was before. */
function harpSongs(harp: RawHarp = {}): MiscSection["harp"] {
  const count = (key: string) => (typeof harp[key] === "number" ? (harp[key] as number) : 0);
  return Object.keys(harp)
    .flatMap((key) => HARP_SONG.exec(key)?.[1] ?? [])
    .map((song) => ({
      song,
      completions: count(`song_${song}_completions`),
      perfect: count(`song_${song}_perfect_completions`),
      best: count(`song_${song}_best_completion`),
    }))
    .toSorted((a, b) => a.song.localeCompare(b.song));
}

function getDragons(member: RawMember): Dragons {
  const end = member.player_stats?.end_island;
  const fight = end?.dragon_fight;
  return {
    summoned: fight?.amount_summoned?.total ?? 0,
    eyesPlaced: fight?.summoning_eyes_contributed?.total ?? 0,
    crystalsDestroyed: fight?.ender_crystals_destroyed ?? 0,
    fastestKill: fight?.fastest_kill?.best,
    mostDamage: fight?.most_damage?.best,
    bestRank: fight?.highest_rank?.best,
    specialZealotLoot: end?.special_zealot_loot_collected ?? 0,
    summoningEyes: end?.summoning_eyes_collected ?? 0,
  };
}

function getConsumables(member: RawMember, items: ItemsResource): Consumable[] {
  return CONSUMABLES.map(({ id, max, used }) => {
    const resource = items.items[id];
    return {
      id,
      name: resource?.name ?? prettify(id),
      texture: resource && resourceTexture(resource),
      used: used(member) ?? 0,
      max,
    };
  });
}

/** Each community upgrade at its highest tier; the profile keeps one entry per tier bought. */
function getUpgrades(profile: RawProfile): MiscSection["upgrades"] {
  const tiers = new Map<string, number>();
  for (const { upgrade, tier } of profile.community_upgrades?.upgrade_states ?? [])
    tiers.set(upgrade, Math.max(tier, tiers.get(upgrade) ?? 0));
  return [...tiers].map(([upgrade, tier]) => ({ upgrade, tier })).toSorted((a, b) => a.upgrade.localeCompare(b.upgrade));
}

/** Numbers from a map, leaving out its other entries (tree_gifts keeps milestone_tier_claimed beside the trees). */
const numbersOf = (record: Record<string, unknown> = {}) =>
  Object.fromEntries(Object.entries(record).filter((entry): entry is [string, number] => typeof entry[1] === "number"));

/** The member's lifetime counters from `player_stats` and the smaller systems, their soulflow, and the profile's upgrades. */
export function getMisc(profile: RawProfile, member: RawMember, items: ItemsResource): MiscSection {
  const stats = member.player_stats ?? {};
  const auctions = stats.auctions ?? {};
  const winter = stats.winter ?? {};
  const foraging = member.foraging;

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
    jerry: {
      mostDamage: winter.most_damage_dealt,
      mostSnowballsHit: winter.most_snowballs_hit,
      mostMagmaDamage: winter.most_magma_damage_dealt,
      mostCannonballsHit: winter.most_cannonballs_hit,
    },
    dragons: getDragons(member),
    harp: harpSongs(foraging?.songs?.harp ?? member.quests?.harp_quest),
    galatea: {
      fishFamily: foraging?.fish_family?.length ?? 0,
      hinaTasks: foraging?.hina?.tasks?.completed_tasks?.length ?? 0,
      treeGifts: numbersOf(foraging?.tree_gifts),
      starlyn: foraging?.starlyn?.personal_bests ?? {},
    },
    consumables: getConsumables(member, items),
    upgrades: getUpgrades(profile),
  };
}
