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
  type PlayerStat,
  SKILLS,
  STAT_SOURCES,
  type Slots,
  type StatSource,
  type StatTotal,
  type StatsSection,
} from "#types";
import { POWERS, STAT_TABLES } from "#data";
import { add, roundTo } from "@statsify/math";
import { bagAccessories, powerScale, stonePowerStats } from "./accessories.js";
import { decodeSlots } from "#items";
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

// Blaze levels' stats (wiki: Blaze Slayer), which NEU's bonus table lacks. Vampire's are Rift Time, a Rift-only stat.
const BLAZE_LEVELS: Stats[] = [
  { health: 3 },
  { strength: 1 },
  { health: 4 },
  { true_defense: 1 },
  { health: 5 },
  { strength: 2 },
  { health: 6 },
  { true_defense: 2 },
  { health: 7 },
];

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
  const hotbar = inventory?.inv_contents ? decodeSlots(inventory.inv_contents).slice(0, 9) : [];
  const weapon = hotbar.find((item): item is ItemView => item !== null && isWeapon(item));

  const skills = getSkills(profile, member);
  const slayers = getSlayers(member).bosses;
  const score = getPets(member).score;

  const sources: Partial<Record<StatSource, Stats>> = {
    base: STAT_TABLES.base,
    armor: inventory?.inv_armor ? loreStats(decodeSlots(inventory.inv_armor)) : undefined,
    equipment: inventory?.equipment_contents ? loreStats(decodeSlots(inventory.equipment_contents)) : undefined,
    weapon: weapon && loreStats([weapon]),
    accessories: bag ? loreStats(bag.active) : undefined,
    power,
    tuning,
    skills: skills ? sumStats(SKILLS.map((skill) => upTo(STAT_TABLES.skills[skill], skills.skills[skill].level))) : undefined,
    slayers: sumStats(
      Object.entries(STAT_TABLES.slayers).map(([boss, levels]) => upTo(levels, slayers[boss as keyof typeof slayers].level.level))
    ),
    blaze: upTo(BLAZE_LEVELS, slayers.blaze.level.level),
    petScore: { magic_find: petScoreMagicFind(score) },
  };

  const unverified: StatSource[] = [];
  if (power) unverified.push("power");
  if (Object.keys(tuning).length > 0) unverified.push("tuning");
  if (slayers.blaze.level.level > 0) unverified.push("blaze");
  if (score >= UNVERIFIED_PET_SCORE) unverified.push("petScore");

  return { stats: toTotals(sources), weapon: weapon?.name, unverified };
}
