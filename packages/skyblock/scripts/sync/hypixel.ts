/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { fetchNeuBeforeRemoval, readNeuStats, sumStatValues } from "./neu.ts";
import { normalizeItemText, parseStatRewards } from "#lore";
import { fetchOk } from "./textures.ts";
import { getCollectionBoards } from "@statsify/skyblock";
import { toLevelCosts } from "#leveling";
import type { SyncContext } from "../sync-data.ts";

const HYPIXEL_SKILLS = "https://api.hypixel.net/v2/resources/skyblock/skills";
const HYPIXEL_COLLECTIONS =
  "https://api.hypixel.net/v2/resources/skyblock/collections";

interface HypixelSkill {
  maxLevel: number;
  levels: { totalExpRequired: number; unlocks?: string[] }[];
}

interface HypixelCollections {
  name: string;
  items: Record<string, { name: string; tiers: { amountRequired: number }[] }>;
}

async function fetchHypixelResource<T>(url: string) {
  const response = await fetchOk(url);
  return (await response.json()) as T & { version: string };
}

// A slayer level gives the stats of the highest bonus key at or under it.
function toLevelStats(
  table: Record<string, Record<string, number>>,
  levels: number,
) {
  const stats: Record<string, number>[] = [];
  let current: Record<string, number> = {};
  for (let level = 1; level <= levels; level++) {
    if (table[level]) current = readNeuStats(table[level]);
    stats.push(current);
  }

  return stats;
}

export const HYPIXEL_UNITS = {
  async hypixel({ readJson, write, setBoards }: SyncContext) {
    // NEU's Runecrafting table is off at five levels, so skills use Hypixel's.
    const [
      { skills, version: skillsVersion },
      { collections, version: collectionsVersion },
      leveling,
      { sblevel_colours },
      fairySouls,
      misc,
      bonuses,
    ] = await Promise.all([
      fetchHypixelResource<{ skills: Record<string, HypixelSkill> }>(
        HYPIXEL_SKILLS,
      ),
      fetchHypixelResource<{ collections: Record<string, HypixelCollections> }>(
        HYPIXEL_COLLECTIONS,
      ),
      readJson<Record<string, unknown>>("constants/leveling.json"),
      fetchNeuBeforeRemoval<{ sblevel_colours: Record<string, string> }>(
        "constants/sblevels.json",
      ),
      readJson<{ "Max Souls": number }>("constants/fairy_souls.json"),
      fetchNeuBeforeRemoval<{ base_stats: Record<string, number> }>(
        "constants/misc.json",
      ),
      readJson<{
        bonus_stats: Record<string, Record<string, Record<string, number>>>;
        pet_rewards: Record<string, { magic_find: number }>;
      }>("constants/bonuses.json"),
    ]);

    const xpTable = (skill: string) =>
      toLevelCosts(
        skills[skill].levels.map(({ totalExpRequired }) => totalExpRequired),
      );

    const collectionData = Object.entries(collections).map(
      ([category, { name, items }]) => ({
        id: category,
        name,
        items: Object.entries(items).map(([id, item]) => ({
          id,
          name: item.name,
          tiers: item.tiers.map(({ amountRequired }) => amountRequired),
        })),
      }),
    );
    write("collections.json", collectionData);

    const slayerXp = leveling.slayer_xp as Record<string, number[]>;
    write("leveling.json", {
      catacombs: leveling.catacombs,
      fairy_souls: fairySouls["Max Souls"],
      HOTF: leveling.HOTF,
      HOTM: leveling.HOTM,
      leveling_caps: leveling.leveling_caps,
      leveling_xp: xpTable("COMBAT"),
      max_levels: Object.fromEntries(
        Object.entries(skills).map(([id, { maxLevel }]) => [
          id.toLowerCase(),
          maxLevel,
        ]),
      ),
      runecrafting_xp: xpTable("RUNECRAFTING"),
      sblevel_colours,
      // NEU copies Revenant's 15 XP for Tarantula level 2, but the game has 25.
      slayer_xp: { ...slayerXp, spider: slayerXp.spider.with(1, 25) },
      slayer_to_highest_tier: leveling.slayer_to_highest_tier,
      social: xpTable("SOCIAL"),
    });

    write("stats.json", {
      base: readNeuStats(misc.base_stats),
      skills: Object.fromEntries(
        Object.entries(skills).map(([id, { levels }]) => [
          id.toLowerCase(),
          levels.map(({ unlocks = [] }) =>
            sumStatValues(
              unlocks.flatMap((line) =>
                parseStatRewards(normalizeItemText(line)),
              ),
            ),
          ),
        ]),
      ),
      slayers: Object.fromEntries(
        Object.entries(bonuses.bonus_stats)
          .filter(([id]) => id.startsWith("slayer_"))
          .map(([id, table]) => {
            const boss = id.slice("slayer_".length);
            return [boss, toLevelStats(table, slayerXp[boss].length)];
          }),
      ),
      pet_score: Object.fromEntries(
        Object.entries(bonuses.pet_rewards)
          .filter(([, { magic_find }]) => magic_find)
          .map(([score, { magic_find }]) => [score, magic_find]),
      ),
    });

    setBoards("collections", getCollectionBoards(collectionData));
    return {
      skills: { url: HYPIXEL_SKILLS, version: skillsVersion },
      collections: { url: HYPIXEL_COLLECTIONS, version: collectionsVersion },
    };
  },
};
