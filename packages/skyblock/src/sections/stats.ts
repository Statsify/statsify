/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  type ItemView,
  type ItemsResource,
  PLAYER_STATS,
  type PetView,
  type PlayerStat,
  SKILLS,
  SLAYER_BOSSES,
  STAT_SOURCES,
  type SlayerBoss,
  type Slots,
  type StatSource,
  type StatTotal,
  type StatsSection,
  type TreeLayout,
  type TreeNode,
} from "#types";
import { HOTF_LAYOUT, HOTM_LAYOUT, PET_ITEMS, PET_STATS, POWERS, STAT_TABLES } from "#data";
import { add, roundTo } from "@statsify/math";
import { bagAccessories, heldAccessories, highestTiers, powerScale, stonePowerStats } from "./accessories.js";
import { decodeSlots } from "#items";
import { SKYBLOCK_XP_PER_LEVEL } from "../profiles.js";
import { getDungeons } from "./dungeons.js";
import { getHotf } from "./hotf.js";
import { getHotm } from "./hotm.js";
import { getPets } from "./pets.js";
import { getSkills } from "./skills.js";
import { getSlayers } from "./slayers.js";
import { isWeapon } from "./gear.js";
import { parsePieceBonuses, parseStatLine, statNamed } from "../lore.js";
import type { RawMember, RawProfile } from "#raw";

type Stats = Partial<Record<PlayerStat, number>>;

const sumStats = (all: Iterable<Stats>): Stats => {
  const sum: Stats = {};
  for (const stats of all) {
    for (const [stat, value] of Object.entries(stats) as [PlayerStat, number][]) sum[stat] = add(sum[stat] ?? 0, value);
  }
  return sum;
};

/** The stat lines in the items' lore, which already count each item's reforge, gems, enchantments and stars. */
const loreStats = (items: Slots): Stats =>
  sumStats(
    items.flatMap((item) => {
      const lore = item?.lore ?? [];
      return [...lore.flatMap((line) => parseStatLine(line) ?? []), ...parsePieceBonuses(lore)].map(({ stat, value }) => ({
        [stat]: value,
      }));
    })
  );

/** The stats of a table's first `level` levels. */
const upTo = (levels: readonly Stats[], level: number) => sumStats(levels.slice(0, level));

const scaleStats = (stats: Stats, factor: number): Stats =>
  Object.fromEntries(Object.entries(stats).map(([stat, value]) => [stat, value * factor]));

// Learned Powers' stats per unit of powerScale (wiki: Powers); stone Powers list theirs on the stone
const LEARNED_POWERS: Record<string, Stats> = {
  fortuitous: { health: 3.35, defense: 1.2, strength: 4.8, crit_chance: 4.35, crit_damage: 4.8 },
  pretty: { health: 1.65, defense: 1.2, speed: 0.65, strength: 4.8, intelligence: 10.8, crit_chance: 0.475, crit_damage: 1.2 },
  protected: { health: 11.75, defense: 10.8, strength: 2.4, crit_chance: 0.475, crit_damage: 1.2 },
  simple: { health: 5.02, defense: 3.6, speed: 1.2, strength: 3.6, intelligence: 5.4, crit_chance: 1.45, crit_damage: 3.6 },
  warrior: { health: 3.35, defense: 1.2, strength: 8.4, crit_chance: 2.4, crit_damage: 6 },
  commando: { health: 5.02, defense: 2.4, strength: 8.4, crit_chance: 0.475, crit_damage: 8.4 },
  disciplined: { health: 5.02, defense: 2.4, strength: 7.2, crit_chance: 1.45, crit_damage: 7.2 },
  inspired: { health: 1.65, defense: 1.2, strength: 4.8, intelligence: 16.2, crit_chance: 0.95, crit_damage: 3.6 },
  ominous: { health: 5.02, speed: 0.95, strength: 3.6, intelligence: 6.1, crit_chance: 1.45, crit_damage: 3.6, attack_speed: 0.9 },
  prepared: { health: 12.4, defense: 11.3, strength: 1.95, crit_chance: 0.4, crit_damage: 0.95 },
};

/** The selected Power's stats at the bag's accessory power. */
function powerStats(power: string | undefined, accessoryPower: number): Stats | undefined {
  const stone = power ? POWERS[power] : undefined;
  if (stone) {
    return sumStats(
      stonePowerStats(stone, accessoryPower).flatMap(({ name, value }) => {
        const stat = statNamed(name);
        return stat ? [{ [stat]: value }] : [];
      })
    );
  }

  const learned = power ? LEARNED_POWERS[power] : undefined;
  return learned && scaleStats(learned, powerScale(accessoryPower));
}

// What a tuning point gives, by the API's tuning keys (wiki: each stat's page)
const TUNING: Record<string, [PlayerStat, number]> = {
  health: ["health", 5],
  defense: ["defense", 1],
  walk_speed: ["speed", 1.5],
  strength: ["strength", 1],
  critical_damage: ["crit_damage", 1],
  critical_chance: ["crit_chance", 0.2],
  attack_speed: ["attack_speed", 0.3],
  intelligence: ["intelligence", 2],
};

const tuningStats = (points: Record<string, number>): Stats =>
  sumStats(
    Object.entries(points).flatMap(([key, count]) => {
      const tuned = TUNING[key];
      return tuned && count > 0 ? [{ [tuned[0]]: count * tuned[1] }] : [];
    })
  );

/** The active pet's stats at its level, raised by its item's percents, plus the item's own stats. */
function petStats(pet: PetView | undefined): Stats | undefined {
  if (!pet) return undefined;

  const table = PET_STATS[pet.type]?.[pet.rarity];
  const item = pet.heldItem ? PET_ITEMS[pet.heldItem] : undefined;
  const [from, to] = table?.levels ?? [1, 100];
  const progress = (Math.min(Math.max(pet.level.level, from), to) - from) / (to - from);

  const own = Object.keys({ ...table?.first, ...table?.last }).map((key) => {
    const stat = key as PlayerStat;
    const first = table?.first[stat] ?? 0;
    const boost = 1 + ((item?.allPetStats ?? 0) + (item?.petStats?.[stat] ?? 0)) / 100;
    return { [stat]: (first + ((table?.last[stat] ?? 0) - first) * progress) * boost };
  });

  return sumStats([...own, item?.stats ?? {}]);
}

// Essence shop perks that count everywhere, per level (wiki: Essence Shops' pages). The Catacombs perks count only in
// dungeons, and the rest only on an island or against some mobs.
const ESSENCE_PERKS: Record<string, Stats> = {
  permanent_health: { health: 2 },
  permanent_defense: { defense: 1 },
  permanent_speed: { speed: 1 },
  permanent_intelligence: { intelligence: 2 },
  permanent_strength: { strength: 1 },
  unbreaking: { vitality: 1 },
  frozen_skin: { cold_resistance: 1 },
  extreme_pressure: { pressure_resistance: 3 },
  lumberjack: { foraging_fortune: 2 },
  // Its Speed and Mana Regen are the Rift's
  blessing_of_time: { health: 5, strength: 2, intelligence: 2, defense: 2 },
};

const essenceStats = (perks: Record<string, number>) =>
  sumStats(
    Object.entries(perks).flatMap(([perk, level]) => {
      const stats = ESSENCE_PERKS[perk];
      return stats ? [scaleStats(stats, level)] : [];
    })
  );

/** The stats of a tree's perks that grant them outright, while the perk is on. */
const treeStats = (nodes: TreeNode[], layout: TreeLayout) =>
  sumStats(
    nodes.flatMap(({ id, level, enabled }) =>
      enabled ? (layout[id]?.stats ?? []).map((stat) => ({ [stat.id]: stat.base + stat.perLevel * level })) : []
    )
  );

// Defaults NEU's base_stats leaves out (wiki: Stats), and its Magic Find of 10, which the wiki puts at 0
const { magic_find: baseMagicFind, ...BASE } = STAT_TABLES.base;
const WIKI_BASE: Stats = { swing_range: 3, health_regen: 100, vitality: 100, mending: 100, respiration: 30, magic_find: baseMagicFind };

// wiki: Health, and SkyBlock Levels for the level's stats. Fairy souls stopped giving stats in 2022.
const BESTIARY_HEALTH = 2;
const CATACOMBS_HEALTH = { perLevel: 2, maxLevel: 50 };
const LEVEL_STATS = { health: 5, strengthEvery: 5 };
const PEPPER_HEALTH = 1;

const neuHealth = (levels: Stats[]) => levels.map(({ health }) => (health ? { health } : {}));

// Each boss's level stats, NEU's and the wiki's (each boss's page). NEU's Zombie, Spider and Enderman tables are from
// before 0.19.2, so only their Health, which matches the wiki's, is kept; it has no Blaze table. Vampire's are Rift Time,
// a Rift-only stat.
const SLAYER_LEVELS = {
  zombie: { neu: neuHealth(STAT_TABLES.slayers.zombie), wiki: [{}, {}, {}, {}, {}, {}, {}, { health_regen: 30 }, {}] },
  spider: {
    neu: neuHealth(STAT_TABLES.slayers.spider),
    wiki: [
      { crit_damage: 1 },
      { crit_damage: 1 },
      { crit_damage: 1 },
      { crit_damage: 1 },
      { crit_damage: 2 },
      { crit_damage: 2 },
      { crit_damage: 2 },
      { crit_damage: 3, alchemy_wisdom: 5 },
      { crit_damage: 3 },
    ],
  },
  wolf: { neu: STAT_TABLES.slayers.wolf, wiki: [] },
  enderman: {
    neu: neuHealth(STAT_TABLES.slayers.enderman),
    wiki: [{}, { intelligence: 2 }, {}, { intelligence: 2 }, {}, { intelligence: 5 }, {}, { intelligence: 4 }, { tracking: 5 }],
  },
  blaze: {
    neu: [],
    wiki: [
      { health: 3 },
      { strength: 1 },
      { health: 4 },
      { true_defense: 1 },
      { health: 5 },
      { strength: 2 },
      { health: 6 },
      { true_defense: 2 },
      { health: 7 },
    ],
  },
} satisfies Partial<Record<SlayerBoss, { neu: Stats[]; wiki: Stats[] }>>;

// Combat Wisdom for each boss tier killed once: 1 for tiers I to III, 2 for IV and V, Vampire's too (the wiki's Combat
// Wisdom page, an owner exception, unverified)
const tierWisdom = (kills: number[]) => add(...kills.map((count, tier) => (count > 0 ? (tier < 3 ? 1 : 2) : 0)));

const STAT_SLAYERS = Object.keys(SLAYER_LEVELS) as (keyof typeof SLAYER_LEVELS)[];

// Anita's Extra Farming Fortune and Agatha's and Miria's log fortunes, per level (wiki: Farming, Fig, Mangrove and Helix
// Fortune)
const FORTUNE_PER_UPGRADE = 4;

// Pet score's Magic Find past NEU's last step at 325 (wiki: Pet Score)
const PET_SCORE_STEPS = { ...STAT_TABLES.pet_score, 375: 11, 450: 12, 500: 13 };
const UNVERIFIED_PET_SCORE = 375;

const petScoreMagicFind = (score: number) =>
  Math.max(0, ...Object.entries(PET_SCORE_STEPS).flatMap(([at, magicFind]) => (score >= Number(at) ? [magicFind] : [])));

/** Each stat with a source, by source; rounded to two places, as lore shows them. */
function toTotals(sources: Partial<Record<StatSource, Stats>>): StatTotal[] {
  return PLAYER_STATS.flatMap(({ id: stat }) => {
    const bySource = Object.fromEntries(
      STAT_SOURCES.flatMap((source) => {
        const value = roundTo(sources[source]?.[stat] ?? 0);
        return value === 0 ? [] : [[source, value]];
      })
    );
    const values = Object.values(bySource);
    return values.length === 0 ? [] : [{ stat, total: roundTo(add(...values)), bySource }];
  });
}

/**
 * The permanent stat sheet. Gear, the weapon, accessories and the Power need the inventory API and skills the skills
 * API; with either off, those sources are left out.
 */
export function getStats(profile: RawProfile, member: RawMember, items: ItemsResource): StatsSection {
  const inventory = member.inventory;
  const bag = bagAccessories(member, items);
  const storage = member.accessory_bag_storage;
  const power = bag ? powerStats(storage?.selected_power, bag.accessoryPower) : undefined;
  const tuning = tuningStats(storage?.tuning?.slot_0 ?? {});
  const inventoryItems = inventory?.inv_contents ? decodeSlots(inventory.inv_contents) : [];
  const weapon = inventoryItems.slice(0, 9).find((item): item is ItemView => item !== null && isWeapon(item));
  const held = bag ? heldAccessories(inventoryItems, items, bag.owned) : [];
  const accessories = bag ? highestTiers([...bag.active, ...held]) : [];

  const skills = getSkills(profile, member);
  const slayers = getSlayers(member).bosses;
  const pets = getPets(member);
  const perks = member.player_data?.perks ?? {};
  const essence = essenceStats(perks);
  const catacombs = getDungeons(member).catacombs.level;
  const level = Math.floor((member.leveling?.experience ?? 0) / SKYBLOCK_XP_PER_LEVEL);
  const peppers = member.player_data?.reaper_peppers_eaten ?? 0;
  const slayerTiers = add(...SLAYER_BOSSES.map((boss) => tierWisdom(slayers[boss].kills)));

  const slayerStats = STAT_SLAYERS.map((boss) => {
    const { neu, wiki } = SLAYER_LEVELS[boss];
    const level = slayers[boss].level.level;
    return { boss, neu: upTo(neu, level), wiki: upTo(wiki, level) };
  });
  const fortuneUpgrades = scaleStats(
    {
      farming_fortune: member.jacobs_contest?.perks?.double_drops ?? 0,
      fig_fortune: perks.agatha_fig_fortune ?? 0,
      mangrove_fortune: perks.agatha_mangrove_fortune ?? 0,
      helix_fortune: perks.miria_helix_fortune ?? 0,
    },
    FORTUNE_PER_UPGRADE
  );

  const sources: Partial<Record<StatSource, Stats>> = {
    base: BASE,
    wikiBase: WIKI_BASE,
    armor: inventory?.inv_armor ? loreStats(decodeSlots(inventory.inv_armor)) : undefined,
    equipment: inventory?.equipment_contents ? loreStats(decodeSlots(inventory.equipment_contents)) : undefined,
    weapon: weapon && loreStats([weapon]),
    accessories: bag ? loreStats(accessories) : undefined,
    power,
    tuning,
    skills: skills ? sumStats(SKILLS.map((skill) => upTo(STAT_TABLES.skills[skill], skills.skills[skill].level))) : undefined,
    ...Object.fromEntries(slayerStats.map(({ boss, neu, wiki }) => [boss, sumStats([neu, wiki])])),
    slayerTiers: { combat_wisdom: slayerTiers },
    pet: petStats(pets.active),
    petScore: { magic_find: petScoreMagicFind(pets.score) },
    essence,
    hotm: treeStats(getHotm(member).nodes, HOTM_LAYOUT),
    hotf: treeStats(getHotf(member)?.nodes ?? [], HOTF_LAYOUT),
    bestiary: { health: BESTIARY_HEALTH * (member.bestiary?.milestone?.last_claimed_milestone ?? 0) },
    catacombs: { health: CATACOMBS_HEALTH.perLevel * Math.min(catacombs, CATACOMBS_HEALTH.maxLevel) },
    level: { health: LEVEL_STATS.health * level, strength: Math.floor(level / LEVEL_STATS.strengthEvery) },
    peppers: { health: PEPPER_HEALTH * peppers },
    fortuneUpgrades,
  };

  const unverified: StatSource[] = ["wikiBase"];
  if (accessories.some((view) => held.includes(view))) unverified.push("accessories");
  if (power) unverified.push("power");
  if (Object.keys(tuning).length > 0) unverified.push("tuning");
  unverified.push(...slayerStats.flatMap(({ boss, wiki }) => (Object.keys(wiki).length > 0 ? [boss] : [])));
  if (slayerTiers > 0) unverified.push("slayerTiers");
  if (pets.score >= UNVERIFIED_PET_SCORE) unverified.push("petScore");
  if (Object.keys(essence).length > 0) unverified.push("essence");
  if (member.bestiary?.milestone?.last_claimed_milestone) unverified.push("bestiary");
  if (catacombs > 0) unverified.push("catacombs");
  if (level > 0) unverified.push("level");
  if (peppers > 0) unverified.push("peppers");
  if (Object.values(fortuneUpgrades).some((value) => value > 0)) unverified.push("fortuneUpgrades");

  return { stats: toTotals(sources), weapon: weapon?.name, unverified };
}
