/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  ATTRIBUTE_SHARDS,
  HOTF_LAYOUT,
  HOTM_LAYOUT,
  PET_ITEMS,
  PET_STATS,
  POWERS,
  STAT_TABLES,
} from "#data";
import {
  type ItemView,
  type ItemsResource,
  PLAYER_STATS,
  type PetView,
  type PlayerStat,
  type Slots,
  type StatTotal,
  type StatValue,
  type Stats,
  type StatsSection,
  type TreeLayout,
  type TreeNode,
} from "#types";
import { SLAYER_BOSSES, type SlayerBoss, getSlayers } from "./slayers.js";
import { SKILLS, getSkills } from "./skills.js";
import { add, roundTo } from "@statsify/math";
import {
  TUNING,
  getHeldAccessories,
  getHighestTiers,
  getPowerScale,
  getPowerStats,
  readBag,
} from "./accessories.js";
import { parsePieceBonuses, parseStatLine, parseStatName } from "#lore";
import { decodeSlots } from "#items";
import { getAttributeLevel } from "./attributes.js";
import { getDungeons } from "./dungeons.js";
import { getHotf } from "./hotf.js";
import { getHotm } from "./hotm.js";
import { getPets } from "./pets.js";
import { isWeapon } from "./gear.js";
import { toSkyBlockLevel } from "#leveling";
import type { RawMember, RawProfile } from "#raw";

// Vampire's level stats are Rift Time, a Rift-only stat.
const STAT_SLAYERS = SLAYER_BOSSES.filter(
  (boss): boss is Exclude<SlayerBoss, "vampire"> => boss !== "vampire",
);

export const STAT_SOURCES = [
  "base",
  "wikiBase",
  "armor",
  "equipment",
  "weapon",
  "accessories",
  "power",
  "tuning",
  "pet",
  "skills",
  ...STAT_SLAYERS,
  "slayerTiers",
  "petScore",
  "essence",
  "fortuneUpgrades",
  "hotm",
  "hotf",
  "bestiary",
  "catacombs",
  "level",
  "peppers",
  // Attribute stats are in byAttribute, so this is only for unverified.
  "attributes",
] as const;

export type StatSource = (typeof STAT_SOURCES)[number];

function sumStats(all: Iterable<Stats>): Stats {
  const sum: Stats = {};

  for (const stats of all) {
    for (const [stat, value] of Object.entries(stats) as [
      PlayerStat,
      number,
    ][]) {
      sum[stat] = add(sum[stat] ?? 0, value);
    }
  }

  return sum;
}

const sumValues = (values: StatValue[]) =>
  sumStats(values.map(({ stat, value }) => ({ [stat]: value })));

const sumLevels = (levels: Stats[], level: number) =>
  sumStats(levels.slice(0, level));

const scaleStats = (stats: Stats, factor: number): Stats =>
  Object.fromEntries(
    Object.entries(stats).map(([stat, value]) => [stat, value * factor]),
  );

function getLoreStats(items: Slots): Stats {
  const values: StatValue[] = [];

  for (const item of items) {
    if (!item) continue;

    for (const line of item.lore) {
      const value = parseStatLine(line);
      if (value) values.push(value);
    }

    values.push(...parsePieceBonuses(item.lore));
  }

  return sumValues(values);
}

// Learned Powers' stats per unit of power scale, from the wiki's Powers page.
const LEARNED_POWERS: Record<string, Stats> = {
  fortuitous: {
    health: 3.35,
    defense: 1.2,
    strength: 4.8,
    crit_chance: 4.35,
    crit_damage: 4.8,
  },
  pretty: {
    health: 1.65,
    defense: 1.2,
    speed: 0.65,
    strength: 4.8,
    intelligence: 10.8,
    crit_chance: 0.475,
    crit_damage: 1.2,
  },
  protected: {
    health: 11.75,
    defense: 10.8,
    strength: 2.4,
    crit_chance: 0.475,
    crit_damage: 1.2,
  },
  simple: {
    health: 5.02,
    defense: 3.6,
    speed: 1.2,
    strength: 3.6,
    intelligence: 5.4,
    crit_chance: 1.45,
    crit_damage: 3.6,
  },
  warrior: {
    health: 3.35,
    defense: 1.2,
    strength: 8.4,
    crit_chance: 2.4,
    crit_damage: 6,
  },
  commando: {
    health: 5.02,
    defense: 2.4,
    strength: 8.4,
    crit_chance: 0.475,
    crit_damage: 8.4,
  },
  disciplined: {
    health: 5.02,
    defense: 2.4,
    strength: 7.2,
    crit_chance: 1.45,
    crit_damage: 7.2,
  },
  inspired: {
    health: 1.65,
    defense: 1.2,
    strength: 4.8,
    intelligence: 16.2,
    crit_chance: 0.95,
    crit_damage: 3.6,
  },
  ominous: {
    health: 5.02,
    speed: 0.95,
    strength: 3.6,
    intelligence: 6.1,
    crit_chance: 1.45,
    crit_damage: 3.6,
    attack_speed: 0.9,
  },
  prepared: {
    health: 12.4,
    defense: 11.3,
    strength: 1.95,
    crit_chance: 0.4,
    crit_damage: 0.95,
  },
};

function getSelectedPowerStats(
  power: string | undefined,
  accessoryPower: number,
): Stats | undefined {
  if (!power) return undefined;

  const stone = POWERS[power];
  if (stone) {
    const values: StatValue[] = [];

    for (const { name, value } of getPowerStats(stone, accessoryPower)) {
      const stat = parseStatName(name);
      if (stat) values.push({ stat, value });
    }

    return sumValues(values);
  }

  const learned = LEARNED_POWERS[power];
  return learned && scaleStats(learned, getPowerScale(accessoryPower));
}

const getTuningStats = (points: Record<string, number>) =>
  sumStats(
    Object.entries(points)
      .filter(([key, count]) => TUNING[key] && count > 0)
      .map(([key, count]) => {
        const [stat, perPoint] = TUNING[key];
        return { [stat]: count * perPoint };
      }),
  );

function getPetStats(pet: PetView | undefined): Stats | undefined {
  if (!pet) return undefined;

  const table = PET_STATS[pet.type]?.[pet.rarity];
  const item = pet.heldItem ? PET_ITEMS[pet.heldItem] : undefined;
  const [from, to] = table?.levels ?? [1, 100];
  const progress = (Math.min(pet.level.level, to) - from) / (to - from);

  // A dragon below its table's first level is an egg with no stats.
  const keys =
    pet.level.level < from
      ? []
      : Object.keys({ ...table?.first, ...table?.last });

  const own = keys.map((key) => {
    const stat = key as PlayerStat;
    const first = table?.first[stat] ?? 0;
    const last = table?.last[stat] ?? 0;
    const percent = (item?.allPetStats ?? 0) + (item?.petStats?.[stat] ?? 0);
    return {
      [stat]: (first + (last - first) * progress) * (1 + percent / 100),
    };
  });

  return sumStats([...own, item?.stats ?? {}]);
}

// Only the essence perks that count everywhere, per level.
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
  // Its Speed and Mana Regen only count in the Rift.
  blessing_of_time: { health: 5, strength: 2, intelligence: 2, defense: 2 },
};

const getEssenceStats = (perks: Record<string, number | boolean>) =>
  sumStats(
    Object.entries(perks)
      .filter(([perk]) => ESSENCE_PERKS[perk])
      .map(([perk, level]) => scaleStats(ESSENCE_PERKS[perk], Number(level))),
  );

const getTreeStats = (nodes: TreeNode[], layout: TreeLayout) =>
  sumStats(
    nodes
      .filter(({ enabled }) => enabled)
      .flatMap(({ id, level }) =>
        (layout[id]?.stats ?? []).map((stat) => ({
          [stat.id]: stat.base + stat.perLevel * level,
        })),
      ),
  );

// Base stats NEU leaves out, plus its Magic Find, which the wiki puts at 0.
const { magic_find: baseMagicFind, ...BASE } = STAT_TABLES.base;
const WIKI_BASE: Stats = {
  swing_range: 3,
  health_regen: 100,
  vitality: 100,
  mending: 100,
  respiration: 30,
  magic_find: baseMagicFind,
};

// Fairy souls stopped giving stats in 2022, so they aren't a source.
const BESTIARY_HEALTH = 2;
const CATACOMBS_HEALTH = { perLevel: 2, maxLevel: 50 };
const LEVEL_STATS = { health: 5, strengthEvery: 5 };
const PEPPER_HEALTH = 1;

const getHealthLevels = (levels: Stats[]) =>
  levels.map(({ health }) => (health ? { health } : {}));

// Only Health is current in NEU's Zombie, Spider and Enderman tables.
const SLAYER_LEVELS = {
  zombie: {
    neu: getHealthLevels(STAT_TABLES.slayers.zombie),
    wiki: [{}, {}, {}, {}, {}, {}, {}, { health_regen: 30 }, {}],
  },
  spider: {
    neu: getHealthLevels(STAT_TABLES.slayers.spider),
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
    neu: getHealthLevels(STAT_TABLES.slayers.enderman),
    wiki: [
      {},
      { intelligence: 2 },
      {},
      { intelligence: 2 },
      {},
      { intelligence: 5 },
      {},
      { intelligence: 4 },
      { tracking: 5 },
    ],
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
} satisfies Record<
  (typeof STAT_SLAYERS)[number],
  { neu: Stats[]; wiki: Stats[] }
>;

// Each boss tier killed once gives 1 Combat Wisdom, or 2 from tier IV up.
function getSlayerTierWisdom(bosses: Record<SlayerBoss, { kills: number[] }>) {
  let wisdom = 0;

  for (const boss of SLAYER_BOSSES) {
    for (const [tier, count] of bosses[boss].kills.entries()) {
      if (count > 0) wisdom += tier < 3 ? 1 : 2;
    }
  }

  return wisdom;
}

const FORTUNE_PER_UPGRADE = 4;

// NEU's pet score steps stop at 325, so the wiki gives the rest.
const PET_SCORE_STEPS = {
  ...STAT_TABLES.pet_score,
  375: 11,
  450: 12,
  500: 13,
};
const UNVERIFIED_PET_SCORE = 375;

const getPetScoreMagicFind = (score: number) =>
  Math.max(
    0,
    ...Object.entries(PET_SCORE_STEPS)
      .filter(([at]) => score >= Number(at))
      .map(([, magicFind]) => magicFind),
  );

interface AttributeStat {
  stat: PlayerStat;
  name: string;
  value: number;
}

// The wiki scales level I's stats by the level.
function getAttributeStats(member: RawMember): AttributeStat[] {
  const stats: AttributeStat[] = [];

  for (const shard of ATTRIBUTE_SHARDS.shards) {
    const { attributeName, grants = [] } = shard;
    if (grants.length === 0) continue;

    const level = getAttributeLevel(shard, member);
    if (level === 0) continue;

    for (const { stat, value } of grants) {
      stats.push({ stat, name: attributeName, value: value * level });
    }
  }

  return stats;
}

// Lore shows stats to two places, so each value rounds the same way.
function toTotals(
  sources: Partial<Record<StatSource, Stats>>,
  attributes: AttributeStat[],
): StatTotal[] {
  const totals: StatTotal[] = [];

  for (const { id: stat } of PLAYER_STATS) {
    const bySource: Partial<Record<StatSource, number>> = {};

    for (const source of STAT_SOURCES) {
      const value = roundTo(sources[source]?.[stat] ?? 0);
      if (value !== 0) bySource[source] = value;
    }

    const byAttribute: Record<string, number> = {};
    for (const { stat: granted, name, value } of attributes) {
      if (granted === stat) byAttribute[name] = roundTo(value);
    }

    const values = [...Object.values(bySource), ...Object.values(byAttribute)];
    if (values.length === 0) continue;

    const total: StatTotal = { stat, total: roundTo(add(...values)), bySource };
    if (Object.keys(byAttribute).length > 0) total.byAttribute = byAttribute;
    totals.push(total);
  }

  return totals;
}

export function getStats(
  profile: RawProfile,
  member: RawMember,
  items: ItemsResource,
): StatsSection {
  const inventory = member.inventory;
  const bag = readBag(member, items);
  const storage = member.accessory_bag_storage;
  const power = bag
    ? getSelectedPowerStats(storage?.selected_power, bag.accessoryPower)
    : undefined;
  const tuning = getTuningStats(storage?.tuning?.slot_0 ?? {});
  const inventoryItems = inventory?.inv_contents
    ? decodeSlots(inventory.inv_contents)
    : [];

  // The API has no held slot, so the first weapon in the hotbar counts.
  const weapon = inventoryItems
    .slice(0, 9)
    .find((item): item is ItemView => item !== null && isWeapon(item));

  const held = bag ? getHeldAccessories(inventoryItems, items, bag.owned) : [];
  const accessories = bag ? getHighestTiers([...bag.active, ...held]) : [];

  const skills = getSkills(profile, member);
  const slayers = getSlayers(member).bosses;
  const pets = getPets(member);
  const perks = member.player_data?.perks ?? {};
  const essence = getEssenceStats(perks);
  const catacombs = getDungeons(member).catacombs.level;
  const level = toSkyBlockLevel(member.leveling?.experience ?? 0).level;
  const peppers = member.player_data?.reaper_peppers_eaten ?? 0;
  const bestiaryMilestone =
    member.bestiary?.milestone?.last_claimed_milestone ?? 0;
  const slayerTiers = getSlayerTierWisdom(slayers);

  const slayerStats = STAT_SLAYERS.map((boss) => {
    const { neu, wiki } = SLAYER_LEVELS[boss];
    const level = slayers[boss].level.level;
    return { boss, neu: sumLevels(neu, level), wiki: sumLevels(wiki, level) };
  });

  // Anita's Extra Farming Fortune upgrade is the API's double_drops.
  const fortuneUpgrades = scaleStats(
    {
      farming_fortune: member.jacobs_contest?.perks?.double_drops ?? 0,
      fig_fortune: Number(perks.agatha_fig_fortune ?? 0),
      mangrove_fortune: Number(perks.agatha_mangrove_fortune ?? 0),
      helix_fortune: Number(perks.miria_helix_fortune ?? 0),
    },
    FORTUNE_PER_UPGRADE,
  );

  const sources: Partial<Record<StatSource, Stats>> = {
    base: BASE,
    wikiBase: WIKI_BASE,
    armor: inventory?.inv_armor
      ? getLoreStats(decodeSlots(inventory.inv_armor))
      : undefined,
    equipment: inventory?.equipment_contents
      ? getLoreStats(decodeSlots(inventory.equipment_contents))
      : undefined,
    weapon: weapon && getLoreStats([weapon]),
    accessories: bag ? getLoreStats(accessories) : undefined,
    power,
    tuning,
    skills: skills
      ? sumStats(
          SKILLS.map((skill) =>
            sumLevels(STAT_TABLES.skills[skill], skills.skills[skill].level),
          ),
        )
      : undefined,
    ...Object.fromEntries(
      slayerStats.map(({ boss, neu, wiki }) => [boss, sumStats([neu, wiki])]),
    ),
    slayerTiers: { combat_wisdom: slayerTiers },
    pet: getPetStats(pets.active),
    petScore: { magic_find: getPetScoreMagicFind(pets.score) },
    essence,
    hotm: getTreeStats(getHotm(member).nodes, HOTM_LAYOUT),
    hotf: getTreeStats(getHotf(member)?.nodes ?? [], HOTF_LAYOUT),
    bestiary: { health: BESTIARY_HEALTH * bestiaryMilestone },
    catacombs: {
      health:
        CATACOMBS_HEALTH.perLevel *
        Math.min(catacombs, CATACOMBS_HEALTH.maxLevel),
    },
    level: {
      health: LEVEL_STATS.health * level,
      strength: Math.floor(level / LEVEL_STATS.strengthEvery),
    },
    peppers: { health: PEPPER_HEALTH * peppers },
    fortuneUpgrades,
  };

  const unverified: StatSource[] = ["wikiBase"];
  if (accessories.some((view) => held.includes(view))) {
    unverified.push("accessories");
  }
  if (power) unverified.push("power");
  if (Object.keys(tuning).length > 0) unverified.push("tuning");
  unverified.push(
    ...slayerStats
      .filter(({ wiki }) => Object.keys(wiki).length > 0)
      .map(({ boss }) => boss),
  );
  if (slayerTiers > 0) unverified.push("slayerTiers");
  if (pets.score >= UNVERIFIED_PET_SCORE) unverified.push("petScore");
  if (Object.keys(essence).length > 0) unverified.push("essence");
  if (bestiaryMilestone) unverified.push("bestiary");
  if (catacombs > 0) unverified.push("catacombs");
  if (level > 0) unverified.push("level");
  if (peppers > 0) unverified.push("peppers");
  if (Object.values(fortuneUpgrades).some((value) => value > 0)) {
    unverified.push("fortuneUpgrades");
  }
  const attributes = getAttributeStats(member);
  if (attributes.length > 0) unverified.push("attributes");

  return {
    stats: toTotals(sources, attributes),
    weapon: weapon?.name,
    unverified,
  };
}
