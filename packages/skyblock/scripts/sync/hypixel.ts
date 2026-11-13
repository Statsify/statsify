/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { collectionBoards } from "@statsify/skyblock";
import { neuStats, statTotals } from "./neu.ts";
import { normalizeItemText, statRewards } from "#lore";
import type { SyncContext } from "../sync-data.ts";
import { toLevelCosts } from "#leveling";

export const HYPIXEL_SKILLS = "https://api.hypixel.net/v2/resources/skyblock/skills";
export const HYPIXEL_COLLECTIONS = "https://api.hypixel.net/v2/resources/skyblock/collections";

interface HypixelSkill {
  maxLevel: number;
  levels: { totalExpRequired: number; unlocks?: string[] }[];
}

interface HypixelCollections {
  name: string;
  items: Record<string, { name: string; tiers: { amountRequired: number }[] }>;
}

/** One of Hypixel's keyless SkyBlock resources. */
async function hypixelResource<T>(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url} answered ${response.status}`);
  return (await response.json()) as T & { version: string };
}

// NEU's bonus tables: a slayer level gives the stats of the highest level key at or under it
const perLevel = (table: Record<string, Record<string, number>>, levels: number) => {
  let current: Record<string, number> = {};
  return Array.from({ length: levels }, (_, i) => (current = table[i + 1] ? neuStats(table[i + 1]) : current));
};

/** The tables built from Hypixel's skills and collections resources, with NEU's where they're merged with them. */
export const HYPIXEL_UNITS = {
  async hypixel({ readJson, write, setBoards }: SyncContext) {
    // Skill tables come from Hypixel's skills resource (keyless), since NEU's runecrafting table is off at five levels.
    const { skills, version: skillsVersion } = await hypixelResource<{ skills: Record<string, HypixelSkill> }>(HYPIXEL_SKILLS);
    const xpTable = (skill: string) => toLevelCosts(skills[skill].levels.map(({ totalExpRequired }) => totalExpRequired));

    // Collection tiers come from Hypixel's collections resource too, in its order of categories and items.
    const { collections, version: collectionsVersion } = await hypixelResource<{
      collections: Record<string, HypixelCollections>;
    }>(HYPIXEL_COLLECTIONS);
    const collectionData = Object.entries(collections).map(([category, { name, items }]) => ({
      id: category,
      name,
      items: Object.entries(items).map(([id, item]) => ({
        id,
        name: item.name,
        tiers: item.tiers.map(({ amountRequired }) => amountRequired),
      })),
    }));
    await write("collections.json", collectionData);

    const leveling = await readJson<Record<string, unknown>>("constants/leveling.json");
    const slayerXp = leveling.slayer_xp as Record<string, number[]>;
    const sblevels = await readJson<{ sblevel_colours: Record<string, string>; core_task: Record<string, unknown> }>(
      "constants/sblevels.json"
    );
    const fairySouls = await readJson<{ "Max Souls": number }>("constants/fairy_souls.json");
    await write("leveling.json", {
      catacombs: leveling.catacombs,
      fairy_souls: fairySouls["Max Souls"],
      HOTF: leveling.HOTF,
      HOTM: leveling.HOTM,
      leveling_caps: leveling.leveling_caps,
      leveling_xp: xpTable("COMBAT"),
      max_levels: Object.fromEntries(Object.entries(skills).map(([id, { maxLevel }]) => [id.toLowerCase(), maxLevel])),
      runecrafting_xp: xpTable("RUNECRAFTING"),
      sblevel_colours: sblevels.sblevel_colours,
      // NEU copies Revenant's 15 XP for Tarantula level 2; the game asks 25.
      slayer_xp: { ...slayerXp, spider: slayerXp.spider.with(1, 25) },
      slayer_to_highest_tier: leveling.slayer_to_highest_tier,
      social: xpTable("SOCIAL"),
    });

    const misc = await readJson<{ base_stats: Record<string, number> }>("constants/misc.json");

    const bonuses = await readJson<{
      bonus_stats: Record<string, Record<string, Record<string, number>>>;
      pet_rewards: Record<string, { magic_find: number }>;
    }>("constants/bonuses.json");

    await write("stats.json", {
      base: neuStats(misc.base_stats),
      // Each level's unlocks, as lore lines: "+2<glyph> Health", "Farmhand XV   Grants +56➜60 <glyph> Farming Fortune, …"
      skills: Object.fromEntries(
        Object.entries(skills).map(([id, { levels }]) => [
          id.toLowerCase(),
          levels.map(({ unlocks = [] }) => statTotals(unlocks.flatMap((line) => statRewards(normalizeItemText(line))))),
        ])
      ),
      slayers: Object.fromEntries(
        Object.entries(bonuses.bonus_stats)
          .filter(([id]) => id.startsWith("slayer_"))
          .map(([id, table]) => [id.slice("slayer_".length), perLevel(table, slayerXp[id.slice("slayer_".length)].length)])
      ),
      pet_score: Object.fromEntries(
        Object.entries(bonuses.pet_rewards).flatMap(([score, { magic_find }]) => (magic_find ? [[score, magic_find]] : []))
      ),
    });

    setBoards("collections", collectionBoards(collectionData));
    return {
      skills: { url: HYPIXEL_SKILLS, version: skillsVersion },
      collections: { url: HYPIXEL_COLLECTIONS, version: collectionsVersion },
    };
  },
};
